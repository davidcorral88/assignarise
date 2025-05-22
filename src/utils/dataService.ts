
import { Task, User, TaskAssignment, TaskAttachment, TimeEntry, VacationDay } from './types';

const API_URL = 'http://localhost:3000';

const getToken = () => {
  return localStorage.getItem('token');
};

export const login = async (credentials: any) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: any) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch tasks');
    }
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch task');
    }
    const task = await response.json();
    return task;
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
};

export const addTask = async (task: Task): Promise<Task> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Could not add task');
    }
    const newTask = await response.json();
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const updateTask = async (id: string, task: Task): Promise<Task> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Could not update task');
    }
    const updatedTask = await response.json();
    return updatedTask;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not delete task');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch users');
    }
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUsersByIds = async (ids: number[]): Promise<Record<number, User | null>> => {
  try {
    const response = await fetch(`${API_URL}/users/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error('Could not fetch users by IDs');
    }

    const users: User[] = await response.json();
    const usersMap: Record<number, User | null> = {};
    users.forEach(user => {
      usersMap[user.id] = user;
    });

    return usersMap;
  } catch (error) {
    console.error('Error fetching users by IDs:', error);
    return {};
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch user');
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const addUser = async (user: User): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('Could not add user');
    }
    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUser = async (id: number, user: User): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('Could not update user');
    }
    const updatedUser = await response.json();
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getNextUserId = async (): Promise<number> => {
    try {
        const response = await fetch(`${API_URL}/users/nextId`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!response.ok) {
            throw new Error('Could not fetch next user ID');
        }
        const data = await response.json();
        return data.nextId;
    } catch (error) {
        console.error('Error fetching next user ID:', error);
        throw error;
    }
};

// Add this function to fetch all tags used in tasks
export const getAllTags = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error fetching tags');
    }
    
    const tags = await response.json();
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

// Missing functions that are needed by various components

// Time Entry Functions
export const addTimeEntry = async (timeEntry: Partial<TimeEntry>): Promise<TimeEntry> => {
  try {
    const response = await fetch(`${API_URL}/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(timeEntry),
    });
    if (!response.ok) {
      throw new Error('Could not add time entry');
    }
    const newTimeEntry = await response.json();
    return newTimeEntry;
  } catch (error) {
    console.error('Error adding time entry:', error);
    throw error;
  }
};

export const updateTimeEntry = async (id: string | number, timeEntry: Partial<TimeEntry>): Promise<TimeEntry> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(timeEntry),
    });
    if (!response.ok) {
      throw new Error('Could not update time entry');
    }
    const updatedTimeEntry = await response.json();
    return updatedTimeEntry;
  } catch (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }
};

export const deleteTimeEntry = async (id: string | number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not delete time entry');
    }
  } catch (error) {
    console.error('Error deleting time entry:', error);
    throw error;
  }
};

export const getTimeEntriesByUserId = async (userId: string | number): Promise<TimeEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch time entries');
    }
    const timeEntries = await response.json();
    return timeEntries;
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return [];
  }
};

// Auth related functions
export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    const response = await fetch(`${API_URL}/users/email/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch user by email');
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return undefined;
  }
};

export const verifyUserPassword = async (userId: number, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ userId, password }),
    });
    if (!response.ok) {
      return false;
    }
    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

export const changeUserPassword = async (
  userId: number | string, 
  currentPassword: string, 
  newPassword: string, 
  isAdmin: boolean = false
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ userId, currentPassword, newPassword, isAdmin }),
    });
    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    return false;
  }
};

// Task related additional functions
export const getTaskByIdForState = async (id: string, setState: React.Dispatch<React.SetStateAction<Task | null>>): Promise<Task | null> => {
  try {
    const task = await getTaskById(id);
    setState(task);
    return task;
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
};

export const getTasksAssignments = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/assignments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch tasks with assignments');
    }
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks with assignments:', error);
    return [];
  }
};

export const getTasksByUserId = async (userId: number): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}/tasks/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch tasks for user');
    }
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks for user:', error);
    return [];
  }
};

// Time tracking related functions
export const getTimeEntriesByTaskIdForState = async (
  taskId: string, 
  setState: React.Dispatch<React.SetStateAction<TimeEntry[]>>
): Promise<TimeEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/time-entries/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch time entries for task');
    }
    const timeEntries = await response.json();
    setState(timeEntries);
    return timeEntries;
  } catch (error) {
    console.error('Error fetching time entries for task:', error);
    return [];
  }
};

export const getTotalHoursByTask = async (taskId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/total-hours`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch total hours');
    }
    const data = await response.json();
    return data.totalHours || 0;
  } catch (error) {
    console.error('Error fetching total hours:', error);
    return 0;
  }
};

