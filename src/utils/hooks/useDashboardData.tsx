import { useState, useEffect } from 'react';
import { User, Task, TimeEntry } from '@/utils/types';
import { getTasksByUserId, getTasks, getTimeEntriesByUserId, getUsers } from '@/utils/apiService';
import { toast } from '@/components/ui/use-toast';

interface UseDashboardDataProps {
  currentUser: User | null;
}

interface DashboardData {
  userTasks: Task[];
  userTimeEntries: TimeEntry[];
  userCount: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardData = ({ currentUser }: UseDashboardDataProps): DashboardData => {
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userTimeEntries, setUserTimeEntries] = useState<TimeEntry[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        setLoading(true);
        setError(null);
        
        try {
          // Fetch users count with better error handling
          try {
            const users = await getUsers();
            
            // Filter admin users from count for non-admin users
            const filteredUsers = currentUser.role === 'admin' 
              ? users 
              : users.filter(user => user.role !== 'admin');
            
            setUserCount(filteredUsers.length);
          } catch (error) {
            console.error("Error fetching users:", error);
            setUserCount(0); // Fallback
          }
          
          // Fetch tasks with robust error handling
          let tasksData: Task[] = [];
          
          if (currentUser.role === 'worker') {
            // Workers only see tasks assigned to them
            const userId = currentUser.id;
            console.log(`Fetching tasks for worker with ID: ${userId}`);
            
            try {
              // Convert userId to string before passing it to getTasksByUserId
              const userIdStr = userId.toString();
              tasksData = await getTasksByUserId(userIdStr);
              console.log(`Retrieved ${tasksData.length} tasks for worker`);
            } catch (error) {
              console.error("Error fetching worker tasks:", error);
              toast({
                title: 'Erro',
                description: 'Non se puideron cargar as tarefas',
                variant: 'destructive',
              });
              tasksData = []; // Set empty array on error
            }
          } else {
            // Directors and Admins see all tasks
            try {
              tasksData = await getTasks();
              console.log(`Retrieved ${tasksData.length} tasks for admin/director`);
            } catch (error) {
              console.error("Error fetching all tasks:", error);
              toast({
                title: 'Erro',
                description: 'Non se puideron cargar as tarefas',
                variant: 'destructive',
              });
              tasksData = []; // Set empty array on error
            }
          }
          
          // Ensure all tasks have an assignments array
          const normalizedTasks = tasksData.map(task => ({
            ...task,
            assignments: task.assignments || []
          }));
          
          setUserTasks(normalizedTasks);
          
          // Fetch time entries for the user with better error handling
          if (currentUser.role === 'worker') {
            try {
              // Convert user ID to string for the time entries API call as well
              const userIdStr = currentUser.id.toString();
              const entries = await getTimeEntriesByUserId(userIdStr);
              setUserTimeEntries(entries || []);
            } catch (error) {
              console.error("Error fetching time entries:", error);
              toast({
                title: 'Erro',
                description: 'Non se puideron cargar os rexistros de tempo',
                variant: 'destructive',
              });
              setUserTimeEntries([]);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Non se puideron cargar os datos. Por favor, inténteo de novo máis tarde.");
          toast({
            title: 'Erro',
            description: 'Non se puideron cargar os datos',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Reset states if no user
        setUserTasks([]);
        setUserTimeEntries([]);
        setUserCount(0);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  return {
    userTasks,
    userTimeEntries,
    userCount,
    loading,
    error
  };
};
