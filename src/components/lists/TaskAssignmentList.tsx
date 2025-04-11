
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { TaskAssignment, User } from '@/utils/types';
import { getUserById } from '@/utils/dataService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

interface TaskAssignmentListProps {
  taskId: string;
  assignments: TaskAssignment[];
}

const TaskAssignmentList: React.FC<TaskAssignmentListProps> = ({ 
  taskId, 
  assignments 
}) => {
  const [assignedUsers, setAssignedUsers] = useState<Record<string, User | null>>({});
  
  useEffect(() => {
    const loadUsers = async () => {
      const userPromises = assignments.map(async (assignment) => {
        try {
          // Handle both string and number IDs
          const userId = typeof assignment.user_id === 'string' 
            ? parseInt(assignment.user_id, 10) 
            : assignment.user_id;
            
          const user = await getUserById(userId);
          return { id: assignment.user_id.toString(), user };
        } catch (error) {
          console.error(`Error loading user ${assignment.user_id}:`, error);
          return { id: assignment.user_id.toString(), user: null };
        }
      });
      
      const users = await Promise.all(userPromises);
      const userMap = users.reduce((acc, { id, user }) => {
        acc[id] = user;
        return acc;
      }, {} as Record<string, User | null>);
      
      setAssignedUsers(userMap);
    };
    
    if (assignments.length > 0) {
      loadUsers();
    }
  }, [assignments]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  if (assignments.length === 0) {
    return <p className="text-muted-foreground py-4">No hay usuarios asignados a esta tarea.</p>;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]"></TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead className="text-right">Horas asignadas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => {
          const user = assignedUsers[assignment.user_id.toString()];
          
          return (
            <TableRow key={assignment.user_id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || ''} alt={user?.name || ''} />
                  <AvatarFallback>
                    {user ? getInitials(user.name) : '?'}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{user?.name || 'Usuario desconocido'}</TableCell>
              <TableCell className="text-right">{assignment.allocatedHours || 0}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TaskAssignmentList;
