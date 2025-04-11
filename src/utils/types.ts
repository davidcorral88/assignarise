
import { ReactElement, ReactNode } from 'react';

export interface User {
  id: number | string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'director' | 'worker';
  active?: boolean;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  emailATSXPTPG?: string;
  organism?: string;
}

export type UserRole = 'admin' | 'director' | 'worker';

export interface Task {
  id?: number | string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdBy: string | number;
  created_by?: string | number; // Alternative field for backwards compatibility
  createdAt?: string;
  startDate?: string;
  dueDate?: string;
  modifiedAt?: string;
  tags?: string[];
  assignedTo?: string[];
  attachments?: TaskAttachment[];
  assignments?: TaskAssignment[];
  category?: string;
  project?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploadedBy?: string | number;
  uploadDate?: string;
  isResolution?: boolean;
  // Alternative field names for backwards compatibility
  filename?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
  taskId?: string;
}

export interface TaskAssignment {
  user_id: string | number;
  allocatedHours?: number;
  task_id?: string;
}

export interface TimeEntry {
  id: string;
  task_id: string | number;
  user_id: string | number;
  date: string;
  hours: number;
  minutes?: number;
  notes?: string;
  description?: string;
  project?: string;
  category?: string;
  activity?: string;
  billable?: boolean;
  timeFormat?: string;
  time_format?: string; // Alternative field for backwards compatibility
  createdAt?: string;
}

export interface CalendarEntry {
  id: string;
  user_id: string | number;
  date: string;
  type?: string;
  notes?: string;
  hours?: number;
  entries?: TimeEntry[];
}

export interface Holiday {
  id: string | number;
  date: string;
  name: string;
  description?: string;
  type?: string;
  isWorkDay?: boolean;
}

export interface VacationDay {
  id?: string | number;
  user_id: string | number;
  userId?: string | number;
  date: string;
  type?: 'vacation' | 'sick' | 'personal' | 'other';
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface WorkScheduleConfig {
  id?: number;
  user_id: number | string;
  day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  start_time?: string;
  end_time?: string;
  lunch_start?: string;
  lunch_end?: string;
  is_workday: boolean;
  expected_hours?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkdaySchedule {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  mondayHours?: number;
  tuesdayHours?: number;
  wednesdayHours?: number;
  thursdayHours?: number;
  fridayHours?: number;
}

export interface WorkSchedule {
  user_id: number | string;
  workday_schedule_id: string | number;
  start_date: string;
  end_date: string | null;
  defaultWorkdayScheduleId?: string;
  useDefaultForAll?: boolean;
  userSchedules?: {
    userId: number | string;
    workdayScheduleId: string;
  }[];
  regularHours?: {
    mondayToThursday: number;
    friday: number;
  };
  reducedHours?: number;
  reducedPeriods?: {
    startDate: string;
    endDate: string;
  }[];
}

// Import button props type
export interface ImportUsersButtonProps {
  onImportComplete: () => void;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateCurrentUser: (user: User) => void;
  loading?: boolean;
}
