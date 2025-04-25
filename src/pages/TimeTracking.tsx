import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { 
  getTasksAssignments, getTimeEntriesByUserId, deleteTimeEntry,
  setStateFromPromise, getTotalHoursByTask, getTotalHoursAllocatedByTask
} from '../utils/dataService';
import { useAuth } from '../components/auth/useAuth';
import { Task, TimeEntry } from '../utils/types';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Clock, Calendar, PlusCircle, Timer, Save, Eye, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import TimeTrackingForm from '@/components/TimeTracking/TimeTrackingForm';
import WeeklyHours from '@/components/TimeTracking/WeeklyHours';

const TimeTracking = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [taskProgress, setTaskProgress] = useState<Record<string, {worked: number, allocated: number, percentage: number}>>({});
  const [selectedWeek, setSelectedWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          
          const fetchedTasks = await getTasksAssignments();
          console.log('Fetched tasks with assignments:', fetchedTasks);
          console.log('Current user ID:', currentUser.id);
          
          if (fetchedTasks && fetchedTasks.length > 0) {
            fetchedTasks.forEach(task => {
              if (task.assignments) {
                console.log(`Task ${task.id} (${task.title}) has ${task.assignments.length} assignments:`, 
                  task.assignments.map(a => `User ${a.user_id} (${typeof a.user_id}) with ${a.allocatedHours} hours`).join(', ')
                );
              } else {
                console.log(`Task ${task.id} (${task.title}) has no assignments`);
              }
            });
          }
          
          setTasks(fetchedTasks);
          
          const userId = typeof currentUser.id === 'string' ? currentUser.id : String(currentUser.id);
          const fetchedEntries = await getTimeEntriesByUserId(userId);
          console.log('Fetched time entries:', fetchedEntries);
          setTimeEntries(fetchedEntries);
          
          await calculateTasksProgress(fetchedTasks);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast({
            title: 'Error',
            description: 'Non se puideron cargar os datos',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [currentUser]);

  const handleWeekChange = (newWeek: Date) => {
    setSelectedWeek(newWeek);
  };

  const getFilteredTimeEntries = () => {
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
  };
  
  const calculateTasksProgress = async (fetchedTasks: Task[]) => {
    const userTaskIds = fetchedTasks
      .filter(task => task.assignments?.some(assignment => {
        const assignmentUserId = typeof assignment.user_id === 'string' 
          ? parseInt(assignment.user_id, 10) 
          : assignment.user_id;
        
        const userIdNumber = typeof currentUser?.id === 'string' 
          ? parseInt(currentUser.id, 10) 
          : currentUser?.id;
        
        return assignmentUserId === userIdNumber;
      }))
      .map(task => task.id);
      
    if (!userTaskIds.length) return;
      
    const progressData: Record<string, {worked: number, allocated: number, percentage: number}> = {};
      
    for (const taskId of userTaskIds) {
      if (!taskId) continue;
        
      try {
        const totalHoursWorked = await getTotalHoursByTask(taskId);
        const totalHoursAllocated = await getTotalHoursAllocatedByTask(taskId);
          
        const progressPercentage = totalHoursAllocated > 0 
          ? Math.min(Math.round((totalHoursWorked / totalHoursAllocated) * 100), 100) 
          : 0;
            
        progressData[taskId] = {
          worked: totalHoursWorked,
          allocated: totalHoursAllocated,
          percentage: progressPercentage
        };
      } catch (error) {
        console.error(`Error calculating progress for task ${taskId}:`, error);
      }
    }
      
    setTaskProgress(progressData);
  };
  
  const handleTimeEntryAdded = async (entry: TimeEntry) => {
    console.log('Entry added successfully, updating state:', entry);
    setTimeEntries(prevEntries => [entry, ...prevEntries]);
    setIsAddingEntry(false);
    
    if (entry.task_id) {
      try {
        const taskId = typeof entry.task_id === 'string' ? entry.task_id : String(entry.task_id);
        const totalHoursWorked = await getTotalHoursByTask(taskId);
        const totalHoursAllocated = await getTotalHoursAllocatedByTask(taskId);
        
        const progressPercentage = totalHoursAllocated > 0 
          ? Math.min(Math.round((totalHoursWorked / totalHoursAllocated) * 100), 100) 
          : 0;
            
        setTaskProgress(prev => ({
          ...prev,
          [taskId]: {
            worked: totalHoursWorked,
            allocated: totalHoursAllocated,
            percentage: progressPercentage
          }
        }));
      } catch (error) {
        console.error('Error updating task progress:', error);
      }
    }
  };
  
  const handleDeleteEntry = async (entryId: string | number) => {
    try {
      const entryToDelete = timeEntries.find(entry => entry.id === entryId);
      await deleteTimeEntry(entryId);
      setTimeEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      
      toast({
        title: 'Rexistro eliminado',
        description: 'O rexistro de horas eliminouse correctamente',
      });
      
      if (entryToDelete && entryToDelete.task_id) {
        const taskId = typeof entryToDelete.task_id === 'string' ? 
          entryToDelete.task_id : String(entryToDelete.task_id);
        
        try {
          const totalHoursWorked = await getTotalHoursByTask(taskId);
          const totalHoursAllocated = await getTotalHoursAllocatedByTask(taskId);
          
          const progressPercentage = totalHoursAllocated > 0 
            ? Math.min(Math.round((totalHoursWorked / totalHoursAllocated) * 100), 100) 
            : 0;
              
          setTaskProgress(prev => ({
            ...prev,
            [taskId]: {
              worked: totalHoursWorked,
              allocated: totalHoursAllocated,
              percentage: progressPercentage
            }
          }));
        } catch (error) {
          console.error('Error updating task progress after deletion:', error);
        }
      }
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Non se puido eliminar o rexistro de horas',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  const filteredTimeEntries = getFilteredTimeEntries();
  
  const userTasks = tasks.filter(task => {
    if (!task.assignments || !Array.isArray(task.assignments)) {
      console.log(`Task ${task.id} has no valid assignments array`);
      return false;
    }
    
    return task.assignments.some(assignment => {
      const assignmentUserId = typeof assignment.user_id === 'string' 
        ? parseInt(assignment.user_id, 10) 
        : assignment.user_id;
      
      const userIdNumber = typeof currentUser?.id === 'string' 
        ? parseInt(currentUser.id, 10) 
        : currentUser?.id;
      
      const isAssigned = assignmentUserId === userIdNumber;
      
      if (isAssigned) {
        console.log(`User ${userIdNumber} is assigned to task ${task.id}`);
      }
      
      return isAssigned;
    });
  });
  
  console.log(`Filtered user tasks: ${userTasks.length}`);
  
  const formatHoursToDecimal = (hours: number): string => {
    return hours.toFixed(1);
  };
  
  const formatHoursToTimeFormat = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rexistro de horas</h1>
            <p className="text-muted-foreground mt-1">
              Rexistra o tempo traballado nas túas tarefas asignadas
            </p>
          </div>
          <Button 
            className="mt-4 sm:mt-0" 
            onClick={() => setIsAddingEntry(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Rexistrar horas
          </Button>
        </div>
        
        {isAddingEntry && currentUser && (
          <TimeTrackingForm 
            tasks={tasks}
            onEntryAdded={handleTimeEntryAdded}
            onCancel={() => setIsAddingEntry(false)}
            userId={currentUser.id}
          />
        )}
        
        {currentUser && (
          <WeeklyHours 
            tasks={tasks}
            timeEntries={timeEntries}
            userId={currentUser.id}
            onEntryAdded={handleTimeEntryAdded}
            selectedWeek={selectedWeek}
            onWeekChange={handleWeekChange}
          />
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Historial de horas rexistradas</CardTitle>
            <CardDescription>
              Visualiza e xestiona os teus rexistros de horas traballadas na semana do {format(selectedWeek, 'dd/MM/yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Accións</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimeEntries.length > 0 ? (
                    filteredTimeEntries.map((entry) => {
                      const taskId = typeof entry.task_id === 'string' 
                        ? parseInt(entry.task_id, 10) 
                        : entry.task_id;
                        
                      const task = tasks.find(t => {
                        const tId = typeof t.id === 'string' ? parseInt(t.id, 10) : t.id;
                        return tId === taskId;
                      });
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-primary" />
                              <span>{task?.title || 'Tarefa non atopada'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{formatHoursToTimeFormat(entry.hours)}</TableCell>
                          <TableCell>
                            <span className="truncate block max-w-[200px]">
                              {entry.notes || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Accións</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Accións</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigate(`/tasks/${taskId}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver tarefa
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar rexistro
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-500" 
                                  onClick={() => handleDeleteEntry(entry.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <Timer className="h-10 w-10 text-muted-foreground/50 mb-4" />
                          <p className="text-sm text-muted-foreground">Non hai rexistros para esta semana</p>
                          <Button 
                            variant="outline" 
                            className="mt-4" 
                            onClick={() => setIsAddingEntry(true)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Rexistrar horas
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Resumo de horas por tarefa</CardTitle>
            <CardDescription>
              Visualiza o progreso das túas horas en cada tarefa asignada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {userTasks.length > 0 ? (
                userTasks.map(task => {
                  const taskId = typeof task.id === 'string' ? task.id : String(task.id);
                  
                  const progress = taskProgress[taskId] || { worked: 0, allocated: 0, percentage: 0 };
                  
                  return (
                    <div key={task.id} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-1">{task.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1.5 h-4 w-4" />
                            <span>Estado: {task.status === 'completed' ? 'Completada' : task.status === 'in_progress' ? 'En progreso' : 'Pendente'}</span>
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
                  <p className="text-muted-foreground mb-4">Non tes tarefas asignadas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TimeTracking;
