import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Layout } from '../components/layout/Layout';
import { 
  Clock, 
  PlusCircle, 
  Search, 
  Filter, 
  ChevronDown,
  CheckCircle2, 
  Circle,
  Edit,
  Eye,
  Hash,
  Calendar,
  User as UserIcon,
  Users,
  Trash2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  getTasks, 
  getTasksAssignments,
  getTasksByUserId, 
  getUserById,
  deleteTask,
  getUsers
} from '../utils/dataService';
import { Task, User } from '../utils/types';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const TaskList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [creatorFilter, setCreatorFilter] = useState<number | null>(null);
  const [assignedToFilter, setAssignedToFilter] = useState<number | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);
  const [dueDateStartFilter, setDueDateStartFilter] = useState<Date | undefined>(undefined);
  const [dueDateEndFilter, setDueDateEndFilter] = useState<Date | undefined>(undefined);
  const [dateFilterType, setDateFilterType] = useState<'creation' | 'due'>('creation');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      let tasksData;
      let tasksDataAssignments;
      
      // Check if currentUser exists before accessing its properties
      if (currentUser && currentUser.id) {
        // If user is logged in, proceed normally
        tasksData = await getTasks();
        tasksDataAssignments = await getTasksAssignments();

        console.log("Raw tasks data:", tasksData);
        
        const normalizedTasks = tasksData.map(task => ({
          ...task,
          assignments: task.assignments || [],
          tags: task.tags || []
        }));

        const normalizedTasks2 = tasksDataAssignments.map(task => ({
          ...task,
          assignments: task.assignments || [],
          tags: task.tags || [],
          createdAt: task.createdAt || task.created_at,
          dueDate: task.dueDate || task.due_date
        }));

        console.log("Normalized tasks with date fields and tags:", normalizedTasks2);
        
        setTasks(normalizedTasks2);
        setFilteredTasks(normalizedTasks2);
        
        const usersData = await getUsers();
        const userMap: Record<number, User> = {};
        
        usersData.forEach(user => {
          const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
          userMap[userId] = { ...user, id: userId };
        });
        
        setUsers(userMap);
        setAllUsers(usersData);
        
        console.log("User map:", userMap);
        console.log("Normalized tasks:", normalizedTasks2);
      } else {
        // If user is not logged in, set empty arrays for tasks
        setTasks([]);
        setFilteredTasks([]);
        setUsers({});
        setAllUsers([]);
        
        // Optionally, you could redirect to login or show a message
        toast({
          title: 'Usuario non conectado',
          description: 'Debe iniciar sesión para ver as tarefas',
          variant: 'destructive',
        });
        
        // Redirect to login page
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error',
        description: 'Non se puideron cargar as tarefas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [currentUser]);
  
  useEffect(() => {
    try {
      let result = [...tasks];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(
          task => {
            const titleMatch = task.title ? task.title.toLowerCase().includes(query) : false;
            const descriptionMatch = task.description ? task.description.toLowerCase().includes(query) : false;
            const idMatch = task.id ? String(task.id).toLowerCase().includes(query) : false;
            
            console.log(`Filtering task ${task.id}: title=${titleMatch}, desc=${descriptionMatch}, id=${idMatch}`);
            return titleMatch || descriptionMatch || idMatch;
          }
        );
      }
      
      if (statusFilter) {
        result = result.filter(task => task.status === statusFilter);
      }

      if (priorityFilter) {
        result = result.filter(task => task.priority === priorityFilter);
      }

      if (projectFilter) {
        result = result.filter(task => 
          task.project && task.project.toLowerCase() === projectFilter.toLowerCase()
        );
      }

      if (tagFilter) {
        result = result.filter(task => 
          task.tags && Array.isArray(task.tags) && 
          task.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
        );
      }

      if (creatorFilter) {
        result = result.filter(task => {
          const createdByNum = task.createdBy ? 
            (typeof task.createdBy === 'string' ? parseInt(task.createdBy, 10) : task.createdBy) : 
            (task.created_by ? (typeof task.created_by === 'string' ? parseInt(task.created_by, 10) : task.created_by) : null);
          
          return createdByNum === creatorFilter;
        });
      }
      
      if (assignedToFilter) {
        result = result.filter(task => {
          if (!task.assignments || task.assignments.length === 0) return false;
          
          return task.assignments.some(assignment => {
            const assignedUserId = typeof assignment.user_id === 'string' 
              ? parseInt(assignment.user_id, 10) 
              : assignment.user_id;
            return assignedUserId === assignedToFilter;
          });
        });
      }

      if (startDateFilter || endDateFilter) {
        result = result.filter(task => {
          if (!task.createdAt) return false;
          
          try {
            const taskDate = parseISO(task.createdAt);
            
            if (isNaN(taskDate.getTime())) return false;
            
            if (startDateFilter) {
              const startOfDay = new Date(startDateFilter);
              startOfDay.setHours(0, 0, 0, 0);
              
              if (isBefore(taskDate, startOfDay)) return false;
            }

            if (endDateFilter) {
              const endOfDay = new Date(endDateFilter);
              endOfDay.setHours(23, 59, 59, 999);
              
              if (isAfter(taskDate, endOfDay)) return false;
            }

            return true;
          } catch (error) {
            console.error('Error filtering by creation date:', error);
            return false;
          }
        });
      }

      if (dueDateStartFilter || dueDateEndFilter) {
        result = result.filter(task => {
          if (!task.dueDate) return false;
          
          try {
            const taskDueDate = parseISO(task.dueDate);
            
            if (isNaN(taskDueDate.getTime())) return false;
            
            if (dueDateStartFilter) {
              const startOfDay = new Date(dueDateStartFilter);
              startOfDay.setHours(0, 0, 0, 0);
              
              if (isBefore(taskDueDate, startOfDay)) return false;
            }

            if (dueDateEndFilter) {
              const endOfDay = new Date(dueDateEndFilter);
              endOfDay.setHours(23, 59, 59, 999);
              
              if (isAfter(taskDueDate, endOfDay)) return false;
            }

            return true;
          } catch (error) {
            console.error('Error filtering by due date:', error);
            return false;
          }
        });
      }
      
      console.log(`Filtered tasks: ${result.length} of ${tasks.length} tasks match criteria`);
      setFilteredTasks(result);
    } catch (error) {
      console.error('Error filtering tasks:', error);
      setFilteredTasks(tasks);
    }
  }, [tasks, searchQuery, statusFilter, priorityFilter, tagFilter, creatorFilter, assignedToFilter, startDateFilter, endDateFilter, dueDateStartFilter, dueDateEndFilter, projectFilter]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-gray-400" />;
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
        return 'Pendente';
      default:
        return status;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Alta</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Media</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const resetFilters = () => {
    setStatusFilter(null);
    setPriorityFilter(null);
    setCreatorFilter(null);
    setAssignedToFilter(null);
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setDueDateStartFilter(undefined);
    setDueDateEndFilter(undefined);
    setSearchQuery('');
    setTagFilter(null);
    setProjectFilter(null);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (priorityFilter) count++;
    if (creatorFilter) count++;
    if (assignedToFilter) count++;
    if (startDateFilter || endDateFilter) count++;
    if (dueDateStartFilter || dueDateEndFilter) count++;
    if (tagFilter) count++;
    if (projectFilter) count++;
    return count;
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: 'Tarefa eliminada',
        description: 'A tarefa foi eliminada correctamente.',
      });
      loadData();
    } catch (error) {
      console.error(`Error deleting task: ${error}`);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la tarea',
        variant: 'destructive'
      });
    }
  };

  const handleTaskCreatorRender = React.useCallback(async (userId: number) => {
    if (!userId) return '-';
    try {
      const user = await getUserById(userId);
      return user?.name || '-';
    } catch (error) {
      console.error('Error fetching task creator:', error);
      return '-';
    }
  }, []);

  const getUserName = (userId: number | undefined): string => {
    if (!userId) return 'Usuario descoñecido';
    
    const user = users[userId];
    return user ? user.name : 'Usuario descoñecido';
  };

  const handleViewTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/tasks/${taskId}/edit`);
  };

  const renderCreatorCell = (task: Task) => {
    const createdById = task.createdBy || task.created_by;
    const taskCreator = createdById ? users[createdById] : null;
    
    return (
      <div className="flex items-center">
        <Avatar className="h-7 w-7 mr-2">
          <AvatarImage src={taskCreator?.avatar || ''} alt={taskCreator?.name || ''} />
          <AvatarFallback>{taskCreator?.name ? taskCreator.name.substring(0, 2) : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{taskCreator?.name || 'Usuario descoñecido'}</p>
          <p className="text-xs text-muted-foreground">
            {taskCreator?.role === 'dxm' || taskCreator?.role === 'xerenteATSXPTPG' ? 'Xerente' : 'Traballador'}
          </p>
        </div>
      </div>
    );
  };

  const formatTaskDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';
    
    try {
      if (typeof dateString === 'string') {
        const date = parseISO(dateString);
        
        if (isNaN(date.getTime())) {
          console.log(`Invalid date format for: ${dateString}`);
          return '—';
        }
        
        return format(date, 'dd/MM/yyyy');
      } else {
        console.log(`Non-string date value: ${dateString}`);
        return '—';
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return '—';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search submitted with query:", searchQuery);
  };

  const getAllTags = () => {
    const tagsSet = new Set<string>();
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  };

  const filteredTags = useMemo(() => {
    return getAllTags().filter(tag => 
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [tasks, tagSearchQuery]);

  // Filter users based on role
  const filteredUsers = Object.values(users).filter(user => {
    // Admins see all users
    if (currentUser?.role === 'admin') return true;
    
    // DXM and Xerente users see only their own organization's users
    if (currentUser?.role === 'dxm' || currentUser?.role === 'xerenteATSXPTPG') {
      return user.organization === currentUser.organization;
    }
    
    // Workers see only themselves
    return user.id === currentUser?.id;
  });

  const filteredAssignees = useMemo(() => {
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(assigneeSearchQuery.toLowerCase())
    );
  }, [allUsers, assigneeSearchQuery]);

  const getAllProjects = () => {
    const projectsSet = new Set<string>();
    tasks.forEach(task => {
      if (task.project) {
        projectsSet.add(task.project);
      }
    });
    return Array.from(projectsSet).sort();
  };

  const filteredProjects = useMemo(() => {
    return getAllProjects().filter(project => 
      project.toLowerCase().includes(projectSearchQuery.toLowerCase())
    );
  }, [tasks, projectSearchQuery]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-muted-foreground mt-1">
              {currentUser?.role === 'dxm' || currentUser?.role === 'xerenteATSXPTPG' || currentUser?.role === 'admin' ? 'Administra todas as tarefas' : 'Administra as túas tarefas asignadas'}
            </p>
          </div>
          <Button 
            className="mt-4 sm:mt-0" 
            onClick={() => navigate('/tasks/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova tarefa
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar tarefas por nome ou ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Filtrar tarefas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Circle className="mr-2 h-4 w-4" />
                    <span>Estado</span>
                    {statusFilter && <Badge variant="outline" className="ml-auto">{getStatusText(statusFilter)}</Badge>}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                      <Circle className="mr-2 h-4 w-4 text-gray-400" />
                      Pendente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('in_progress')}>
                      <Clock className="mr-2 h-4 w-4 text-amber-500" />
                      En progreso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Completada
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span className="flex items-center">
                      {priorityFilter === 'high' && <Badge variant="outline" className="mr-2 bg-red-100 text-red-800 border-red-200">Alta</Badge>}
                      {priorityFilter === 'medium' && <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 border-amber-200">Media</Badge>}
                      {priorityFilter === 'low' && <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 border-green-200">Baixa</Badge>}
                      Prioridade
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setPriorityFilter(null)}>
                      Todas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter('high')}>
                      <Badge variant="outline" className="mr-2 bg-red-100 text-red-800 border-red-200">Alta</Badge>
                      Alta prioridade
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter('medium')}>
                      <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 border-amber-200">Media</Badge>
                      Media prioridade
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter('low')}>
                      <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 border-green-200">Baixa</Badge>
                      Baixa prioridade
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Hash className="mr-2 h-4 w-4" />
                    <span>Etiquetas</span>
                    {tagFilter && (
                      <Badge variant="outline" className="ml-auto">
                        {tagFilter}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <div className="p-2">
                      <Input
                        placeholder="Buscar etiqueta..."
                        value={tagSearchQuery}
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    <ScrollArea className="h-[200px]">
                      <DropdownMenuItem onClick={() => setTagFilter(null)}>
                        Todas as etiquetas
                      </DropdownMenuItem>
                      {filteredTags.map(tag => (
                        <DropdownMenuItem key={tag} onClick={() => setTagFilter(tag)}>
                          <Hash className="mr-2 h-4 w-4" />
                          {tag}
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Creador</span>
                    {creatorFilter && (
                      <Badge variant="outline" className="ml-auto">
                        {getUserName(creatorFilter)}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <div className="p-2">
                      <Input
                        placeholder="Buscar usuario..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    <ScrollArea className="h-[300px]">
                      <DropdownMenuItem onClick={() => setCreatorFilter(null)}>
                        Todos os usuarios
                      </DropdownMenuItem>
                      {filteredUsers.map(user => (
                        <DropdownMenuItem key={user.id} onClick={() => setCreatorFilter(user.id)}>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Asignados</span>
                    {assignedToFilter && (
                      <Badge variant="outline" className="ml-auto">
                        {getUserName(assignedToFilter)}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <div className="p-2">
                      <Input
                        placeholder="Buscar usuario..."
                        value={assigneeSearchQuery}
                        onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    <ScrollArea className="h-[300px]">
                      <DropdownMenuItem onClick={() => setAssignedToFilter(null)}>
                        Todos os usuarios
                      </DropdownMenuItem>
                      {filteredAssignees.map(user => (
                        <DropdownMenuItem key={user.id} onClick={() => setAssignedToFilter(user.id)}>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Data de creación</span>
                    {(startDateFilter || endDateFilter) && (
                      <Badge variant="outline" className="ml-auto">
                        {startDateFilter && format(startDateFilter, "dd/MM/yy")}
                        {startDateFilter && endDateFilter && ' - '}
                        {endDateFilter && format(endDateFilter, "dd/MM/yy")}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0" sideOffset={-5}>
                    <div className="p-2 bg-popover border rounded-md shadow-md">
                      <div className="mb-2">
                        <div className="mb-1 text-sm font-medium">Desde</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !startDateFilter && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {startDateFilter ? format(startDateFilter, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={startDateFilter}
                              onSelect={setStartDateFilter}
                              initialFocus
                              className="rounded-md border bg-popover"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="mb-2">
                        <div className="mb-1 text-sm font-medium">Hasta</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDateFilter && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {endDateFilter ? format(endDateFilter, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={endDateFilter}
                              onSelect={setEndDateFilter}
                              initialFocus
                              className="rounded-md border bg-popover"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button variant="outline" className="w-full mt-1" onClick={() => {
                        setStartDateFilter(undefined);
                        setEndDateFilter(undefined);
                      }}>
                        Borrar datas
                      </Button>
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Data de vencemento</span>
                    {(dueDateStartFilter || dueDateEndFilter) && (
                      <Badge variant="outline" className="ml-auto">
                        {dueDateStartFilter && format(dueDateStartFilter, "dd/MM/yy")}
                        {dueDateStartFilter && dueDateEndFilter && ' - '}
                        {dueDateEndFilter && format(dueDateEndFilter, "dd/MM/yy")}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0" sideOffset={-5}>
                    <div className="p-2 bg-popover border rounded-md shadow-md">
                      <div className="mb-2">
                        <div className="mb-1 text-sm font-medium">Desde</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dueDateStartFilter && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {dueDateStartFilter ? format(dueDateStartFilter, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={dueDateStartFilter}
                              onSelect={setDueDateStartFilter}
                              initialFocus
                              className="rounded-md border bg-popover"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="mb-2">
                        <div className="mb-1 text-sm font-medium">Hasta</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !dueDateEndFilter && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {dueDateEndFilter ? format(dueDateEndFilter, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={dueDateEndFilter}
                              onSelect={setDueDateEndFilter}
                              initialFocus
                              className="rounded-md border bg-popover"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button variant="outline" className="w-full mt-1" onClick={() => {
                        setDueDateStartFilter(undefined);
                        setDueDateEndFilter(undefined);
                      }}>
                        Borrar datas
                      </Button>
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Proxecto</span>
                    {projectFilter && (
                      <Badge variant="outline" className="ml-auto">
                        {projectFilter}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <div className="p-2">
                      <Input
                        placeholder="Buscar proxecto..."
                        value={projectSearchQuery}
                        onChange={(e) => setProjectSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    <ScrollArea className="h-[200px]">
                      <DropdownMenuItem onClick={() => setProjectFilter(null)}>
                        Todos os proxectos
                      </DropdownMenuItem>
                      {filteredProjects.map(project => (
                        <DropdownMenuItem key={project} onClick={() => setProjectFilter(project)}>
                          <Filter className="mr-2 h-4 w-4" />
                          {project}
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              
              <div className="p-2">
                <Button className="w-full" variant="outline" onClick={resetFilters}>
                  Limpar filtros
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="rounded-md border animate-scale-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Creador</TableHead>
                <TableHead>Asignados</TableHead>
                <TableHead>Data Creación</TableHead>
                <TableHead>Data Vencemento</TableHead>
                <TableHead className="text-right">Accións</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Cargando tarefas...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const createdById = task.createdBy || task.created_by;
                  const taskCreator = createdById ? users[createdById] : null;
                  
                  console.log(`Task ${task.id} - createdAt:`, task.createdAt || (task.created_at as string | undefined), 
                              'dueDate:', task.dueDate || (task.due_date as string | undefined));
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center">
                          <Hash className="h-3 w-3 mr-1 text-muted-foreground" />
                          {task.id}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getStatusIcon(task.status)}
                          <span className="ml-2">{task.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusText(task.status)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        {taskCreator ? (
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={taskCreator?.avatar || ''} alt={taskCreator?.name || ''} />
                              <AvatarFallback>{taskCreator?.name ? taskCreator.name.substring(0, 2) : 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{taskCreator.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sen asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {task.assignments && task.assignments.length > 0 ? (
                            <>
                              {task.assignments.slice(0, 3).map((assignment, index) => {
                                const assignedUserId = typeof assignment.user_id === 'string' 
                                  ? parseInt(assignment.user_id, 10) 
                                  : assignment.user_id;
                                
                                const user = users[assignedUserId];
                                return (
                                  <div 
                                    key={`${task.id}-${assignedUserId}-${index}`} 
                                    className="h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-background" 
                                    title={user?.name || `User ${assignedUserId}`}
                                  >
                                    {user && user.avatar ? (
                                      <img 
                                        src={user.avatar} 
                                        alt={user.name} 
                                        className="h-full w-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs font-medium text-primary-foreground">
                                        {user ? user.name.substring(0, 2) : assignedUserId.toString().substring(0, 2)}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                              {task.assignments.length > 3 && (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border-2 border-background">
                                  <span className="text-xs">+{task.assignments.length - 3}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">0</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatTaskDate(task.createdAt || (task.created_at as string | undefined))}
                      </TableCell>
                      <TableCell>
                        {formatTaskDate(task.dueDate || (task.due_date as string | undefined))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewTask(task.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditTask(task.id)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          {currentUser?.role === 'admin' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
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
                                  <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Clock className="h-10 w-10 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground">Non se atoparon tarefas</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default TaskList;
