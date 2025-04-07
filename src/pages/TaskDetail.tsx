import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Layout } from '../components/layout/Layout';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getTaskByIdForState,
  getUserById, 
  getTimeEntriesByTaskIdForState,
  getTotalHoursByTask,
  getTotalHoursAllocatedByTask
} from '../utils/dataService';
import { Task, TimeEntry, User } from '../utils/types';
import { parseISO, format } from 'date-fns';

import { TaskDetailHeader } from '@/components/tasks/detail/TaskDetailHeader';
import { TaskDescription } from '@/components/tasks/detail/TaskDescription';
import { TaskDetailTabs } from '@/components/tasks/detail/TaskDetailTabs';
import { TaskDetailSidebar } from '@/components/tasks/detail/TaskDetailSidebar';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalHoursWorked, setTotalHoursWorked] = useState(0);
  const [totalHoursAllocated, setTotalHoursAllocated] = useState(0);
  const [creator, setCreator] = useState<User | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<Record<string, User | null>>({});
  
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          setLoading(true);
          setError(null);
          
          const taskResult = await getTaskByIdForState(id, setTask);
          if (!taskResult) {
            setError('No se pudo cargar la tarea');
            setLoading(false);
            return;
          }
          
          await getTimeEntriesByTaskIdForState(id, setTimeEntries);
          
          const hoursWorked = await getTotalHoursByTask(id);
          setTotalHoursWorked(hoursWorked);
          
          const hoursAllocated = await getTotalHoursAllocatedByTask(id);
          setTotalHoursAllocated(hoursAllocated);
          
          setLoading(false);
        } catch (err) {
          console.error('Error al cargar los detalles de la tarea:', err);
          setError('Error al cargar los detalles de la tarea');
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [id]);
  
  useEffect(() => {
    const getCreator = async () => {
      if (task && task.createdBy) {
        try {
          const createdById = typeof task.createdBy === 'string' 
            ? parseInt(task.createdBy, 10) 
            : task.createdBy;
            
          console.log(`Fetching creator with ID: ${createdById} (original: ${task.createdBy})`);
          const user = await getUserById(createdById);
          console.log('Creator fetched:', user);
          setCreator(user || null);
        } catch (error) {
          console.error('Error fetching creator:', error);
        }
      }
    };
    
    getCreator();
  }, [task]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (task?.assignments) {
        const users: Record<string, User | null> = {};
        
        for (const assignment of task.assignments) {
          try {
            const userId = typeof assignment.user_id === 'string' 
              ? parseInt(assignment.user_id, 10) 
              : assignment.user_id;
              
            console.log(`Fetching user with ID: ${userId} (original: ${assignment.user_id})`);
            const user = await getUserById(userId);
            console.log('User fetched for assignment:', user);
            
            if (user) {
              users[userId.toString()] = user;
              users[userId] = user;
            }
          } catch (error) {
            console.error(`Error fetching user for assignment with userId ${assignment.user_id}:`, error);
          }
        }
        
        setAssignedUsers(users);
      }
    };
    
    fetchUsers();
  }, [task]);
  
  useEffect(() => {
    const fetchTimeEntryUsers = async () => {
      if (timeEntries.length > 0) {
        const userIds = timeEntries.map(entry => entry.userId);
        const uniqueUserIds = [...new Set(userIds)];
        
        const users: Record<string, User | null> = { ...assignedUsers };
        
        for (const userId of uniqueUserIds) {
          if (!users[userId] && !users[userId.toString()]) {
            try {
              const userIdNum = typeof userId === 'string' 
                ? parseInt(userId, 10) 
                : userId;
                
              console.log(`Fetching time entry user with ID: ${userIdNum} (original: ${userId})`);
              const user = await getUserById(userIdNum);
              console.log('User fetched for time entry:', user);
              
              if (user) {
                users[userIdNum.toString()] = user;
                users[userIdNum] = user;
              }
            } catch (error) {
              console.error(`Error fetching user for time entry with userId ${userId}:`, error);
            }
          }
        }
        
        setAssignedUsers(users);
      }
    };
    
    fetchTimeEntryUsers();
  }, [timeEntries, assignedUsers]);
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No disponible';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
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
  
  if (error || !task) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tarea no encontrada</h2>
          <p className="text-muted-foreground mb-6">{error || 'No se pudo encontrar esta tarea'}</p>
          <Button onClick={() => navigate('/tasks')}>
            Volver a tareas
          </Button>
        </div>
      </Layout>
    );
  }
  
  const currentUserId = currentUser?.id;
  console.log('Current user ID in TaskDetail:', currentUserId);
  console.log('Assigned users in TaskDetail:', assignedUsers);
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <TaskDetailHeader 
          task={task} 
          currentUserId={currentUserId} 
        />
        
        {timeEntries.length === 0 && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              No hay registros de tiempo para esta tarea. Los datos de progreso y horas trabajadas no estarán disponibles.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TaskDescription task={task} />
            
            <TaskDetailTabs
              taskId={task.id}
              assignments={task.assignments}
              timeEntries={timeEntries}
              assignedUsers={assignedUsers}
              currentUserId={currentUserId}
            />
          </div>
          
          <div className="space-y-6">
            <TaskDetailSidebar
              task={task}
              creator={creator}
              totalHoursWorked={totalHoursWorked}
              totalHoursAllocated={totalHoursAllocated}
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskDetail;
