
// Define all types and interfaces for the application

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'director' | 'worker';
  active?: boolean;
  avatar?: string | null;
  phone?: string;
  emailATSXPTPG?: string;
  organism?: string;
}

export type UserRole = 'admin' | 'director' | 'worker';

export interface TaskAssignment {
  user_id: number;
  allocatedHours: number;
  task_id?: string;
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
}

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

export interface TimeEntry {
  id: string;
  task_id: number; // Changed from string to number to match the DB schema
  user_id: number;
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
  date: string;
  description: string;
  name: string;
}

export type VacationType = 'vacation' | 'personal' | 'sick' | 'sick_leave';

export interface VacationDay {
  userId: number;
  date: string;
  type: VacationType;
  reason?: string;
  // Support for date ranges
  endDate?: string;
  isRange?: boolean;
}

export interface WorkdaySchedule {
  id?: string;
  name?: string; // Make name optional since we're now using type
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
  workday_schedule_id: string;
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
