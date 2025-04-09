
-- Script para restablecer la base de datos controltarefas3
-- Este script eliminará todas las tablas existentes y las recreará con la estructura deseada

-- Primero, eliminar todas las tablas si existen (en el orden correcto para manejar las claves foráneas)
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS vacation_days CASCADE;
DROP TABLE IF EXISTS workday_schedules CASCADE;
DROP TABLE IF EXISTS work_schedule CASCADE;
DROP TABLE IF EXISTS reduced_periods CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Crear tabla de usuarios
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  organization VARCHAR(50),
  phone VARCHAR(50),
  email_notification VARCHAR(255),
  active BOOLEAN DEFAULT true
);

-- Crear tabla de tareas
CREATE TABLE tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_by VARCHAR(50) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(255),
  project VARCHAR(255)
);

-- Crear tabla task_tags para relación muchos-a-muchos entre tareas y etiquetas
CREATE TABLE task_tags (
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Crear tabla task_assignments
CREATE TABLE task_assignments (
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

-- Crear tabla time_entries
CREATE TABLE time_entries (
  id VARCHAR(50) PRIMARY KEY,
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  hours NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  category VARCHAR(255),
  project VARCHAR(255),
  activity VARCHAR(255),
  time_format VARCHAR(50)
);

-- Crear tabla de adjuntos de tareas
CREATE TABLE task_attachments (
  id VARCHAR(50) PRIMARY KEY,
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP NOT NULL,
  uploaded_by VARCHAR(50) REFERENCES users(id),
  file_size NUMERIC,
  is_resolution BOOLEAN DEFAULT false
);

-- Crear tabla de festivos
CREATE TABLE holidays (
  date DATE PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Crear tabla de días de vacaciones
CREATE TABLE vacation_days (
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- Crear tabla work_schedule (para configuración global del calendario)
CREATE TABLE work_schedule (
  id SERIAL PRIMARY KEY,
  regular_hours_monday_to_thursday NUMERIC NOT NULL,
  regular_hours_friday NUMERIC NOT NULL,
  reduced_hours_daily NUMERIC NOT NULL
);

-- Crear tabla reduced_periods
CREATE TABLE reduced_periods (
  id SERIAL PRIMARY KEY,
  work_schedule_id INTEGER REFERENCES work_schedule(id) ON DELETE CASCADE,
  start_date VARCHAR(10) NOT NULL,  -- Formato: MM-DD
  end_date VARCHAR(10) NOT NULL     -- Formato: MM-DD
);

-- Crear tabla workday_schedules
CREATE TABLE workday_schedules (
  id VARCHAR(50) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  start_date VARCHAR(10) NOT NULL,  -- Formato: MM-DD
  end_date VARCHAR(10) NOT NULL,    -- Formato: MM-DD
  monday_hours NUMERIC NOT NULL,
  tuesday_hours NUMERIC NOT NULL,
  wednesday_hours NUMERIC NOT NULL,
  thursday_hours NUMERIC NOT NULL,
  friday_hours NUMERIC NOT NULL
);

-- Insertar usuarios iniciales para probar el sistema
INSERT INTO users (id, name, email, role, avatar, active) 
VALUES 
('1', 'Admin', 'admin@example.com', 'manager', 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff', true),
('2', 'Ana Pereira', 'ana.pereira@example.com', 'manager', 'https://ui-avatars.com/api/?name=Ana+Pereira&background=0D8ABC&color=fff', true),
('3', 'Carlos Silva', 'carlos.silva@example.com', 'worker', 'https://ui-avatars.com/api/?name=Carlos+Silva&background=0D8ABC&color=fff', true),
('4', 'Laura Méndez', 'laura.mendez@example.com', 'worker', 'https://ui-avatars.com/api/?name=Laura+Mendez&background=0D8ABC&color=fff', true),
('5', 'Miguel González', 'miguel.gonzalez@example.com', 'worker', 'https://ui-avatars.com/api/?name=Miguel+Gonzalez&background=0D8ABC&color=fff', true),
('6', 'María Antonia López', 'maria.lopez@example.com', 'manager', 'https://ui-avatars.com/api/?name=Maria+Lopez&background=0D8ABC&color=fff', true);

-- Insertar configuración inicial del calendario
INSERT INTO work_schedule 
(regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily) 
VALUES (8, 7, 6);

-- Insertar algunos festivos para 2023
INSERT INTO holidays (date, name)
VALUES 
('2023-01-01', 'Aninovo'),
('2023-01-06', 'Reis'),
('2023-04-07', 'Venres Santo'),
('2023-05-01', 'Día do Traballo'),
('2023-07-25', 'Santiago Apóstolo'),
('2023-08-15', 'Asunción'),
('2023-10-12', 'Día da Hispanidade'),
('2023-11-01', 'Todos os Santos'),
('2023-12-06', 'Constitución'),
('2023-12-08', 'Inmaculada Concepción'),
('2023-12-25', 'Nadal');

-- Añadir festivos para 2024
INSERT INTO holidays (date, name)
VALUES 
('2024-01-01', 'Aninovo'),
('2024-01-06', 'Reis'),
('2024-03-29', 'Venres Santo'),
('2024-05-01', 'Día do Traballo'),
('2024-07-25', 'Santiago Apóstolo'),
('2024-08-15', 'Asunción'),
('2024-10-12', 'Día da Hispanidade'),
('2024-11-01', 'Todos os Santos'),
('2024-12-06', 'Constitución'),
('2024-12-08', 'Inmaculada Concepción'),
('2024-12-25', 'Nadal');

-- Añadir festivos para 2025
INSERT INTO holidays (date, name)
VALUES 
('2025-01-01', 'Aninovo'),
('2025-01-06', 'Reis'),
('2025-04-18', 'Venres Santo'),
('2025-05-01', 'Día do Traballo'),
('2025-07-25', 'Santiago Apóstolo'),
('2025-08-15', 'Asunción'),
('2025-10-12', 'Día da Hispanidade'),
('2025-11-01', 'Todos os Santos'),
('2025-12-06', 'Constitución'),
('2025-12-08', 'Inmaculada Concepción'),
('2025-12-25', 'Nadal');

-- Crear algunas tareas de ejemplo
INSERT INTO tasks (id, title, description, status, created_by, created_at, start_date, due_date, priority, category, project)
VALUES 
('1', 'Desarrollar dashboard', 'Crear un dashboard con estadísticas de tareas', 'completed', '1', NOW(), '2023-10-01', '2023-10-15', 'high', 'Development', 'ControlTarefas'),
('2', 'Diseñar logo', 'Diseñar un nuevo logo para la aplicación', 'in_progress', '2', NOW(), '2023-10-05', '2023-10-20', 'medium', 'Design', 'ControlTarefas'),
('3', 'Implementar autenticación', 'Añadir sistema de login y registro', 'pending', '1', NOW(), '2023-10-10', '2023-10-25', 'high', 'Development', 'ControlTarefas');

-- Asignar tareas a usuarios
INSERT INTO task_assignments (task_id, user_id, allocated_hours)
VALUES 
('1', '3', 20),
('1', '4', 15),
('2', '5', 10),
('3', '3', 25);

-- Añadir registros de tiempo
INSERT INTO time_entries (id, task_id, user_id, hours, date, notes)
VALUES 
('1', '1', '3', 4, '2023-10-02', 'Trabajando en el diseño inicial'),
('2', '1', '3', 5, '2023-10-03', 'Implementando gráficas'),
('3', '1', '4', 6, '2023-10-04', 'Mejorando la interfaz de usuario'),
('4', '2', '5', 3, '2023-10-06', 'Bocetos iniciales del logo'),
('5', '2', '5', 4, '2023-10-07', 'Refinando el diseño del logo');
