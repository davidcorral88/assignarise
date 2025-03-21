
-- Script to recreate all tables in PostgreSQL database
-- This script will delete all existing tables and recreate them with the proper structure

-- First, drop all tables if they exist (in correct order to handle foreign keys)
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

-- Create users table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  organization VARCHAR(50),
  phone VARCHAR(50),
  email_notification VARCHAR(255),
  active BOOLEAN DEFAULT true
);

-- Create tasks table
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

-- Create task_tags table for many-to-many relationship between tasks and tags
CREATE TABLE task_tags (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Create task_assignments table
CREATE TABLE task_assignments (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

-- Create time_entries table
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

-- Create holidays table
CREATE TABLE holidays (
  date DATE PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Create vacation_days table
CREATE TABLE vacation_days (
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- Create work_schedule table (for global schedule configuration)
CREATE TABLE work_schedule (
  id SERIAL PRIMARY KEY,
  regular_hours_monday_to_thursday NUMERIC NOT NULL,
  regular_hours_friday NUMERIC NOT NULL,
  reduced_hours_daily NUMERIC NOT NULL
);

-- Create reduced_periods table
CREATE TABLE reduced_periods (
  id SERIAL PRIMARY KEY,
  work_schedule_id INTEGER REFERENCES work_schedule(id) ON DELETE CASCADE,
  start_date VARCHAR(10) NOT NULL,  -- Format: MM-DD
  end_date VARCHAR(10) NOT NULL     -- Format: MM-DD
);

-- Create workday_schedules table
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

-- Insert initial users for testing the system
INSERT INTO users (id, name, email, role, avatar, active) 
VALUES 
('1', 'Admin', 'admin@example.com', 'manager', 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff', true),
('2', 'Ana Pereira', 'ana.pereira@example.com', 'manager', 'https://ui-avatars.com/api/?name=Ana+Pereira&background=0D8ABC&color=fff', true),
('3', 'Carlos Silva', 'carlos.silva@example.com', 'worker', 'https://ui-avatars.com/api/?name=Carlos+Silva&background=0D8ABC&color=fff', true),
('4', 'Laura Méndez', 'laura.mendez@example.com', 'worker', 'https://ui-avatars.com/api/?name=Laura+Mendez&background=0D8ABC&color=fff', true),
('5', 'Miguel González', 'miguel.gonzalez@example.com', 'worker', 'https://ui-avatars.com/api/?name=Miguel+Gonzalez&background=0D8ABC&color=fff', true);

-- Insert initial schedule configuration
INSERT INTO work_schedule 
(regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily) 
VALUES (8, 7, 6);

-- Insert some holidays
INSERT INTO holidays (date, name)
VALUES 
('2023-01-01', 'New Year'),
('2023-01-06', 'Epiphany'),
('2023-04-07', 'Good Friday'),
('2023-05-01', 'Labor Day'),
('2023-07-25', 'Saint James'),
('2023-08-15', 'Assumption'),
('2023-10-12', 'National Day'),
('2023-11-01', 'All Saints'),
('2023-12-06', 'Constitution Day'),
('2023-12-08', 'Immaculate Conception'),
('2023-12-25', 'Christmas');

-- Add 2024 holidays
INSERT INTO holidays (date, name)
VALUES 
('2024-01-01', 'New Year'),
('2024-01-06', 'Epiphany'),
('2024-03-29', 'Good Friday'),
('2024-05-01', 'Labor Day'),
('2024-07-25', 'Saint James'),
('2024-08-15', 'Assumption'),
('2024-10-12', 'National Day'),
('2024-11-01', 'All Saints'),
('2024-12-06', 'Constitution Day'),
('2024-12-08', 'Immaculate Conception'),
('2024-12-25', 'Christmas');
