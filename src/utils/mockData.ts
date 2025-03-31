
// This file contains mock data and will be kept but we need to ensure that the API functions are used instead
import { v4 as uuidv4 } from 'uuid';
import { User, Task, TimeEntry, TaskAttachment, WorkdaySchedule } from './types';
import * as dataService from './dataService';

// Mock users data
export const mockUsers: User[] = [
  { id: 'user1', name: 'Ana Pereira', email: 'ana@example.com', password: 'password', role: 'worker', active: true, avatar: null },
  { id: 'user2', name: 'Carlos Silva', email: 'carlos@example.com', password: 'password', role: 'worker', active: true, avatar: null },
  { id: 'user3', name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin', active: true, avatar: null }
];

// Mock tasks data - left for backward compatibility
export const mockTasks: Task[] = [];

// Utility functions that redirect to the dataService API functions
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  // Redirect to dataService
  return await dataService.getTaskById(id);
};

export const getNextTaskId = async (): Promise<number> => {
  // Redirect to dataService
  return await dataService.getNextTaskId();
};

export const getTimeEntriesByUserId = async (userId: string): Promise<TimeEntry[]> => {
  // Redirect to dataService
  return await dataService.getTimeEntriesByUserId(userId);
};

export const getTimeEntriesByTaskId = async (taskId: string): Promise<TimeEntry[]> => {
  // Redirect to dataService
  return await dataService.getTimeEntriesByTaskId(taskId);
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  // Redirect to dataService
  return await dataService.getUserById(id);
};

export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  // Redirect to dataService
  return await dataService.getTasksByUserId(userId);
};

export const getTotalHoursByTask = async (taskId: string): Promise<number> => {
  // Redirect to dataService
  return await dataService.getTotalHoursByTask(taskId);
};

export const getTotalHoursAllocatedByTask = async (taskId: string): Promise<number> => {
  // Redirect to dataService
  return await dataService.getTotalHoursAllocatedByTask(taskId);
};

export const getHolidays = async (): Promise<Holiday[]> => {
  // Redirect to dataService
  return await dataService.getHolidays();
};

export const getWorkSchedule = async (): Promise<WorkSchedule> => {
  // Redirect to dataService
  return await dataService.getWorkSchedule();
};

export const updateWorkSchedule = async (schedule: WorkSchedule): Promise<void> => {
  // Redirect to dataService
  await dataService.updateWorkSchedule(schedule);
};

export const addHoliday = async (holiday: Holiday): Promise<void> => {
  // Redirect to dataService
  await dataService.addHoliday(holiday);
};

export const removeHoliday = async (holiday: Holiday): Promise<void> => {
  // Redirect to dataService
  await dataService.removeHoliday(holiday);
};

// Esta función será reemplazada por el uso de fileService
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
      fileUrl: URL.createObjectURL(file),
      taskId
    };
    
    // Redirect to dataService in a real application
    // For now, just simulate
    setTimeout(() => {
      resolve(attachment);
    }, 500);
  });
};

export const removeAttachment = (taskId: string, attachmentId: string): Promise<void> => {
  return new Promise((resolve) => {
    // In a real application, this would call dataService
    // For now, just simulate
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

// Mock time entries - should be migrated to PostgreSQL
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

// Mock workday schedules - should be migrated to PostgreSQL
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
