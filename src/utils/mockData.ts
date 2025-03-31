// This file contains mock data and will be kept but we need to ensure that the API functions are used instead
import { v4 as uuidv4 } from 'uuid';
import { User, Task, TimeEntry, TaskAttachment, WorkdaySchedule } from './types';

// Mock users data
export const mockUsers: User[] = [
  { id: 'user1', name: 'Ana Pereira', email: 'ana@example.com', password: 'password', role: 'worker', active: true, avatar: null },
  { id: 'user2', name: 'Carlos Silva', email: 'carlos@example.com', password: 'password', role: 'worker', active: true, avatar: null },
  { id: 'user3', name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin', active: true, avatar: null }
];

// Mock tasks data - left for backward compatibility
export const mockTasks: Task[] = [];

// Utility functions to interact with mock data
export const getTaskById = (id: string): Task | undefined => {
  // Keep this function for fallback
  return mockTasks.find(task => task.id === id);
};

export const getNextTaskId = (): number => {
  // This function is still being called from TaskForm
  // Fallback method to get next ID if API fails
  if (mockTasks.length === 0) return 1;
  
  const ids = mockTasks.map(task => parseInt(task.id));
  return Math.max(...ids) + 1;
};

export const getTimeEntriesByUserId = (userId: string): TimeEntry[] => {
  return mockTimeEntries.filter(entry => entry.userId === userId);
};

export const addAttachment = (
  taskId: string,
  file: File,
  userId: string,
  isResolution: boolean
): Promise<TaskAttachment> => {
  return new Promise((resolve) => {
    const attachment: TaskAttachment = {
      id: uuidv4(),
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      uploadedBy: userId,
      isResolution,
      fileUrl: URL.createObjectURL(file)
    };
    
    // Find the task and add the attachment
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      if (!task.attachments) {
        task.attachments = [];
      }
      task.attachments.push(attachment);
    }
    
    // Simulate network delay
    setTimeout(() => {
      resolve(attachment);
    }, 500);
  });
};

export const removeAttachment = (taskId: string, attachmentId: string): Promise<void> => {
  return new Promise((resolve) => {
    // Find the task and remove the attachment
    const task = mockTasks.find(t => t.id === taskId);
    if (task && task.attachments) {
      task.attachments = task.attachments.filter(a => a.id !== attachmentId);
    }
    
    // Simulate network delay
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

// Mock time entries
export const mockTimeEntries: TimeEntry[] = [
  {
    id: 'entry1',
    userId: 'user1',
    taskId: '1',
    date: '2023-05-10',
    hours: 4,
    description: 'Worked on feature A'
  },
  {
    id: 'entry2',
    userId: 'user1',
    taskId: '2',
    date: '2023-05-11',
    hours: 6,
    description: 'Worked on feature B'
  },
  {
    id: 'entry3',
    userId: 'user2',
    taskId: '1',
    date: '2023-05-10',
    hours: 3,
    description: 'Helped with feature A'
  }
];

// Mock workday schedules
export const mockWorkdaySchedules: WorkdaySchedule[] = [
  {
    id: 'schedule1',
    name: 'Standard 9-5',
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '13:00',
    breakEnd: '14:00'
  },
  {
    id: 'schedule2',
    name: 'Part-time Morning',
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    startTime: '09:00',
    endTime: '13:00'
  }
];
