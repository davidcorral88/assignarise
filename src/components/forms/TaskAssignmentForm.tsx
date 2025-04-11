
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { User, Task, TaskAssignment } from '@/utils/types';
import { getUsers, updateTask } from '@/utils/dataService';
import { Plus } from 'lucide-react';
import { toNumericId } from '@/utils/typeUtils';

interface TaskAssignmentFormProps {
  taskId: string;
  onTaskUpdated: (task: Task) => void;
}

const TaskAssignmentForm: React.FC<TaskAssignmentFormProps> = ({ taskId, onTaskUpdated }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [allocatedHours, setAllocatedHours] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  
  useEffect(() => {
    // Load available users
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    
    fetchUsers();
    
    // Load current task to get assignments
    const fetchTask = async () => {
      try {
        const numericTaskId = toNumericId(taskId);
        if (numericTaskId !== undefined) {
          const taskData = await getTaskById(numericTaskId);
          setTask(taskData);
        }
      } catch (error) {
        console.error('Error loading task:', error);
      }
    };
    
    fetchTask();
  }, [taskId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !task) {
      toast({
        title: "Error",
        description: "Selecciona un usuario para asignar",
        variant: "destructive"
      });
      return;
    }
    
    if (allocatedHours <= 0) {
      toast({
        title: "Error",
        description: "Las horas asignadas deben ser mayores que cero",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user is already assigned
    const isAlreadyAssigned = task.assignments?.some(
      assignment => assignment.user_id.toString() === selectedUser
    );
    
    if (isAlreadyAssigned) {
      toast({
        title: "Error",
        description: "Este usuario ya está asignado a la tarea",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const numericTaskId = toNumericId(taskId);
      const numericUserId = toNumericId(selectedUser);
      
      if (numericTaskId === undefined || numericUserId === undefined) {
        throw new Error("ID inválido");
      }
      
      // Create new assignment
      const newAssignment: TaskAssignment = {
        user_id: numericUserId,
        allocatedHours: allocatedHours,
        task_id: taskId
      };
      
      // Update task with new assignment
      const updatedTask = {
        ...task,
        assignments: [...(task.assignments || []), newAssignment]
      };
      
      await updateTask(numericTaskId, updatedTask);
      
      toast({
        title: "Éxito",
        description: "Usuario asignado correctamente",
      });
      
      // Reset form
      setSelectedUser('');
      setAllocatedHours(1);
      
      // Notify parent component
      onTaskUpdated(updatedTask);
    } catch (error) {
      console.error('Error al asignar usuario:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar el usuario a la tarea",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 border-t pt-4">
      <h4 className="text-sm font-medium">Añadir asignación</h4>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="user">Usuario</Label>
          <Select 
            value={selectedUser} 
            onValueChange={setSelectedUser}
          >
            <SelectTrigger id="user">
              <SelectValue placeholder="Seleccionar usuario" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id.toString()}>
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
            step="0.5"
            min="0.5"
            value={allocatedHours}
            onChange={(e) => setAllocatedHours(Number(e.target.value))}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            Asignando...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Asignar usuario
          </>
        )}
      </Button>
    </form>
  );
};

// For TypeScript to work properly, we need to import getTaskById
import { getTaskById } from '@/utils/dataService';

export default TaskAssignmentForm;
