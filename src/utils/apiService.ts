import { API_URL } from './dbConfig';
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule, WorkSchedule } from './types';

// User-related API functions
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('Error fetching users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getUsers:', error);
    return [];
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching user with ID ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getUserById(${id}):`, error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/users/email/${encodeURIComponent(email)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching user with email ${email}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getUserByEmail(${email}):`, error);
    return null;
  }
};

export const addUser = async (user: Partial<User>): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error adding user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in addUser:', error);
    return null;
  }
};

export const updateUser = async (id: number, user: Partial<User>): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating user with ID ${id}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in updateUser(${id}):`, error);
    return null;
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting user with ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in deleteUser(${id}):`, error);
    return false;
  }
};

export const getNextUserId = async (): Promise<number> => {
  try {
    const users = await getUsers();
    if (users.length === 0) {
      return 1;
    }
    const maxId = Math.max(...users.map(user => user.id));
    return maxId + 1;
  } catch (error) {
    console.error('Error in getNextUserId:', error);
    return 1;
  }
};

// Task-related API functions
export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) {
      throw new Error('Error fetching tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getTasks:', error);
    return [];
  }
};

export const getTasksAssignments = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/assignments`);
    if (!response.ok) {
      throw new Error('Error fetching task assignments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getTasksAssignments:', error);
    return [];
  }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching task with ID ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getTaskById(${id}):`, error);
    return null;
  }
};

export const getTasksByUserId = async (userId: number): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Error fetching tasks for user with ID ${userId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getTasksByUserId(${userId}):`, error);
    return [];
  }
};

export const addTask = async (task: Partial<Task>): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error('Error adding task');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in addTask:', error);
    return null;
  }
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating task with ID ${id}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in updateTask(${id}):`, error);
    return null;
  }
};

export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting task with ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in deleteTask(${id}):`, error);
    return false;
  }
};

// Time entry-related API functions
/**
 * Get time entries with optional date range filter
 */
export const getTimeEntries = async (startDate?: string, endDate?: string): Promise<TimeEntry[]> => {
  try {
    let url = `${API_URL}/time-entries`;
    
    // Add query parameters for date range if provided
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error fetching time entries');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getTimeEntries:', error);
    return [];
  }
};

export const getTimeEntryById = async (id: number): Promise<TimeEntry | null> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching time entry with ID ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getTimeEntryById(${id}):`, error);
    return null;
  }
};

/**
 * Get time entries by user ID with optional date range filter
 */
export const getTimeEntriesByUserId = async (userId: number, startDate?: string, endDate?: string): Promise<TimeEntry[]> => {
  try {
    let url = `${API_URL}/time-entries/user/${userId}`;
    
    // Add query parameters for date range if provided
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching time entries for user ${userId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in getTimeEntriesByUserId(${userId}):`, error);
    return [];
  }
};

export const getTimeEntriesByTaskId = async (taskId: string): Promise<TimeEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/task/${taskId}`);
    if (!response.ok) {
      throw new Error(`Error fetching time entries for task with ID ${taskId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getTimeEntriesByTaskId(${taskId}):`, error);
    return [];
  }
};

export const addTimeEntry = async (timeEntry: Partial<TimeEntry>): Promise<TimeEntry | null> => {
  try {
    const response = await fetch(`${API_URL}/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeEntry),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error adding time entry');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in addTimeEntry:', error);
    return null;
  }
};

export const updateTimeEntry = async (id: number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry | null> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeEntry),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating time entry with ID ${id}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in updateTimeEntry(${id}):`, error);
    return null;
  }
};

export const deleteTimeEntry = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting time entry with ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in deleteTimeEntry(${id}):`, error);
    return false;
  }
};

// Utility functions
export const getTotalHoursByTask = async (taskId: string): Promise<number> => {
  try {
    const timeEntries = await getTimeEntriesByTaskId(taskId);
    return timeEntries.reduce((total, entry) => total + parseFloat(entry.hours.toString()), 0);
  } catch (error) {
    console.error(`Error in getTotalHoursByTask(${taskId}):`, error);
    return 0;
  }
};

export const getTotalHoursAllocatedByTask = async (taskId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/allocated-hours`);
    if (!response.ok) {
      throw new Error(`Error fetching allocated hours for task with ID ${taskId}`);
    }
    const data = await response.json();
    return data.totalHours || 0;
  } catch (error) {
    console.error(`Error in getTotalHoursAllocatedByTask(${taskId}):`, error);
    return 0;
  }
};

export const getNextTaskId = async (): Promise<number> => {
  try {
    const tasks = await getTasks();
    if (tasks.length === 0) {
      return 1;
    }
    const maxId = Math.max(...tasks.map(task => parseInt(task.id.toString(), 10)));
    return maxId + 1;
  } catch (error) {
    console.error('Error in getNextTaskId:', error);
    return 1;
  }
};

