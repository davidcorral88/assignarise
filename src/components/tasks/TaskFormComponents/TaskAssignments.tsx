
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { User, TaskAssignment } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';

interface TaskAssignmentsProps {
  assignments: TaskAssignment[];
  setAssignments: (assignments: TaskAssignment[]) => void;
  availableUsers: User[];
  assignedUserData: Record<number, User | null>;
  recentlyAddedUsers: Record<number, User | null>;
}

const TaskAssignments: React.FC<TaskAssignmentsProps> = ({
  assignments,
  setAssignments,
  availableUsers,
  assignedUserData,
  recentlyAddedUsers,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [allocatedHours, setAllocatedHours] = useState<number>(0);

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

  return (
    <div className="space-y-6">
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
    </div>
  );
}

export default TaskAssignments;
