import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Layout } from '../components/layout/Layout';
import { 
  CheckSquare,
  PlusCircle, 
  Search, 
  MoreHorizontal,
  User as UserIcon,
  Pencil,
  Trash2,
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Save,
  X,
  FileUp,
  FilePlus2,
  Users,
  FileJson,
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';
import { getTasks, getTaskById, updateTask, deleteTask, getUsers, getUserById } from '../utils/dataService';
import { Task, User, TaskAssignment, TaskAttachment } from '../utils/types';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { FileUploader } from '@/components/files/FileUploader';
import { getCategoryOptions, getProjectOptions } from '@/utils/categoryProjectData';

const TaskList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedPriority, setEditedPriority] = useState('');
  const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(undefined);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editedAssignments, setEditedAssignments] = useState<TaskAssignment[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [allocatedHours, setAllocatedHours] = useState<number>(0);
  const [assignedUserData, setAssignedUserData] = useState<Record<number, User | null>>({});
  const [recentlyAddedUsers, setRecentlyAddedUsers] = useState<Record<number, User | null>>({});
  const [editedAttachments, setEditedAttachments] = useState<TaskAttachment[]>([]);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [availableProjects, setAvailableProjects] = useState<string[]>(['all']);
  
  const canEditTasks = currentUser?.role === 'admin' || currentUser?.role === 'dxm' || currentUser?.role === 'xerenteATSXPTPG';
  const canDeleteTasks = currentUser?.role === 'admin';
  const canExportTasks = currentUser?.role === 'admin';
  
  const handleCategoryFilterChange = (newCategory: string) => {
    setCategoryFilter(newCategory);
    const projectOptions = getProjectOptions(newCategory);
    setAvailableProjects(['all', ...projectOptions]);
    
    if (!projectOptions.includes(projectFilter)) {
      setProjectFilter('all');
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
      setFilteredTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tareas desde PostgreSQL',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadTasks();
  }, []);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        const filteredUsers = users.filter(user => {
          if (currentUser?.role === 'dxm' || currentUser?.role === 'xerenteATSXPTPG') {
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
    if (searchQuery.trim() === '') {
      let filtered = [...tasks];
      
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(task => task.category === categoryFilter);
      }
      
      if (projectFilter !== 'all') {
        filtered = filtered.filter(task => task.project === projectFilter);
      }
      
      setFilteredTasks(filtered);
    } else {
      const query = searchQuery.toLowerCase();
      let filtered = tasks.filter(
        task => 
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
      
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(task => task.category === categoryFilter);
      }
      
      if (projectFilter !== 'all') {
        filtered = filtered.filter(task => task.project === projectFilter);
      }
      
      setFilteredTasks(filtered);
    }
  }, [tasks, searchQuery, categoryFilter, projectFilter]);
  
  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedTask) return;
    
    try {
      await deleteTask(selectedTask.id);
      toast({
        title: "Tarefa eliminada",
        description: `A tarefa ${selectedTask.title} foi eliminada correctamente.`,
      });
      
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    }
    
    setShowDeleteDialog(false);
    setSelectedTask(null);
  };
  
  const handleEditTask = async (task: Task) => {
    setSelectedTask(task);
    setEditMode(true);
    setEditedStatus(task.status);
    setEditedPriority(task.priority);
    setEditedDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setEditedTags(task.tags || []);
    
    if (task.assignments && task.assignments.length > 0) {
      const normalizedAssignments = task.assignments.map(assignment => {
        const userId = typeof assignment.user_id === 'string' 
          ? parseInt(assignment.user_id, 10) 
          : assignment.user_id;
          
        return {
          user_id: userId,
          allocatedHours: assignment.allocatedHours || 0
        };
      });
      setEditedAssignments(normalizedAssignments);
      
      const userIds = normalizedAssignments.map(a => a.user_id);
      if (userIds.length > 0) {
        const usersData = await getUsersByIds(userIds);
        setAssignedUserData(usersData);
      }
    } else {
      setEditedAssignments([]);
    }
    
    setEditedAttachments(task.attachments || []);
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedTask(null);
    setEditedStatus('');
    setEditedPriority('');
    setEditedDueDate(undefined);
    setEditedTags([]);
    setEditedAssignments([]);
    setEditedAttachments([]);
  };
  
  const handleSaveTask = async () => {
    if (!selectedTask) return;
    
    setIsSaving(true);
    
    try {
      const normalizedAssignments = editedAssignments.map(assignment => {
        const userId = typeof assignment.user_id === 'string'
          ? parseInt(assignment.user_id, 10)
          : assignment.user_id;
          
        return {
          user_id: userId,
          allocatedHours: assignment.allocatedHours
        };
      });
      
      const taskData: Task = {
        ...selectedTask,
        status: editedStatus as 'pending' | 'in_progress' | 'completed',
        priority: editedPriority as 'low' | 'medium' | 'high',
        dueDate: editedDueDate ? format(editedDueDate, 'yyyy-MM-dd') : undefined,
        tags: editedTags || [],
        assignments: normalizedAssignments,
        attachments: editedAttachments || []
      };
      
      await updateTask(selectedTask.id, taskData);
      toast({
        title: 'Tarefa actualizada',
        description: 'A tarefa foi actualizada correctamente.',
      });
      
      loadTasks();
      handleCancelEdit();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: 'Erro',
        description: 'Ocorreu un erro ao gardar a tarefa. Por favor, inténtao de novo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim().toLowerCase())) {
      setEditedTags([...editedTags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(t => t !== tagToRemove));
  };
  
  const handleAddAssignment = () => {
    if (selectedUserId && allocatedHours > 0) {
      if (!editedAssignments.some(a => {
        const aUserId = typeof a.user_id === 'string' ? parseInt(a.user_id, 10) : a.user_id;
        return aUserId === selectedUserId;
      })) {
        setEditedAssignments([
          ...editedAssignments,
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
    setEditedAssignments(editedAssignments.filter(a => {
      const assignmentUserId = typeof a.user_id === 'string' ? parseInt(a.user_id, 10) : a.user_id;
      return assignmentUserId !== userId;
    }));
  };
  
  const handleAttachmentAdded = (attachment: TaskAttachment) => {
    setEditedAttachments(prev => [...prev, attachment]);
  };
  
  const handleAttachmentRemoved = (attachmentId: string) => {
    setEditedAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-muted-foreground mt-1">
              Xestiona as tarefas do sistema
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            {canExportTasks && (
              <Button 
                variant="outline"
                onClick={() => {
                  const jsonStr = JSON.stringify(tasks, null, 2);
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  const date = new Date().toISOString().split('T')[0];
                  a.href = url;
                  a.download = `tasks-${date}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  toast({
                    title: "Tarefas exportadas",
                    description: "O arquivo JSON foi descargado correctamente",
                  });
                }}
              >
                <FileJson className="mr-2 h-4 w-4" />
                Descargar JSON
              </Button>
            )}
            <Button onClick={() => navigate('/tasks/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova tarefa
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar tarefas..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative flex-1">
            <Select
              value={categoryFilter}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorías</SelectItem>
                {getCategoryOptions().map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative flex-1">
            <Select
              value={projectFilter}
              onValueChange={(value) => setProjectFilter(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por proxecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tódolos proxectos</SelectItem>
                {availableProjects.map((proj) => (
                  <SelectItem key={proj} value={proj}>
                    {proj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="rounded-md border animate-scale-in overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Data de vencemento</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead className="text-right">Accións</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Cargando tarefas...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{task.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editMode && selectedTask?.id === task.id ? (
                        <Select value={editedStatus} onValueChange={setEditedStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="in_progress">En progreso</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          variant="outline"
                          className={
                            task.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : task.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-green-100 text-green-800 border-green-200'
                          }
                        >
                          {task.status === 'pending'
                            ? 'Pendente'
                            : task.status === 'in_progress'
                              ? 'En progreso'
                              : 'Completada'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode && selectedTask?.id === task.id ? (
                        <Select value={editedPriority} onValueChange={setEditedPriority}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="outline"
                          className={
                            task.priority === 'low'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {task.priority === 'low'
                            ? 'Baixa'
                            : task.priority === 'medium'
                              ? 'Media'
                              : 'Alta'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode && selectedTask?.id === task.id ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !editedDueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editedDueDate ? format(editedDueDate, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={editedDueDate}
                              onSelect={setEditedDueDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy") : 'Sen data'
                      )}
                    </TableCell>
                    <TableCell>
                      {task.assignments && task.assignments.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          {task.assignments.map(assignment => {
                            const userId = typeof assignment.user_id === 'string' 
                              ? parseInt(assignment.user_id, 10) 
                              : assignment.user_id;
                            
                            return (
                              <div key={`assigned-user-${userId}`} className="flex items-center">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={assignedUserData[userId]?.avatar} alt={assignedUserData[userId]?.name || `Usuario ID: ${userId}`} />
                                  <AvatarFallback>{getInitials(assignedUserData[userId]?.name || `Usuario ID: ${userId}`)}</AvatarFallback>
                                </Avatar>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sen asignar</span>
                      )}
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
                          
                          <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          
                          {canEditTasks ? (
                            editMode && selectedTask?.id === task.id ? (
                              <>
                                <DropdownMenuItem onClick={handleSaveTask} disabled={isSaving}>
                                  {isSaving ? (
                                    <>
                                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                                      Gardando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="mr-2 h-4 w-4" />
                                      Gardar
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCancelEdit}>
                                  <X className="mr-2 h-4 w-4" />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            )
                          ) : null}
                          
                          {canDeleteTasks ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={() => handleDeleteTask(task)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <CheckSquare className="h-10 w-10 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground">Non se atoparon tarefas</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-destructive mr-2" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a tarefa <strong>{selectedTask?.title}</strong>?
              Esta acción no se pode deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default TaskList;
