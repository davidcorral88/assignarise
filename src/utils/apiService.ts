
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule, WorkSchedule } from './types';
import { toast } from '@/components/ui/use-toast';
import { API_URL } from './dbConfig';

// Configuración para la conexión a PostgreSQL
// const API_URL = 'http://localhost:5433/api';
// Nota: La autenticación se maneja en el backend, no exponemos credenciales en el frontend

// Función genérica para manejar errores de fetch
const handleFetchError = (error: any, message: string): never => {
  console.error(`${message}:`, error);
  toast({
    title: 'Error de conexión',
    description: message,
    variant: 'destructive',
  });
  throw error;
};

// Funciones para usuarios
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Error al obtener usuarios');
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, `Error al obtener usuario ${id}`);
  }
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    const response = await fetch(`${API_URL}/users/by-email/${email}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, `Error al obtener usuario por email ${email}`);
  }
};

export const addUser = async (user: User): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, 'Error al crear usuario');
  }
};

export const updateUser = async (user: User): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, `Error al actualizar usuario ${user.id}`);
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, `Error al eliminar usuario ${id}`);
  }
};

// Funciones para tareas
export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Error al obtener tareas');
  }
};

export const getTaskById = async (id: string): Promise<Task | undefined> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, `Error al obtener tarea ${id}`);
  }
};

export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/user/${userId}`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, `Error al obtener tareas del usuario ${userId}`);
  }
};

export const addTask = async (task: Task): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, 'Error al crear tarea');
  }
};

export const updateTask = async (task: Task): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, `Error al actualizar tarea ${task.id}`);
  }
};

// Registros de tiempo (TimeEntries)
export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/time-entries`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Error al obtener registros de tiempo');
  }
};

export const getTimeEntryById = async (id: string): Promise<TimeEntry | undefined> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/${id}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, `Error al obtener registro de tiempo ${id}`);
  }
};

export const getTimeEntriesByUserId = async (userId: string): Promise<TimeEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/user/${userId}`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, `Error al obtener registros de tiempo del usuario ${userId}`);
  }
};

export const getTimeEntriesByTaskId = async (taskId: string): Promise<TimeEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/task/${taskId}`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, `Error al obtener registros de tiempo de la tarea ${taskId}`);
  }
};

export const addTimeEntry = async (entry: TimeEntry): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/time-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, 'Error al crear registro de tiempo');
  }
};

export const updateTimeEntry = async (entry: TimeEntry): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, `Error al actualizar registro de tiempo ${entry.id}`);
  }
};

// Días festivos (Holidays)
export const getHolidays = async (): Promise<Holiday[]> => {
  try {
    const response = await fetch(`${API_URL}/holidays`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Error al obtener días festivos');
  }
};

export const addHoliday = async (holiday: Holiday): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/holidays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holiday)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, 'Error al crear día festivo');
  }
};

export const removeHoliday = async (holiday: Holiday): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/holidays/${holiday.date}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, `Error al eliminar día festivo ${holiday.date}`);
  }
};

// Días de vacaciones (VacationDays)
export const getVacationDays = async (userId?: string): Promise<VacationDay[]> => {
  try {
    const url = userId ? `${API_URL}/vacation-days/user/${userId}` : `${API_URL}/vacation-days`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Error al obtener días de vacaciones');
  }
};

export const addVacationDay = async (vacationDay: VacationDay): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/vacation-days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vacationDay)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, 'Error al crear día de vacaciones');
  }
};

export const removeVacationDay = async (vacationDay: VacationDay): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/vacation-days`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vacationDay)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, `Error al eliminar día de vacaciones`);
  }
};

// Horarios de trabajo (WorkdaySchedules)
export const getWorkdaySchedules = async (): Promise<WorkdaySchedule[]> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Error al obtener horarios de trabajo');
  }
};

export const getWorkdayScheduleById = async (id: string): Promise<WorkdaySchedule | undefined> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules/${id}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, `Error al obtener horario de trabajo ${id}`);
  }
};

export const addWorkdaySchedule = async (schedule: WorkdaySchedule): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, 'Error al crear horario de trabajo');
  }
};

export const updateWorkdaySchedule = async (schedule: WorkdaySchedule): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules/${schedule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, `Error al actualizar horario de trabajo ${schedule.id}`);
  }
};

export const deleteWorkdaySchedule = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, `Error al eliminar horario de trabajo ${id}`);
  }
};

// Configuración de horarios (WorkSchedule)
export const getWorkSchedule = async (): Promise<WorkSchedule> => {
  try {
    const response = await fetch(`${API_URL}/work-schedule`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Error al obtener configuración de horarios');
  }
};

export const updateWorkSchedule = async (schedule: WorkSchedule): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/work-schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
  } catch (error) {
    handleFetchError(error, 'Error al actualizar configuración de horarios');
  }
};

// Funciones auxiliares para estadísticas y cálculos
export const getTotalHoursByTask = async (taskId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/statistics/task/${taskId}/hours`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result = await response.json();
    return result.totalHours || 0;
  } catch (error) {
    return handleFetchError(error, `Error al calcular horas totales para la tarea ${taskId}`);
  }
};

export const getTotalHoursAllocatedByTask = async (taskId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/statistics/task/${taskId}/allocated-hours`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result = await response.json();
    return result.allocatedHours || 0;
  } catch (error) {
    return handleFetchError(error, `Error al calcular horas asignadas para la tarea ${taskId}`);
  }
};

export const getNextTaskId = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/tasks/next-id`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result = await response.json();
    return result.nextId || 1;
  } catch (error) {
    console.error('Error al obtener siguiente ID de tarea:', error);
    return 1; // Valor por defecto en caso de error
  }
};
