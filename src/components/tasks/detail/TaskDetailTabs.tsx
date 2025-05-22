
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Timer } from 'lucide-react';
import { Task, TimeEntry, User, TaskAssignment } from '@/utils/types';
import { TaskAssignmentList } from './TaskAssignmentList';
import { TimeEntryList } from './TimeEntryList';

interface TaskDetailTabsProps {
  taskId: string;
  assignments: TaskAssignment[];
  timeEntries: TimeEntry[];
  assignedUsers: Record<string | number, User | null>;
  currentUserId?: number;
  currentUserRole?: string;
}

export const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({
  taskId,
  assignments,
  timeEntries,
  assignedUsers,
  currentUserId,
  currentUserRole
}) => {
  const [refreshTimeEntries, setRefreshTimeEntries] = useState(0);
  
  // Check if user is assigned to this task - ensure we're comparing numbers with numbers
  const isAssignedToCurrentUser = assignments.some(a => {
    // Ensure user_id is a number for comparison
    const assignmentUserId = typeof a.user_id === 'string' ? parseInt(a.user_id, 10) : a.user_id;
    return assignmentUserId === currentUserId;
  });
  
  const handleEntryDeleted = () => {
    // Trigger a refresh of the time entries
    setRefreshTimeEntries(prev => prev + 1);
  };
  
  return (
    <Tabs defaultValue="assignments">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
        <TabsTrigger value="timeEntries">Registro de horas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="assignments" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Asignaciones
            </CardTitle>
            <CardDescription>
              Usuarios asignados y horas asignadas a esta tarea
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskAssignmentList
              taskId={taskId}
              assignments={assignments}
              assignedUsers={assignedUsers}
              timeEntries={timeEntries}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="timeEntries" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="mr-2 h-4 w-4" />
              Registro de horas
            </CardTitle>
            <CardDescription>
              Horas registradas para esta tarea
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeEntryList
              taskId={taskId}
              timeEntries={timeEntries}
              assignedUsers={assignedUsers}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isAssignedToCurrentUser={isAssignedToCurrentUser}
              onEntryDeleted={handleEntryDeleted}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
