import * as apiService from './apiService';
import * as mockData from './mockData';
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule, WorkSchedule } from './types';
import { toast } from '@/components/ui/use-toast';

// Indicador para determinar si se usa la API o localStorage
let useAPI = localStorage.getItem('useAPI') === 'true';

export const setUseAPI = (value: boolean) => {
  useAPI = value;
  localStorage.setItem('useAPI', value.toString());
  
  // Notificar al usuario sobre el cambio
  toast({
    title: value ? 'Usando PostgreSQL' : 'Usando almacenamiento local',
    description: value 
      ? 'La aplicación está usando la base de datos PostgreSQL' 
      : 'La aplicación está usando el almacenamiento local',
  });
};

export const getUseAPI = () => useAPI;

// Funciones para usuarios
export const getUsers = async (): Promise<User[]> => {
  try {
    return useAPI ? await apiService.getUsers() : mockData.getUsers();
  } catch (error) {
    console.error('Error en getUsers:', error);
    // Si falla la API, intentamos con localStorage como fallback
    if (useAPI) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con PostgreSQL. Usando datos locales temporalmente.',
        variant: 'destructive',
      });
      return mockData.getUsers();
    }
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    return useAPI ? await apiService.getUserById(id) : mockData.getUserById(id);
  } catch (error) {
    console.error(`Error en getUserById(${id}):`, error);
    if (useAPI) {
      return mockData.getUserById(id);
    }
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    return useAPI ? await apiService.getUserByEmail(email) : mockData.getUserByEmail(email);
  } catch (error) {
    console.error(`Error en getUserByEmail(${email}):`, error);
    if (useAPI) {
      return mockData.getUserByEmail(email);
    }
    throw error;
  }
};

