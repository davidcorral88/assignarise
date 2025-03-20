import {
  User,
  Task,
  TimeEntry,
  Holiday,
  VacationDay,
  WorkSchedule,
  DailyHoursData,
  WorkdaySchedule,
} from './types';
import { saveToStorage, getFromStorage } from './storageService';

// Datos iniciales para usuarios
const initialUsers: User[] = [
  {
    id: 'user_1',
    name: 'Ana Pereira',
    email: 'ana.pereira@example.com',
    role: 'manager',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Pereira&background=0D8ABC&color=fff',
  },
  {
    id: 'user_2',
    name: 'Carlos Silva',
    email: 'carlos.silva@example.com',
    role: 'worker',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Silva&background=0D8ABC&color=fff',
  },
  {
    id: 'user_3',
    name: 'Mariana Costa',
    email: 'mariana.costa@example.com',
    role: 'worker',
    avatar: 'https://ui-avatars.com/api/?name=Mariana+Costa&background=0D8ABC&color=fff',
  },
];

// Datos iniciales para tareas
const initialTasks: Task[] = [
  {
    id: 'task_1',
    title: 'Desenvolver interface de usuario',
    description: 'Implementar a interface de usuario para a nova aplicación web.',
    status: 'in_progress',
    createdBy: 'user_1',
    createdAt: '2024-01-20T10:00:00Z',
    startDate: '2024-01-22',
    dueDate: '2024-02-15',
    assignments: [
      { userId: 'user_2', allocatedHours: 40 },
    ],
    priority: 'high',
    tags: ['frontend', 'react'],
    category: 'Desenvolvemento',
    project: 'Novo Produto',
  },
  {
    id: 'task_2',
    title: 'Crear API de autenticación',
    description: 'Desenvolver unha API segura para autenticación de usuarios.',
    status: 'completed',
    createdBy: 'user_1',
    createdAt: '2024-01-25T14:00:00Z',
    startDate: '2024-01-28',
    dueDate: '2024-02-05',
    assignments: [
      { userId: 'user_2', allocatedHours: 20 },
      { userId: 'user_3', allocatedHours: 20 },
    ],
    priority: 'medium',
    tags: ['backend', 'api', 'authentication'],
    category: 'Desenvolvemento',
    project: 'Plataforma Principal',
  },
  {
    id: 'task_3',
    title: 'Redactar documentación técnica',
    description: 'Elaborar documentación técnica detallada para a nova API.',
    status: 'pending',
    createdBy: 'user_1',
    createdAt: '2024-02-01T09:00:00Z',
    startDate: '2024-02-05',
    dueDate: '2024-02-28',
    assignments: [
      { userId: 'user_3', allocatedHours: 30 },
    ],
    priority: 'low',
    tags: ['documentation', 'api'],
    category: 'Documentación',
    project: 'Plataforma Principal',
  },
  {
    id: 'task_4',
    title: 'Testes de usabilidade da interface',
    description: 'Realizar testes de usabilidade para identificar melloras na interface.',
    status: 'in_progress',
    createdBy: 'user_1',
    createdAt: '2024-02-05T11:00:00Z',
    startDate: '2024-02-08',
    dueDate: '2024-02-22',
    assignments: [
      { userId: 'user_2', allocatedHours: 25 },
    ],
    priority: 'medium',
    tags: ['usability', 'testing', 'frontend'],
    category: 'Testes',
    project: 'Novo Produto',
  },
  {
    id: 'task_5',
    title: 'Optimización de base de datos',
    description: 'Mellorar o rendemento da base de datos para consultas máis rápidas.',
    status: 'pending',
    createdBy: 'user_1',
    createdAt: '2024-02-10T15:00:00Z',
    startDate: '2024-02-15',
    dueDate: '2024-03-10',
    assignments: [
      { userId: 'user_3', allocatedHours: 35 },
    ],
    priority: 'high',
    tags: ['database', 'optimization', 'backend'],
    category: 'Infraestrutura',
    project: 'Plataforma Principal',
  },
];

