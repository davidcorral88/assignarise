
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'director' | 'worker';
  active?: boolean;
  password?: string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  phone?: string;
  emailATSXPTPG?: string;
  organism?: string;
}

export type UserRole = 'admin' | 'director' | 'worker';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdBy: number;
  created_by?: number; // Para compatibilidad con la API de PostgreSQL
  createdAt: string;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  assignments: TaskAssignment[];
  attachments?: TaskAttachment[];
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
  fileSize: number;
  uploadDate: string;
  uploadedBy: number;
  isResolution: boolean;
  fileUrl?: string;
  fileType?: string;
  taskId?: string;
  url?: string;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  taskId?: string; // Para compatibilidad con código existente
  user_id: number;
  date: string;
  hours: number;
  description: string;
  notes?: string;
  category?: string;
  project?: string;
  activity?: string;
  timeFormat?: string;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  description?: string;
}

export type VacationType = 'vacation' | 'personal' | 'sick' | 'sick_leave';

export interface VacationDay {
  id?: number;
  userId: number;
  date: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
  type?: VacationType;
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
  user_id: number;
  workday_schedule_id: number;
  start_date: string;
  end_date: string | null;
  defaultWorkdayScheduleId?: string;
  useDefaultForAll?: boolean;
  userSchedules?: {
    userId: number;
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

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateCurrentUser: (user: User) => void;
  loading?: boolean;
}

// Import button props type
export interface ImportUsersButtonProps {
  onImportComplete: () => void;
}
