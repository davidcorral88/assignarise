
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/utils/types';
import { TaskStatusIcon } from './TaskStatusIcon';

interface TaskDetailHeaderProps {
  task: Task;
  currentUserId?: number;
  currentUserRole?: string;
}

export const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({
  task,
  currentUserId,
  currentUserRole
}) => {
  const navigate = useNavigate();
  
  const isAssignedToCurrentUser = task.assignments && 
    task.assignments.some(a => a.userId === currentUserId);
  
  const canEdit = currentUserRole === 'director' || 
    currentUserRole === 'admin' || 
    isAssignedToCurrentUser;

  const canTrackTime = currentUserRole === 'worker' && isAssignedToCurrentUser;
  
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
        
        {canTrackTime && (
          <Button variant="outline" onClick={() => navigate('/time-tracking')}>
            <Timer className="mr-2 h-4 w-4" />
            Registrar horas
          </Button>
        )}
      </div>
    </div>
  );
};
