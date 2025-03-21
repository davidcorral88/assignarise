
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
