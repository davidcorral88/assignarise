
import { ReactElement, ReactNode } from 'react';

export interface User {
  id: number | string;
  name: string;
  email: string;
  password?: string;
  role: 'director' | 'worker';
  active?: boolean;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id?: number | string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdBy: string | number;
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
}

export interface TaskAssignment {
  user_id: string | number;
  allocatedHours?: number;
}

export interface TimeEntry {
  id: string;
  task_id: string | number;
  user_id: string | number;
  date: string;
  hours: number;
  minutes?: number;
  notes?: string;
  project?: string;
  category?: string;
  activity?: string;
  billable?: boolean;
  timeFormat?: string;
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
  id: string | number;
  user_id: string | number;
  date: string;
  type?: 'vacation' | 'sick' | 'personal' | 'other';
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface WorkScheduleConfig {
  id?: number;
  user_id: number;
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
