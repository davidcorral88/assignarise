
import { User, Task, TimeEntry } from './types';

// Initial mock data
const initialMockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Smith',
    email: 'alex@example.com',
    role: 'manager',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Smith&background=0D8ABC&color=fff'
  },
  {
    id: '2',
    name: 'Jamie Taylor',
    email: 'jamie@example.com',
    role: 'worker',
    avatar: 'https://ui-avatars.com/api/?name=Jamie+Taylor&background=0D8ABC&color=fff'
  },
  {
    id: '3',
    name: 'Morgan Lewis',
    email: 'morgan@example.com',
    role: 'worker',
    avatar: 'https://ui-avatars.com/api/?name=Morgan+Lewis&background=0D8ABC&color=fff'
  },
  {
    id: '4',
    name: 'Casey Jones',
    email: 'casey@example.com',
    role: 'worker',
    avatar: 'https://ui-avatars.com/api/?name=Casey+Jones&background=0D8ABC&color=fff'
  }
];

const initialMockTasks: Task[] = [
  {
    id: '1',
    title: 'Website Redesign',
    description: 'Redesign the company website to improve user experience and implement new branding guidelines.',
    status: 'in_progress',
    createdBy: '1',
    createdAt: '2023-05-01T10:00:00Z',
    startDate: '2023-05-01T10:00:00Z',
    dueDate: '2023-06-01T18:00:00Z',
    assignments: [
      { userId: '2', allocatedHours: 20 },
      { userId: '3', allocatedHours: 15 }
    ],
    priority: 'high',
    tags: ['design', 'frontend']
  },
  {
    id: '2',
    title: 'Database Optimization',
    description: 'Optimize database queries to improve application performance and reduce server load.',
    status: 'pending',
    createdBy: '1',
    createdAt: '2023-05-05T14:30:00Z',
    startDate: '2023-05-05T14:30:00Z',
    dueDate: '2023-05-20T18:00:00Z',
    assignments: [
      { userId: '4', allocatedHours: 10 }
    ],
    priority: 'medium',
    tags: ['backend', 'performance']
  },
  {
    id: '3',
    title: 'Mobile App Development',
    description: 'Create a mobile application for iOS and Android platforms with core functionality.',
    status: 'pending',
    createdBy: '1',
    createdAt: '2023-05-10T09:15:00Z',
    startDate: '2023-05-10T09:15:00Z',
    dueDate: '2023-07-15T18:00:00Z',
    assignments: [
      { userId: '2', allocatedHours: 40 },
      { userId: '3', allocatedHours: 40 },
      { userId: '4', allocatedHours: 20 }
    ],
    priority: 'high',
    tags: ['mobile', 'development']
  },
  {
    id: '4',
    title: 'Content Creation',
    description: 'Create content for the new marketing campaign including blog posts and social media materials.',
    status: 'completed',
    createdBy: '1',
    createdAt: '2023-04-20T11:00:00Z',
    startDate: '2023-04-20T11:00:00Z',
    dueDate: '2023-05-10T18:00:00Z',
    assignments: [
      { userId: '3', allocatedHours: 25 }
    ],
    priority: 'low',
    tags: ['marketing', 'content']
  }
];

const initialMockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    taskId: '1',
    userId: '2',
    hours: 4,
    date: '2023-05-05',
    notes: 'Started working on header designs'
  },
  {
    id: '2',
    taskId: '1',
    userId: '2',
    hours: 3,
    date: '2023-05-06',
    notes: 'Continued with main page layout'
  },
  {
    id: '3',
    taskId: '1',
    userId: '3',
    hours: 5,
    date: '2023-05-05',
    notes: 'Implemented responsive design patterns'
  },
  {
    id: '4',
    taskId: '2',
    userId: '4',
    hours: 2,
    date: '2023-05-10',
    notes: 'Analyzed current query structure'
  },
  {
    id: '5',
    taskId: '4',
    userId: '3',
    hours: 6,
    date: '2023-05-01',
    notes: 'Created blog post drafts'
  }
];

