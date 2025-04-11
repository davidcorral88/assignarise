import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/useAuth';
import { Layout } from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, CheckSquare, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  getTimeEntries,
  getTimeEntryById,
  getTimeEntriesByUserId,
  getTimeEntriesByTaskId,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTasks,
  getTaskById,
  getUsers,
  getUserById,
} from '@/utils/dataService';
import { Task, User, TimeEntry } from '@/utils/types';
import { toNumericId } from '@/utils/typeUtils';

const TimeTracking = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all time entries
        const entriesData = await getTimeEntries();
        setTimeEntries(entriesData);

        // Fetch available tasks and users
        const tasksData = await getTasks();
        setAvailableTasks(tasksData);

        const usersData = await getUsers();
        setAvailableUsers(usersData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterTimeEntries = () => {
    let filtered = timeEntries.filter(entry => {
      if (selectedTask && selectedTask !== '0') {
        if (entry.taskId?.toString() !== selectedTask) {
          return false;
        }
      }

      if (selectedUser && selectedUser !== '0') {
        if (entry.userId?.toString() !== selectedUser) {
          return false;
        }
      }

      if (selectedDate) {
        const entryDate = new Date(entry.date || '');
        const selected = new Date(selectedDate);
        if (
          entryDate.getFullYear() !== selected.getFullYear() ||
          entryDate.getMonth() !== selected.getMonth() ||
          entryDate.getDate() !== selected.getDate()
        ) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const taskMatch = availableTasks.find(task => task.id?.toString() === entry.taskId?.toString())?.title?.toLowerCase().includes(searchLower);
        const userMatch = availableUsers.find(user => user.id?.toString() === entry.userId?.toString())?.name?.toLowerCase().includes(searchLower);
        const descriptionMatch = entry.description?.toLowerCase().includes(searchLower);

        if (!(taskMatch || userMatch || descriptionMatch)) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  };

  const filteredTimeEntries = filterTimeEntries();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleTaskChange = (value: string) => {
    setSelectedTask(value);
  };

  const handleUserChange = (value: string) => {
    setSelectedUser(value);
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteEntry = async (entryId: string | number) => {
    const entryIdNumber = typeof entryId === 'string' ? parseInt(entryId, 10) : entryId;
    if (isNaN(entryIdNumber)) {
      toast({
        title: 'Error',
        description: 'Invalid entry ID.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteTimeEntry(entryIdNumber);
      setTimeEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      toast({
        title: 'Success',
        description: 'Time entry deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time entry.',
        variant: 'destructive',
      });
    }
  };

  const canCreateTimeEntries = currentUser?.role === 'admin' || currentUser?.role === 'director' || currentUser?.role === 'employee';

  // Fix the type conversion in the component
  const processTimeEntry = (entry: any) => {
    // Convert userId to number if it's a string
    const userId = toNumericId(entry.userId);

    return {
      ...entry,
      userId: userId !== undefined ? userId : entry.userId,
    };
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

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Rexistro de Tempo
            </h2>
            <p className="text-muted-foreground">
              Aquí tes unha lista de todos os rexistros de tempo.
            </p>
          </div>
          {canCreateTimeEntries && (
            <Button onClick={() => navigate('/time-tracking/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Rexistro
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>
              Utiliza os filtros para refinar a lista de rexistros de tempo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por tarefa, usuario, descripción..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div>
              <Label htmlFor="task">Tarefa</Label>
              <Select value={selectedTask} onValueChange={handleTaskChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as tarefas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas as tarefas</SelectItem>
                  {availableTasks.map(task => (
                    <SelectItem key={task.id} value={task.id?.toString() || ''}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user">Usuario</Label>
              <Select value={selectedUser} onValueChange={handleUserChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos os usuarios</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id?.toString() || ''}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy")
                    ) : (
                      <span>Escolle unha data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Accións</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimeEntries.map(entry => {
                const processedEntry = processTimeEntry(entry);
                const task = availableTasks.find(task => task.id?.toString() === processedEntry.taskId?.toString());
                const user = availableUsers.find(user => user.id?.toString() === processedEntry.userId?.toString());

                return (
                  <TableRow key={processedEntry.id}>
                    <TableCell>{task?.title}</TableCell>
                    <TableCell>{user?.name}</TableCell>
                    <TableCell>{formatDate(processedEntry.date)}</TableCell>
                    <TableCell>{processedEntry.hours}</TableCell>
                    <TableCell>{processedEntry.description}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Edit className="h-4 w-4 mr-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Accións</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigate(`/time-tracking/edit/${processedEntry.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteEntry(processedEntry.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default TimeTracking;
