
import { Task, User, TimeEntry, Holiday, VacationDay } from './types';

// Empty mock objects for initial development
export const mockUsers: User[] = [];
export const mockTasks: Task[] = [];
export const mockTimeEntries: TimeEntry[] = [];
export const mockWorkdaySchedules: any[] = [];
export const mockHolidays: Holiday[] = [];
export const mockVacationDays: VacationDay[] = [];
export const mockWorkSchedule: any = {
  user_id: 0,
  workday_schedule_id: 0, 
  start_date: '',
  end_date: null,
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

export const getTimeEntriesByUserId = async (userId: number): Promise<TimeEntry[]> => {
  console.warn('Using deprecated mockData.getTimeEntriesByUserId - update to use apiService directly');
  return mockTimeEntries.filter(entry => {
    const entryUserId = typeof entry.user_id === 'string' ? parseInt(entry.user_id, 10) : entry.user_id;
    return entryUserId === userId;
  });
};