export const addUser = async (user: User): Promise<void> => {
  try {
    if (useAPI) {
      await apiService.addUser(user);
    } else {
      mockData.addUser(user);
    }
  } catch (error) {
    console.error('Error en addUser:', error);
    toast({
      title: 'Error al crear usuario',
      description: 'No se pudo guardar el usuario. Consulte la consola para más detalles.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const updateUser = async (user: User): Promise<void> => {
  try {
    if (useAPI) {
      await apiService.updateUser(user);
    } else {
      mockData.updateUser(user);
    }
  } catch (error) {
    console.error('Error en updateUser:', error);
    toast({
      title: 'Error al actualizar usuario',
      description: 'No se pudo actualizar el usuario. Consulte la consola para más detalles.',
      variant: 'destructive',
    });
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    if (useAPI) {
      await apiService.deleteUser(id);
    } else {
      mockData.deleteUser(id);
    }
  } catch (error) {
    console.error(`Error en deleteUser(${id}):`, error);
    toast({
      title: 'Error al eliminar usuario',
      description: 'No se pudo eliminar el usuario. Consulte la consola para más detalles.',
      variant: 'destructive',
    });
    throw error;
  }
};

// Nueva función para obtener el siguiente ID de usuario
export const getNextUserId = async (): Promise<number> => {
  try {
    if (useAPI) {
      // Si la API tiene un endpoint para esto, úsalo
      return await apiService.getNextUserId();
    } else {
      // De lo contrario, obtener todos los usuarios y encontrar el próximo ID
      const users = mockData.getUsers();
      const maxId = users.reduce((max, user) => {
        const userId = parseInt(user.id);
        return isNaN(userId) ? max : Math.max(max, userId);
      }, 0);
      return maxId + 1;
    }
  } catch (error) {
    console.error('Error al obtener próximo ID de usuario:', error);
    return Date.now(); // Fallback usando timestamp
  }
};

// Funciones para tareas
export const getTasks = async (): Promise<Task[]> => {
  return useAPI ? await apiService.getTasks() : mockData.getTasks();
};

export const getTaskById = async (id: string): Promise<Task | undefined> => {
  return useAPI ? await apiService.getTaskById(id) : mockData.getTaskById(id);
};

export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  return useAPI ? await apiService.getTasksByUserId(userId) : mockData.getTasksByUserId(userId);
};

export const addTask = async (task: Task): Promise<void> => {
  if (useAPI) {
    await apiService.addTask(task);
  } else {
    mockData.addTask(task);
  }
};

export const updateTask = async (task: Task): Promise<void> => {
  if (useAPI) {
    await apiService.updateTask(task);
  } else {
    mockData.updateTask(task);
  }
};

// Registros de tiempo
export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  return useAPI ? await apiService.getTimeEntries() : mockData.getTimeEntries();
};

export const getTimeEntryById = async (id: string): Promise<TimeEntry | undefined> => {
  return useAPI ? await apiService.getTimeEntryById(id) : mockData.getTimeEntryById(id);
};

export const getTimeEntriesByUserId = async (userId: string): Promise<TimeEntry[]> => {
  return useAPI ? await apiService.getTimeEntriesByUserId(userId) : mockData.getTimeEntriesByUserId(userId);
};

export const getTimeEntriesByTaskId = async (taskId: string): Promise<TimeEntry[]> => {
  return useAPI ? await apiService.getTimeEntriesByTaskId(taskId) : mockData.getTimeEntriesByTaskId(taskId);
};

export const addTimeEntry = async (entry: TimeEntry): Promise<void> => {
  if (useAPI) {
    await apiService.addTimeEntry(entry);
  } else {
    mockData.addTimeEntryOld(entry);
  }
};

export const updateTimeEntry = async (entry: TimeEntry): Promise<void> => {
  if (useAPI) {
    await apiService.updateTimeEntry(entry);
  } else {
    mockData.updateTimeEntry(entry);
  }
};

// Días festivos
export const getHolidays = async (): Promise<Holiday[]> => {
  return useAPI ? await apiService.getHolidays() : mockData.getHolidays();
};

export const addHoliday = async (holiday: Holiday): Promise<void> => {
  if (useAPI) {
    await apiService.addHoliday(holiday);
  } else {
    mockData.addHoliday(holiday);
  }
};

export const removeHoliday = async (holiday: Holiday): Promise<void> => {
  if (useAPI) {
    await apiService.removeHoliday(holiday);
  } else {
    mockData.removeHoliday(holiday);
  }
};

// Días de vacaciones
export const getVacationDays = async (userId?: string): Promise<VacationDay[]> => {
  return useAPI ? await apiService.getVacationDays(userId) : mockData.getVacationDays(userId);
};

export const addVacationDay = async (vacationDay: VacationDay): Promise<void> => {
  if (useAPI) {
    await apiService.addVacationDay(vacationDay);
  } else {
    mockData.addVacationDay(vacationDay);
  }
};

export const removeVacationDay = async (vacationDay: VacationDay): Promise<void> => {
  if (useAPI) {
    await apiService.removeVacationDay(vacationDay);
  } else {
    mockData.removeVacationDay(vacationDay);
  }
};

// Horarios de trabajo
export const getWorkdaySchedules = async (): Promise<WorkdaySchedule[]> => {
  return useAPI ? await apiService.getWorkdaySchedules() : mockData.getWorkdaySchedules();
};

export const getWorkdayScheduleById = async (id: string): Promise<WorkdaySchedule | undefined> => {
  return useAPI ? await apiService.getWorkdayScheduleById(id) : mockData.getWorkdayScheduleById(id);
};

export const addWorkdaySchedule = async (schedule: WorkdaySchedule): Promise<void> => {
  if (useAPI) {
    await apiService.addWorkdaySchedule(schedule);
  } else {
    mockData.addWorkdaySchedule(schedule);
  }
};

export const updateWorkdaySchedule = async (schedule: WorkdaySchedule): Promise<void> => {
  if (useAPI) {
    await apiService.updateWorkdaySchedule(schedule);
  } else {
    mockData.updateWorkdaySchedule(schedule);
  }
};

export const deleteWorkdaySchedule = async (id: string): Promise<void> => {
  if (useAPI) {
    await apiService.deleteWorkdaySchedule(id);
  } else {
    mockData.deleteWorkdaySchedule(id);
  }
};

// Configuración de horarios
export const getWorkSchedule = async (): Promise<WorkSchedule> => {
  return useAPI ? await apiService.getWorkSchedule() : mockData.getWorkSchedule();
};

export const updateWorkSchedule = async (schedule: WorkSchedule): Promise<void> => {
  if (useAPI) {
    await apiService.updateWorkSchedule(schedule);
  } else {
    mockData.updateWorkSchedule(schedule);
  }
};

// Funciones auxiliares para estadísticas y cálculos
export const getTotalHoursByTask = async (taskId: string): Promise<number> => {
  return useAPI 
    ? await apiService.getTotalHoursByTask(taskId) 
    : mockData.getTotalHoursByTask(taskId);
};

export const getTotalHoursAllocatedByTask = async (taskId: string): Promise<number> => {
  return useAPI 
    ? await apiService.getTotalHoursAllocatedByTask(taskId) 
    : mockData.getTotalHoursAllocatedByTask(taskId);
};

export const getNextTaskId = async (): Promise<number> => {
  return useAPI 
    ? await apiService.getNextTaskId() 
    : mockData.getNextTaskId();
};

// Funciones específicas de desarrollo/depuración
export const resetDatabase = (): void => {
  if (!useAPI) {
    mockData.resetDatabase();
  } else {
    toast({
      title: 'Operación no disponible',
      description: 'El restablecimiento de la base de datos no está disponible cuando se usa PostgreSQL',
      variant: 'destructive',
    });
  }
};

// Re-exportar funciones para mantener compatibilidad
export { 
  downloadDatabaseBackup, 
  importDatabaseFromJSON,
  getStorageUsage 
} from './storageService';
