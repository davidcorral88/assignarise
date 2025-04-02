
-- Reset Database Script for Control de Tarefas Application
-- Version: 02/04/2025

-- Drop existing tables if they exist (in reverse order to respect foreign keys)
DROP TABLE IF EXISTS vacation_days CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS workday_schedules CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS user_passwords CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables with correct data types

-- Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  active BOOLEAN DEFAULT TRUE
);

-- User Passwords Table
CREATE TABLE user_passwords (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL
);

-- Tasks Table
CREATE TABLE tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  priority VARCHAR(50) DEFAULT 'medium',
  category VARCHAR(255),
  project VARCHAR(255)
);

-- Task Tags Table
CREATE TABLE task_tags (
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Task Assignments Table
CREATE TABLE task_assignments (
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC(10,2) DEFAULT 0,
  PRIMARY KEY (task_id, user_id)
);

-- Time Entries Table
CREATE TABLE time_entries (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Holidays Table
CREATE TABLE holidays (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL
);

-- Vacation Days Table
CREATE TABLE vacation_days (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  UNIQUE (user_id, date)
);

-- Workday Schedules Table
CREATE TABLE workday_schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  UNIQUE (user_id, day_of_week)
);

-- Insert initial data

-- Sample Users
INSERT INTO users (id, name, email, role, active) VALUES
(0, 'Administrador ATSXPTPG', 'admin@ticmoveo.com', 'admin', true),
(1, 'Director Ejemplo', 'director@example.com', 'director', true),
(2, 'Trabajador Ejemplo', 'trabajador@example.com', 'worker', true);

-- Sample Tasks
INSERT INTO tasks (id, title, description, status, created_by, created_at, priority) VALUES
('1', 'Tarea de ejemplo 1', 'Descripción de la tarea de ejemplo 1', 'pending', 1, NOW(), 'medium'),
('2', 'Tarea de ejemplo 2', 'Descripción de la tarea de ejemplo 2', 'in_progress', 1, NOW(), 'high');

-- Sample Task Assignments
INSERT INTO task_assignments (task_id, user_id, allocated_hours) VALUES
('1', 2, 8),
('2', 2, 16);

-- Sample Time Entries
INSERT INTO time_entries (task_id, user_id, date, hours, description, created_at) VALUES
('1', 2, CURRENT_DATE, 2, 'Trabajo en tarea 1', NOW()),
('2', 2, CURRENT_DATE, 4, 'Trabajo en tarea 2', NOW());

-- Create indexes for better performance
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_vacation_days_user_id ON vacation_days(user_id);
CREATE INDEX idx_workday_schedules_user_id ON workday_schedules(user_id);
