
-- Script para recrear todas as táboas na base de datos PostgreSQL
-- Este script borrará todas as táboas existentes e recrearaas coa estrutura adecuada

-- Primeiro, borramos todas as táboas se existen (na orde correcta para manexar as claves foráneas)
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

-- Crear táboa de usuarios
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  organism VARCHAR(50),
  phone VARCHAR(50),
  email_atsxptpg VARCHAR(255),
  active BOOLEAN DEFAULT true
);

-- Crear táboa de tarefas
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(255),
  project VARCHAR(255)
);

-- Crear táboa task_tags para a relación moitos-a-moitos entre tarefas e etiquetas
CREATE TABLE task_tags (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Crear táboa task_assignments
CREATE TABLE task_assignments (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

-- Crear táboa time_entries
CREATE TABLE time_entries (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  hours NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  category VARCHAR(255),
  project VARCHAR(255),
  activity VARCHAR(255),
  time_format VARCHAR(50)
);

-- Crear táboa holidays
CREATE TABLE holidays (
  date DATE PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Crear táboa vacation_days
CREATE TABLE vacation_days (
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- Crear táboa work_schedule (para configuración global de horario)
CREATE TABLE work_schedule (
  id SERIAL PRIMARY KEY,
  regular_hours_monday_to_thursday NUMERIC NOT NULL,
  regular_hours_friday NUMERIC NOT NULL,
  reduced_hours_daily NUMERIC NOT NULL
);

-- Crear táboa reduced_periods
CREATE TABLE reduced_periods (
  id SERIAL PRIMARY KEY,
  work_schedule_id INTEGER REFERENCES work_schedule(id) ON DELETE CASCADE,
  start_date VARCHAR(10) NOT NULL,  -- Formato: MM-DD
  end_date VARCHAR(10) NOT NULL     -- Formato: MM-DD
);

-- Crear táboa workday_schedules
CREATE TABLE workday_schedules (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  start_date VARCHAR(10) NOT NULL,  -- Formato: MM-DD
  end_date VARCHAR(10) NOT NULL,    -- Formato: MM-DD
  monday_hours NUMERIC NOT NULL,
  tuesday_hours NUMERIC NOT NULL,
  wednesday_hours NUMERIC NOT NULL,
  thursday_hours NUMERIC NOT NULL,
  friday_hours NUMERIC NOT NULL
);

-- Insertar usuario administrador inicial para que o sistema teña polo menos un usuario
INSERT INTO users (id, name, email, role) 
VALUES ('1', 'Admin', 'admin@example.com', 'manager');

-- Insertar configuración inicial de horario
INSERT INTO work_schedule 
(regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily) 
VALUES (8, 7, 6);
