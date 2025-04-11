
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, CheckSquare, Trash2 } from 'lucide-react';
import { useTaskForm } from '@/hooks/useTaskForm';
import TaskBasicInfo from '@/components/tasks/TaskFormComponents/TaskBasicInfo';
import TaskTags from '@/components/tasks/TaskFormComponents/TaskTags';
import TaskAttachments from '@/components/tasks/TaskFormComponents/TaskAttachments';
import TaskAssignments from '@/components/tasks/TaskFormComponents/TaskAssignments';
import TaskSidebar from '@/components/tasks/TaskFormComponents/TaskSidebar';

const TaskForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
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
    
    handleSubmit,
    handleDeleteTask,
    handleAttachmentAdded,
    handleAttachmentRemoved,
    
    isEditMode,
    canEdit,
    isTaskCompleted,
    isUserAssignedToTask,
    canAddResolutionAttachments
  } = useTaskForm(id);
  
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
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Información básica</CardTitle>
                  <CardDescription>
                    Ingresa os detalles básicos da tarefa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskBasicInfo
                    task={task}
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
                    creatorUser={creatorUser}
                    isEditMode={isEditMode}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Etiquetas</CardTitle>
                  <CardDescription>
                    Engade etiquetas para categorizar esta tarefa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskTags tags={tags} setTags={setTags} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Arquivos adjuntos</CardTitle>
                  <CardDescription>
                    Xestión de arquivos relacionados coa tarefa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskAttachments
                    taskId={task?.id}
                    attachments={attachments}
                    onAttachmentAdded={handleAttachmentAdded}
                    onAttachmentRemoved={handleAttachmentRemoved}
                    canEdit={canEdit}
                    canAddResolutionAttachments={canAddResolutionAttachments}
                    isUserAssignedToTask={isUserAssignedToTask}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Asignacións</CardTitle>
                  <CardDescription>
                    Asigna esta tarefa a un ou varios traballadores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskAssignments
                    assignments={assignments}
                    setAssignments={setAssignments}
                    availableUsers={availableUsers}
                    assignedUserData={assignedUserData}
                    recentlyAddedUsers={recentlyAddedUsers}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Detalles</CardTitle>
                  <CardDescription>
                    Configura o estado e a prioridade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TaskSidebar
                    status={status}
                    setStatus={setStatus}
                    priority={priority}
                    setPriority={setPriority}
                    dueDate={dueDate}
                    setDueDate={setDueDate}
                    submitting={submitting}
                    isEditMode={isEditMode}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TaskForm;
