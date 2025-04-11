
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, User } from '@/utils/types';
import { Circle, Clock, UserCheck, CalendarDays, CalendarClock, Folder, ListTodo } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TaskDetailSidebarProps {
  task: Task;
  creator: User | null;
  totalHoursWorked: number;
  totalHoursAllocated: number;
  formatDate: (date?: string | null) => string;
}

export const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({
  task,
  creator,
  totalHoursWorked,
  totalHoursAllocated,
  formatDate
}) => {
  // Calculate progress percentage
  const progressPercentage = totalHoursAllocated > 0 
    ? Math.min(Math.round((totalHoursWorked / totalHoursAllocated) * 100), 100)
    : 0;
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Progreso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {totalHoursAllocated > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{totalHoursWorked.toFixed(1)} horas trabajadas</span>
                <span>{totalHoursAllocated.toFixed(1)} horas asignadas</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No hay horas asignadas para esta tarea.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Category information */}
            {task.category && (
              <div className="flex items-start">
                <Folder className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{task.category}</p>
                </div>
              </div>
            )}

            {/* Project information */}
            {task.project && (
              <div className="flex items-start">
                <ListTodo className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Proyecto</p>
                  <p className="font-medium">{task.project}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <Circle className={`h-4 w-4 mr-2 mt-0.5 ${
                task.priority === 'high' ? 'text-red-500' :
                task.priority === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
              <div>
                <p className="text-sm text-muted-foreground">Prioridad</p>
                <p className="font-medium">
                  {task.priority === 'high' && 'Alta'}
                  {task.priority === 'medium' && 'Media'}
                  {task.priority === 'low' && 'Baja'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <UserCheck className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Creada por</p>
                <p className="font-medium">{creator ? creator.name : 'Usuario desconocido'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Creada el</p>
                <p className="font-medium">{formatDate(task.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha inicio</p>
                <p className="font-medium">{formatDate(task.startDate)}</p>
              </div>
            </div>

            {task.dueDate && (
              <div className="flex items-start">
                <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha vencimiento</p>
                  <p className="font-medium">{formatDate(task.dueDate)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
