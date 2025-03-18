
import { User, Task, TimeEntry } from './types';

export const mockUsers: User[] = [
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

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Website Redesign',
    description: 'Redesign the company website to improve user experience and implement new branding guidelines.',
    status: 'in_progress',
    createdBy: '1',
    createdAt: '2023-05-01T10:00:00Z',
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
    dueDate: '2023-05-10T18:00:00Z',
    assignments: [
      { userId: '3', allocatedHours: 25 }
    ],
    priority: 'low',
    tags: ['marketing', 'content']
  }
];

export const mockTimeEntries: TimeEntry[] = [
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

export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getTaskById(id: string): Task | undefined {
  return mockTasks.find(task => task.id === id);
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
