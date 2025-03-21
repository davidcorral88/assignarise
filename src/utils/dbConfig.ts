
// PostgreSQL database configuration for production
export const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'task_management',
  user: 'task_control',
  password: 'dc0rralIplan',
};

// PostgreSQL admin user configuration
export const pgAdminConfig = {
  user: 'postgres',
  password: 'admin'  // Change this to your actual postgres admin password
};

// API URL that connects to PostgreSQL
// Modify this URL according to your server configuration in production
export const API_URL = 'http://localhost:3000/api';

// Default users for testing purposes (used as fallback when PostgreSQL is not available)
export const defaultUsers = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin' as const,
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    active: true
  },
  {
    id: '2',
    name: 'Ana Pereira',
    email: 'ana.pereira@example.com',
    role: 'manager' as const,
    avatar: 'https://ui-avatars.com/api/?name=Ana+Pereira&background=0D8ABC&color=fff',
    active: true
  },
  {
    id: '3',
    name: 'Carlos Silva',
    email: 'carlos.silva@example.com',
    role: 'worker' as const,
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Silva&background=0D8ABC&color=fff',
    active: true
  },
  {
    id: '4',
    name: 'Laura Mendez',
    email: 'laura.mendez@example.com',
    role: 'worker' as const,
    avatar: 'https://ui-avatars.com/api/?name=Laura+Mendez&background=0D8ABC&color=fff',
    active: true
  },
  {
    id: '5',
    name: 'Miguel Gonzalez',
    email: 'miguel.gonzalez@example.com',
    role: 'worker' as const,
    avatar: 'https://ui-avatars.com/api/?name=Miguel+Gonzalez&background=0D8ABC&color=fff',
    active: true
  }
];
