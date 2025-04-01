
-- Script para convertir los IDs de usuario de VARCHAR a INTEGER en PostgreSQL
-- ¡IMPORTANTE! Hacer una copia de seguridad completa antes de ejecutar este script

-- 1. Crear tablas temporales y migrar datos

-- Usuarios
CREATE TABLE users_new (
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

-- Migrar usuarios - convertir IDs a enteros
INSERT INTO users_new (id, name, email, role, avatar, organization, phone, email_notification, active)
SELECT 
  CASE 
    WHEN id ~ '^[0-9]+$' THEN CAST(id AS INTEGER)
    ELSE ROW_NUMBER() OVER (ORDER BY email) + 1000 -- Para IDs no numéricos, asignar un nuevo ID
  END, 
  name, 
  email, 
  role, 
  avatar, 
  organization, 
  phone, 
  email_notification, 
  active
FROM users;

-- Crear una tabla de mapeo para los IDs que no son numéricos
CREATE TABLE id_mapping (
  old_id VARCHAR(255),
  new_id INTEGER
);

INSERT INTO id_mapping (old_id, new_id)
SELECT 
  id, 
  CASE 
    WHEN id ~ '^[0-9]+$' THEN CAST(id AS INTEGER)
    ELSE ROW_NUMBER() OVER (ORDER BY email) + 1000
  END
FROM users
WHERE id !~ '^[0-9]+$' OR id IS NULL;

-- 2. Actualizar tablas relacionadas con referencias a users.id

-- Para task_assignments
CREATE TABLE task_assignments_new (
  task_id VARCHAR(255),
  user_id INTEGER,
  allocated_hours NUMERIC NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

INSERT INTO task_assignments_new (task_id, user_id, allocated_hours)
SELECT 
  ta.task_id, 
  CASE 
    WHEN ta.user_id ~ '^[0-9]+$' THEN CAST(ta.user_id AS INTEGER)
    ELSE m.new_id
  END, 
  ta.allocated_hours
FROM task_assignments ta
LEFT JOIN id_mapping m ON ta.user_id = m.old_id;

-- Para time_entries
CREATE TABLE time_entries_new (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255),
  user_id INTEGER,
  hours NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  category VARCHAR(255),
  project VARCHAR(255),
  activity VARCHAR(255),
  time_format VARCHAR(50)
);

INSERT INTO time_entries_new (id, task_id, user_id, hours, date, notes, category, project, activity, time_format)
SELECT 
  te.id, 
  te.task_id, 
  CASE 
    WHEN te.user_id ~ '^[0-9]+$' THEN CAST(te.user_id AS INTEGER)
    ELSE m.new_id
  END,
  te.hours, 
  te.date, 
  te.notes, 
  te.category, 
  te.project, 
  te.activity, 
  te.time_format
FROM time_entries te
LEFT JOIN id_mapping m ON te.user_id = m.old_id;

-- Para vacation_days
CREATE TABLE vacation_days_new (
  user_id INTEGER,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, date)
);

INSERT INTO vacation_days_new (user_id, date, type)
SELECT 
  CASE 
    WHEN vd.user_id ~ '^[0-9]+$' THEN CAST(vd.user_id AS INTEGER)
    ELSE m.new_id
  END,
  vd.date, 
  vd.type
FROM vacation_days vd
LEFT JOIN id_mapping m ON vd.user_id = m.old_id;

-- Para tasks (columna created_by)
CREATE TABLE tasks_new (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(255),
  project VARCHAR(255)
);

INSERT INTO tasks_new (id, title, description, status, created_by, created_at, start_date, due_date, priority, category, project)
SELECT 
  t.id, 
  t.title, 
  t.description, 
  t.status, 
  CASE 
    WHEN t.created_by ~ '^[0-9]+$' THEN CAST(t.created_by AS INTEGER)
    ELSE m.new_id
  END,
  t.created_at, 
  t.start_date, 
  t.due_date, 
  t.priority, 
  t.category, 
  t.project
FROM tasks t
LEFT JOIN id_mapping m ON t.created_by = m.old_id;

-- 3. Reemplazar las tablas originales

-- Primero, eliminar las restricciones de clave externa para evitar errores
BEGIN;

-- Eliminar tablas que dependen de users con CASCADE
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS vacation_days CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Eliminar la tabla de usuarios
DROP TABLE IF EXISTS users CASCADE;

-- Renombrar las nuevas tablas
ALTER TABLE users_new RENAME TO users;
ALTER TABLE task_assignments_new RENAME TO task_assignments;
ALTER TABLE time_entries_new RENAME TO time_entries;
ALTER TABLE vacation_days_new RENAME TO vacation_days;
ALTER TABLE tasks_new RENAME TO tasks;

-- 4. Recrear las restricciones de clave externa
ALTER TABLE task_assignments 
  ADD CONSTRAINT task_assignments_task_id_fkey 
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE task_assignments 
  ADD CONSTRAINT task_assignments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE time_entries 
  ADD CONSTRAINT time_entries_task_id_fkey 
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE time_entries 
  ADD CONSTRAINT time_entries_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE vacation_days 
  ADD CONSTRAINT vacation_days_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE tasks 
  ADD CONSTRAINT tasks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id);

-- Recrear la tabla task_tags si existe
CREATE TABLE IF NOT EXISTS task_tags (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- 5. Crear secuencia para auto-incremento de IDs de usuario
CREATE SEQUENCE users_id_seq;

-- Establecer el valor actual de la secuencia al máximo ID existente
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users), true);

-- Modificar la columna id para que use la secuencia por defecto
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');

-- Eliminar la tabla de mapeo temporal
DROP TABLE id_mapping;

COMMIT;

-- Verificar la conversión
SELECT 'Conversión completada. Número de usuarios: ' || COUNT(*) AS resultado FROM users;
