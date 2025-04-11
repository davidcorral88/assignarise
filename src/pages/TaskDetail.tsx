import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask, deleteTask, getTimeEntriesByTaskId, getTaskAttachments } from '../utils/dataService';
import { Task, TimeEntry, TaskAttachment } from '../utils/types';
import { useAuth } from '../components/auth/useAuth';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Plus, CheckSquare, ArrowLeft, Trash2, Edit, Filter, ChevronsUpDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Link } from 'react-router-dom';
import TimeEntryForm from '@/components/forms/TimeEntryForm';
import TimeEntryList from '@/components/lists/TimeEntryList';
import TaskAssignmentList from '@/components/lists/TaskAssignmentList';
import TaskAssignmentForm from '@/components/forms/TaskAssignmentForm';
import FileUpload from '@/components/forms/FileUpload';
import FileList from '@/components/lists/FileList';
import { formatFileSize, isImageFile } from '@/utils/fileService';
import { toNumericId, toStringId } from '@/utils/typeUtils';

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalAllocatedHours, setTotalAllocatedHours] = useState(0);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true);
      try {
        const numericTaskId = toNumericId(taskId);
        
        if (numericTaskId === undefined) {
          throw new Error("Invalid task ID");
        }
        
        const taskData = await getTaskById(numericTaskId);
        setTask(taskData);
        
        const timeEntriesData = await getTimeEntriesByTaskId(numericTaskId);
        setTimeEntries(timeEntriesData);
        
        const totalHours = timeEntriesData.reduce((sum, entry) => sum + Number(entry.hours), 0);
        setTotalHours(totalHours);
        
        if (taskData.assignments) {
          const totalAllocated = taskData.assignments.reduce(
            (sum, assignment) => sum + Number(assignment.allocatedHours || 0), 
            0
          );
          setTotalAllocatedHours(totalAllocated);
        }
        
        const attachmentsData = await getTaskAttachments(taskId || '');
        setAttachments(attachmentsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading task data:', error);
        setError('Failed to load task data');
        setLoading(false);
      }
    };
    
    loadTask();
    
    return () => {
    };
  }, [taskId]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setCreatedAt(task.createdAt ? new Date(task.createdAt) : null);
      setStartDate(task.startDate ? new Date(task.startDate) : null);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setCreatedAt(task.createdAt ? new Date(task.createdAt) : null);
      setStartDate(task.startDate ? new Date(task.startDate) : null);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  };

  const handleSaveClick = async () => {
    if (!task) return;

    setLoading(true);
    try {
      const numericTaskId = toNumericId(taskId);
      
      if (numericTaskId === undefined) {
        throw new Error("Invalid task ID");
      }
      
      const updatedTask: Partial<Task> = {
        ...task,
        title,
        description,
        status: status as 'pending' | 'in_progress' | 'completed',
        priority: priority as 'low' | 'medium' | 'high',
        createdAt: createdAt ? createdAt.toISOString() : undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };
      
      await updateTask(numericTaskId, updatedTask);
      
      const updatedTaskData = await getTaskById(numericTaskId);
      setTask(updatedTaskData);
      
      toast({
        title: "Tarea actualizada",
        description: "La tarea ha sido actualizada correctamente.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error al actualizar tarea",
        description: "No se pudo actualizar la tarea. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!task) return;

    setLoading(true);
    try {
      const numericTaskId = toNumericId(taskId);
      
      if (numericTaskId === undefined) {
        throw new Error("Invalid task ID");
      }
      
      await deleteTask(numericTaskId);
      
      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente.",
      });
      
      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error al eliminar tarea",
        description: "No se pudo eliminar la tarea. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

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

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div>
            <h2 className="text-xl font-semibold mb-2">Tarea no encontrada</h2>
            <p className="text-muted-foreground">La tarea solicitada no existe.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const canEditTasks = currentUser?.role === 'admin' || currentUser?.role === 'director';

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="mb-4">
          <Link to="/tasks" className="flex items-center text-sm font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista de tareas
          </Link>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Detalles de la Tarea
            </h2>
            <p className="text-muted-foreground">
              Aquí tes información detallada sobre a tarefa.
            </p>
          </div>
          {canEditTasks && !isEditing && (
            <div>
              <Button variant="secondary" onClick={handleEditClick} className="mr-2">
                <Edit className="mr-2 h-4 w-4" />
                Editar Tarea
              </Button>
              <Button variant="destructive" onClick={handleDeleteClick}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Tarea
              </Button>
            </div>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información de la Tarea</CardTitle>
            <CardDescription>
              Detalles completos de la tarea.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Título de la tarea"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción de la tarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in_progress">En progreso</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="low">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Fecha de Creación</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !createdAt && "text-muted-foreground"
                          )}
                        >
                          {createdAt ? (
                            format(createdAt, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center" side="bottom">
                        <Calendar
                          mode="single"
                          selected={createdAt}
                          onSelect={setCreatedAt}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Fecha de Inicio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          {startDate ? (
                            format(startDate, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center" side="bottom">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Fecha de Vencimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          {dueDate ? (
                            format(dueDate, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center" side="bottom">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" onClick={handleCancelEdit} className="mr-2">
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveClick}>Guardar</Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Título</Label>
                  <p className="text-muted-foreground">{task.title}</p>
                </div>
                <div>
                  <Label>Descripción</Label>
                  <p className="text-muted-foreground">{task.description}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Estado</Label>
                    <Badge variant="secondary">{task.status}</Badge>
                  </div>
                  <div>
                    <Label>Prioridad</Label>
                    <Badge variant="secondary">{task.priority}</Badge>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Fecha de Creación</Label>
                    <p className="text-muted-foreground">{formatDate(task.createdAt)}</p>
                  </div>
                  <div>
                    <Label>Fecha de Inicio</Label>
                    <p className="text-muted-foreground">{formatDate(task.startDate)}</p>
                  </div>
                  <div>
                    <Label>Fecha de Vencimiento</Label>
                    <p className="text-muted-foreground">{formatDate(task.dueDate)}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Asignaciones</CardTitle>
            <CardDescription>
              Lista de usuarios asignados a esta tarea.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskAssignmentList taskId={taskId || ''} assignments={task?.assignments || []} />
            <TaskAssignmentForm taskId={taskId || ''} onTaskUpdated={setTask} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Registro de Horas</CardTitle>
            <CardDescription>
              Registre el tiempo dedicado a esta tarea.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeEntryList taskId={taskId || ''} timeEntries={timeEntries} setTimeEntries={setTimeEntries} />
            <TimeEntryForm taskId={taskId || ''} onTimeEntryCreated={() => {
              if (taskId) {
                const numericTaskId = toNumericId(taskId);
                if (numericTaskId !== undefined) {
                  getTimeEntriesByTaskId(numericTaskId).then(setTimeEntries);
                }
              }
            }} />
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Archivos Adjuntos</CardTitle>
            <CardDescription>
              Subir y gestionar archivos relacionados con esta tarea.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileList taskId={taskId || ''} attachments={attachments} setAttachments={setAttachments} />
            <FileUpload taskId={taskId || ''} onFileUpload={() => {
              if (taskId) {
                getTaskAttachments(taskId).then(setAttachments);
              }
            }} />
          </CardContent>
        </Card>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de que desea eliminar esta tarea? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDelete}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default TaskDetail;
