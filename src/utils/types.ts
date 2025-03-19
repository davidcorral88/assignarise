
export type UserRole = 'manager' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface TaskAssignment {
  userId: string;
  allocatedHours: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  date: string;
  notes?: string;
  category?: string;
  project?: string;
  activity?: string;
  timeFormat?: string; // Para formato hh:mm
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdBy: string;
  createdAt: string;
  startDate: string;
  dueDate?: string;
  assignments: TaskAssignment[];
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  category?: string;
  project?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface VacationDay {
  userId: string;
  date: string;
  type: 'vacation' | 'sick_leave';
}

export interface WorkSchedule {
  regularHours: {
    mondayToThursday: number;
    friday: number;
  };
  reducedHours: {
    dailyHours: number;
  };
  reducedPeriods: {
    start: string; // formato MM-DD
    end: string;   // formato MM-DD
  }[];
}

export interface DailyHoursData {
  date: Date;
  hours: number;
  isComplete: boolean;
  isHoliday?: boolean;
  isVacation?: boolean;
  isSickLeave?: boolean;
}
