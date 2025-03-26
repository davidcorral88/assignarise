import {
  User,
  Task,
  TimeEntry,
  Holiday,
  VacationDay,
  WorkSchedule,
  DailyHoursData,
  WorkdaySchedule,
  TaskAttachment
} from './types';
import { saveToStorage, getFromStorage } from './storageService';

// Empty initial data
const initialUsers: User[] = [];
const initialTasks: Task[] = [];
const initialTimeEntries: TimeEntry[] = [];
const initialVacationDays: VacationDay[] = [];
const initialWorkdaySchedules: WorkdaySchedule[] = [];

// Initial data for holidays (keep only official holidays)
const initialHolidays: Holiday[] = [
  { date: '2024-01-01', name: 'Ano Novo' },
  { date: '2024-01-06', name: 'Día de Reis' },
  { date: '2024-04-19', name: 'Venres Santo' },
  { date: '2024-05-01', name: 'Día do Traballo' },
  { date: '2024-05-17', name: 'Día das Letras Galegas' },
  { date: '2024-07-25', name: 'Día de Santiago' },
  { date: '2024-08-15', name: 'Asunción da Virxe' },
  { date: '2024-10-12', name: 'Día da Hispanidade' },
  { date: '2024-11-01', name: 'Día de Todos os Santos' },
  { date: '2024-12-06', name: 'Día da Constitución' },
  { date: '2024-12-08', name: 'Inmaculada Concepción' },
  { date: '2024-12-25', name: 'Nadal' },
];

// Configuración inicial del horario de trabajo
const initialWorkSchedule: WorkSchedule = {
  regularHours: {
    mondayToThursday: 8.5,
    friday: 6,
  },
  reducedHours: {
    dailyHours: 7,
  },
  reducedPeriods: [
    {
      start: '07-01', // July 1st
      end: '08-31', // August 31st
    },
  ],
};

// Mock data for users
let mockUsers: User[] = getFromStorage('mockUsers', initialUsers);

// Mock data for tasks
let mockTasks: Task[] = getFromStorage('mockTasks', initialTasks);

// Mock data for time entries
let mockTimeEntries: TimeEntry[] = getFromStorage('mockTimeEntries', initialTimeEntries);

// Mock data for holidays
let mockHolidays: Holiday[] = getFromStorage('mockHolidays', initialHolidays);

// Mock data for vacation days
let mockVacationDays: VacationDay[] = getFromStorage('mockVacationDays', initialVacationDays);

// Mock data for workday schedules
let mockWorkdaySchedules: WorkdaySchedule[] = getFromStorage('mockWorkdaySchedules', initialWorkdaySchedules);

// Mock data for work schedule configuration
let mockWorkSchedule: WorkSchedule = getFromStorage('mockWorkSchedule', initialWorkSchedule);

// Save mock data to localStorage
const saveUsers = () => {
  saveToStorage('mockUsers', mockUsers);
};

const saveTasks = () => {
  saveToStorage('mockTasks', mockTasks);
};

const saveTimeEntries = () => {
  saveToStorage('mockTimeEntries', mockTimeEntries);
};

const saveHolidays = () => {
  saveToStorage('mockHolidays', mockHolidays);
};

const saveVacationDays = () => {
  saveToStorage('mockVacationDays', mockVacationDays);
};

const saveWorkdaySchedules = () => {
  saveToStorage('mockWorkdaySchedules', mockWorkdaySchedules);
};

const saveWorkSchedule = () => {
  saveToStorage('mockWorkSchedule', mockWorkSchedule);
};

// Función para restablecer la base de datos
export const resetDatabase = () => {
  mockUsers = [...initialUsers];
  mockTasks = [...initialTasks];
  mockTimeEntries = [...initialTimeEntries];
  mockHolidays = [...initialHolidays];
  mockVacationDays = [...initialVacationDays];
  mockWorkSchedule = {...initialWorkSchedule};
  mockWorkdaySchedules = [...initialWorkdaySchedules];
  
  saveUsers();
  saveTasks();
  saveTimeEntries();
  saveHolidays();
  saveVacationDays();
  saveWorkSchedule();
  saveWorkdaySchedules();
  
  // Si el usuario actual no existe después del restablecimiento, también limpiamos la sesión
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    const userExists = mockUsers.some(u => u.id === user.id);
    if (!userExists) {
      localStorage.removeItem('currentUser');
    }
  }
};

// User functions
export const getUsers = (): User[] => {
  return [...mockUsers];
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
};

export const addUser = (user: User): void => {
  mockUsers.push(user);
  saveUsers();
};

export const updateUser = (user: User): void => {
  mockUsers = mockUsers.map((u) => (u.id === user.id ? user : u));
  saveUsers();
};

export const deleteUser = (id: string): void => {
  mockUsers = mockUsers.filter((user) => user.id !== id);
  saveUsers();
};

// Task functions
export const getTasks = (): Task[] => {
  return [...mockTasks];
};

export const getTaskById = (id: string): Task | undefined => {
  return mockTasks.find((task) => task.id === id);
};

export const addTask = (task: Task): void => {
  if (!task.attachments) {
    task.attachments = [];
  }
  
  mockTasks.push(task);
  saveTasks();
};

export const updateTask = (updatedTask: Task): void => {
  if (!updatedTask.attachments) {
    updatedTask.attachments = [];
  }
  
  mockTasks = mockTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
  saveTasks();
};

export const deleteTask = (id: string): void => {
  mockTasks = mockTasks.filter((task) => task.id !== id);
  saveTasks();
};

export const getTasksByUserId = (userId: string): Task[] => {
  return mockTasks.filter((task) =>
    task.assignments.some((assignment) => assignment.userId === userId)
  );
};

