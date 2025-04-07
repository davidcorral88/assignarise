export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  password?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdBy: number;
  createdAt: string;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  assignments: TaskAssignment[];
  attachments: TaskAttachment[];
  category?: string;
  project?: string;
}

export interface TaskAssignment {
  task_id?: string;
  user_id: number;
  allocatedHours: number;
}

export interface TaskAttachment {
  id: string;
  filename: string;
  url: string;
  isResolution: boolean;
}

export interface TimeEntry {
  id: number;
  task_id: string;
  user_id: number;
  start_time: string;
  end_time: string;
  description: string;
  total_hours: number;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
}

export interface VacationDay {
  id: number;
  user_id: number;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface WorkdaySchedule {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
}

export interface WorkSchedule {
  user_id: number;
  workday_schedule_id: number;
  start_date: string;
  end_date: string | null;
}
