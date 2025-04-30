
// Database configuration
export const API_URL = typeof window !== 'undefined' ? 
  (window.location.hostname === 'localhost' 
    ? "http://localhost:3000/api"
    : `https://${window.location.hostname}/api`)
  : "http://localhost:3000/api";
  
export const DEFAULT_USE_POSTGRESQL = true;
export const POSTGRESQL_ONLY_MODE = true;

// Contraseña predeterminada para usuarios nuevos
export const DEFAULT_PASSWORD = 'dc0rralIplan';

// PostgreSQL database connection config
export const dbConfig = {
  host: 'localhost',
  port: 5433,
  database: 'controltarefasv2', // Nova base de datos
  user: 'task_control',
  password: 'dc0rralIplan'
};

// PostgreSQL admin access config
export const pgAdminConfig = {
  user: 'task_control',
  password: 'dc0rralIplan'
};

// Default users for initial setup
export const defaultUsers = [
  {
    id: 1, // Agora usamos números para IDs
    name: 'Admin',
    email: 'admin@example.com',
    password: DEFAULT_PASSWORD,
    role: 'admin' as const,
    active: true
  }
];
