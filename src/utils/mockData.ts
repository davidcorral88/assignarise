
import { Task, User, TimeEntry, VacationDay, WorkdaySchedule } from './types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// This file now only provides mock data for development and testing purposes
// All actual data operations should use apiService.ts for PostgreSQL storage

// Mock users for development
export const mockUsers: User[] = [
  {
    id: 'admin1',
    name: 'Administrador',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    active: true
  },
  {
    id: 'director1',
    name: 'Director 1',
    email: 'director1@example.com',
    password: 'password',
    role: 'director',
    active: true
  },
  {
    id: 'worker1',
    name: 'Trabajador 1',
    email: 'worker1@example.com',
    password: 'password',
    role: 'worker',
    active: true
  }
];

// Mock functions for development or as fallbacks
export const getNextTaskId = (): number => {
  return Date.now();
};

export const getNextUserId = (): number => {
  return Date.now();
};

export const addAttachment = (taskId: string, file: File, userId: string, isResolution: boolean) => {
  return {
    id: uuidv4(),
    taskId,
    fileName: file.name,
    fileSize: file.size,
    uploadDate: new Date().toISOString(),
    uploadedBy: userId,
    isResolution,
    fileUrl: URL.createObjectURL(file)
  };
};

export const removeAttachment = (attachmentId: string) => {
  return true;
};

// Placeholder for mock holidays
export const mockHolidays = [
  {
    date: format(new Date(), 'yyyy-MM-dd'),
    name: 'Mock Holiday',
    description: 'This is a mock holiday'
  }
];

// Placeholder for mock workday schedule
export const mockWorkdaySchedule: WorkdaySchedule = {
  id: 'default-schedule',
  name: 'Default Schedule',
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
  startTime: '09:00',
  endTime: '17:00',
  mondayHours: 8,
  tuesdayHours: 8,
  wednesdayHours: 8,
  thursdayHours: 8,
  fridayHours: 8
};

// Placeholder for mock work schedule
export const mockWorkSchedule = {
  defaultWorkdayScheduleId: 'default-schedule',
  useDefaultForAll: true,
  userSchedules: [],
  regularHours: {
    mondayToThursday: 8,
    friday: 8
  },
  reducedHours: 6,
  reducedPeriods: [
    {
      startDate: format(new Date(), 'yyyy-06-01'),
      endDate: format(new Date(), 'yyyy-09-15')
    }
  ]
};
