
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
  organization?: string;
  organism?: string; // Keep for backward compatibility
  email_notification?: boolean;
}

export type UserRole = 'admin' | 'director' | 'worker';

export interface Task {
  id?: string; // Make ID optional for new tasks
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdBy: number;
  created_by?: number; // Alternative field for compatibility
  createdAt: string;
  created_at?: string; // Alternative field for compatibility
  startDate?: string;
  start_date?: string; // Alternative field for compatibility
  dueDate?: string;
  due_date?: string; // Alternative field for compatibility
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
  task_id: number; // Changed from string to number to match the DB schema
  user_id: number; // Already a number
  date: string;
  hours: number;
  description?: string;
  notes?: string;
  category?: string;
  project?: string;
  activity?: string;
  timeFormat?: string;
}

export interface Holiday {
  id?: number;
  date: string;
  name: string;
}

export type VacationType = 'vacacions' | 'baixa_medica' | 'outros';

export interface VacationDay {
  id?: number;
  userId: number;
  date: string;
  type: VacationType;
  reason?: string; 
}

export interface WorkdaySchedule {
  id?: string;
  name?: string;
  type?: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
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