// Time entry functions
export const getTimeEntries = (): TimeEntry[] => {
  return [...mockTimeEntries];
};

export const getTimeEntryById = (id: string): TimeEntry | undefined => {
  return mockTimeEntries.find((entry) => entry.id === id);
};

export const getTimeEntriesByUserId = (userId: string): TimeEntry[] => {
  return mockTimeEntries.filter((entry) => entry.userId === userId);
};

export const getTimeEntriesByTaskId = (taskId: string): TimeEntry[] => {
  return mockTimeEntries.filter((entry) => entry.taskId === taskId);
};

export const addTimeEntryOld = (entry: TimeEntry): void => {
  mockTimeEntries.push(entry);
  saveTimeEntries();
};

export const updateTimeEntry = (entry: TimeEntry): void => {
  mockTimeEntries = mockTimeEntries.map((t) => (t.id === entry.id ? entry : t));
  saveTimeEntries();
};

// Additional task and time entry helper functions
export const getTotalHoursByTask = (taskId: string): number => {
  return getTimeEntriesByTaskId(taskId).reduce((sum, entry) => sum + entry.hours, 0);
};

export const getTotalHoursAllocatedByTask = (taskId: string): number => {
  const task = getTaskById(taskId);
  if (!task) return 0;
  
  return task.assignments.reduce((sum, assignment) => sum + assignment.allocatedHours, 0);
};

// Update the getNextTaskId function to return a numeric ID
export const getNextTaskId = (): number => {
  if (mockTasks.length === 0) return 1;
  
  const taskIds = mockTasks.map(task => parseInt(task.id));
  const maxId = Math.max(...taskIds, 0);
  return maxId + 1;
};

// Holiday functions
export const getHolidays = (): Holiday[] => {
  return [...mockHolidays];
};

export const addHoliday = (holiday: Holiday): void => {
  // Check if holiday already exists
  const existingIndex = mockHolidays.findIndex((h) => h.date === holiday.date);
  if (existingIndex >= 0) {
    mockHolidays[existingIndex] = holiday;
  } else {
    mockHolidays.push(holiday);
  }
  saveHolidays();
};

export const removeHoliday = (holiday: Holiday): void => {
  mockHolidays = mockHolidays.filter((h) => h.date !== holiday.date);
  saveHolidays();
};

// Vacation day functions
export const getVacationDays = (userId?: string): VacationDay[] => {
  if (userId) {
    return mockVacationDays.filter((v) => v.userId === userId);
  }
  return [...mockVacationDays];
};

export const addVacationDay = (vacationDay: VacationDay): void => {
  // Check if vacation day already exists
  const existingIndex = mockVacationDays.findIndex(
    (v) =>
      v.date === vacationDay.date &&
      v.userId === vacationDay.userId &&
      v.type === vacationDay.type
  );

  if (existingIndex >= 0) {
    mockVacationDays[existingIndex] = vacationDay;
  } else {
    mockVacationDays.push(vacationDay);
  }
  saveVacationDays();
};

export const removeVacationDay = (vacationDay: VacationDay): void => {
  mockVacationDays = mockVacationDays.filter(
    (v) =>
      !(
        v.date === vacationDay.date &&
        v.userId === vacationDay.userId &&
        v.type === vacationDay.type
      )
  );
  saveVacationDays();
};

// Work schedule functions
export const getWorkSchedule = (): WorkSchedule => {
  return { ...mockWorkSchedule };
};

export const updateWorkSchedule = (schedule: WorkSchedule): void => {
  mockWorkSchedule = { ...schedule };
  saveWorkSchedule();
};

// Workday schedule functions
export const getWorkdaySchedules = (): WorkdaySchedule[] => {
  return [...mockWorkdaySchedules];
};

export const getWorkdayScheduleById = (id: string): WorkdaySchedule | undefined => {
  return mockWorkdaySchedules.find((schedule) => schedule.id === id);
};

export const addWorkdaySchedule = (schedule: WorkdaySchedule): void => {
  // Generate an ID if not provided
  if (!schedule.id) {
    const nextId = mockWorkdaySchedules.length + 1;
    schedule.id = `schedule_${nextId}`;
  }
  mockWorkdaySchedules.push(schedule);
  saveWorkdaySchedules();
};

export const updateWorkdaySchedule = (schedule: WorkdaySchedule): void => {
  mockWorkdaySchedules = mockWorkdaySchedules.map((s) => 
    s.id === schedule.id ? schedule : s
  );
  saveWorkdaySchedules();
};

export const deleteWorkdaySchedule = (id: string): void => {
  mockWorkdaySchedules = mockWorkdaySchedules.filter((s) => s.id !== id);
  saveWorkdaySchedules();
};

// Export mock data for direct access
export {
  mockUsers,
  mockTasks,
  mockTimeEntries,
  mockHolidays,
  mockVacationDays,
  mockWorkSchedule,
  mockWorkdaySchedules
};

// Exportar funciones del servicio de almacenamiento para utilizar en Settings
export { 
  downloadDatabaseBackup, 
  importDatabaseFromJSON,
  getStorageUsage 
} from './storageService';

// Agregar funciones para manejar adjuntos
export function addAttachment(attachment: TaskAttachment): void {
  const task = getTaskById(attachment.taskId);
  if (task) {
    if (!task.attachments) {
      task.attachments = [];
    }
    task.attachments.push(attachment);
    updateTask(task);
  }
}

export function removeAttachment(taskId: string, attachmentId: string): void {
  const task = getTaskById(taskId);
  if (task && task.attachments) {
    task.attachments = task.attachments.filter(a => a.id !== attachmentId);
    updateTask(task);
  }
}

export function getAttachmentsByTaskId(taskId: string): TaskAttachment[] {
  const task = getTaskById(taskId);
  return task?.attachments || [];
}
