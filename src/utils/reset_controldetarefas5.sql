
-- Script to reset the controldetarefasv2 database and keep only admin user
-- This script completely recreates the database structure with proper INTEGER types for IDs
-- Version 5: Enhanced time management with time format support

-- First, drop all existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS vacation_days CASCADE;
DROP TABLE IF EXISTS workday_schedules CASCADE;
DROP TABLE IF EXISTS work_schedule CASCADE;
DROP TABLE IF EXISTS reduced_periods CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS user_passwords CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with INTEGER id
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

-- Create user_passwords table to store passwords separately
CREATE TABLE user_passwords (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL
);

-- Create tasks table with INTEGER id
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
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

-- Create task_tags table
CREATE TABLE task_tags (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Create task_assignments table with INTEGER user_id
CREATE TABLE task_assignments (
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC NOT NULL, -- Decimal hours for flexible time format
  PRIMARY KEY (task_id, user_id)
);

-- Create time_entries table with INTEGER ids
CREATE TABLE time_entries (
  id INTEGER PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  hours NUMERIC NOT NULL, -- Decimal hours for flexible time format
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

-- Create vacation_days table with INTEGER user_id
CREATE TABLE vacation_days (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- Create work_schedule table
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
  id INTEGER PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  start_date VARCHAR(10) NOT NULL,  -- Format: MM-DD
  end_date VARCHAR(10) NOT NULL,    -- Format: MM-DD
  monday_hours NUMERIC NOT NULL,
  tuesday_hours NUMERIC NOT NULL,
  wednesday_hours NUMERIC NOT NULL,
  thursday_hours NUMERIC NOT NULL,
  friday_hours NUMERIC NOT NULL
);

-- Create sequences for IDs
CREATE SEQUENCE IF NOT EXISTS users_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS tasks_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS time_entries_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS workday_schedules_id_seq START 1;

-- Insert single admin user
INSERT INTO users (id, name, email, role, active) 
VALUES (1, 'Admin', 'admin@ticmoveo.com', 'admin', true);

-- Insert password for admin user (password: dc0rralIplan)
INSERT INTO user_passwords (user_id, password_hash)
VALUES (1, '$2a$10$3U6TErL8ZeyQ.IgjJl9rmuCiTsA.DHJF6R7GTJr8jrCX7Vinr5wEm');

-- Insert initial schedule configuration
INSERT INTO work_schedule 
(regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily) 
VALUES (8, 7, 6);

-- Add 2024 holidays
INSERT INTO holidays (date, name)
VALUES 
('2024-01-01', 'Aninovo'),
('2024-01-06', 'Día de Reis'),
('2024-03-29', 'Venres Santo'),
('2024-05-01', 'Día do Traballo'),
('2024-05-17', 'Día das Letras Galegas'),
('2024-07-25', 'Santiago Apóstolo'),
('2024-08-15', 'Asunción'),
('2024-10-12', 'Día Nacional'),
('2024-11-01', 'Todos os Santos'),
('2024-12-06', 'Día da Constitución'),
('2024-12-08', 'Inmaculada Concepción'),
('2024-12-25', 'Nadal');

-- Add 2025 holidays
INSERT INTO holidays (date, name)
VALUES 
('2025-01-01', 'Aninovo'),
('2025-01-06', 'Día de Reis'),
('2025-04-18', 'Venres Santo'),
('2025-05-01', 'Día do Traballo'),
('2025-05-17', 'Día das Letras Galegas'),
('2025-07-25', 'Santiago Apóstolo'),
('2025-08-15', 'Asunción'),
('2025-10-12', 'Día Nacional'),
('2025-11-01', 'Todos os Santos'),
('2025-12-06', 'Día da Constitución'),
('2025-12-08', 'Inmaculada Concepción'),
('2025-12-25', 'Nadal');

-- Create manual de instruccións para reset
COMMENT ON DATABASE controltarefasv2 IS '
# Manual de Reinicio de Control de Tarefas 5

Este manual detalla a forma de reiniciar por completo a base de datos "controltarefasv2" 
e configurala cun único usuario administrador.

## Requisitos Previos

- PostgreSQL instalado e en funcionamento
- Acceso ao servidor PostgreSQL con credenciais de administrador
- Conexión establecida á base de datos

## Procedemento de Reinicio

### 1. Acceder a PostgreSQL

Acceda ao servidor PostgreSQL:

```bash
# Usando psql coa contrasinal no comando:
psql -U task_control -p 5433 -d controltarefasv2

# Ou usando psql interactivo:
psql -U task_control -p 5433
```

Cando se lle solicite, introduza a contrasinal configurada.

### 2. Executar Script de Reinicio

Unha vez conectado a PostgreSQL, execute o script de reinicio:

```sql
\i /ruta/completa/ao/arquivo/reset_controldetarefas5.sql
```

Alternativamente, pode executar o script desde a liña de comandos:

```bash
psql -U task_control -p 5433 -d controltarefasv2 -f /ruta/completa/ao/arquivo/reset_controldetarefas5.sql
```

### 3. Verificación

Para verificar que o reinicio completouse correctamente, execute:

```sql
SELECT * FROM users;
SELECT * FROM user_passwords;
```

Debería ver un único usuario administrador co correo `admin@ticmoveo.com`.

### 4. Credenciais do Administrador

- **Email**: admin@ticmoveo.com
- **Contrasinal**: dc0rralIplan
- **Rol**: admin

### 5. Notas Importantes

- Este script elimina TODAS as táboas existentes e os seus datos.
- Os novos usuarios deberán ser creados manualmente ou a través da aplicación.
- Os contrasinais almacénanse na táboa `user_passwords` separada dos datos de usuario.
- Non se crean rexistros de exemplo adicionais en ningunha táboa.
- Os IDs de usuarios manéxanse como tipo INTEGER para maior eficiencia e consistencia.
- As asignacións de tarefas (task_assignments) utilizan user_id de tipo INTEGER.
- Os rexistros de tempo (time_entries) aseguran que tanto user_id como task_id son de tipo INTEGER.
- O almacenamento de horas realízase en formato decimal para permitir a entrada e visualización en formato horario HH:MM.

## Estrutura da Base de Datos

A base de datos recén reiniciada contén as seguintes táboas principais:

- `users` - Información de usuarios (ID de tipo INTEGER)
- `user_passwords` - Contrasinais de usuario (separadas por seguridade)
- `tasks` - Tarefas do sistema (ID de tipo INTEGER)
- `task_tags` - Etiquetas de tarefas
- `task_assignments` - Asignacións de tarefas a usuarios (user_id de tipo INTEGER)
- `time_entries` - Rexistros de tempo (user_id e task_id de tipo INTEGER)
- `holidays` - Días festivos
- `vacation_days` - Días de vacacións (user_id de tipo INTEGER)
- `workday_schedules` - Horarios de traballo (user_id de tipo INTEGER)

## Importante para time_entries

Ao crear ou actualizar rexistros de tempo (time_entries), é crucial asegurarse de que:

1. Tanto `task_id` como `user_id` manéxanse sempre como valores INTEGER na base de datos
2. As datas pásanse en formato "YYYY-MM-DD"
3. As horas almacénanse como valores numéricos (poden ser decimais)
4. O formato de visualización é HH:MM pero almacénase como decimal na base de datos
5. Os IDs dos rexistros son sempre valores numéricos secuenciais
';
