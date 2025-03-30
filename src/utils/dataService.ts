import * as apiService from './apiService';
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule, WorkSchedule } from './types';
import { toast } from '@/components/ui/use-toast';
import { POSTGRESQL_ONLY_MODE } from './dbConfig';

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

// Funciones para usuarios
export const getUsers = async (): Promise<User[]> => {
  try {
    return await apiService.getUsers();
  } catch (error) {
    console.error('Error en getUsers:', error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudo conectar con la base de datos. Contacte con el administrador.',
      variant: 'destructive',
    });
    // Return empty array to avoid app crash
    return [];
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    return await apiService.getUserById(id);
  } catch (error) {
    console.error(`Error en getUserById(${id}):`, error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudo obtener el usuario desde la base de datos.',
      variant: 'destructive',
    });
    return undefined;
  }
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    return await apiService.getUserByEmail(email);
  } catch (error) {
    console.error(`Error en getUserByEmail(${email}):`, error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudo obtener el usuario desde la base de datos.',
      variant: 'destructive',
    });
    return undefined;
  }
};

export const addUser = async (user: User): Promise<void> => {
  try {
    await apiService.addUser(user);
  } catch (error) {
    console.error('Error en addUser:', error);
    toast({
      title: 'Error al crear usuario',
      description: 'No se pudo guardar el usuario en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const updateUser = async (user: User): Promise<void> => {
  try {
    await apiService.updateUser(user);
  } catch (error) {
    console.error('Error en updateUser:', error);
    toast({
      title: 'Error al actualizar usuario',
      description: 'No se pudo actualizar el usuario en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiService.deleteUser(id);
  } catch (error) {
    console.error(`Error en deleteUser(${id}):`, error);
    toast({
      title: 'Error al eliminar usuario',
      description: 'No se pudo eliminar el usuario en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

// Nueva función para obtener el siguiente ID de usuario
export const getNextUserId = async (): Promise<number> => {
  try {
    return await apiService.getNextUserId();
  } catch (error) {
    console.error('Error al obtener próximo ID de usuario:', error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudo obtener el siguiente ID de usuario.',
      variant: 'destructive',
    });
    // Fallback to timestamp to avoid conflicts
    return Date.now();
  }
};

// Funciones para tareas
export const getTasks = async (): Promise<Task[]> => {
  try {
    return await apiService.getTasks();
  } catch (error) {
    console.error('Error en getTasks:', error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudieron obtener las tareas desde la base de datos.',
      variant: 'destructive',
    });
    // Return empty array to avoid app crash
    return [];
  }
};

export const getTaskById = async (id: string): Promise<Task | undefined> => {
  try {
    return await apiService.getTaskById(id);
  } catch (error) {
    console.error(`Error en getTaskById(${id}):`, error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudo obtener la tarea desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  try {
    return await apiService.getTasksByUserId(userId);
  } catch (error) {
    console.error(`Error en getTasksByUserId(${userId}):`, error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudieron obtener las tareas por usuario desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const addTask = async (task: Task): Promise<void> => {
  try {
    await apiService.addTask(task);
  } catch (error) {
    console.error('Error en addTask:', error);
    toast({
      title: 'Error al crear tarea',
      description: 'No se pudo guardar la tarea en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const updateTask = async (task: Task): Promise<void> => {
  try {
    await apiService.updateTask(task);
  } catch (error) {
    console.error('Error en updateTask:', error);
    toast({
      title: 'Error al actualizar tarea',
      description: 'No se pudo actualizar la tarea en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

// Registros de tiempo
export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  try {
    return await apiService.getTimeEntries();
  } catch (error) {
    console.error('Error en getTimeEntries:', error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudieron obtener los registros de tiempo desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const getTimeEntryById = async (id: string): Promise<TimeEntry | undefined> => {
  try {
    return await apiService.getTimeEntryById(id);
  } catch (error) {
    console.error(`Error en getTimeEntryById(${id}):`, error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudo obtener el registro de tiempo desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const getTimeEntriesByUserId = async (userId: string): Promise<TimeEntry[]> => {
  try {
    return await apiService.getTimeEntriesByUserId(userId);
  } catch (error) {
    console.error(`Error en getTimeEntriesByUserId(${userId}):`, error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudieron obtener los registros de tiempo por usuario desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const getTimeEntriesByTaskId = async (taskId: string): Promise<TimeEntry[]> => {
  try {
    return await apiService.getTimeEntriesByTaskId(taskId);
  } catch (error) {
    console.error(`Error en getTimeEntriesByTaskId(${taskId}):`, error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudieron obtener los registros de tiempo por tarea desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const addTimeEntry = async (entry: TimeEntry): Promise<void> => {
  try {
    await apiService.addTimeEntry(entry);
  } catch (error) {
    console.error('Error en addTimeEntry:', error);
    toast({
      title: 'Error al registrar tiempo',
      description: 'No se pudo guardar el registro de tiempo en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const updateTimeEntry = async (entry: TimeEntry): Promise<void> => {
  try {
    await apiService.updateTimeEntry(entry);
  } catch (error) {
    console.error('Error en updateTimeEntry:', error);
    toast({
      title: 'Error al actualizar registro',
      description: 'No se pudo actualizar el registro de tiempo en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

// Días festivos
export const getHolidays = async (): Promise<Holiday[]> => {
  try {
    return await apiService.getHolidays();
  } catch (error) {
    console.error('Error en getHolidays:', error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudieron obtener los días festivos desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const addHoliday = async (holiday: Holiday): Promise<void> => {
  try {
    await apiService.addHoliday(holiday);
  } catch (error) {
    console.error('Error en addHoliday:', error);
    toast({
      title: 'Error al añadir festivo',
      description: 'No se pudo guardar el día festivo en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const removeHoliday = async (holiday: Holiday): Promise<void> => {
  try {
    await apiService.removeHoliday(holiday);
  } catch (error) {
    console.error('Error en removeHoliday:', error);
    toast({
      title: 'Error al eliminar festivo',
      description: 'No se pudo eliminar el día festivo en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

// Días de vacaciones
export const getVacationDays = async (userId?: string): Promise<VacationDay[]> => {
  try {
    return await apiService.getVacationDays(userId);
  } catch (error) {
    console.error('Error en getVacationDays:', error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudieron obtener los días de vacaciones desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const addVacationDay = async (vacationDay: VacationDay): Promise<void> => {
  try {
    await apiService.addVacationDay(vacationDay);
  } catch (error) {
    console.error('Error en addVacationDay:', error);
    toast({
      title: 'Error al añadir vacaciones',
      description: 'No se pudo guardar el día de vacaciones en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const removeVacationDay = async (vacationDay: VacationDay): Promise<void> => {
  try {
    await apiService.removeVacationDay(vacationDay);
  } catch (error) {
    console.error('Error en removeVacationDay:', error);
    toast({
      title: 'Error al eliminar vacaciones',
      description: 'No se pudo eliminar el día de vacaciones en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

// Horarios de trabajo
export const getWorkdaySchedules = async (): Promise<WorkdaySchedule[]> => {
  try {
    return await apiService.getWorkdaySchedules();
  } catch (error) {
    console.error('Error en getWorkdaySchedules:', error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudieron obtener los horarios desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const getWorkdayScheduleById = async (id: string): Promise<WorkdaySchedule | undefined> => {
  try {
    return await apiService.getWorkdayScheduleById(id);
  } catch (error) {
    console.error(`Error en getWorkdayScheduleById(${id}):`, error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudo obtener el horario desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const addWorkdaySchedule = async (schedule: WorkdaySchedule): Promise<void> => {
  try {
    await apiService.addWorkdaySchedule(schedule);
  } catch (error) {
    console.error('Error en addWorkdaySchedule:', error);
    toast({
      title: 'Error al añadir horario',
      description: 'No se pudo guardar el horario en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const updateWorkdaySchedule = async (schedule: WorkdaySchedule): Promise<void> => {
  try {
    await apiService.updateWorkdaySchedule(schedule);
  } catch (error) {
    console.error('Error en updateWorkdaySchedule:', error);
    toast({
      title: 'Error al actualizar horario',
      description: 'No se pudo actualizar el horario en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const deleteWorkdaySchedule = async (id: string): Promise<void> => {
  try {
    await apiService.deleteWorkdaySchedule(id);
  } catch (error) {
    console.error(`Error en deleteWorkdaySchedule(${id}):`, error);
    toast({
      title: 'Error al eliminar horario',
      description: 'No se pudo eliminar el horario en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

// Configuración de horarios
export const getWorkSchedule = async (): Promise<WorkSchedule> => {
  try {
    return await apiService.getWorkSchedule();
  } catch (error) {
    console.error('Error en getWorkSchedule:', error);
    toast({
      title: 'Error de conexión a PostgreSQL',
      description: 'No se pudo obtener la configuración de horarios desde la base de datos.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const updateWorkSchedule = async (schedule: WorkSchedule): Promise<void> => {
  try {
    await apiService.updateWorkSchedule(schedule);
  } catch (error) {
    console.error('Error en updateWorkSchedule:', error);
    toast({
      title: 'Error al actualizar configuración',
      description: 'No se pudo actualizar la configuración de horarios en la base de datos PostgreSQL.',
      variant: 'destructive',
    });
    throw error;
  }
};

// Funciones auxiliares para estadísticas y cálculos
export const getTotalHoursByTask = async (taskId: string): Promise<number> => {
  try {
    return await apiService.getTotalHoursByTask(taskId);
  } catch (error) {
    console.error(`Error en getTotalHoursByTask(${taskId}):`, error);
    toast({
      title: 'Error de cálculo',
      description: 'No se pudieron calcular las horas totales por tarea.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const getTotalHoursAllocatedByTask = async (taskId: string): Promise<number> => {
  try {
    return await apiService.getTotalHoursAllocatedByTask(taskId);
  } catch (error) {
    console.error(`Error en getTotalHoursAllocatedByTask(${taskId}):`, error);
    toast({
      title: 'Error de cálculo',
      description: 'No se pudieron calcular las horas asignadas a la tarea.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const getNextTaskId = async (): Promise<number> => {
  try {
    return await apiService.getNextTaskId();
  } catch (error) {
    console.error('Error en getNextTaskId:', error);
    toast({
      title: 'Error de secuencia',
      description: 'No se pudo obtener el próximo ID de tarea.',
      variant: 'destructive',
    });
    return Date.now();
  }
};

// Esta función ya no es relevante en modo PostgreSQL
export const resetDatabase = (): void => {
  toast({
    title: 'Operación no disponible',
    description: 'El restablecimiento de la base de datos local no está disponible. Contacte con el administrador de la base de datos PostgreSQL.',
    variant: 'destructive',
  });
  return;
};

// Create empty replacement functions for localStorage functions
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
