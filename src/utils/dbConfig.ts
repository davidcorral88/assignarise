
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
// When accessing remotely, use the same domain as the application with the appropriate port
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Configure the API URL based on the environment
export const API_URL = isLocalhost 
  ? 'http://localhost:3000/api' 
  : 'https://rexistrodetarefas.iplanmovilidad.com/api';

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

// Force PostgreSQL as the only storage option
export const DEFAULT_USE_POSTGRESQL = true;
export const ALLOW_LOCAL_STORAGE = false; // New constant to disable localStorage completely
