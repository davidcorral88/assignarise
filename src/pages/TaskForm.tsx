
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../components/auth/AuthContext';
import { getUserById, addUser, updateUser, getNextUserId, getUsers, addTask, updateTask, getTaskById, getNextTaskId, deleteTask } from '../utils/dataService';
import { Task, User, TaskAssignment, TaskAttachment } from '../utils/types';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { CheckSquare, ArrowLeft, Trash2, Plus, Search, Calendar as CalendarIcon, Clock, Save, X, FileUp, FilePlus2 } from 'lucide-react';
import FileUploader from '@/components/files/FileUploader';

const TaskForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  
  const [taskId, setTaskId] = useState<number | undefined>(undefined);
  const [searchTaskId, setSearchTaskId] = useState('');
  const [tarefa, setTarefa] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [priority, setPriority] = useState<string>('medium');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tag, setTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [allocatedHours, setAllocatedHours] = useState<number>(0);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  
  // Updated to handle users as state instead of as a Promise
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        const filteredUsers = users.filter(user => {
          if (currentUser?.role === 'director') {
            return user.active !== false;
          } else {
            return user.role === 'worker' && user.active !== false;
          }
        });
        setAvailableUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [currentUser]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode && id) {
          const taskData = await getTaskById(id);
          if (taskData) {
            setTask(taskData);
            setTaskId(parseInt(taskData.id));
            setTarefa(taskData.title);
            setDescription(taskData.description);
            setStatus(taskData.status);
            setPriority(taskData.priority);
            setStartDate(taskData.startDate ? new Date(taskData.startDate) : new Date());
            setDueDate(taskData.dueDate ? new Date(taskData.dueDate) : undefined);
            setTags(taskData.tags || []);
            setAssignments([...taskData.assignments]);
            setAttachments(taskData.attachments || []);
          }
        } else {
          const nextId = await getNextTaskId();
          setTaskId(nextId);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading task data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tarefa.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor ingresa un nome para a tarefa',
        variant: 'destructive',
      });
      return;
    }
    
    if (!taskId) {
      toast({
        title: 'Erro',
        description: 'O ID da tarefa non é válido',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    const taskData: Task = {
      id: String(taskId),
      title: tarefa,
      description,
      status: status as 'pending' | 'in_progress' | 'completed',
      priority: priority as 'low' | 'medium' | 'high',
      createdBy: currentUser?.id || '',
      createdAt: isEditMode || searchMode ? task?.createdAt || new Date().toISOString() : new Date().toISOString(),
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      tags,
      assignments,
      attachments,
    };
    
    try {
      if (isEditMode || searchMode) {
        await updateTask(taskData);
        toast({
          title: 'Tarefa actualizada',
          description: 'A tarefa foi actualizada correctamente.',
        });
      } else {
        await addTask(taskData);
        toast({
          title: 'Tarefa creada',
          description: 'A tarefa foi creada correctamente.',
        });
      }
      
      setTimeout(() => {
        navigate('/tasks');
        setSubmitting(false);
      }, 800);
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: 'Erro',
        description: 'Ocorreu un erro ao gardar a tarefa. Por favor, inténtao de novo.',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if ((isEditMode && id) || (searchMode && searchTaskId)) {
      const taskIdToDelete = isEditMode ? id : searchTaskId;
      try {
        await deleteTask(taskIdToDelete);
        toast({
          title: 'Tarefa eliminada',
          description: 'A tarefa foi eliminada correctamente.',
        });
        navigate('/tasks');
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: 'Erro',
          description: 'Ocorreu un erro ao eliminar a tarefa. Por favor, inténtao de novo.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleSearchTask = async () => {
    if (searchTaskId.trim()) {
      try {
        const taskData = await getTaskById(searchTaskId);
        if (taskData) {
          setTaskId(parseInt(taskData.id));
          setTarefa(taskData.title);
          setDescription(taskData.description);
          setStatus(taskData.status);
          setPriority(taskData.priority);
          setStartDate(taskData.startDate ? new Date(taskData.startDate) : new Date());
          setDueDate(taskData.dueDate ? new Date(taskData.dueDate) : undefined);
          setTags(taskData.tags || []);
          setAssignments([...taskData.assignments]);
          setAttachments(taskData.attachments || []);
          setSearchMode(true);
          setTask(taskData);
          
          toast({
            title: 'Tarefa atopada',
            description: `Cargouse a tarefa con ID ${searchTaskId}`,
          });
        } else {
          toast({
            title: 'Tarefa non atopada',
            description: `Non se atopou ningunha tarefa co ID ${searchTaskId}`,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error("Error searching for task:", error);
        toast({
          title: 'Tarefa non atopada',
          description: `Non se atopou ningunha tarefa co ID ${searchTaskId}`,
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleResetForm = async () => {
    const nextId = await getNextTaskId();
    setTaskId(nextId);
    setTarefa('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
    setStartDate(new Date());
    setDueDate(undefined);
    setTags([]);
    setAssignments([]);
    setAttachments([]);
    setSearchMode(false);
    setSearchTaskId('');
    setTask(null);
    
    toast({
      title: 'Formulario restablecido',
      description: 'O formulario foi restablecido para crear unha nova tarefa.',
    });
  };
  
  const handleAddTag = () => {
    if (tag.trim() && !tags.includes(tag.trim().toLowerCase())) {
      setTags([...tags, tag.trim().toLowerCase()]);
      setTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  const handleAddAssignment = () => {
    if (selectedUserId && allocatedHours > 0) {
      if (!assignments.some(a => a.userId === selectedUserId)) {
        setAssignments([
          ...assignments,
          { userId: selectedUserId, allocatedHours }
        ]);
        
        setSelectedUserId('');
        setAllocatedHours(0);
      } else {
        toast({
          title: 'Usuario xa asignado',
          description: 'Este usuario xa está asignado á tarefa.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor selecciona un usuario e asigna horas.',
        variant: 'destructive',
      });
    }
  };
  
  const handleRemoveAssignment = (userId: string) => {
    setAssignments(assignments.filter(a => a.userId !== userId));
  };
  
  const handleAttachmentAdded = (attachment: TaskAttachment) => {
    setAttachments(prev => [...prev, attachment]);
  };
  
  const handleAttachmentRemoved = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
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
  
  const canEdit = currentUser?.role === 'director' || 
    (isEditMode && task?.createdBy === currentUser?.id) ||
    (searchMode && task?.createdBy === currentUser?.id);
  
  const isTaskCompleted = status === 'completed';
  
  const isUserAssignedToTask = currentUser && assignments.some(a => a.userId === currentUser.id);
  
  const canAddResolutionAttachments = currentUser && (
    currentUser.role === 'director' || isUserAssignedToTask
  );
  
  if ((isEditMode || searchMode) && !canEdit) {
    navigate('/tasks');
    return null;
  }
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="pl-0 hover:pl-0 hover:bg-transparent" 
            onClick={() => navigate('/tasks')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a tarefas
          </Button>
          
          <div className="flex space-x-2">
            {(isEditMode || searchMode) && (
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar tarefa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción non se pode desfacer. Eliminarás permanentemente esta tarefa.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTask}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#007bc4' }}>
              {isEditMode ? 'Editar tarefa' : searchMode ? 'Editar tarefa (buscada)' : 'Nova tarefa'}
            </h1>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Información básica</CardTitle>
                  <CardDescription>
                    Ingresa os detalles básicos da tarefa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="w-1/3 space-y-2">
                      <Label htmlFor="id">ID</Label>
                      <div className="flex">
                        <Input
                          id="id"
                          type="number"
                          value={taskId || ''}
                          className="bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        O ID asígnase automaticamente e non se pode modificar
                      </p>
                    </div>

                    {!isEditMode && !searchMode && (
                      <div className="w-2/3 space-y-2">
                        <Label htmlFor="searchId">Buscar tarefa por ID</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="searchId"
                            type="number"
                            value={searchTaskId}
                            onChange={(e) => setSearchTaskId(e.target.value)}
                            placeholder="Introducir ID da tarefa"
                          />
                          <Button 
                            type="button" 
                            onClick={handleSearchTask} 
                            className="flex-shrink-0"
                          >
                            <Search className="h-4 w-4 mr-1" />
                            Buscar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {searchMode && (
                      <div className="w-2/3 space-y-2 flex items-end">
                        <Button 
                          type="button" 
                          onClick={handleResetForm}
                          variant="outline"
                          className="ml-auto"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Nova tarefa
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Inicio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tarefa">Tarefa *</Label>
                    <Input
                      id="tarefa"
                      value={tarefa}
                      onChange={(e) => setTarefa(e.target.value)}
                      placeholder="Ingresa o nome da tarefa"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrición</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe a tarefa en detalle"
                      className="min-h-[150px]"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Etiquetas</CardTitle>
                  <CardDescription>
                    Engade etiquetas para categorizar esta tarefa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Eliminar etiqueta</span>
                        </Button>
                      </Badge>
                    ))}
                    
                    {tags.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        Non hai etiquetas aínda
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Engadir nova etiqueta"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                    </div>
                    <Button type="button" size="sm" onClick={handleAddTag}>
                      <Plus className="h-4 w-4 mr-1" />
                      Engadir
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Arquivos adjuntos</CardTitle>
                  <CardDescription>
                    Xestión de arquivos relacionados coa tarefa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="task-files">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="task-files" className="flex items-center">
                        <FileUp className="h-4 w-4 mr-2" />
                        Arquivos da tarefa
                      </TabsTrigger>
                      <TabsTrigger value="resolution-files" className="flex items-center">
                        <FilePlus2 className="h-4 w-4 mr-2" />
                        Arquivos de resolución
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="task-files" className="mt-4">
                      <FileUploader
                        taskId={String(taskId)}
                        attachments={attachments}
                        isResolution={false}
                        onAttachmentAdded={handleAttachmentAdded}
                        onAttachmentRemoved={handleAttachmentRemoved}
                        readOnly={isEditMode && !canEdit}
                      />
                    </TabsContent>
                    
                    <TabsContent value="resolution-files" className="mt-4">
                      <FileUploader
                        taskId={String(taskId)}
                        attachments={attachments}
                        isResolution={true}
                        onAttachmentAdded={handleAttachmentAdded}
                        onAttachmentRemoved={handleAttachmentRemoved}
                        readOnly={!canAddResolutionAttachments}
                      />
                      
                      {!canAddResolutionAttachments && (
                        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md text-sm">
                          <p className="text-orange-700">
                            Solo os usuarios asignados a esta tarefa poden engadir arquivos de resolución.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Asignacións</CardTitle>
                  <CardDescription>
                    Asigna esta tarefa a un ou varios traballadores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {assignments.map(assignment => {
                      const user = availableUsers[0].find(u => u.id === assignment.userId);
                      return (
                        <div key={assignment.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                              {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full" />
                              ) : (
                                <span className="text-xs font-medium text-primary-foreground">
                                  {user?.name.substring(0, 2)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{user?.name}</p>
                              <p className="text-sm text-muted-foreground">{assignment.allocatedHours} horas asignadas</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveAssignment(assignment.userId)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Eliminar asignación</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-3">Asignar usuario</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user">Usuario</Label>
                        <Select 
                          value={selectedUserId} 
                          onValueChange={setSelectedUserId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar usuario" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers[0].map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name} {user.role === 'director' ? ' (Xerente)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hours">Horas asignadas</Label>
                        <Input
                          id="hours"
                          type="number"
                          min="1"
                          value={allocatedHours || ''}
                          onChange={(e) => setAllocatedHours(Number(e.target.value))}
                          placeholder="Horas"
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={handleAddAssignment}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Engadir asignación
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: '#007bc4' }}>Detalles</CardTitle>
                  <CardDescription>
                    Configura o estado e a prioridade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">En progreso</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Data de vencemento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button className="w-full" type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode || searchMode ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode || searchMode ? 'Actualizar tarefa' : 'Crear tarefa'}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TaskForm;
