
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
  mockTasks, 
  mockUsers, 
  mockTimeEntries, 
  getTasksByUserId, 
  getTimeEntriesByUserId 
} from '../utils/mockData';
import { Task } from '../utils/types';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'worker') {
        // Workers only see tasks assigned to them
        setUserTasks(getTasksByUserId(currentUser.id));
      } else {
        // Managers see all tasks
        setUserTasks(mockTasks);
      }
    }
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
    if (currentUser?.role === 'manager') {
      // For managers: tasks by status
      const statusCounts = {
        completed: mockTasks.filter(t => t.status === 'completed').length,
        in_progress: mockTasks.filter(t => t.status === 'in_progress').length,
        pending: mockTasks.filter(t => t.status === 'pending').length,
      };
      
      return [
        { name: 'Completadas', value: statusCounts.completed },
        { name: 'En progreso', value: statusCounts.in_progress },
        { name: 'Pendientes', value: statusCounts.pending },
      ];
    } else {
      // For workers: hours by task for their tasks
      const userEntries = getTimeEntriesByUserId(currentUser?.id || '');
      const taskHours: Record<string, number> = {};
      
      userEntries.forEach(entry => {
        const task = mockTasks.find(t => t.id === entry.taskId);
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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido, {currentUser?.name}. {currentUser?.role === 'manager' ? 'Aquí tienes un resumen de todas las tareas.' : 'Aquí tienes tus tareas asignadas.'}
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => navigate('/tasks/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Tareas totales
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userTasks.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentUser?.role === 'manager' 
                  ? 'Todas las tareas en el sistema' 
                  : 'Tareas asignadas a ti'}
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
                Tareas actualmente en progreso
              </p>
            </CardContent>
          </Card>
          
          {currentUser?.role === 'manager' ? (
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
                  Usuarios registrados en el sistema
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Horas registradas
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {getTimeEntriesByUserId(currentUser?.id || '').reduce((sum, entry) => sum + entry.hours, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de horas registradas
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Tareas recientes</CardTitle>
              <CardDescription>
                {currentUser?.role === 'manager' ? 'Todas las tareas' : 'Tus tareas asignadas'}
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
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <span>
                          Vencimiento: {task.dueDate ? format(new Date(task.dueDate), 'dd/MM/yyyy') : 'No definido'}
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
                    <h3 className="text-lg font-medium mb-1">No hay tareas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {currentUser?.role === 'manager' 
                        ? 'No hay tareas en el sistema.' 
                        : 'No tienes tareas asignadas.'}
                    </p>
                    <Button onClick={() => navigate('/tasks/new')}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crear tarea
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" className="w-full" onClick={() => navigate('/tasks')}>
                Ver todas las tareas
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Análisis</CardTitle>
                <CardDescription>
                  {currentUser?.role === 'manager' 
                    ? 'Estado de las tareas' 
                    : 'Horas trabajadas por tarea'}
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
                    <Bar dataKey="value" fill="hsl(var(--primary))" name={currentUser?.role === 'manager' ? 'Tareas' : 'Horas'} />
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
