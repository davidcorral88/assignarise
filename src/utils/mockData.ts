
import { Task, User, TimeEntry, WorkdaySchedule, Holiday, VacationDay, WorkSchedule } from './types';

// Empty mock objects for initial development
export const mockUsers: User[] = [];
export const mockTasks: Task[] = [];
export const mockTimeEntries: TimeEntry[] = [];
export const mockWorkdaySchedules: WorkdaySchedule[] = [];
export const mockHolidays: Holiday[] = [];
export const mockVacationDays: VacationDay[] = [];
export const mockWorkSchedule: WorkSchedule = {
  defaultWorkdayScheduleId: '',
  useDefaultForAll: true,
  userSchedules: [],
  reducedHours: 0,
  reducedPeriods: []
};

// These functions are kept for backward compatibility but will be removed in future refactors
// The actual implementations have been moved to apiService and are re-exported via dataService
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  console.warn('Using deprecated mockData.getTaskById - update to use apiService directly');
  return mockTasks.find(task => task.id === id);
};

export const getTimeEntriesByUserId = async (userId: string): Promise<TimeEntry[]> => {
  console.warn('Using deprecated mockData.getTimeEntriesByUserId - update to use apiService directly');
  return mockTimeEntries.filter(entry => entry.userId === userId);
};