// Holiday-related API functions
export const getHolidays = async (): Promise<Holiday[]> => {
  try {
    const response = await fetch(`${API_URL}/holidays`);
    if (!response.ok) {
      throw new Error('Error fetching holidays');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getHolidays:', error);
    return [];
  }
};

export const addHoliday = async (holiday: Partial<Holiday>): Promise<Holiday | null> => {
  try {
    const response = await fetch(`${API_URL}/holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holiday),
    });
    
    if (!response.ok) {
      throw new Error('Error adding holiday');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in addHoliday:', error);
    return null;
  }
};

export const removeHoliday = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/holidays/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error removing holiday with ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in removeHoliday(${id}):`, error);
    return false;
  }
};

export const updateHoliday = async (id: number, holiday: Partial<Holiday>): Promise<Holiday | null> => {
  try {
    const response = await fetch(`${API_URL}/holidays/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holiday),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating holiday with ID ${id}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in updateHoliday(${id}):`, error);
    return null;
  }
};

// Vacation day-related API functions
export const getVacationDays = async (userId?: number): Promise<VacationDay[]> => {
  try {
    let url = `${API_URL}/vacation-days`;
    if (userId) {
      url += `?user_id=${userId}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error fetching vacation days');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getVacationDays:', error);
    return [];
  }
};

export const addVacationDay = async (vacationDay: Partial<VacationDay>): Promise<VacationDay | null> => {
  try {
    const response = await fetch(`${API_URL}/vacation-days`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vacationDay),
    });
    
    if (!response.ok) {
      throw new Error('Error adding vacation day');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in addVacationDay:', error);
    return null;
  }
};

export const removeVacationDay = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/vacation-days/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error removing vacation day with ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in removeVacationDay(${id}):`, error);
    return false;
  }
};

// Workday schedule-related API functions
export const getWorkdaySchedules = async (): Promise<WorkdaySchedule[]> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules`);
    if (!response.ok) {
      throw new Error('Error fetching workday schedules');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getWorkdaySchedules:', error);
    return [];
  }
};

export const getWorkdayScheduleById = async (id: number): Promise<WorkdaySchedule | null> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching workday schedule with ID ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getWorkdayScheduleById(${id}):`, error);
    return null;
  }
};

export const addWorkdaySchedule = async (schedule: Partial<WorkdaySchedule>): Promise<WorkdaySchedule | null> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    });
    
    if (!response.ok) {
      throw new Error('Error adding workday schedule');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in addWorkdaySchedule:', error);
    return null;
  }
};

export const updateWorkdaySchedule = async (id: number, schedule: Partial<WorkdaySchedule>): Promise<WorkdaySchedule | null> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating workday schedule with ID ${id}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in updateWorkdaySchedule(${id}):`, error);
    return null;
  }
};

export const deleteWorkdaySchedule = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting workday schedule with ID ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in deleteWorkdaySchedule(${id}):`, error);
    return false;
  }
};

// Work schedule-related API functions
export const getWorkSchedule = async (userId: number): Promise<WorkSchedule | null> => {
  try {
    const response = await fetch(`${API_URL}/work-schedules/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching work schedule for user with ID ${userId}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getWorkSchedule(${userId}):`, error);
    return null;
  }
};

export const updateWorkSchedule = async (userId: number, schedule: Partial<WorkSchedule>): Promise<WorkSchedule | null> => {
  try {
    const response = await fetch(`${API_URL}/work-schedules/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating work schedule for user with ID ${userId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in updateWorkSchedule(${userId}):`, error);
    return null;
  }
};

// Authentication-related API functions
export const verifyUserPassword = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in verifyUserPassword:', error);
    return null;
  }
};

export const changeUserPassword = async (userId: number, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error changing password');
    }
    
    return true;
  } catch (error) {
    console.error('Error in changeUserPassword:', error);
    return false;
  }
};

export const resetUserPassword = async (userId: number, newPassword: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, newPassword }),
    });
    
    if (!response.ok) {
      throw new Error('Error resetting password');
    }
    
    return true;
  } catch (error) {
    console.error('Error in resetUserPassword:', error);
    return false;
  }
};

// Task attachment-related API functions
export const uploadTaskAttachment = async (taskId: string, file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/tasks/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error uploading attachment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in uploadTaskAttachment:', error);
    throw error;
  }
};

export const getTaskAttachments = async (taskId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/attachments`);
    if (!response.ok) {
      throw new Error('Error fetching task attachments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getTaskAttachments:', error);
    return [];
  }
};

export const deleteTaskAttachment = async (taskId: string, attachmentId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error deleting attachment');
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteTaskAttachment:', error);
    return false;
  }
};
