
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Timer, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/utils/types';
import { TaskStatusIcon } from './TaskStatusIcon';

interface TaskDetailHeaderProps {
  task: Task;
  currentUserId?: number;
  onDeleteTask?: () => void;
}

export const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({
  task,
  currentUserId,
  onDeleteTask
}) => {
  const navigate = useNavigate();
  
  // All users can edit and delete tasks
  const canEdit = true;
  const canDelete = true;

  // Users can track time if they're assigned to the task
  const isAssignedToCurrentUser = task.assignments && 
    task.assignments.some(a => {
      const assignmentUserId = typeof a.userId === 'string' ? parseInt(a.userId, 10) : a.userId;
      return assignmentUserId === currentUserId;
    });
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4">
      <Button 
        variant="ghost" 
        className="w-fit pl-0 hover:pl-0 hover:bg-transparent" 
        onClick={() => navigate('/tasks')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a tareas
      </Button>
      
      <div className="flex space-x-2">
        {canEdit && (
          <Button onClick={() => navigate(`/tasks/${task.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar tarea
          </Button>
        )}
        
        {canDelete && onDeleteTask && (
          <Button variant="destructive" onClick={onDeleteTask}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        )}
        
        {isAssignedToCurrentUser && (
          <Button variant="outline" onClick={() => navigate('/time-tracking')}>
            <Timer className="mr-2 h-4 w-4" />
            Registrar horas
          </Button>
        )}
      </div>
    </div>
  );
};
