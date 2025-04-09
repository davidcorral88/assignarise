
-- Script de inicialización para controltarefasv2
-- Este script crea todas as táboas necesarias e inserta datos iniciais

-- Primeiro, eliminar todas as táboas se existen (na orde correcta para manexar claves foráneas)
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

-- Mellorar a estrutura da base de datos: usar INTEGER para IDs numéricos en lugar de VARCHAR

-- Crear táboa users con ID numérico
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  organization VARCHAR(100),
  phone VARCHAR(50),
  email_notification VARCHAR(255),
  active BOOLEAN DEFAULT true
);

-- Crear táboa tasks con ID numérico
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  start_date DATE NOT NULL,
  due_date DATE,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(255),
  project VARCHAR(255)
);

-- Crear táboa task_tags para relación moitos-a-moitos entre tasks e tags
CREATE TABLE task_tags (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Crear táboa task_assignments
CREATE TABLE task_assignments (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

-- Crear táboa time_entries
CREATE TABLE time_entries (
  id INTEGER PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- Crear táboa work_schedule (para configuración global do calendario)
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
  id INTEGER PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  start_date VARCHAR(10) NOT NULL,  -- Formato: MM-DD
  end_date VARCHAR(10) NOT NULL,    -- Formato: MM-DD
  monday_hours NUMERIC NOT NULL,
  tuesday_hours NUMERIC NOT NULL,
  wednesday_hours NUMERIC NOT NULL,
  thursday_hours NUMERIC NOT NULL,
  friday_hours NUMERIC NOT NULL
);

-- Insertar usuarios iniciais para probas do sistema
INSERT INTO users (id, name, email, role, avatar, active) 
VALUES 
(1, 'Admin', 'admin@example.com', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff', true),
(2, 'Ana Pereira', 'ana.pereira@example.com', 'director', 'https://ui-avatars.com/api/?name=Ana+Pereira&background=0D8ABC&color=fff', true),
(3, 'Carlos Silva', 'carlos.silva@example.com', 'worker', 'https://ui-avatars.com/api/?name=Carlos+Silva&background=0D8ABC&color=fff', true),
(4, 'Laura Méndez', 'laura.mendez@example.com', 'worker', 'https://ui-avatars.com/api/?name=Laura+Mendez&background=0D8ABC&color=fff', true),
(5, 'Miguel González', 'miguel.gonzalez@example.com', 'worker', 'https://ui-avatars.com/api/?name=Miguel+Gonzalez&background=0D8ABC&color=fff', true);

-- Insertar configuración inicial do calendario
INSERT INTO work_schedule 
(regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily) 
VALUES (8, 7, 6);

-- Insertar algúns días festivos para 2023
INSERT INTO holidays (date, name)
VALUES 
('2023-01-01', 'Aninovo'),
('2023-01-06', 'Reis'),
('2023-04-07', 'Venres Santo'),
('2023-05-01', 'Día do Traballo'),
('2023-07-25', 'Santiago Apóstolo'),
('2023-08-15', 'Asunción'),
('2023-10-12', 'Festa Nacional'),
('2023-11-01', 'Todos os Santos'),
('2023-12-06', 'Día da Constitución'),
('2023-12-08', 'Inmaculada Concepción'),
('2023-12-25', 'Nadal');

-- Insertar días festivos para 2024
INSERT INTO holidays (date, name)
VALUES 
('2024-01-01', 'Aninovo'),
('2024-01-06', 'Reis'),
('2024-03-29', 'Venres Santo'),
('2024-05-01', 'Día do Traballo'),
('2024-07-25', 'Santiago Apóstolo'),
('2024-08-15', 'Asunción'),
('2024-10-12', 'Festa Nacional'),
('2024-11-01', 'Todos os Santos'),
('2024-12-06', 'Día da Constitución'),
('2024-12-08', 'Inmaculada Concepción'),
('2024-12-25', 'Nadal');

-- Insertar días festivos para 2025
INSERT INTO holidays (date, name)
VALUES 
('2025-01-01', 'Aninovo'),
('2025-01-06', 'Reis'),
('2025-04-18', 'Venres Santo'),
('2025-05-01', 'Día do Traballo'),
('2025-07-25', 'Santiago Apóstolo'),
('2025-08-15', 'Asunción'),
('2025-10-12', 'Festa Nacional'),
('2025-11-01', 'Todos os Santos'),
('2025-12-06', 'Día da Constitución'),
('2025-12-08', 'Inmaculada Concepción'),
('2025-12-25', 'Nadal');
