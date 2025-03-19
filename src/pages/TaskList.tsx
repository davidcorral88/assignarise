
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  CheckSquare, 
  PlusCircle, 
  Search, 
  Filter, 
  ChevronDown,
  CheckCircle2,
  Clock, 
  Circle,
  Edit,
  Eye,
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
} from '@/components/ui/dropdown-menu';
import { 
  mockTasks, 
  mockUsers, 
  getTasksByUserId, 
  getUserById 
} from '../utils/mockData';
import { Task } from '../utils/types';
import { format } from 'date-fns';

const TaskList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'worker') {
        // Workers only see tasks assigned to them
        setTasks(getTasksByUserId(currentUser.id));
      } else {
        // Managers see all tasks
        setTasks(mockTasks);
      }
    }
  }, [currentUser]);
  
  useEffect(() => {
    let result = [...tasks];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          task.description.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, statusFilter]);
  
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
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
            <p className="text-muted-foreground mt-1">
              {currentUser?.role === 'manager' ? 'Administra todas as tarefas' : 'Administra as túas tarefas asignadas'}
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
              placeholder="Buscar tarefas..."
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
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="rounded-md border animate-scale-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Asignados</TableHead>
                <TableHead>Vencemento</TableHead>
                <TableHead className="text-right">Accións</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getStatusIcon(task.status)}
                        <span className="ml-2">{task.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusText(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
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
                      </div>
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
    </Layout>
  );
};

export default TaskList;
