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

// Helper functions for React useState - these all need to be adjusted to work with the correct typings
export const getTaskByIdForState = async (id: string, setState: React.Dispatch<React.SetStateAction<Task | null>>) => {
  try {
    console.log(`Fetching task with ID: ${id}`);
    const task = await apiService.getTaskById(id);
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
    const user = await apiService.getUserById(id);
    console.log(`User retrieved:`, user);
    setState(user || null);
    return user;
  } catch (error) {
    console.error(`Error en getUserByIdForState(${id}):`, error);
    setState(null);
    return null;
  }
};

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
        scriptName: 'reset_database_20250402.sql'
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al reiniciar la base de datos');
    }
    
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
