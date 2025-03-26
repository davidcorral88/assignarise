
export type UserRole = 'worker' | 'director' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organism?: 'Xunta' | 'iPlan';
  phone?: string;
  emailATSXPTPG?: string;
  active?: boolean;
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

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  isTaskResolution: boolean; // true si es un archivo de resolución, false si es un archivo inicial
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
  attachments?: TaskAttachment[]; // Archivos adjuntos a la tarea
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
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

export interface WorkdaySchedule {
  id: string;
  type: string;
  startDate: string; // formato MM-DD
  endDate: string;   // formato MM-DD
  mondayHours: number;
  tuesdayHours: number;
  wednesdayHours: number;
  thursdayHours: number;
  fridayHours: number;
}
