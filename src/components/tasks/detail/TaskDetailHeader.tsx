
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Task } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { TaskStatusIcon } from './TaskStatusIcon';
import { TaskStatusBadge, TaskPriorityBadge, TagBadge } from './TaskBadges';

interface TaskDetailHeaderProps {
  task: Task;
  currentUserId?: number;
  canEdit?: boolean;
  userRole?: string;
}

export const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({
  task,
  currentUserId,
  canEdit = true,
  userRole = 'worker'
}) => {
  const navigate = useNavigate();
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En progreso';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex-1">
        <div className="flex items-center">
          <TaskStatusIcon status={task.status} className="mr-2 h-5 w-5" />
          <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm text-muted-foreground">
            {getStatusText(task.status)}
          </span>
          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            {task.tags && task.tags.map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-start sm:self-center">
        <Button 
          variant="ghost" 
          className="hover:bg-transparent" 
          onClick={() => navigate('/tasks')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a tarefas
        </Button>
        
        {canEdit && userRole === 'admin' && (
          <Button onClick={() => navigate(`/tasks/${task.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar tarefa
          </Button>
        )}
      </div>
    </div>
  );
};
