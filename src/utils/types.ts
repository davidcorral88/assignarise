
// If this file doesn't exist yet, we'll create it with proper type definitions

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'director' | 'worker';
  active?: boolean;
  avatar?: string | null;
}

export interface TaskAssignment {
  userId: string;
  allocatedHours: number;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  isResolution: boolean;
  fileUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  assignments: TaskAssignment[];
  attachments?: TaskAttachment[];
}

export interface TimeEntry {
  id: string;
  userId: string;
  taskId: string;
  date: string;
  hours: number;
  description: string;
}

export interface Holiday {
  date: string;
  description: string;
}

export interface VacationDay {
  userId: string;
  date: string;
}

export interface WorkdaySchedule {
  id: string;
  name: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface WorkSchedule {
  defaultWorkdayScheduleId: string;
  useDefaultForAll: boolean;
  userSchedules: {
    userId: string;
    workdayScheduleId: string;
  }[];
}
