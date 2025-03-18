
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  CheckSquare, 
  Clock, 
  Calendar, 
  Tag, 
  Users,
  ArrowLeft,
  Edit,
  CheckCircle2,
  Circle,
  Timer,
  PlusCircle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  getTaskById, 
  getUserById, 
  getTimeEntriesByTaskId,
  getTotalHoursByTask,
  getTotalHoursAllocatedByTask
} from '../utils/mockData';
import { Task, TimeEntry } from '../utils/types';
import { format, parseISO } from 'date-fns';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const fetchedTask = getTaskById(id);
      if (fetchedTask) {
        setTask(fetchedTask);
        setTimeEntries(getTimeEntriesByTaskId(id));
      }
      setLoading(false);
    }
  }, [id]);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!task) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tarea no encontrada</h2>
          <p className="text-muted-foreground mb-6">No se pudo encontrar esta tarea</p>
          <Button onClick={() => navigate('/tasks')}>
            Volver a tareas
          </Button>
        </div>
      </Layout>
    );
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En progreso';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };
  
  const getPriorityClass = (priority: string) => {
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
  
  const creator = getUserById(task.createdBy);
  const totalHoursWorked = getTotalHoursByTask(task.id);
  const totalHoursAllocated = getTotalHoursAllocatedByTask(task.id);
  const progressPercentage = totalHoursAllocated > 0 
    ? Math.min(Math.round((totalHoursWorked / totalHoursAllocated) * 100), 100) 
    : 0;
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
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
            {/* Only managers or the assigned workers can edit tasks */}
            {(currentUser?.role === 'manager' || task.assignments.some(a => a.userId === currentUser?.id)) && (
              <Button onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar tarea
              </Button>
            )}
            
            {/* Only assigned workers can log time */}
            {currentUser?.role === 'worker' && task.assignments.some(a => a.userId === currentUser?.id) && (
              <Button variant="outline" onClick={() => navigate('/time-tracking')}>
                <Timer className="mr-2 h-4 w-4" />
                Registrar horas
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`${getPriorityClass(task.priority)}`}>
                Prioridad: {getPriorityText(task.priority)}
              </Badge>
              
              <Badge variant="outline">
                Estado: {getStatusText(task.status)}
              </Badge>
              
              {task.tags && task.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{task.description}</p>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="assignments">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
                <TabsTrigger value="timeEntries">Registro de horas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assignments" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Asignaciones
                    </CardTitle>
                    <CardDescription>
                      Usuarios asignados y horas asignadas a esta tarea
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {task.assignments.length > 0 ? (
                      <div className="space-y-4">
                        {task.assignments.map(assignment => {
                          const user = getUserById(assignment.userId);
                          const hoursWorked = timeEntries
                            .filter(entry => entry.userId === assignment.userId)
                            .reduce((sum, entry) => sum + entry.hours, 0);
                          
                          const progress = assignment.allocatedHours > 0 
                            ? Math.min(Math.round((hoursWorked / assignment.allocatedHours) * 100), 100) 
                            : 0;
                          
                          return (
                            <div key={assignment.userId} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                  {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full" />
                                  ) : (
                                    <span className="text-sm font-medium text-primary-foreground">
                                      {user?.name.substring(0, 2)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{user?.name}</p>
                                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col min-w-[180px]">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progreso: {progress}%</span>
                                  <span>{hoursWorked} / {assignment.allocatedHours} horas</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${progress}%` }} 
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground mb-4">No hay usuarios asignados a esta tarea</p>
                        {currentUser?.role === 'manager' && (
                          <Button onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Asignar usuarios
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="timeEntries" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Timer className="mr-2 h-4 w-4" />
                      Registro de horas
                    </CardTitle>
                    <CardDescription>
                      Horas registradas para esta tarea
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {timeEntries.length > 0 ? (
                      <div className="space-y-4">
                        {timeEntries.map(entry => {
                          const user = getUserById(entry.userId);
                          return (
                            <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                  {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full" />
                                  ) : (
                                    <span className="text-sm font-medium text-primary-foreground">
                                      {user?.name.substring(0, 2)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">{user?.name}</p>
                                  <p className="text-sm text-muted-foreground">{format(new Date(entry.date), 'dd/MM/yyyy')}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <Badge variant="secondary">{entry.hours} horas</Badge>
                                {entry.notes && (
                                  <p className="text-sm text-muted-foreground">
                                    "{entry.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Timer className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground mb-4">No hay horas registradas para esta tarea</p>
                        {currentUser?.role === 'worker' && task.assignments.some(a => a.userId === currentUser.id) && (
                          <Button onClick={() => navigate('/time-tracking')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar horas
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Creado por</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      {creator?.avatar ? (
                        <img src={creator.avatar} alt={creator.name} className="h-full w-full rounded-full" />
                      ) : (
                        <span className="text-xs font-medium text-primary-foreground">
                          {creator?.name.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    <span>{creator?.name}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de creación</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(task.createdAt), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
                
                {task.dueDate && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de vencimiento</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(parseISO(task.dueDate), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskDetail;
