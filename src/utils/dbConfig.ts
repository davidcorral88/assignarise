
// PostgreSQL database configuration for production
export const dbConfig = {
  host: 'localhost',
  port: 5433, // Updated to match the requirement in port 5433
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
// Ensure the URL ends without a trailing slash
export const API_URL = 'http://localhost:3000/api';

// Default admin user (used as fallback when PostgreSQL is not available)
export const defaultUsers = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@ticmoveo.com',
    role: 'admin' as const,
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    active: true
  }
];
