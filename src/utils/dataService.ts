
import * as apiService from './apiService';
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule, WorkSchedule } from './types';
import { toast } from '@/components/ui/use-toast';

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

// Re-export functions from apiService
export const { 
  getUsers,
  getUserById,
  getUserByEmail,
  addUser,
  updateUser,
  deleteUser,
  getNextUserId,
  getTasks,
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
  resetUserPassword
} = apiService;

// Helper functions for React useState
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
  id: string | number, 
  setState: React.Dispatch<React.SetStateAction<User | null>>
) => {
  try {
    const userId = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log(`Fetching user with ID: ${userId}`);
    const user = await apiService.getUserById(userId);
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

// Functions with no direct PostgreSQL equivalent
export const resetDatabase = (): void => {
  toast({
    title: 'Operación no disponible',
    description: 'El restablecimiento de la base de datos local no está disponible. Contacte con el administrador de la base de datos PostgreSQL.',
    variant: 'destructive',
  });
  return;
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
