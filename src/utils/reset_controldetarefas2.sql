
-- Reset Database Script for Control de Tarefas v2
-- This script recreates all tables with the correct structure and initializes only the admin user

-- First, drop all tables if they exist (in reverse order to respect foreign keys)
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
  phone VARCHAR(50),
  emailATSXPTPG VARCHAR(255),
  organism VARCHAR(100),
  active BOOLEAN DEFAULT TRUE
);

-- User Passwords Table
CREATE TABLE user_passwords (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL
);

-- Tasks Table
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  start_date DATE,
  due_date DATE,
  priority VARCHAR(50) DEFAULT 'medium',
  category VARCHAR(255),
  project VARCHAR(255)
);

-- Task Tags Table
CREATE TABLE task_tags (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Task Assignments Table
CREATE TABLE task_assignments (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC(10,2) DEFAULT 0,
  PRIMARY KEY (task_id, user_id)
);

-- Time Entries Table
CREATE TABLE time_entries (
  id INTEGER PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  notes TEXT,
  category VARCHAR(255),
  project VARCHAR(255),
  activity VARCHAR(255),
  time_format VARCHAR(50),
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
  type VARCHAR(50) DEFAULT 'vacation',
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

-- Create sequence for user IDs
CREATE SEQUENCE IF NOT EXISTS users_id_seq START WITH 1;
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');

-- Create sequence for task IDs
CREATE SEQUENCE IF NOT EXISTS tasks_id_seq START WITH 1;
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq');

-- Create sequence for time_entries IDs
CREATE SEQUENCE IF NOT EXISTS time_entries_id_seq START WITH 1;
ALTER TABLE time_entries ALTER COLUMN id SET DEFAULT nextval('time_entries_id_seq');

-- Insert only the admin user
INSERT INTO users (id, name, email, role, active) 
VALUES (0, 'Administrador ATSXPTPG', 'admin@ticmoveo.com', 'admin', true);

-- Insert admin password
INSERT INTO user_passwords (user_id, password) 
VALUES (0, 'dc0rralIplan');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_vacation_days_user_id ON vacation_days(user_id);
CREATE INDEX idx_workday_schedules_user_id ON workday_schedules(user_id);
