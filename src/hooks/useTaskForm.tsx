
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { getProjectsByCategory } from '@/utils/categoryProjectData';
import { Task, User, TaskAssignment, TaskAttachment } from '@/utils/types';
import { 
  getUserById, 
  addTask, 
  updateTask, 
  getTaskById, 
  deleteTask, 
  getUsers, 
  getUsersByIds 
} from '@/utils/dataService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/useAuth';

export const useTaskForm = (taskId?: string) => {
  const isEditMode = !!taskId;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [task, setTask] = useState<Task | null>(null);
  const [tarefa, setTarefa] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [priority, setPriority] = useState<string>('medium');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tag, setTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [creatorUser, setCreatorUser] = useState<User | null>(null);
  
  const [category, setCategory] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [assignedUserData, setAssignedUserData] = useState<Record<number, User | null>>({});
  const [recentlyAddedUsers, setRecentlyAddedUsers] = useState<Record<number, User | null>>({});

  // Update available projects when category changes
  useEffect(() => {
    setAvailableProjects(getProjectsByCategory(category));
    // Reset project if not in the new category's projects list
    if (project && !getProjectsByCategory(category).includes(project)) {
      setProject('');
    }
  }, [category, project]);
  
  // Load available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        const filteredUsers = users.filter(user => {
          if (currentUser?.role === 'director') {
            return user.active !== false;
          } else {
            return user.role === 'worker' && user.active !== false;
          }
        });
        setAvailableUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao cargar os usuarios',
          variant: 'destructive',
        });
      }
    };
    
    fetchUsers();
  }, [currentUser]);
  
  // Load task data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode && taskId) {
          console.log(`Fetching task with ID: ${taskId}`);
          const taskData = await getTaskById(taskId);
          console.log("Task data received:", taskData);
          
          if (taskData) {
            setTask(taskData);
            setTarefa(taskData.title);
            setDescription(taskData.description || '');
            setStatus(taskData.status || 'pending');
            setPriority(taskData.priority || 'medium');
            
            setCategory(taskData.category || '');
            setProject(taskData.project || '');
            
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
            
            if (taskData.assignments && taskData.assignments.length > 0) {
              const normalizedAssignments = taskData.assignments.map(assignment => {
                const userId = typeof assignment.user_id === 'string' 
                  ? parseInt(assignment.user_id, 10) 
                  : assignment.user_id;
                  
                return {
                  user_id: userId,
                  allocatedHours: assignment.allocatedHours || 0
                };
              });
              setAssignments(normalizedAssignments);
              console.log("Normalized assignments:", normalizedAssignments);
              
              const userIds = normalizedAssignments.map(a => a.user_id);
              if (userIds.length > 0) {
                try {
                  const usersData = await getUsersByIds(userIds);
                  setAssignedUserData(usersData);
                  console.log("Assigned users data:", usersData);
                } catch (error) {
                  console.error('Error fetching assigned users:', error);
                }
              }
            } else {
              setAssignments([]);
            }
            
            setAttachments(taskData.attachments || []);
            
            if (taskData.createdBy) {
              try {
                const creator = await getUserById(Number(taskData.createdBy));
                setCreatorUser(creator || null);
              } catch (error) {
                console.error('Error fetching creator user:', error);
              }
            }
          } else {
            console.error(`Task with ID ${taskId} not found`);
            toast({
              title: 'Erro',
              description: 'Tarefa non atopada. Redirixindo á lista de tarefas.',
              variant: 'destructive',
            });
            navigate('/tasks');
            return;
          }
        } else {
          if (currentUser) {
            setCreatorUser(currentUser);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading task data:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao cargar os datos da tarefa',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [taskId, isEditMode, currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tarefa.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor ingresa un nome para a tarefa',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const normalizedAssignments = assignments.map(assignment => {
        const userId = typeof assignment.user_id === 'string'
          ? parseInt(assignment.user_id, 10)
          : assignment.user_id;
          
        return {
          user_id: userId,
          allocatedHours: assignment.allocatedHours
        };
      });
      
      console.log("Normalized assignments for submission:", normalizedAssignments);
      
      const taskData: Task = {
        ...(isEditMode && task ? { id: task.id } : {}),
        title: tarefa,
        description: description || '',
        status: (status as 'pending' | 'in_progress' | 'completed') || 'pending',
        priority: (priority as 'low' | 'medium' | 'high') || 'medium',
        createdBy: currentUser?.id || 0,
        createdAt: task?.createdAt || new Date().toISOString(),
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        tags: tags || [],
        assignments: normalizedAssignments,
        attachments: attachments || [],
        category: category || undefined,
        project: project || undefined,
      };
      
      console.log("Saving task data:", taskData);
      
      if (isEditMode && task?.id) {
        await updateTask(task.id, taskData);
        toast({
          title: 'Tarefa actualizada',
          description: 'A tarefa foi actualizada correctamente.',
        });
      } else {
        const savedTask = await addTask(taskData);
        console.log("Tarea creada con ID:", savedTask.id);
        toast({
          title: 'Tarefa creada',
          description: `A tarefa foi creada correctamente con ID: ${savedTask.id}`,
        });
      }
      
      setTimeout(() => {
        navigate('/tasks');
        setSubmitting(false);
      }, 800);
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: 'Erro',
        description: 'Ocorreu un erro ao gardar a tarefa. Por favor, inténtao de novo.',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (isEditMode && taskId) {
      try {
        await deleteTask(taskId);
        toast({
          title: 'Tarefa eliminada',
          description: 'A tarefa foi eliminada correctamente.',
        });
        navigate('/tasks');
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: 'Erro',
          description: 'Ocorreu un erro ao eliminar a tarefa. Por favor, inténtao de novo.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleAttachmentAdded = (attachment: TaskAttachment) => {
    setAttachments(prev => [...prev, attachment]);
  };
  
  const handleAttachmentRemoved = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  // Derived values
  const canEdit = true;
  const isTaskCompleted = status === 'completed';
  const isUserAssignedToTask = currentUser && assignments.some(a => {
    const userId = typeof a.user_id === 'string' ? parseInt(a.user_id, 10) : a.user_id;
    return userId === currentUser.id;
  });
  const canAddResolutionAttachments = true;

  return {
    // State
    task,
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
    category,
    setCategory,
    project,
    setProject,
    availableProjects,
    loading,
    submitting,
    showDeleteDialog,
    setShowDeleteDialog,
    availableUsers,
    assignedUserData,
    recentlyAddedUsers,
    attachments,
    creatorUser,
    
    // Functions
    handleSubmit,
    handleDeleteTask,
    handleAttachmentAdded,
    handleAttachmentRemoved,
    
    // Derived values
    isEditMode,
    canEdit,
    isTaskCompleted,
    isUserAssignedToTask,
    canAddResolutionAttachments
  };
};
