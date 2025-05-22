import { Task, User, TaskAssignment, TaskAttachment } from './types';

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
