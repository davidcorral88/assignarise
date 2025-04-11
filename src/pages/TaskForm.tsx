
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../components/auth/useAuth';
import { getUsers, getTaskById, getUsersByIds } from '../utils/dataService';
import { getAllCategories, getProjectsForCategory } from '@/utils/categoriesData';
import { useTaskForm } from '@/hooks/useTaskForm';

// Import components
import TaskFormBasicInfo from '@/components/tasks/form/TaskFormBasicInfo';
import TaskFormTagsSection from '@/components/tasks/form/TaskFormTagsSection';
import TaskFormAttachmentsSection from '@/components/tasks/form/TaskFormAttachmentsSection';
import TaskFormAssignmentsSection from '@/components/tasks/form/TaskFormAssignmentsSection';
import TaskFormSidebar from '@/components/tasks/form/TaskFormSidebar';

// UI Components
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, CheckSquare, Trash2 } from 'lucide-react';

const TaskForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const categories = getAllCategories();
  
  const {
    task,
    setTask,
    tarefa,
    setTarefa,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    startDate,
    setStartDate,
    dueDate,
    setDueDate,
    tags,
    setTags,
    assignments,
    setAssignments,
    selectedUserId,
    setSelectedUserId,
    allocatedHours,
    setAllocatedHours,
    attachments,
    setAttachments,
    creatorUser,
    setCreatorUser,
    category,
    setCategory,
    project,
    setProject,
    availableProjects,
    setAvailableProjects,
    loading,
    setLoading,
    submitting,
    setShowDeleteDialog,
    showDeleteDialog,
    availableUsers,
    setAvailableUsers,
    assignedUserData,
    setAssignedUserData,
    recentlyAddedUsers,
    handleAddAssignment,
    handleRemoveAssignment,
    handleAttachmentAdded,
    handleAttachmentRemoved,
    handleDeleteTask,
    handleSubmit,
    isEditMode
  } = useTaskForm(id, navigate);

  useEffect(() => {
    if (category) {
      console.log(`Category changed to: ${category}, getting projects`);
      const projects = getProjectsForCategory(category);
      console.log(`Available projects for category ${category}:`, projects);
      setAvailableProjects(projects);
      
      if (projects.length > 0 && project && !projects.includes(project)) {
        setProject('');
      }
    } else {
      console.log('No category selected, clearing projects');
      setAvailableProjects([]);
      setProject('');
    }
  }, [category, project, setProject, setAvailableProjects]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        if (!users || !Array.isArray(users)) {
          console.error('Invalid users data:', users);
          return;
        }
        
        const filteredUsers = users.filter(user => {
          if (!user) return false;
          if (currentUser?.role === 'director') {
            return user.active !== false;
          } else {
            return user.role === 'worker' && user.active !== false;
          }
        });
        setAvailableUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [currentUser]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode && id) {
          console.log(`Fetching task with ID: ${id}`);
          const taskData = await getTaskById(id);
          console.log("Task data received:", taskData);
          
          if (taskData) {
            setTask(taskData);
            setTarefa(taskData.title);
            setDescription(taskData.description || '');
            setStatus(taskData.status || 'pending');
            setPriority(taskData.priority || 'medium');
            
            if (taskData.category) {
              console.log(`Task has category: ${taskData.category}`);
              setCategory(taskData.category);
              const projectsForCategory = getProjectsForCategory(taskData.category);
              console.log(`Available projects for category ${taskData.category}:`, projectsForCategory);
              setAvailableProjects(projectsForCategory);
              
              if (taskData.project) {
                console.log(`Task has project: ${taskData.project}`);
                setProject(taskData.project);
              }
            } else {
              console.log('Task has no category');
            }
            
            if (taskData.startDate) {
              try {
                setStartDate(new Date(taskData.startDate));
              } catch (e) {
                console.error("Error parsing startDate:", e);
                setStartDate(new Date());
              }
            } else {
              setStartDate(new Date());
            }
            
            if (taskData.dueDate) {
              try {
                setDueDate(new Date(taskData.dueDate));
              } catch (e) {
                console.error("Error parsing dueDate:", e);
                setDueDate(undefined);
              }
            } else {
              setDueDate(undefined);
            }
            
            setTags(taskData.tags || []);
            
            const userIdsToFetch = new Set<number>();
            
            if (taskData.createdBy) {
              userIdsToFetch.add(Number(taskData.createdBy));
            }
            
            if (taskData.assignments && taskData.assignments.length > 0) {
              const normalizedAssignments = taskData.assignments.map(assignment => {
                const userId = typeof assignment.user_id === 'string' 
                  ? parseInt(assignment.user_id, 10) 
                  : assignment.user_id;
                  
                userIdsToFetch.add(userId);
                
                return {
                  user_id: userId,
                  allocatedHours: assignment.allocatedHours || 0
                };
              });
              setAssignments(normalizedAssignments);
              console.log("Normalized assignments:", normalizedAssignments);
            } else {
              setAssignments([]);
            }
            
            setAttachments(taskData.attachments || []);
            
            if (userIdsToFetch.size > 0) {
              const userIds = Array.from(userIdsToFetch);
              console.log(`Fetching data for ${userIds.length} users in batch`);
              const usersData = await getUsersByIds(userIds);
              setAssignedUserData(usersData);
              
              if (taskData.createdBy && usersData[Number(taskData.createdBy)]) {
                setCreatorUser(usersData[Number(taskData.createdBy)]);
              }
            }
          } else {
            console.error(`Task with ID ${id} not found`);
            navigate('/tasks');
            return;
          }
        } else {
          // For new task creation
          if (currentUser) {
            setCreatorUser(currentUser);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading task data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, currentUser, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Layout>
    );
  }
  
  const canEdit = true;
  const canAddResolutionAttachments = true;
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="pl-0 hover:pl-0 hover:bg-transparent" 
            onClick={() => navigate('/tasks')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a tarefas
          </Button>
          
          <div className="flex space-x-2">
            {isEditMode && (
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar tarefa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción non se pode desfacer. Eliminarás permanentemente esta tarefa.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTask}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#007bc4' }}>
              {isEditMode ? 'Editar tarefa' : 'Nova tarefa'}
            </h1>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TaskFormBasicInfo
                task={task}
                creatorUser={creatorUser}
                tarefa={tarefa}
                setTarefa={setTarefa}
                description={description}
                setDescription={setDescription}
                startDate={startDate}
                setStartDate={setStartDate}
                category={category}
                setCategory={setCategory}
                project={project}
                setProject={setProject}
                availableProjects={availableProjects}
                categories={categories}
                isEditMode={isEditMode}
              />
              
              <TaskFormTagsSection 
                tags={tags}
                setTags={setTags}
              />

              <TaskFormAttachmentsSection
                taskId={task?.id ? String(task.id) : '0'}
                attachments={attachments}
                onAttachmentAdded={handleAttachmentAdded}
                onAttachmentRemoved={handleAttachmentRemoved}
                canEdit={canEdit}
                canAddResolutionAttachments={canAddResolutionAttachments}
                isEditMode={isEditMode}
              />
              
              <TaskFormAssignmentsSection
                assignments={assignments}
                setAssignments={setAssignments}
                availableUsers={availableUsers}
                assignedUserData={assignedUserData}
                recentlyAddedUsers={recentlyAddedUsers}
                handleAddAssignment={handleAddAssignment}
                handleRemoveAssignment={handleRemoveAssignment}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                allocatedHours={allocatedHours}
                setAllocatedHours={setAllocatedHours}
              />
            </div>
            
            <div className="space-y-6">
              <TaskFormSidebar
                status={status}
                setStatus={setStatus}
                priority={priority}
                setPriority={setPriority}
                dueDate={dueDate}
                setDueDate={setDueDate}
                submitting={submitting}
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TaskForm;
