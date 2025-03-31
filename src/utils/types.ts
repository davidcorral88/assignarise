
// Define all types and interfaces for the application

export interface User {
  id: string;
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
  fileType?: string;
  taskId?: string;
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
  notes?: string;
}

export interface Holiday {
  date: string;
  description: string;
  name: string;
}

export interface VacationDay {
  userId: string;
  date: string;
  type: 'vacation' | 'personal' | 'sick';
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
  defaultWorkdayScheduleId: string;
  useDefaultForAll: boolean;
  userSchedules: {
    userId: string;
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateCurrentUser: (user: User) => void;
}
