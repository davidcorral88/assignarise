
import React from 'react';
import { Users, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TaskAssignment, User, TimeEntry } from '@/utils/types';
import { UserAvatar } from './UserAvatar';

interface TaskAssignmentListProps {
  taskId: string;
  assignments: TaskAssignment[];
  assignedUsers: Record<string, User | null>;
  timeEntries: TimeEntry[];
}

export const TaskAssignmentList: React.FC<TaskAssignmentListProps> = ({
  taskId,
  assignments,
  assignedUsers,
  timeEntries
}) => {
  const navigate = useNavigate();
  
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">No hay usuarios asignados a esta tarea</p>
        <Button onClick={() => navigate(`/tasks/${taskId}/edit`)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Asignar usuarios
        </Button>
      </div>
    );
  }
  
  console.log('Assignments in TaskAssignmentList:', assignments);
  console.log('assignedUsers in TaskAssignmentList:', assignedUsers);
  
  return (
    <div className="space-y-4">
      {assignments.map(assignment => {
        // Try to get user using both string and number keys
        const userId = assignment.userId;
        const userIdStr = typeof userId === 'number' ? userId.toString() : userId;
        const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        
        let user = assignedUsers[userId] || assignedUsers[userIdStr] || assignedUsers[userIdNum];
        
        console.log(`Looking up user for assignment userId: ${userId}, found:`, user);
        
        const hoursWorked = timeEntries
          .filter(entry => {
            const entryUserId = typeof entry.userId === 'string' ? parseInt(entry.userId, 10) : entry.userId;
            return entryUserId === userIdNum;
          })
          .reduce((sum, entry) => sum + entry.hours, 0);
        
        const progress = assignment.allocatedHours > 0 
          ? Math.min(Math.round((hoursWorked / assignment.allocatedHours) * 100), 100) 
          : 0;
        
        return (
          <div key={userIdStr} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 flex-1">
              <UserAvatar user={user} />
              <div>
                <p className="font-medium">{user?.name || `Usuario ID: ${userId}`}</p>
                <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
              </div>
            </div>
            
            <div className="flex flex-col min-w-[180px]">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso: {progress}%</span>
                <span>{hoursWorked} / {assignment.allocatedHours} horas</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
