import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Layout } from '../components/layout/Layout';
import { AlertCircle, CheckSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users);
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
    const processUsers = async () => {
      if (!task) return;
      
      if (task.createdBy) {
        const createdById = typeof task.createdBy === 'string' 
          ? parseInt(task.createdBy, 10) 
          : task.createdBy;
            
        const cachedUser = allUsers.find(user => {
          const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
          return userId === createdById;
        });
        
        if (cachedUser) {
          setCreator(cachedUser);
        } else {
          try {
            const user = await getUserById(createdById);
            setCreator(user || null);
          } catch (error) {
            console.error('Error fetching creator:', error);
          }
        }
      }
      
      if (task.assignments && task.assignments.length > 0) {
        const users: Record<string, User | null> = {};
        
        for (const assignment of task.assignments) {
          const userId = typeof assignment.user_id === 'string' 
            ? parseInt(assignment.user_id, 10) 
            : assignment.user_id;
          
          const cachedUser = allUsers.find(user => {
            const userIdNum = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
            return userIdNum === userId;
          });
          
          if (cachedUser) {
            users[userId.toString()] = cachedUser;
          } else {
            try {
              const user = await getUserById(userId);
              if (user) {
                users[userId.toString()] = user;
              }
            } catch (error) {
              console.error(`Error fetching user for assignment with userId ${userId}:`, error);
            }
          }
        }
        
        setAssignedUsers(users);
      }
      
      if (timeEntries.length > 0) {
        const updatedUsers = { ...assignedUsers };
        
        for (const entry of timeEntries) {
          const entryUserId = typeof entry.user_id === 'string' 
            ? parseInt(entry.user_id, 10) 
            : entry.user_id;
          
          if (updatedUsers[entryUserId.toString()]) continue;
          
          const cachedUser = allUsers.find(user => {
            const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
            return userId === entryUserId;
          });
          
          if (cachedUser) {
            updatedUsers[entryUserId.toString()] = cachedUser;
          } else {
            try {
              const user = await getUserById(entryUserId);
              if (user) {
                updatedUsers[entryUserId.toString()] = user;
              }
            } catch (error) {
              console.error(`Error fetching user for time entry with userId ${entryUserId}:`, error);
            }
          }
        }
        
        if (Object.keys(updatedUsers).length > Object.keys(assignedUsers).length) {
          setAssignedUsers(updatedUsers);
        }
      }
    };
    
    processUsers();
  }, [task, timeEntries, allUsers]);
  
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
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <TaskDetailHeader 
          task={task} 
          currentUserId={currentUserId} 
          canEdit={true}
        />
        
        {timeEntries.length === 0 && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              Non hai rexistros de tempo para esta tarefa. Os datos de progreso e horas traballadas non estarán dispoñibles.
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