export const getTotalHoursAllocatedByTask = async (taskId: string): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}/allocated-hours`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch allocated hours');
    }
    const data = await response.json();
    return data.allocatedHours || 0;
  } catch (error) {
    console.error('Error fetching allocated hours:', error);
    return 0;
  }
};

// Helper function for state management
export const setStateFromPromise = async <T>(
  promise: Promise<T>, 
  setState: React.Dispatch<React.SetStateAction<T>>
): Promise<T> => {
  const result = await promise;
  setState(result);
  return result;
};

// Calendar related functions
export const getVacationDays = async (userId?: number): Promise<VacationDay[]> => {
  try {
    let url = `${API_URL}/vacations`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch vacation days');
    }
    const vacationDays = await response.json();
    return vacationDays;
  } catch (error) {
    console.error('Error fetching vacation days:', error);
    return [];
  }
};

export const addVacationDay = async (vacationDay: Partial<VacationDay>): Promise<VacationDay> => {
  try {
    const response = await fetch(`${API_URL}/vacations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(vacationDay),
    });
    if (!response.ok) {
      throw new Error('Could not add vacation day');
    }
    const newVacationDay = await response.json();
    return newVacationDay;
  } catch (error) {
    console.error('Error adding vacation day:', error);
    throw error;
  }
};

export const removeVacationDay = async (userId: number, date: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/vacations`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ userId, date }),
    });
    if (!response.ok) {
      throw new Error('Could not remove vacation day');
    }
  } catch (error) {
    console.error('Error removing vacation day:', error);
    throw error;
  }
};

// Holidays functions
export const getHolidays = async (year?: number): Promise<any[]> => {
  try {
    let url = `${API_URL}/holidays`;
    if (year) {
      url += `?year=${year}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch holidays');
    }
    const holidays = await response.json();
    return holidays;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};

export const addHoliday = async (holiday: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(holiday),
    });
    if (!response.ok) {
      throw new Error('Could not add holiday');
    }
    const newHoliday = await response.json();
    return newHoliday;
  } catch (error) {
    console.error('Error adding holiday:', error);
    throw error;
  }
};

export const removeHoliday = async (id: number | string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/holidays/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not remove holiday');
    }
  } catch (error) {
    console.error('Error removing holiday:', error);
    throw error;
  }
};

// Workday schedules functions
export const getWorkdaySchedules = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch workday schedules');
    }
    const schedules = await response.json();
    return schedules;
  } catch (error) {
    console.error('Error fetching workday schedules:', error);
    return [];
  }
};

export const addWorkdaySchedule = async (schedule: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(schedule),
    });
    if (!response.ok) {
      throw new Error('Could not add workday schedule');
    }
    const newSchedule = await response.json();
    return newSchedule;
  } catch (error) {
    console.error('Error adding workday schedule:', error);
    throw error;
  }
};

export const updateWorkdaySchedule = async (id: number | string, schedule: any): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(schedule),
    });
    if (!response.ok) {
      throw new Error('Could not update workday schedule');
    }
    const updatedSchedule = await response.json();
    return updatedSchedule;
  } catch (error) {
    console.error('Error updating workday schedule:', error);
    throw error;
  }
};

export const deleteWorkdaySchedule = async (id: number | string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/workday-schedules/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not delete workday schedule');
    }
  } catch (error) {
    console.error('Error deleting workday schedule:', error);
    throw error;
  }
};

// Settings related functions
export const getUseAPI = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/settings/use-api`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not fetch API usage setting');
    }
    const data = await response.json();
    return data.useAPI;
  } catch (error) {
    console.error('Error fetching API usage setting:', error);
    return false;
  }
};

export const setUseAPI = async (useAPI: boolean): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/settings/use-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ useAPI }),
    });
    if (!response.ok) {
      throw new Error('Could not set API usage setting');
    }
  } catch (error) {
    console.error('Error setting API usage:', error);
    throw error;
  }
};

// Database reset function
export const resetDatabase = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/database/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Could not reset database');
    }
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};
