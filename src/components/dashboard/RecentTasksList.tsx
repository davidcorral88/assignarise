
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckSquare, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/utils/types';
import { User } from '@/utils/types';

interface RecentTasksListProps {
  tasks: Task[];
  loading: boolean;
  currentUser: User;
}

export const RecentTasksList: React.FC<RecentTasksListProps> = ({ tasks, loading, currentUser }) => {
  const navigate = useNavigate();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="text-green-500">✓</div>;
      case 'in_progress':
        return <div className="text-amber-500">⟳</div>;
      case 'pending':
        return <div className="text-gray-400">○</div>;
      default:
        return <div className="text-muted-foreground">!</div>;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Tarefas recentes</CardTitle>
        <CardDescription>
          {currentUser?.role === 'worker' ? 'As túas tarefas asignadas' : 'Todas as tarefas'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.slice(0, 5).map(task => (
            <div 
              key={task.id} 
              className="flex items-start p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <div className="mr-3 mt-0.5">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baixa'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {task.description}
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <span>
                    Vencemento: {task.dueDate ? format(new Date(task.dueDate), 'dd/MM/yyyy') : 'Non definido'}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {(task.assignments || []).length} 
                    {(task.assignments || []).length === 1 ? ' asignado' : ' asignados'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">Non hai tarefas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {currentUser?.role === 'worker' 
                  ? 'Non tes tarefas asignadas.' 
                  : 'Non hai tarefas no sistema.'}
              </p>
              <Button onClick={() => navigate('/tasks/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear tarefa
              </Button>
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="ghost" className="w-full" onClick={() => navigate('/tasks')}>
          Ver todas as tarefas
        </Button>
      </CardFooter>
    </Card>
  );
};
