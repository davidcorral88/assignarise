
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  Clock, 
  Calendar, 
  CheckSquare, 
  PlusCircle,
  Timer,
  Save,
  Eye,
  Edit,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  getTasksByUserId, 
  getTimeEntriesByUserId,
  mockTimeEntries
} from '../utils/mockData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { TimeEntry, Task } from '../utils/types';

const TimeTracking = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [hours, setHours] = useState<number>(1);
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  
  useEffect(() => {
    // Only workers can access this page
    if (currentUser?.role !== 'worker') {
      navigate('/dashboard');
    } else {
      setUserTasks(getTasksByUserId(currentUser.id));
      setTimeEntries(getTimeEntriesByUserId(currentUser.id));
      setLoading(false);
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTaskId || hours <= 0 || !date) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to save the time entry
      const newEntry: TimeEntry = {
        id: String(mockTimeEntries.length + 1),
        taskId: selectedTaskId,
        userId: currentUser?.id || '',
        hours,
        date: format(date, 'yyyy-MM-dd'),
        notes: notes.trim() || undefined
      };
      
      // Update local state (in a real app, this would be fetched from the API)
      setTimeEntries([newEntry, ...timeEntries]);
      
      toast({
        title: 'Horas registradas',
        description: 'Se han registrado tus horas correctamente.',
      });
      
      // Reset form
      setSelectedTaskId('');
      setHours(1);
      setDate(new Date());
      setNotes('');
      setIsAddingEntry(false);
      setSubmitting(false);
    }, 800);
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
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de horas</h1>
            <p className="text-muted-foreground mt-1">
              Registra el tiempo trabajado en tus tareas asignadas
            </p>
          </div>
          <Button 
            className="mt-4 sm:mt-0" 
            onClick={() => setIsAddingEntry(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar horas
          </Button>
        </div>
        
        {isAddingEntry && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Nuevo registro de horas</CardTitle>
              <CardDescription>
                Ingresa las horas trabajadas en una tarea asignada
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task">Tarea *</Label>
                  <Select 
                    value={selectedTaskId} 
                    onValueChange={setSelectedTaskId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tarea" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTasks.map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Horas trabajadas *</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={hours || ''}
                      onChange={(e) => setHours(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Fecha *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, "d MMMM yyyy") : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={(date) => date && setDate(date)}
                          initialFocus
                          className="bg-white pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Añade detalles sobre el trabajo realizado"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" type="button" onClick={() => setIsAddingEntry(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar registro
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Historial de horas registradas</CardTitle>
            <CardDescription>
              Visualiza y gestiona tus registros de horas trabajadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.length > 0 ? (
                    timeEntries.map((entry) => {
                      const task = userTasks.find(t => t.id === entry.taskId);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <CheckSquare className="mr-2 h-4 w-4 text-primary" />
                              <span>{task?.title || 'Tarea no encontrada'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{entry.hours} horas</TableCell>
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
                                  <span className="sr-only">Acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                {task && (
                                  <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver tarea
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar registro
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">
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
                          <p className="text-sm text-muted-foreground">No has registrado horas aún</p>
                          <Button 
                            variant="outline" 
                            className="mt-4" 
                            onClick={() => setIsAddingEntry(true)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Registrar horas
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
            <CardTitle>Resumen de horas por tarea</CardTitle>
            <CardDescription>
              Visualiza el progreso de tus horas en cada tarea asignada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {userTasks.map(task => {
                const taskEntries = timeEntries.filter(entry => entry.taskId === task.id);
                const totalHoursWorked = taskEntries.reduce((sum, entry) => sum + entry.hours, 0);
                const taskAssignment = task.assignments.find(a => a.userId === currentUser?.id);
                const allocatedHours = taskAssignment?.allocatedHours || 0;
                
                const progress = allocatedHours > 0 
                  ? Math.min(Math.round((totalHoursWorked / allocatedHours) * 100), 100) 
                  : 0;
                
                return (
                  <div key={task.id} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">{task.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CheckSquare className="mr-1.5 h-4 w-4" />
                          <span>Estado: {task.status === 'completed' ? 'Completada' : task.status === 'in_progress' ? 'En progreso' : 'Pendiente'}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/${task.id}`)}>
                          <Eye className="mr-2 h-3 w-3" />
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso: {progress}%</span>
                        <span>{totalHoursWorked} / {allocatedHours} horas</span>
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
              
              {userTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No tienes tareas asignadas</p>
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
