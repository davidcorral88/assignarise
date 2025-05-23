import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Tag, Users, Hash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Task, User } from '@/utils/types';
import { UserAvatar } from './UserAvatar';
import { TaskStatusIcon, getStatusText } from './TaskStatusIcon';

interface TaskDetailSidebarProps {
  task: Task;
  creator: User | null;
  totalHoursWorked: number;
  totalHoursAllocated: number;
  formatDate: (dateString?: string | null) => string;
}

export const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({
  task,
  creator,
  totalHoursWorked,
  totalHoursAllocated,
  formatDate
}) => {
  const progressPercentage = totalHoursAllocated > 0 
    ? Math.min(Math.round((totalHoursWorked / totalHoursAllocated) * 100), 100) 
    : 0;
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">ID de tarefa</h3>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span>{task.id}</span>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Creado por</h3>
          <div className="flex items-center gap-2">
            <UserAvatar user={creator} size="sm" />
            <span>{creator?.name || 'Usuario desconocido'}</span>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de creación</h3>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{task.createdAt ? formatDate(task.createdAt) : 'No disponible'}</span>
          </div>
        </div>
        
        {task.dueDate && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de vencimiento</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
          </>
        )}
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
          <div className="flex items-center gap-2">
            <TaskStatusIcon status={task.status} />
            <span>{getStatusText(task.status)}</span>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Prioridad</h3>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span>{getPriorityText(task.priority)}</span>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Asignados</h3>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{task.assignments.length} usuarios</span>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Progreso</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progressPercentage}% completado</span>
              <span>{totalHoursWorked} / {totalHoursAllocated} horas</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
