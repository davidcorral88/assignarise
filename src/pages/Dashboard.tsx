
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
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
import { getTasks, getTasksByUserId, getTimeEntriesByUserId, getUsers } from '../utils/apiService';
import { Task, TimeEntry } from '../utils/types';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userTimeEntries, setUserTimeEntries] = useState<TimeEntry[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        setLoading(true);
        setError(null);
        
        try {
          // Fetch users count with better error handling
          try {
            const users = await getUsers();
            setUserCount(users.length);
          } catch (error) {
            console.error("Error fetching users:", error);
            setUserCount(0); // Fallback
          }
          
          // Fetch tasks with robust error handling
          let tasksData: Task[] = [];
          
          if (currentUser.role === 'worker') {
            // Workers only see tasks assigned to them
            const userId = currentUser.id;
            console.log(`Fetching tasks for worker with ID: ${userId}`);
            
            try {
              // Convert userId to string before passing it to getTasksByUserId
              const userIdStr = userId.toString();
              tasksData = await getTasksByUserId(userIdStr);
              console.log(`Retrieved ${tasksData.length} tasks for worker`);
            } catch (error) {
              console.error("Error fetching worker tasks:", error);
              toast({
                title: 'Erro',
                description: 'Non se puideron cargar as tarefas',
                variant: 'destructive',
              });
              tasksData = []; // Set empty array on error
            }
          } else {
            // Directors and Admins see all tasks
            try {
              tasksData = await getTasks();
              console.log(`Retrieved ${tasksData.length} tasks for admin/director`);
            } catch (error) {
              console.error("Error fetching all tasks:", error);
              toast({
                title: 'Erro',
                description: 'Non se puideron cargar as tarefas',
                variant: 'destructive',
              });
              tasksData = []; // Set empty array on error
            }
          }
          
          // Ensure all tasks have an assignments array
          const normalizedTasks = tasksData.map(task => ({
            ...task,
            assignments: task.assignments || []
          }));
          
          setUserTasks(normalizedTasks);
          
          // Fetch time entries for the user with better error handling
          if (currentUser.role === 'worker') {
            try {
              // Convert user ID to string for the time entries API call as well
              const userIdStr = currentUser.id.toString();
              const entries = await getTimeEntriesByUserId(userIdStr);
              setUserTimeEntries(entries || []);
            } catch (error) {
              console.error("Error fetching time entries:", error);
              toast({
                title: 'Erro',
                description: 'Non se puideron cargar os rexistros de tempo',
                variant: 'destructive',
              });
              setUserTimeEntries([]);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Non se puideron cargar os datos. Por favor, inténteo de novo máis tarde.");
          toast({
            title: 'Erro',
            description: 'Non se puideron cargar os datos',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Reset states if no user
        setUserTasks([]);
        setUserTimeEntries([]);
        setUserCount(0);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Safe task ID comparison helper function
  const isSameTask = (taskId1: string | number, taskId2: string | number): boolean => {
    // Convert both to string for comparison
    return String(taskId1) === String(taskId2);
  };
  
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
  
  const getChartData = () => {
    if (!userTasks || userTasks.length === 0) {
      return [];
    }
    
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
      const taskHours: Record<string, number> = {};
      
      if (!userTimeEntries || userTimeEntries.length === 0 || !userTasks || userTasks.length === 0) {
        return [];
      }
      
      userTimeEntries.forEach(entry => {
        // Fix the type comparison by using the helper function
        const task = userTasks.find(t => isSameTask(t.id, entry.task_id));
        
        if (task) {
          const taskName = task.title.substring(0, 20) + (task.title.length > 20 ? '...' : '');
          taskHours[taskName] = (taskHours[taskName] || 0) + entry.hours;
        }
      });
      
      return Object.entries(taskHours).map(([name, value]) => ({ name, value }));
    }
  };
  
  // If there's no user (not authenticated), show a loading state until redirect happens
  if (!currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error && !loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
              <p className="text-muted-foreground mt-1">
                Benvido/a, {currentUser?.name}.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-medium mb-2">Erro ao cargar datos</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="default"
            >
              Intentar de novo
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
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
                  {userCount}
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
                  {userTimeEntries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}
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
                {currentUser?.role === 'worker' ? 'As túas tarefas asignadas' : 'Todas as tarefas'}
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
                          {(task.assignments || []).length} 
                          {(task.assignments || []).length === 1 ? ' asignado' : ' asignados'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {userTasks.length === 0 && !loading && (
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
          
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Análise</CardTitle>
                <CardDescription>
                  {currentUser?.role === 'director' || currentUser?.role === 'admin'
                    ? 'Estado das tarefas' 
                    : 'Horas traballadas por tarefa'}
                </CardDescription>
              </div>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                {!loading ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {getChartData().length > 0 ? (
                      <BarChart data={getChartData()}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="hsl(var(--primary))" name={currentUser?.role === 'director' || currentUser?.role === 'admin' ? 'Tarefas' : 'Horas'} />
                      </BarChart>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <BarChart2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                          {currentUser?.role === 'director' || currentUser?.role === 'admin'
                            ? 'Non hai datos suficientes para mostrar a análise.' 
                            : 'Non hai horas rexistradas para mostrar.'}
                        </p>
                      </div>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
