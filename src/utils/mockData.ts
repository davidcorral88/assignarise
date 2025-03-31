
import { Task, User, TimeEntry, WorkdaySchedule } from './types';
import { v4 as uuidv4 } from 'uuid';

// Empty mock objects for initial development
export const mockUsers: User[] = [];
export const mockTasks: Task[] = [];
export const mockWorkdaySchedules: WorkdaySchedule[] = [];

// Placeholder functions that now call the API service
// These are kept for backward compatibility but will be removed in future refactors
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  console.warn('Using deprecated mockData.getTaskById - update to use apiService directly');
  return undefined;
};

export const getTimeEntriesByUserId = async (userId: string): Promise<TimeEntry[]> => {
  console.warn('Using deprecated mockData.getTimeEntriesByUserId - update to use apiService directly');
  return [];
};

export const mockTimeEntries: TimeEntry[] = [];
