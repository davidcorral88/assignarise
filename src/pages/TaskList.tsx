import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
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
  mockTasks, 
  mockUsers, 
  getTasksByUserId, 
  getUserById,
  deleteTask
} from '../utils/mockData';
import { Task } from '../utils/types';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

const TaskList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [creatorFilter, setCreatorFilter] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);
  const [dueDateStartFilter, setDueDateStartFilter] = useState<Date | undefined>(undefined);
  const [dueDateEndFilter, setDueDateEndFilter] = useState<Date | undefined>(undefined);
  const [dateFilterType, setDateFilterType] = useState<'creation' | 'due'>('creation');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'worker') {
        setTasks(getTasksByUserId(currentUser.id));
      } else {
        setTasks(mockTasks);
      }
    }
  }, [currentUser]);
  
  useEffect(() => {
    let result = [...tasks];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          task.description.toLowerCase().includes(query) ||
          task.id.includes(query)
      );
    }
    
    if (statusFilter) {
      result = result.filter(task => task.status === statusFilter);
    }

    if (priorityFilter) {
      result = result.filter(task => task.priority === priorityFilter);
    }

    if (creatorFilter) {
      result = result.filter(task => task.createdBy === creatorFilter);
    }

    if (startDateFilter || endDateFilter) {
      result = result.filter(task => {
        const taskDate = parseISO(task.createdAt);
        let matches = true;

        if (startDateFilter) {
          const startOfDay = new Date(startDateFilter);
          startOfDay.setHours(0, 0, 0, 0);
          matches = matches && isAfter(taskDate, startOfDay);
        }

        if (endDateFilter) {
          const endOfDay = new Date(endDateFilter);
          endOfDay.setHours(23, 59, 59, 999);
          matches = matches && isBefore(taskDate, endOfDay);
        }

        return matches;
      });
    }

    if (dueDateStartFilter || dueDateEndFilter) {
      result = result.filter(task => {
        if (!task.dueDate) return false;
        
        const taskDueDate = parseISO(task.dueDate);
        let matches = true;

        if (dueDateStartFilter) {
          const startOfDay = new Date(dueDateStartFilter);
          startOfDay.setHours(0, 0, 0, 0);
          matches = matches && isAfter(taskDueDate, startOfDay);
        }

        if (dueDateEndFilter) {
          const endOfDay = new Date(dueDateEndFilter);
          endOfDay.setHours(23, 59, 59, 999);
          matches = matches && isBefore(taskDueDate, endOfDay);
        }

        return matches;
      });
    }
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, statusFilter, priorityFilter, creatorFilter, startDateFilter, endDateFilter, dueDateStartFilter, dueDateEndFilter]);
  
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
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setDueDateStartFilter(undefined);
    setDueDateEndFilter(undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (priorityFilter) count++;
    if (creatorFilter) count++;
    if (startDateFilter || endDateFilter) count++;
    if (dueDateStartFilter || dueDateEndFilter) count++;
    return count;
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      toast({
        title: 'Tarefa eliminada',
        description: 'A tarefa foi eliminada correctamente.',
      });
      // Refresh the task list
      if (currentUser?.role === 'worker') {
        setTasks(getTasksByUserId(currentUser.id));
      } else {
        setTasks(mockTasks);
      }
      setTaskToDelete(null);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-muted-foreground mt-1">
              {currentUser?.role === 'director' ? 'Administra todas as tarefas' : 'Administra as túas tarefas asignadas'}
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
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar tarefas por nome ou ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
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
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Creador</span>
                    {creatorFilter && (
                      <Badge variant="outline" className="ml-auto">
                        {getUserById(creatorFilter)?.name || 'Usuario'}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setCreatorFilter(null)}>
                      Todos os usuarios
                    </DropdownMenuItem>
                    {mockUsers.map(user => (
                      <DropdownMenuItem key={user.id} onClick={() => setCreatorFilter(user.id)}>
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-2">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full" />
                            ) : (
                              <span className="text-xs font-medium text-primary-foreground">
                                {user.name.substring(0, 2)}
                              </span>
                            )}
                          </div>
                          {user.name}
                        </div>
                      </DropdownMenuItem>
                    ))}
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
                  <DropdownMenuSubContent className="p-0">
                    <div className="p-2">
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
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={startDateFilter}
                              onSelect={setStartDateFilter}
                              className="rounded-md border"
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
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={endDateFilter}
                              onSelect={setEndDateFilter}
                              className="rounded-md border"
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
                  <DropdownMenuSubContent className="p-0">
                    <div className="p-2">
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
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={dueDateStartFilter}
                              onSelect={setDueDateStartFilter}
                              className="rounded-md border"
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
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={dueDateEndFilter}
                              onSelect={setDueDateEndFilter}
                              className="rounded-md border"
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
                <TableHead>Vencemento</TableHead>
                <TableHead className="text-right">Accións</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
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
                      {task.createdBy && (
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-2">
                            {getUserById(task.createdBy)?.avatar ? (
                              <img 
                                src={getUserById(task.createdBy)?.avatar} 
                                alt={getUserById(task.createdBy)?.name} 
                                className="h-full w-full rounded-full" 
                              />
                            ) : (
                              <span className="text-xs font-medium text-primary-foreground">
                                {getUserById(task.createdBy)?.name?.substring(0, 2) || '??'}
                              </span>
                            )}
                          </div>
                          <span className="text-sm">{getUserById(task.createdBy)?.name || 'Usuario descoñecido'}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {task.assignments.slice(0, 3).map((assignment) => {
                          const user = getUserById(assignment.userId);
                          return (
                            <div key={assignment.userId} className="h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-background" title={user?.name}>
                              {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full" />
                              ) : (
                                <span className="text-xs font-medium text-primary-foreground">
                                  {user?.name.substring(0, 2)}
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
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.dueDate 
                        ? format(new Date(task.dueDate), 'dd/MM/yyyy')
                        : '—'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/tasks/${task.id}`)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        {currentUser?.role === 'director' && (
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
                                <AlertDialogAction onClick={() => {
                                  deleteTask(task.id);
                                  toast({
                                    title: 'Tarefa eliminada',
                                    description: 'A tarefa foi eliminada correctamente.',
                                  });
                                  // Refresh the task list
                                  if (currentUser?.role === 'worker') {
                                    setTasks(getTasksByUserId(currentUser.id));
                                  } else {
                                    setTasks(mockTasks);
                                  }
                                }}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
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
      
      <AlertDialog open={taskToDelete !== null} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción non se pode desfacer. Eliminarás permanentemente esta tarefa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default TaskList;
