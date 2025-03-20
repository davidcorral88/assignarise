
// Configuración de la base de datos PostgreSQL
export const dbConfig = {
  host: 'localhost',
  port: 5433,
  database: 'DBtarefas',
  user: 'control_de_tarefas',
  password: 'dc0rralIplan',
};

// Configuración del usuario administrador de PostgreSQL
export const pgAdminConfig = {
  user: 'postgres',
  password: 'iPlan'
};

// URL de la API que conecta con PostgreSQL
export const API_URL = 'http://localhost:3000/api';
