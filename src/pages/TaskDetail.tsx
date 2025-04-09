
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
  getTotalHoursAllocatedByTask,
  getUsers
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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  // Fetch all users first to have a complete user reference
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users);
        console.log("All users loaded:", users.length);
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    };
    
    fetchAllUsers();
  }, []);
  
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
          
          // Try to find creator in allUsers first
          const cachedUser = allUsers.find(user => user.id === createdById);
          if (cachedUser) {
            console.log('Creator found in cached users:', cachedUser);
            setCreator(cachedUser);
            return;
          }
          
          // If not found, fetch from API
          const user = await getUserById(createdById);
          console.log('Creator fetched from API:', user);
          setCreator(user || null);
        } catch (error) {
          console.error('Error fetching creator:', error);
        }
      }
    };
    
    getCreator();
  }, [task, allUsers]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (task?.assignments && task.assignments.length > 0) {
        const users: Record<string, User | null> = {};
        
        for (const assignment of task.assignments) {
          try {
            const userId = typeof assignment.user_id === 'string' 
              ? parseInt(assignment.user_id, 10) 
              : assignment.user_id;
              
            console.log(`Processing assignment with user ID: ${userId}`);
            
            // First check if user exists in the allUsers array (to avoid redundant API calls)
            const cachedUser = allUsers.find(user => user.id === userId);
            if (cachedUser) {
              console.log('User found in cached users:', cachedUser);
              users[userId.toString()] = cachedUser;
              continue;
            }
            
            // If not in cache, fetch from API
            console.log(`Fetching user with ID: ${userId}`);
            const user = await getUserById(userId);
            console.log('User fetched for assignment:', user);
            
            if (user) {
              users[userId.toString()] = user;
            }
          } catch (error) {
            console.error(`Error fetching user for assignment with userId ${assignment.user_id}:`, error);
          }
        }
        
        console.log('Final assignedUsers map:', users);
        setAssignedUsers(users);
      }
    };
    
    fetchUsers();
  }, [task?.assignments, allUsers]);
  
  useEffect(() => {
    const fetchTimeEntryUsers = async () => {
      if (timeEntries.length > 0) {
        const userIds = timeEntries.map(entry => entry.user_id);
        const uniqueUserIds = [...new Set(userIds)];
        
        const users: Record<string, User | null> = { ...assignedUsers };
        
        for (const userId of uniqueUserIds) {
          if (!users[userId.toString()]) {
            try {
              const userIdNum = typeof userId === 'string' 
                ? parseInt(userId, 10) 
                : userId;
                
              // First check in allUsers cache
              const cachedUser = allUsers.find(user => user.id === userIdNum);
              if (cachedUser) {
                console.log('Time entry user found in cache:', cachedUser);
                users[userIdNum.toString()] = cachedUser;
                continue;
              }
                
              console.log(`Fetching time entry user with ID: ${userIdNum}`);
              const user = await getUserById(userIdNum);
              console.log('User fetched for time entry:', user);
              
              if (user) {
                users[userIdNum.toString()] = user;
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
  }, [timeEntries, assignedUsers, allUsers]);
  
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
          canEdit={true} // Modificado para permitir editar a cualquier usuario
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
