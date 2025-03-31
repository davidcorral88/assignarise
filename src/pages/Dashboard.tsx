
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  CheckSquare, 
  Clock, 
  Users, 
  PlusCircle, 
  CheckCircle2,
  Circle,
  AlertCircle,
  BarChart2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  mockUsers, 
  mockTimeEntries, 
  getTimeEntriesByUserId 
} from '../utils/mockData';
import {
  getTasks,
  getTasksByUserId
} from '../utils/apiService'; // Use API functions for tasks
import { Task } from '../utils/types';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (currentUser) {
        try {
          let tasksData;
          if (currentUser.role === 'worker') {
            // Workers only see tasks assigned to them
            tasksData = await getTasksByUserId(currentUser.id);
          } else {
            // Directors and Admins see all tasks
            tasksData = await getTasks();
          }
          setUserTasks(tasksData);
        } catch (error) {
          console.error("Error fetching tasks:", error);
          // If API fails, fallback to empty array
          setUserTasks([]);
          toast({
            title: 'Error',
            description: 'Non se puideron cargar as tarefas',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchTasks();
  }, [currentUser]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-green-500" />;
      case 'in_progress':
        return <Clock className="text-amber-500" />;
      case 'pending':
        return <Circle className="text-gray-400" />;
      default:
        return <AlertCircle className="text-muted-foreground" />;
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
  
  // Prepare chart data
  const getChartData = () => {
    if (currentUser?.role === 'director' || currentUser?.role === 'admin') {
      // For directors and admins: tasks by status
      const statusCounts = {
        completed: userTasks.filter(t => t.status === 'completed').length,
        in_progress: userTasks.filter(t => t.status === 'in_progress').length,
        pending: userTasks.filter(t => t.status === 'pending').length,
      };
      
      return [
        { name: 'Completadas', value: statusCounts.completed },
        { name: 'En progreso', value: statusCounts.in_progress },
        { name: 'Pendentes', value: statusCounts.pending },
      ];
    } else {
      // For workers: hours by task for their tasks
      const userEntries = getTimeEntriesByUserId(currentUser?.id || '');
      const taskHours: Record<string, number> = {};
      
      userEntries.forEach(entry => {
        const task = userTasks.find(t => t.id === entry.taskId);
        if (task) {
          const taskName = task.title.substring(0, 20) + (task.title.length > 20 ? '...' : '');
          taskHours[taskName] = (taskHours[taskName] || 0) + entry.hours;
        }
      });
      
      return Object.entries(taskHours).map(([name, value]) => ({ name, value }));
    }
  };
  
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
            <p className="text-muted-foreground mt-1">
              Benvido/a, {currentUser?.name}. {currentUser?.role === 'worker' ? 'Aquí tes as túas tarefas asignadas.' : 'Aquí tes un resumo de todas as tarefas.'}
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => navigate('/tasks/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova tarefa
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tarefas totais
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userTasks.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentUser?.role === 'worker'
                  ? 'Tarefas asignadas a ti'
                  : 'Todas as tarefas no sistema'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                En progreso
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userTasks.filter(task => task.status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tarefas actualmente en progreso
              </p>
            </CardContent>
          </Card>
          
          {(currentUser?.role === 'director' || currentUser?.role === 'admin') ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuarios
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {mockUsers.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios rexistrados no sistema
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Horas rexistradas
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {getTimeEntriesByUserId(currentUser?.id || '').reduce((sum, entry) => sum + entry.hours, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de horas rexistradas
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Tarefas recentes</CardTitle>
              <CardDescription>
                {currentUser?.role === 'director' ? 'Todas as tarefas' : 'As túas tarefas asignadas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userTasks.slice(0, 5).map(task => (
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
                          {task.assignments.length} 
                          {task.assignments.length === 1 ? ' asignado' : ' asignados'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {userTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-1">Non hai tarefas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentUser?.role === 'director' 
                        ? 'Non hai tarefas no sistema.' 
                        : 'Non tes tarefas asignadas.'}
                    </p>
                    <Button onClick={() => navigate('/tasks/new')}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crear tarefa
                    </Button>
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
          
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Análise</CardTitle>
                <CardDescription>
                  {currentUser?.role === 'director' 
                    ? 'Estado das tarefas' 
                    : 'Horas traballadas por tarefa'}
                </CardDescription>
              </div>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name={currentUser?.role === 'director' ? 'Tarefas' : 'Horas'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
