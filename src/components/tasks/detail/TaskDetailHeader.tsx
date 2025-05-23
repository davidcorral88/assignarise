
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Task } from '@/utils/types';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex-1">
        {/* Empty space to maintain layout structure */}
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
