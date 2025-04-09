
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule, WorkSchedule } from './types';
import { API_URL } from './dbConfig';

// Helper functions for better logging and error handling
const handleFetchError = (error: unknown, message: string) => {
  console.error(message, error);
  throw error;
};

async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
  console.log(`Realizando ${method} a: ${API_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    // For 404 errors in GET requests specific to user tasks, return empty array instead of throwing
    if (response.status === 404 && method === 'GET' && endpoint.includes('/tasks/user/')) {
      console.log(`No tasks found for the specified user`);
      return [] as unknown as T;
    }
    
    // Handle other HTTP errors
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    handleFetchError(error, `Error en ${method} ${endpoint}:`);
    throw error; // Re-throw for proper handling upstream
  }
}

// User related functions
export const getUsers = async (): Promise<User[]> => {
  try {
    return await apiRequest<User[]>('/users');
  } catch (error) {
    handleFetchError(error, 'Error al obtener usuarios:');
    return [];
  }
};

export const getUserById = async (id: number): Promise<User> => {
  try {
    return await apiRequest<User>(`/users/${id}`);
  } catch (error) {
    handleFetchError(error, `Error al obtener usuario ${id}:`);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User> => {
  try {
    return await apiRequest<User>(`/users/${email}`);
  } catch (error) {
    handleFetchError(error, `Error al obtener usuario por email ${email}:`);
    throw error;
  }
};

export const addUser = async (user: Partial<User>): Promise<User> => {
  try {
    return await apiRequest<User>('/users', 'POST', user);
  } catch (error) {
    handleFetchError(error, 'Error al crear usuario:');
    throw error;
  }
};

export const updateUser = async (id: number, user: Partial<User>): Promise<User> => {
  try {
    return await apiRequest<User>(`/users/${id}`, 'PUT', user);
  } catch (error) {
    handleFetchError(error, `Error al actualizar usuario ${id}:`);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await apiRequest<void>(`/users/${id}`, 'DELETE');
  } catch (error) {
    handleFetchError(error, `Error al eliminar usuario ${id}:`);
    throw error;
  }
};

export const getNextUserId = async (): Promise<number> => {
  try {
    const users = await getUsers();
    return users.length > 0 
      ? Math.max(...users.map(user => typeof user.id === 'string' ? parseInt(user.id, 10) : user.id)) + 1 
      : 1;
  } catch (error) {
    handleFetchError(error, 'Error al obtener siguiente ID de usuario:');
    return 1;
  }
};

// Task related functions
export const getTasks = async (): Promise<Task[]> => {
  try {
    return await apiRequest<Task[]>('/tasks');
  } catch (error) {
    handleFetchError(error, 'Error al obtener tareas:');
    return [];
  }
};

export const getTasksAssignments = async (): Promise<Task[]> => {
  try {
    return await apiRequest<Task[]>('/tasks/conassignments');
  } catch (error) {
    handleFetchError(error, 'Error al obtener tareas con asignaciones:');
    return [];
  }
};

export const getTaskById = async (id: string | number): Promise<Task> => {
  try {
    const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await apiRequest<Task>(`/tasks/${taskId}`);
  } catch (error) {
    handleFetchError(error, `Error al obtener tarea ${id}:`);
    throw error;
  }
};

export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  try {
    // Ensure userId is correctly processed
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      throw new Error(`Invalid user ID: ${userId}`);
    }
    
    return await apiRequest<Task[]>(`/tasks/user/${userIdInt}`);
  } catch (error) {
    handleFetchError(error, `Error al obtener tareas del usuario ${userId}:`);
    return []; // Return empty array on error for better fault tolerance
  }
};

export const addTask = async (task: Partial<Task>): Promise<Task> => {
  try {
    return await apiRequest<Task>('/tasks', 'POST', task);
  } catch (error) {
    handleFetchError(error, 'Error al crear tarea:');
    throw error;
  }
};

export const updateTask = async (id: string | number, task: Partial<Task>): Promise<Task> => {
  try {
    const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await apiRequest<Task>(`/tasks/${taskId}`, 'PUT', task);
  } catch (error) {
    handleFetchError(error, `Error al actualizar tarea ${id}:`);
    throw error;
  }
};

export const deleteTask = async (id: string | number): Promise<void> => {
  try {
    const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
    await apiRequest<void>(`/tasks/${taskId}`, 'DELETE');
  } catch (error) {
    handleFetchError(error, `Error al eliminar tarea ${id}:`);
    throw error;
  }
};

// Time entries related functions
export const getTimeEntries = async (filters?: { user_id?: string | number, task_id?: string | number, start_date?: string, end_date?: string }): Promise<TimeEntry[]> => {
  try {
    let endpoint = '/time_entries';
    
    if (filters) {
      const params = new URLSearchParams();
      
      if (filters.user_id) {
        const userId = typeof filters.user_id === 'string' ? filters.user_id : filters.user_id.toString();
        params.append('user_id', userId);
      }
      
      if (filters.task_id) {
        const taskId = typeof filters.task_id === 'string' ? filters.task_id : filters.task_id.toString();
        params.append('task_id', taskId);
      }
      
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const paramsString = params.toString();
      if (paramsString) {
        endpoint += `?${paramsString}`;
      }
    }
    
    return await apiRequest<TimeEntry[]>(endpoint);
  } catch (error) {
    handleFetchError(error, 'Error al obtener registros de tiempo:');
    return [];
  }
};

export const getTimeEntryById = async (id: string | number): Promise<TimeEntry> => {
  try {
    const entryId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await apiRequest<TimeEntry>(`/time_entries/${entryId}`);
  } catch (error) {
    handleFetchError(error, `Error al obtener registro de tiempo ${id}:`);
    throw error;
  }
};

export const getTimeEntriesByUserId = async (userId: string): Promise<TimeEntry[]> => {
  try {
    // Use the filters parameter of getTimeEntries
    return await getTimeEntries({ user_id: userId });
  } catch (error) {
    handleFetchError(error, `Error al obtener registros de tiempo del usuario ${userId}:`);
    return [];
  }
};

export const getTimeEntriesByTaskId = async (taskId: string | number): Promise<TimeEntry[]> => {
  try {
    return await getTimeEntries({ task_id: taskId });
  } catch (error) {
    handleFetchError(error, `Error al obtener registros de tiempo para la tarea ${taskId}:`);
    return [];
  }
};

export const addTimeEntry = async (entry: Partial<TimeEntry>): Promise<TimeEntry> => {
  try {
    return await apiRequest<TimeEntry>('/time_entries', 'POST', entry);
  } catch (error) {
    handleFetchError(error, 'Error al crear registro de tiempo:');
    throw error;
  }
};

export const updateTimeEntry = async (id: string | number, entry: Partial<TimeEntry>): Promise<TimeEntry> => {
  try {
    const entryId = typeof id === 'string' ? parseInt(id, 10) : id;
    return await apiRequest<TimeEntry>(`/time_entries/${entryId}`, 'PUT', entry);
  } catch (error) {
    handleFetchError(error, `Error al actualizar registro de tiempo ${id}:`);
    throw error;
  }
};

export const deleteTimeEntry = async (id: string | number): Promise<void> => {
  try {
    const entryId = typeof id === 'string' ? parseInt(id, 10) : id;
    await apiRequest<void>(`/time_entries/${entryId}`, 'DELETE');
  } catch (error) {
    handleFetchError(error, `Error al eliminar registro de tiempo ${id}:`);
    throw error;
  }
};

// Helper functions for time tracking and task management
export const getTotalHoursByTask = async (taskId: string | number): Promise<number> => {
  try {
    const entries = await getTimeEntriesByTaskId(taskId);
    return entries.reduce((total, entry) => total + Number(entry.hours), 0);
  } catch (error) {
    handleFetchError(error, `Error al calcular horas totales para la tarea ${taskId}:`);
    return 0;
  }
};

export const getTotalHoursAllocatedByTask = async (taskId: string | number): Promise<number> => {
  try {
    const task = await getTaskById(taskId);
    return task.assignments.reduce((total, assignment) => total + Number(assignment.allocatedHours), 0);
  } catch (error) {
    handleFetchError(error, `Error al calcular horas asignadas para la tarea ${taskId}:`);
    return 0;
  }
};

export const getNextTaskId = async (): Promise<number> => {
  try {
    const response = await apiRequest<{ nextId: number }>('/tasks/next-id');
    return response.nextId;
  } catch (error) {
    handleFetchError(error, 'Error al obtener siguiente ID de tarea:');
    return 1;
  }
};

// Holiday related functions
export const getHolidays = async (year?: number): Promise<Holiday[]> => {
  try {
    let endpoint = '/holidays';
    if (year) {
      endpoint += `?year=${year}`;
    }
    return await apiRequest<Holiday[]>(endpoint);
  } catch (error) {
    handleFetchError(error, 'Error al obtener festivos:');
    return [];
  }
};

export const addHoliday = async (holiday: Holiday): Promise<Holiday> => {
  try {
    return await apiRequest<Holiday>('/holidays', 'POST', holiday);
  } catch (error) {
    handleFetchError(error, 'Error al crear festivo:');
    throw error;
  }
};

export const removeHoliday = async (date: string): Promise<void> => {
  try {
    await apiRequest<void>(`/holidays/${date}`, 'DELETE');
  } catch (error) {
    handleFetchError(error, `Error al eliminar festivo ${date}:`);
    throw error;
  }
};

// Vacation days related functions
export const getVacationDays = async (userId?: number, year?: number): Promise<VacationDay[]> => {
  try {
    let endpoint = '/vacation_days';
    const params = new URLSearchParams();
    
    if (userId) params.append('user_id', userId.toString());
    if (year) params.append('year', year.toString());
    
    const paramsString = params.toString();
    if (paramsString) {
      endpoint += `?${paramsString}`;
    }
    
    return await apiRequest<VacationDay[]>(endpoint);
  } catch (error) {
    handleFetchError(error, 'Error al obtener días de vacaciones:');
    return [];
  }
};

export const addVacationDay = async (vacationDay: VacationDay): Promise<VacationDay> => {
  try {
    return await apiRequest<VacationDay>('/vacation_days', 'POST', vacationDay);
  } catch (error) {
    handleFetchError(error, 'Error al crear día de vacaciones:');
    throw error;
  }
};

export const removeVacationDay = async (userId: number, date: string): Promise<void> => {
  try {
    await apiRequest<void>(`/vacation_days/${userId}/${date}`, 'DELETE');
  } catch (error) {
    handleFetchError(error, `Error al eliminar día de vacaciones para usuario ${userId} en fecha ${date}:`);
    throw error;
  }
};

// Workday schedules related functions
export const getWorkdaySchedules = async (): Promise<WorkdaySchedule[]> => {
  try {
    return await apiRequest<WorkdaySchedule[]>('/workday_schedules');
  } catch (error) {
    handleFetchError(error, 'Error al obtener horarios de trabajo:');
    return [];
  }
};

export const getWorkdayScheduleById = async (id: number): Promise<WorkdaySchedule> => {
  try {
    return await apiRequest<WorkdaySchedule>(`/workday_schedules/${id}`);
  } catch (error) {
    handleFetchError(error, `Error al obtener horario de trabajo ${id}:`);
    throw error;
  }
};

export const addWorkdaySchedule = async (schedule: WorkdaySchedule): Promise<WorkdaySchedule> => {
  try {
    return await apiRequest<WorkdaySchedule>('/workday_schedules', 'POST', schedule);
  } catch (error) {
    handleFetchError(error, 'Error al crear horario de trabajo:');
    throw error;
  }
};

export const updateWorkdaySchedule = async (id: number, schedule: Partial<WorkdaySchedule>): Promise<WorkdaySchedule> => {
  try {
    return await apiRequest<WorkdaySchedule>(`/workday_schedules/${id}`, 'PUT', schedule);
  } catch (error) {
    handleFetchError(error, `Error al actualizar horario de trabajo ${id}:`);
    throw error;
  }
};

export const deleteWorkdaySchedule = async (id: number): Promise<void> => {
  try {
    await apiRequest<void>(`/workday_schedules/${id}`, 'DELETE');
  } catch (error) {
    handleFetchError(error, `Error al eliminar horario de trabajo ${id}:`);
    throw error;
  }
};

// Work schedule related functions
export const getWorkSchedule = async (): Promise<WorkSchedule> => {
  try {
    return await apiRequest<WorkSchedule>('/work_schedule');
  } catch (error) {
    handleFetchError(error, 'Error al obtener configuración de horario:');
    throw error;
  }
};

export const updateWorkSchedule = async (schedule: WorkSchedule): Promise<WorkSchedule> => {
  try {
    return await apiRequest<WorkSchedule>('/work_schedule', 'PUT', schedule);
  } catch (error) {
    handleFetchError(error, 'Error al actualizar configuración de horario:');
    throw error;
  }
};

// Password management functions
export const verifyUserPassword = async (userId: number, password: string): Promise<boolean> => {
  try {
    const response = await apiRequest<{ valid: boolean }>('/passwords/verify', 'POST', {
      userId,
      password
    });
    return response.valid;
  } catch (error) {
    handleFetchError(error, `Error al verificar contraseña del usuario ${userId}:`);
    return false;
  }
};

export const changeUserPassword = async (userId: number, oldPassword: string, newPassword: string): Promise<boolean> => {
  try {
    const response = await apiRequest<{ success: boolean }>('/passwords/change', 'POST', {
      userId,
      oldPassword,
      newPassword
    });
    return response.success;
  } catch (error) {
    handleFetchError(error, `Error al cambiar contraseña del usuario ${userId}:`);
    return false;
  }
};

export const resetUserPassword = async (userId: number): Promise<{ success: boolean, password?: string }> => {
  try {
    return await apiRequest<{ success: boolean, password?: string }>('/passwords/reset', 'POST', {
      userId
    });
  } catch (error) {
    handleFetchError(error, `Error al restablecer contraseña del usuario ${userId}:`);
    return { success: false };
  }
};
