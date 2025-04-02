
-- Script para crear la base de datos task_management_v04
-- Con soporte para IDs de usuarios de tipo INTEGER

-- Primero, crear la base de datos (ejecutar como usuario postgres o superusuario)
-- CREATE DATABASE task_management_v04;

-- Conectar a la base de datos task_management_v04
-- \c task_management_v04

-- Drop existing tables if they exist (in reverse order to respect foreign keys)
DROP TABLE IF EXISTS vacation_days CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS workday_schedules CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS work_schedule CASCADE;
DROP TABLE IF EXISTS reduced_periods CASCADE;
DROP TABLE IF EXISTS user_passwords CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables with INTEGER user IDs

-- Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  organization VARCHAR(50),
  phone VARCHAR(50),
  email_notification VARCHAR(255),
  active BOOLEAN DEFAULT true
);

-- User Passwords Table (optional, for securely storing passwords)
CREATE TABLE user_passwords (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL
);

-- Tasks Table
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(255),
  project VARCHAR(255)
);

-- Task Tags Table for many-to-many relationship between tasks and tags
CREATE TABLE task_tags (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Task Assignments Table
CREATE TABLE task_assignments (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

-- Time Entries Table
CREATE TABLE time_entries (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  hours NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  category VARCHAR(255),
  project VARCHAR(255),
  activity VARCHAR(255),
  time_format VARCHAR(50)
);

-- Holidays Table
CREATE TABLE holidays (
  date DATE PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Vacation Days Table
CREATE TABLE vacation_days (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- Work Schedule Table (for global schedule configuration)
CREATE TABLE work_schedule (
  id SERIAL PRIMARY KEY,
  regular_hours_monday_to_thursday NUMERIC NOT NULL,
  regular_hours_friday NUMERIC NOT NULL,
  reduced_hours_daily NUMERIC NOT NULL
);

-- Reduced Periods Table
CREATE TABLE reduced_periods (
  id SERIAL PRIMARY KEY,
  work_schedule_id INTEGER REFERENCES work_schedule(id) ON DELETE CASCADE,
  start_date VARCHAR(10) NOT NULL,  -- Format: MM-DD
  end_date VARCHAR(10) NOT NULL     -- Format: MM-DD
);

-- Workday Schedules Table
CREATE TABLE workday_schedules (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  start_date VARCHAR(10) NOT NULL,  -- Format: MM-DD
  end_date VARCHAR(10) NOT NULL,    -- Format: MM-DD
  monday_hours NUMERIC NOT NULL,
  tuesday_hours NUMERIC NOT NULL,
  wednesday_hours NUMERIC NOT NULL,
  thursday_hours NUMERIC NOT NULL,
  friday_hours NUMERIC NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_vacation_days_user_id ON vacation_days(user_id);

-- Create sequence for user IDs
CREATE SEQUENCE IF NOT EXISTS users_id_seq START WITH 1;
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');

-- Insert initial admin user (ID 0)
INSERT INTO users (id, name, email, role, active) 
VALUES (0, 'Administrador ATSXPTPG', 'admin@ticmoveo.com', 'admin', true);

-- Insert some example users
INSERT INTO users (id, name, email, role, active)
VALUES 
(1, 'Director Ejemplo', 'director@example.com', 'director', true),
(2, 'Trabajador Ejemplo', 'trabajador@example.com', 'worker', true);

-- Initial example task
INSERT INTO tasks (id, title, description, status, created_by, created_at, start_date, priority)
VALUES ('1', 'Tarea de ejemplo', 'Esta es una tarea de ejemplo', 'pending', 0, NOW(), NOW(), 'medium');

-- Insert some holidays for reference
INSERT INTO holidays (date, name)
VALUES 
('2024-01-01', 'Año Nuevo'),
('2024-05-01', 'Día del Trabajo');

-- Insert basic work schedule
INSERT INTO work_schedule (regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily)
VALUES (8, 7, 6);
