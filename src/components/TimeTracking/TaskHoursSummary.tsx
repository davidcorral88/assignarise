
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Clock, Eye, Search, Filter } from 'lucide-react';
import { Task, User } from '@/utils/types';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskProgress {
  worked: number;
  allocated: number;
  percentage: number;
}

interface TaskHoursSummaryProps {
  tasks: Task[];
  taskProgress: Record<string, TaskProgress>;
  formatHoursToDecimal: (hours: number) => string;
  currentUser: User | null;
  workers?: User[];
}

export const TaskHoursSummary: React.FC<TaskHoursSummaryProps> = ({
  tasks,
  taskProgress,
  formatHoursToDecimal,
  currentUser,
  workers = []
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<string>('all');
  
  // Determine if the user has manager/admin permissions
  const hasManagerAccess = currentUser && 
    ['admin', 'dxm', 'xerenteATSXPTPG'].includes(currentUser.role);

  // Filter tasks based on role and selected worker
  const getFilteredTasks = () => {
    // If not admin/manager, only show user's assigned tasks
    let filteredByAccess = tasks;
    
    if (!hasManagerAccess) {
      // Workers can only see their own tasks
      filteredByAccess = tasks.filter(task => {
        return task.assignments?.some(assignment => {
          const assignmentUserId = typeof assignment.user_id === 'string' 
            ? parseInt(assignment.user_id, 10) 
            : assignment.user_id;
          
          const userIdNumber = typeof currentUser?.id === 'string' 
            ? parseInt(currentUser.id, 10) 
            : currentUser?.id;
          
          return assignmentUserId === userIdNumber;
        });
      });
    } else if (selectedWorker !== 'all') {
      // Managers with worker filter
      const workerId = parseInt(selectedWorker, 10);
      filteredByAccess = tasks.filter(task => {
        return task.assignments?.some(assignment => {
          const assignmentUserId = typeof assignment.user_id === 'string' 
            ? parseInt(assignment.user_id, 10) 
            : assignment.user_id;
          
          return assignmentUserId === workerId;
        });
      });
    }
    
    // Apply search filter
    return filteredByAccess.filter(task => {
      const taskId = typeof task.id === 'string' ? task.id : String(task.id);
      const searchLower = searchQuery.toLowerCase();
      return (
        taskId.toLowerCase().includes(searchLower) ||
        task.title.toLowerCase().includes(searchLower)
      );
    });
  };
  
  // Sort tasks by hours worked and take top 10
  const getSortedTasks = () => {
    return getFilteredTasks()
      .sort((a, b) => {
        const aProgress = taskProgress[typeof a.id === 'string' ? a.id : String(a.id)]?.worked || 0;
        const bProgress = taskProgress[typeof b.id === 'string' ? b.id : String(b.id)]?.worked || 0;
        return bProgress - aProgress;
      })
      .slice(0, 10);
  };

  const displayedTasks = getSortedTasks();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución das tarefas asignadas</CardTitle>
        <CardDescription>
          {hasManagerAccess 
            ? 'Visualiza o progreso de horas por tarefa para cada traballador' 
            : 'Visualiza o progreso das túas horas en cada tarefa asignada'}
        </CardDescription>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID ou nome da tarefa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>
          
          {hasManagerAccess && workers.length > 0 && (
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por traballador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os traballadores</SelectItem>
                  {workers.map((worker) => (
                    <SelectItem 
                      key={worker.id} 
                      value={String(worker.id)}
                    >
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {displayedTasks.length > 0 ? (
            displayedTasks.map(task => {
              const taskId = typeof task.id === 'string' ? task.id : String(task.id);
              const progress = taskProgress[taskId] || { worked: 0, allocated: 0, percentage: 0 };
              
              return (
                <div key={task.id} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{task.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1.5 h-4 w-4" />
                        <span>
                          Estado: {task.status === 'completed' ? 'Completada' : task.status === 'in_progress' ? 'En progreso' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/${taskId}`)}>
                        <Eye className="mr-2 h-3 w-3" />
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso: {progress.percentage}%</span>
                      <span>
                        {formatHoursToDecimal(progress.worked)} / 
                        {formatHoursToDecimal(progress.allocated)} horas
                      </span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Non se atoparon tarefas que coincidan coa búsqueda' 
                  : hasManagerAccess && selectedWorker !== 'all'
                    ? 'Non hai tarefas asignadas ao traballador seleccionado'
                    : 'Non hai tarefas asignadas'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
