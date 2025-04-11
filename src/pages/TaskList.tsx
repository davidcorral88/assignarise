// Fix for line 156 - Property 'includes' does not exist on type 'string | number'
// Fix for line 397 - Cannot find name 'setSearchTerm'
// Fix for line 563,87 & 600,90 - Type string is not assignable to type SetStateAction<number>
// Fix for line 937,84 - Type number is not assignable to type string

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, getTasksAssignments, getUserById, getUsers } from '../utils/dataService';
import { Task, User } from '../utils/types';
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
import { DotsHorizontalIcon, Plus, CheckSquare, ArrowLeft, Trash2, Edit, Filter, ChevronsUpDown } from 'lucide-react';
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

const TaskList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [creatorNames, setCreatorNames] = useState<Record<string, string>>({});
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        setLoading(true);
        setError(null);

        const tasksData = await getTasksAssignments();
        setTasks(tasksData);

        const usersData = await getUsers();
        setAvailableUsers(usersData);

        // Create a map of user IDs to names for quick access
        const namesMap: Record<string, string> = {};
        usersData.forEach(user => {
          namesMap[user.id.toString()] = user.name;
        });
        setCreatorNames(namesMap);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
        setLoading(false);
      }
    };

    fetchTasksData();
  }, []);

  // Task filtering logic
  const filterTasks = () => {
    let filtered = tasks.filter(task => {
      // Task creator and assignee filtering
      if (selectedCreator && selectedCreator !== '0') {
        const taskCreatedBy = task.createdBy?.toString();
        if (taskCreatedBy !== selectedCreator) {
          return false;
        }
      }

      if (selectedAssignee && selectedAssignee !== '0') {
        if (!task.assignments) return false;
        
        const isAssigned = task.assignments.some(assignment => {
          const assigneeId = assignment.user_id.toString();
          return assigneeId === selectedAssignee;
        });
        
        if (!isAssigned) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        
        // Convert task.id to string safely before using includes
        const idMatch = task.id?.toString().includes(searchLower) || false;
        
        const descriptionMatch = task.description?.toLowerCase().includes(searchLower) || false;
        const creatorMatch = creatorNames[task.createdBy?.toString() || '']?.toLowerCase().includes(searchLower) || false;
        
        // Handle category and project search
        const categoryMatch = task.category?.toLowerCase().includes(searchLower) || false;
        const projectMatch = task.project?.toLowerCase().includes(searchLower) || false;
        
        if (!(titleMatch || idMatch || descriptionMatch || creatorMatch || categoryMatch || projectMatch)) {
          return false;
        }
      }
      
      // Status filtering
      if (
        (selectedStatus === 'pending' && task.status !== 'pending') ||
        (selectedStatus === 'in_progress' && task.status !== 'in_progress') ||
        (selectedStatus === 'completed' && task.status !== 'completed')
      ) {
        return false;
      }
      
      // Priority filtering
      if (
        (selectedPriority === 'high' && task.priority !== 'high') ||
        (selectedPriority === 'medium' && task.priority !== 'medium') ||
        (selectedPriority === 'low' && task.priority !== 'low')
      ) {
        return false;
      }
      
      return true;
    });
    
    // Sorting logic
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof Task];
        const bValue = b[sortField as keyof Task];

        if (aValue === undefined || bValue === undefined) {
          return 0;
        }

        const aStr = typeof aValue === 'string' ? aValue.toLowerCase() : String(aValue);
        const bStr = typeof bValue === 'string' ? bValue.toLowerCase() : String(bValue);

        if (aStr < bStr) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  };

  const filteredTasks = filterTasks();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIndicator = (field: string) => {
    if (sortField === field) {
      return sortOrder === 'asc' ? "↑" : "↓";
    }
    return null;
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handlePriorityChange = (value: string) => {
    setSelectedPriority(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle type conversions for selectedCreator/Assignee in event handlers
  const handleCreatorChange = (value: string) => {
    setSelectedCreator(value);
  };
  
  const handleAssigneeChange = (value: string) => {
    setSelectedAssignee(value);
  };
  
  // Fix for the numeric ID conversion in task links
  const getTaskLink = (taskId: string | number) => {
    return `/tasks/${taskId.toString()}`;
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

  const canCreateTasks = currentUser?.role === 'admin' || currentUser?.role === 'director';

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Lista de Tarefas
            </h2>
            <p className="text-muted-foreground">
              Aquí tes unha lista de todas as túas tarefas.
            </p>
          </div>
          {canCreateTasks && (
            <Button onClick={() => navigate('/tasks/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Tarefa
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>
              Utiliza os filtros para refinar a lista de tarefas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por título, ID, descripción..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os estados</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={selectedPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="creator">Creador</Label>
              <Select value={selectedCreator} onValueChange={handleCreatorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os creadores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos os creadores</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignee">Asignado a</Label>
              <Select value={selectedAssignee} onValueChange={handleAssigneeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os asignados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos os asignados</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('id')} className="cursor-pointer">
                  ID {getSortIndicator('id')}
                </TableHead>
                <TableHead onClick={() => handleSort('title')} className="cursor-pointer">
                  Título {getSortIndicator('title')}
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                  Estado {getSortIndicator('status')}
                </TableHead>
                <TableHead onClick={() => handleSort('priority')} className="cursor-pointer">
                  Prioridade {getSortIndicator('priority')}
                </TableHead>
                <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                  Data de Creación {getSortIndicator('createdAt')}
                </TableHead>
                <TableHead>Accións</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>{formatDate(task.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(getTaskLink(task.id))}>
                      <Edit className="h-4 w-4 mr-2" />
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default TaskList;
