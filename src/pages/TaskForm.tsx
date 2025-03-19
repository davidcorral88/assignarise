import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  ArrowLeft, 
  Calendar, 
  CheckSquare, 
  Plus, 
  Tag, 
  Trash2, 
  X,
  Clock,
  Save,
  Search
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  mockTasks, 
  mockUsers, 
  getTaskById,
  getNextTaskId
} from '../utils/mockData';
import { Task, User, TaskAssignment } from '../utils/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const TaskForm = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [taskId, setTaskId] = useState(getNextTaskId());
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
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const workers = mockUsers.filter(user => user.role === 'worker');
  
  useEffect(() => {
    if (isEditing && id) {
      const task = getTaskById(id);
      if (task) {
        setTaskId(parseInt(task.id));
        setTarefa(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setStartDate(task.startDate ? new Date(task.startDate) : new Date());
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setTags(task.tags || []);
        setAssignments([...task.assignments]);
      }
    } else {
      setTaskId(getNextTaskId());
    }
    setLoading(false);
  }, [id, isEditing]);
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to save the task
      const task: Task = {
        id: String(taskId),
        title: tarefa,
        description,
        status: status as 'pending' | 'in_progress' | 'completed',
        priority: priority as 'low' | 'medium' | 'high',
        createdBy: currentUser?.id || '',
        createdAt: isEditing ? getTaskById(id!)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        tags,
        assignments,
      };
      
      toast({
        title: isEditing ? 'Tarefa actualizada' : 'Tarefa creada',
        description: isEditing ? 'A tarefa foi actualizada correctamente.' : 'A tarefa foi creada correctamente.',
      });
      
      // Navigate back to tasks list
      navigate('/tasks');
      
      setSubmitting(false);
    }, 800);
  };
  
  const handleSearchTask = () => {
    if (searchTaskId.trim()) {
      const task = getTaskById(searchTaskId);
      if (task) {
        setTaskId(parseInt(task.id));
        setTarefa(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setStartDate(task.startDate ? new Date(task.startDate) : new Date());
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setTags(task.tags || []);
        setAssignments([...task.assignments]);
        
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
      // Check if user is already assigned
      if (!assignments.some(a => a.userId === selectedUserId)) {
        setAssignments([
          ...assignments,
          { userId: selectedUserId, allocatedHours }
        ]);
        
        // Reset form fields
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
  
  // Access control: only managers and task owners can edit
  const canEdit = currentUser?.role === 'manager' || 
    (isEditing && getTaskById(id!)?.createdBy === currentUser?.id);
  
  if (isEditing && !canEdit) {
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
          
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#007bc4' }}>
            {isEditing ? 'Editar tarefa' : 'Nova tarefa'}
          </h1>
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
                          value={taskId}
                          onChange={(e) => setTaskId(parseInt(e.target.value))}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="w-2/3 space-y-2">
                        <Label htmlFor="searchId">Buscar tarefa por ID</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="searchId"
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
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className="bg-white pointer-events-auto"
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
                  <CardTitle style={{ color: '#007bc4' }}>Asignacións</CardTitle>
                  <CardDescription>
                    Asigna esta tarefa a un ou varios traballadores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {assignments.map(assignment => {
                      const user = mockUsers.find(u => u.id === assignment.userId);
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
                  
                  {/* Assignment form */}
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
                            {workers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
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
                          <Calendar className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                          className="bg-white pointer-events-auto"
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
                        {isEditing ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? 'Actualizar tarefa' : 'Crear tarefa'}
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
