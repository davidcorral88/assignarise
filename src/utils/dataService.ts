
import * as apiService from './apiService';
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule, WorkSchedule } from './types';
import { toast } from '@/components/ui/use-toast';
import { API_URL } from './dbConfig';

// Always true - PostgreSQL is the only storage option
const useAPI = true;

export const setUseAPI = (value: boolean) => {
  // Always keep useAPI as true regardless of the request
  if (!value) {
    toast({
      title: 'Operación no permitida',
      description: 'Esta aplicación sólo puede utilizar PostgreSQL como almacenamiento.',
      variant: 'destructive',
    });
  }
};

export const getUseAPI = () => useAPI;

// Utility function to handle promises in async functions for useState
const resolvePromise = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    console.error('Error resolving promise:', error);
    throw error;
  }
};

// Re-export functions from apiService with properly typed re-exports
export const { 
  getUsers,
  getUserById,
  getUserByEmail,
  addUser,
  updateUser,
  deleteUser,
  getNextUserId,
  getTasks,
  getTasksAssignments,
  getTaskById,
  getTasksByUserId,
  addTask,
  updateTask,
  deleteTask,
  getTimeEntries,
  getTimeEntryById,
  getTimeEntriesByUserId,
  getTimeEntriesByTaskId,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTotalHoursByTask,
  getTotalHoursAllocatedByTask,
  getNextTaskId,
  getHolidays,
  addHoliday,
  removeHoliday,
  getVacationDays,
  addVacationDay,
  removeVacationDay,
  getWorkdaySchedules,
  getWorkdayScheduleById,
  addWorkdaySchedule,
  updateWorkdaySchedule,
  deleteWorkdaySchedule,
  getWorkSchedule,
  updateWorkSchedule,
  verifyUserPassword,
  changeUserPassword,
  resetUserPassword,
  uploadTaskAttachment,
  getTaskAttachments,
  deleteTaskAttachment
} = apiService;

// Add caching for common requests to improve performance
const userCache = new Map<number, User | null>();
const taskCache = new Map<string, Task | null>();

// Helper functions for React useState with caching
export const getTaskByIdForState = async (id: string, setState: React.Dispatch<React.SetStateAction<Task | null>>) => {
  try {
    console.log(`Fetching task with ID: ${id}`);
    
    // Check cache first
    if (taskCache.has(id)) {
      const cachedTask = taskCache.get(id);
      setState(cachedTask);
      console.log(`Using cached task ${id}`);
      return cachedTask;
    }
    
    // If not in cache, fetch from API
    const task = await apiService.getTaskById(id);
    
    if (task) {
      // Update cache
      taskCache.set(id, task);
    }
    
    console.log(`Task retrieved:`, task);
    setState(task || null);
    return task;
  } catch (error) {
    console.error(`Error en getTaskByIdForState(${id}):`, error);
    setState(null);
    return null;
  }
};

export const getUserByIdForState = async (
  id: number, 
  setState: React.Dispatch<React.SetStateAction<User | null>>
) => {
  try {
    console.log(`Fetching user with ID: ${id}`);
    
    // Check cache first
    if (userCache.has(id)) {
      const cachedUser = userCache.get(id);
      setState(cachedUser);
      console.log(`Using cached user ${id}`);
      return cachedUser;
    }
    
    // If not in cache, fetch from API
    const user = await apiService.getUserById(id);
    
    if (user) {
      // Update cache
      userCache.set(id, user);
    }
    
    console.log(`User retrieved:`, user);
    setState(user || null);
    return user;
  } catch (error) {
    console.error(`Error en getUserByIdForState(${id}):`, error);
    setState(null);
    return null;
  }
};

// New helper function to get multiple users by their IDs with caching
export const getUsersByIds = async (userIds: number[]): Promise<Record<number, User | null>> => {
  try {
    console.log(`Fetching users with IDs: ${userIds.join(', ')}`);
    const userMap: Record<number, User | null> = {};
    
    // First check cache for each user
    const usersToFetch: number[] = [];
    
    userIds.forEach(userId => {
      if (userCache.has(userId)) {
        userMap[userId] = userCache.get(userId);
      } else {
        usersToFetch.push(userId);
      }
    });
    
    if (usersToFetch.length > 0) {
      // Process in batches to avoid too many parallel requests
      const batchSize = 5;
      for (let i = 0; i < usersToFetch.length; i += batchSize) {
        const batch = usersToFetch.slice(i, i + batchSize);
        const userPromises = batch.map(userId => apiService.getUserById(userId));
        const users = await Promise.all(userPromises);
        
        batch.forEach((userId, index) => {
          const user = users[index];
          userMap[userId] = user;
          
          // Add to cache
          if (user) {
            userCache.set(userId, user);
          }
        });
      }
    }
    
    console.log(`Retrieved ${Object.keys(userMap).length} users`);
    return userMap;
  } catch (error) {
    console.error('Error fetching multiple users:', error);
    return {};
  }
};

// Helper function to get time entries for a specific task
export const getTimeEntriesByTaskIdForState = async (
  taskId: string, 
  setState: React.Dispatch<React.SetStateAction<TimeEntry[]>>
) => {
  try {
    const entries = await apiService.getTimeEntriesByTaskId(taskId);
    setState(entries);
    return entries;
  } catch (error) {
    console.error(`Error en getTimeEntriesByTaskIdForState(${taskId}):`, error);
    setState([]);
    return [];
  }
};

// Helper for setting states from promises
export const setStateFromPromise = async <T>(
  promise: Promise<T>, 
  setState: React.Dispatch<React.SetStateAction<T>>
) => {
  try {
    const data = await promise;
    setState(data);
    return data;
  } catch (error) {
    console.error('Error setting state from promise:', error);
    throw error;
  }
};

// Reset database functionality
export const resetDatabase = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/reset-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scriptName: 'reset_controldetarefas3.sql'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al reiniciar la base de datos');
    }
    
    // Reset caches on database reset
    userCache.clear();
    taskCache.clear();
    
    return await response.json();
  } catch (error) {
    console.error('Error resetting database:', error);
    toast({
      title: 'Error al reiniciar la base de datos',
      description: `${error instanceof Error ? error.message : 'Error desconocido'}. Contacte con el administrador del sistema.`,
      variant: 'destructive',
    });
    throw error;
  }
};

// Clear cache for a specific task or user
export const clearTaskCache = (taskId?: string) => {
  if (taskId) {
    taskCache.delete(taskId);
  } else {
    taskCache.clear();
  }
};

export const clearUserCache = (userId?: number) => {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
};

// Clear cache for specific operations
export const clearCacheAfterTaskChange = (taskId?: string) => {
  if (taskId) {
    taskCache.delete(taskId);
  } else {
    taskCache.clear();
  }
  // Also clear related caches that might be affected
};

export const clearCacheAfterUserChange = (userId?: number) => {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
};

export const downloadDatabaseBackup = () => {
  toast({
    title: 'Operación no disponible',
    description: 'La función de respaldo local no está disponible en modo PostgreSQL.',
    variant: 'destructive',
  });
};

export const importDatabaseFromJSON = () => {
  toast({
    title: 'Operación no disponible',
    description: 'La importación local no está disponible en modo PostgreSQL.',
    variant: 'destructive',
  });
  return false;
};

export const getStorageUsage = () => {
  // Always return 0 as localStorage is not used
  return 0;
};
