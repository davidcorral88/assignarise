
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../components/auth/useAuth';
import { getUserById, addTask, updateTask, getTaskById, deleteTask, getUsers, getUsersByIds } from '../utils/dataService';
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
import { CheckSquare, ArrowLeft, Trash2, Plus, Calendar as CalendarIcon, Clock, Save, X, FileUp, FilePlus2, User as UserIcon } from 'lucide-react';
import { FileUploader } from '@/components/files/FileUploader';
import { getAllCategories, getProjectsByCategory } from '../utils/categoryProjectData';

const TaskForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  
  const [tarefa, setTarefa] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [priority, setPriority] = useState<string>('medium');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tag, setTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [allocatedHours, setAllocatedHours] = useState<number>(0);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [creatorUser, setCreatorUser] = useState<User | null>(null);
  
  const [category, setCategory] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [assignedUserData, setAssignedUserData] = useState<Record<number, User | null>>({});
  const [recentlyAddedUsers, setRecentlyAddedUsers] = useState<Record<number, User | null>>({});
  
  // Lista de categorías disponibles
  const categories = getAllCategories();
  
  // Actualizar proyectos disponibles cuando cambia la categoría
  useEffect(() => {
    setAvailableProjects(getProjectsByCategory(category));
    // Si la categoría cambia, resetear el proyecto si no está en la nueva lista
    if (project && !getProjectsByCategory(category).includes(project)) {
      setProject('');
    }
  }, [category]);
  
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
          console.log(`Fetching task with ID: ${id}`);
          const taskData = await getTaskById(id);
          console.log("Task data received:", taskData);
          
          if (taskData) {
            setTask(taskData);
            setTarefa(taskData.title);
            setDescription(taskData.description || '');
            setStatus(taskData.status || 'pending');
            setPriority(taskData.priority || 'medium');
            
            setCategory(taskData.category || '');
            setProject(taskData.project || '');
            
            if (taskData.startDate) {
              try {
                setStartDate(new Date(taskData.startDate));
              } catch (e) {
                console.error("Error parsing startDate:", e);
                setStartDate(new Date());
              }
            } else {
              setStartDate(new Date());
            }
            
            if (taskData.dueDate) {
              try {
                setDueDate(new Date(taskData.dueDate));
              } catch (e) {
                console.error("Error parsing dueDate:", e);
                setDueDate(undefined);
              }
            } else {
              setDueDate(undefined);
            }
            
            setTags(taskData.tags || []);
            
            if (taskData.assignments && taskData.assignments.length > 0) {
              const normalizedAssignments = taskData.assignments.map(assignment => {
                const userId = typeof assignment.user_id === 'string' 
                  ? parseInt(assignment.user_id, 10) 
                  : assignment.user_id;
                  
                return {
                  user_id: userId,
                  allocatedHours: assignment.allocatedHours || 0
                };
              });
              setAssignments(normalizedAssignments);
              console.log("Normalized assignments:", normalizedAssignments);
              
              const userIds = normalizedAssignments.map(a => a.user_id);
              if (userIds.length > 0) {
                const usersData = await getUsersByIds(userIds);
                setAssignedUserData(usersData);
                console.log("Assigned users data:", usersData);
              }
            } else {
              setAssignments([]);
            }
            
            setAttachments(taskData.attachments || []);
            
            if (taskData.createdBy) {
              try {
                const creator = await getUserById(Number(taskData.createdBy));
                setCreatorUser(creator || null);
              } catch (error) {
                console.error('Error fetching creator user:', error);
              }
            }
          } else {
            console.error(`Task with ID ${id} not found`);
            toast({
              title: 'Erro',
              description: 'Tarefa non atopada. Redirixindo á lista de tarefas.',
              variant: 'destructive',
            });
            navigate('/tasks');
            return;
          }
        } else {
          if (currentUser) {
            setCreatorUser(currentUser);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading task data:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao cargar os datos da tarefa',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, currentUser, navigate]);
  
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
    
    setSubmitting(true);
    
    try {
      const normalizedAssignments = assignments.map(assignment => {
        const userId = typeof assignment.user_id === 'string'
          ? parseInt(assignment.user_id, 10)
          : assignment.user_id;
          
        return {
          user_id: userId,
          allocatedHours: assignment.allocatedHours
        };
      });
      
      console.log("Normalized assignments for submission:", normalizedAssignments);
      
      const taskData: Task = {
        ...(isEditMode && task ? { id: task.id } : {}),
        title: tarefa,
        description: description || '',
        status: (status as 'pending' | 'in_progress' | 'completed') || 'pending',
        priority: (priority as 'low' | 'medium' | 'high') || 'medium',
        createdBy: currentUser?.id || 0,
        createdAt: task?.createdAt || new Date().toISOString(),
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        tags: tags || [],
        assignments: normalizedAssignments,
        attachments: attachments || [],
        category: category || undefined,
        project: project || undefined,
      };
      
      console.log("Saving task data:", taskData);
      
      if (isEditMode) {
        await updateTask(task!.id, taskData);
        toast({
          title: 'Tarefa actualizada',
          description: 'A tarefa foi actualizada correctamente.',
        });
      } else {
        const savedTask = await addTask(taskData);
        console.log("Tarea creada con ID:", savedTask.id);
        toast({
          title: 'Tarefa creada',
          description: `A tarefa foi creada correctamente con ID: ${savedTask.id}`,
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
    if (isEditMode && id) {
      try {
        await deleteTask(id);
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
      if (!assignments.some(a => {
        const aUserId = typeof a.user_id === 'string' ? parseInt(a.user_id, 10) : a.user_id;
        return aUserId === selectedUserId;
      })) {
        setAssignments([
          ...assignments,
          { 
            user_id: selectedUserId, 
            allocatedHours: allocatedHours 
          }
        ]);
        
        const selectedUser = availableUsers.find(u => u.id === selectedUserId);
        if (selectedUser) {
          setRecentlyAddedUsers(prev => ({
            ...prev,
            [selectedUserId]: selectedUser
          }));
          
          setAssignedUserData(prev => ({
            ...prev,
            [selectedUserId]: selectedUser
          }));
        }
        
        setSelectedUserId(null);
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
  
  const handleRemoveAssignment = (userId: number) => {
    setAssignments(assignments.filter(a => {
      const assignmentUserId = typeof a.user_id === 'string' ? parseInt(a.user_id, 10) : a.user_id;
      return assignmentUserId !== userId;
    }));
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
  
  const canEdit = true;
  
  const isTaskCompleted = status === 'completed';
  
  const isUserAssignedToTask = currentUser && assignments.some(a => a.user_id === currentUser.id);
  
  const canAddResolutionAttachments = true;
  
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
            {isEditMode && (
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
              {isEditMode ? 'Editar tarefa' : 'Nova tarefa'}
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
                  {isEditMode && task?.id && (
                    <div className="space-y-2">
                      <Label htmlFor="id">ID</Label>
                      <div className="flex">
                        <Input
                          id="id"
                          type="text"
                          value={task?.id || ''}
                          className="bg-gray-100 cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        O ID asígnase automaticamente e non se pode modificar
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="creator">Creador</Label>
                    <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">
                        {creatorUser ? creatorUser.name : isEditMode ? 'Usuario non atopado' : 'Ti (creador da tarefa)'}
                      </span>
                    </div>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={category}
                        onValueChange={setCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <SelectItem value="">Ningunha</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="project">Proxecto</Label>
                      <Select
                        value={project}
                        onValueChange={setProject}
                        disabled={!category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={category ? "Seleccionar proxecto" : "Seleccione categoría primeiro"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <SelectItem value="">Ningún</SelectItem>
                          {availableProjects.map((proj) => (
                            <SelectItem key={proj} value={proj}>{proj}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                    {tags.map((tag, index) => (
                      <Badge key={`tag-${index}-${tag}`} variant="secondary" className="px-3 py-1 text-sm">
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
                        taskId={String(task?.id)}
                        attachments={attachments}
                        isResolution={false}
                        onAttachmentAdded={handleAttachmentAdded}
                        onAttachmentRemoved={handleAttachmentRemoved}
                        readOnly={isEditMode && !canEdit}
                      />
                    </TabsContent>
                    
                    <TabsContent value="resolution-files" className="mt-4">
                      <FileUploader
                        taskId={String(task?.id)}
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
                    {assignments.map((assignment, index) => {
                      const userId = typeof assignment.user_id === 'string' 
                        ? parseInt(assignment.user_id, 10) 
                        : assignment.user_id;
                      
                      const user = recentlyAddedUsers[userId] || assignedUserData[userId] || availableUsers.find(u => u.id === userId);
                      
                      return (
                        <div key={`assignment-${userId}-${index}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                              {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full" />
                              ) : (
                                <span className="text-xs font-medium text-primary-foreground">
                                  {user?.name ? user.name.substring(0, 2) : 'UN'}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{user?.name || `Usuario ID: ${userId}`}</p>
                              <p className="text-sm text-muted-foreground">{assignment.allocatedHours} horas asignadas</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveAssignment(userId)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Eliminar asignación</span>
                          </Button>
                        </div>
                      );
                    })}
                    
                    {assignments.length === 0 && (
                      <div className="text-sm text-muted-foreground p-3">
                        Non hai asignacións aínda
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-3">Asignar usuario</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user">Usuario</Label>
                        <Select 
                          value={selectedUserId ? String(selectedUserId) : undefined} 
                          onValueChange={(value) => setSelectedUserId(value ? Number(value) : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar usuario" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers.map(user => (
                              <SelectItem key={user.id} value={String(user.id)}>
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
                        {isEditMode ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? 'Actualizar tarefa' : 'Crear tarefa'}
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