// Load data from localStorage or use initial data if not available
const loadData = <T>(key: string, initialData: T[]): T[] => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : initialData;
  } catch (error) {
    console.error(`Error loading data for ${key}:`, error);
    return initialData;
  }
};

// Save data to localStorage
const saveData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for ${key}:`, error);
  }
};

// Initialize data
export let mockUsers: User[] = loadData('users', initialMockUsers);
export let mockTasks: Task[] = loadData('tasks', initialMockTasks);
export let mockTimeEntries: TimeEntry[] = loadData('timeEntries', initialMockTimeEntries);

// Helper functions
export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getTaskById(id: string): Task | undefined {
  return mockTasks.find(task => task.id === id);
}

export function getNextTaskId(): number {
  const ids = mockTasks.map(task => parseInt(task.id));
  return Math.max(...ids, 0) + 1;
}

export function getTimeEntriesByTaskId(taskId: string): TimeEntry[] {
  return mockTimeEntries.filter(entry => entry.taskId === taskId);
}

export function getTimeEntriesByUserId(userId: string): TimeEntry[] {
  return mockTimeEntries.filter(entry => entry.userId === userId);
}

export function getTasksByUserId(userId: string): Task[] {
  return mockTasks.filter(task => 
    task.assignments.some(assignment => assignment.userId === userId)
  );
}

export function getTotalHoursByTask(taskId: string): number {
  return mockTimeEntries
    .filter(entry => entry.taskId === taskId)
    .reduce((sum, entry) => sum + entry.hours, 0);
}

export function getTotalHoursAllocatedByTask(taskId: string): number {
  const task = getTaskById(taskId);
  if (!task) return 0;
  
  return task.assignments.reduce((sum, assignment) => sum + assignment.allocatedHours, 0);
}

// Functions to add, update, and delete data
export function addUser(user: User): User {
  // Ensure unique ID
  if (!user.id) {
    const ids = mockUsers.map(u => parseInt(u.id));
    user.id = String(Math.max(...ids, 0) + 1);
  }
  mockUsers = [...mockUsers, user];
  saveData('users', mockUsers);
  return user;
}

export function updateUser(updatedUser: User): User {
  mockUsers = mockUsers.map(user => 
    user.id === updatedUser.id ? updatedUser : user
  );
  saveData('users', mockUsers);
  return updatedUser;
}

export function deleteUser(userId: string): void {
  mockUsers = mockUsers.filter(user => user.id !== userId);
  saveData('users', mockUsers);
}

export function addTask(task: Task): Task {
  // Ensure unique ID
  if (!task.id) {
    task.id = String(getNextTaskId());
  }
  mockTasks = [...mockTasks, task];
  saveData('tasks', mockTasks);
  return task;
}

export function updateTask(updatedTask: Task): Task {
  mockTasks = mockTasks.map(task => 
    task.id === updatedTask.id ? updatedTask : task
  );
  saveData('tasks', mockTasks);
  return updatedTask;
}

export function deleteTask(taskId: string): void {
  mockTasks = mockTasks.filter(task => task.id !== taskId);
  saveData('tasks', mockTasks);
  
  // Delete associated time entries
  mockTimeEntries = mockTimeEntries.filter(entry => entry.taskId !== taskId);
  saveData('timeEntries', mockTimeEntries);
}

export function addTimeEntry(entry: TimeEntry): TimeEntry {
  // Ensure unique ID
  if (!entry.id) {
    const ids = mockTimeEntries.map(e => parseInt(e.id));
    entry.id = String(Math.max(...ids, 0) + 1);
  }
  mockTimeEntries = [...mockTimeEntries, entry];
  saveData('timeEntries', mockTimeEntries);
  return entry;
}

export function updateTimeEntry(updatedEntry: TimeEntry): TimeEntry {
  mockTimeEntries = mockTimeEntries.map(entry => 
    entry.id === updatedEntry.id ? updatedEntry : entry
  );
  saveData('timeEntries', mockTimeEntries);
  return updatedEntry;
}

export function deleteTimeEntry(entryId: string): void {
  mockTimeEntries = mockTimeEntries.filter(entry => entry.id !== entryId);
  saveData('timeEntries', mockTimeEntries);
}