// Datos iniciales para registros de tiempo
const initialTimeEntries: TimeEntry[] = [
  {
    id: 'time_1',
    taskId: 'task_1',
    userId: 'user_2',
    hours: 7.5,
    date: '2024-02-01',
    notes: 'Traballando na estrutura principal da interface.',
    category: 'Desenvolvemento',
    project: 'Novo Produto',
    activity: 'Implementación',
    timeFormat: '07:30',
  },
  {
    id: 'time_2',
    taskId: 'task_1',
    userId: 'user_2',
    hours: 8,
    date: '2024-02-02',
    notes: 'Axustes de deseño e probas de responsividade.',
    category: 'Desenvolvemento',
    project: 'Novo Produto',
    activity: 'Testes',
    timeFormat: '08:00',
  },
  {
    id: 'time_3',
    taskId: 'task_2',
    userId: 'user_2',
    hours: 6,
    date: '2024-02-01',
    notes: 'Creación de endpoints para autenticación.',
    category: 'Desenvolvemento',
    project: 'Plataforma Principal',
    activity: 'Implementación',
    timeFormat: '06:00',
  },
  {
    id: 'time_4',
    taskId: 'task_2',
    userId: 'user_3',
    hours: 6.5,
    date: '2024-02-02',
    notes: 'Implementación de middleware de seguridade.',
    category: 'Desenvolvemento',
    project: 'Plataforma Principal',
    activity: 'Seguridade',
    timeFormat: '06:30',
  },
  {
    id: 'time_5',
    taskId: 'task_4',
    userId: 'user_2',
    hours: 5,
    date: '2024-02-08',
    notes: 'Recollida de feedback inicial dos usuarios.',
    category: 'Testes',
    project: 'Novo Produto',
    activity: 'Testes de Usabilidade',
    timeFormat: '05:00',
  },
];

// Datos iniciales para festivos
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

// Datos iniciales para vacaciones
const initialVacationDays: VacationDay[] = [
  { userId: 'user_2', date: '2024-08-01', type: 'vacation' },
  { userId: 'user_2', date: '2024-08-02', type: 'vacation' },
  { userId: 'user_2', date: '2024-08-05', type: 'vacation' },
  { userId: 'user_2', date: '2024-08-06', type: 'vacation' },
  { userId: 'user_2', date: '2024-08-07', type: 'vacation' },
  { userId: 'user_3', date: '2024-07-15', type: 'vacation' },
  { userId: 'user_3', date: '2024-07-16', type: 'vacation' },
  { userId: 'user_3', date: '2024-07-17', type: 'vacation' },
  { userId: 'user_3', date: '2024-07-18', type: 'vacation' },
  { userId: 'user_3', date: '2024-07-19', type: 'vacation' },
  { userId: 'user_3', date: '2024-03-10', type: 'sick_leave' },
  { userId: 'user_3', date: '2024-03-11', type: 'sick_leave' },
  { userId: 'user_3', date: '2024-03-12', type: 'sick_leave' },
];

// Datos iniciales para horarios de trabajo diarios
const initialWorkdaySchedules: WorkdaySchedule[] = [
  {
    id: 'schedule_1',
    type: 'Reducida',
    startDate: '07-01', // July 1st
    endDate: '08-31',   // August 31st
    mondayHours: 7,
    tuesdayHours: 7,
    wednesdayHours: 7,
    thursdayHours: 7,
    fridayHours: 7,
  },
  {
    id: 'schedule_2',
    type: 'Normal',
    startDate: '01-01', // January 1st
    endDate: '12-31',   // December 31st
    mondayHours: 8.5,
    tuesdayHours: 8.5,
    wednesdayHours: 8.5,
    thursdayHours: 8.5,
    fridayHours: 6,
  }
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
  mockTasks.push(task);
  saveTasks();
};

export const updateTask = (task: Task): void => {
  mockTasks = mockTasks.map((t) => (t.id === task.id ? task : t));
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

export const getNextTaskId = (): number => {
  const taskIds = mockTasks.map(task => parseInt(task.id.replace('task_', '')));
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
