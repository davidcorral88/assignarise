
/**
 * Modificaciones necesarias en la base de datos para usar IDs de tipo entero
 * 
 * Este archivo contiene las instrucciones y scripts SQL necesarios para
 * migrar la base de datos PostgreSQL y cambiar el tipo de los campos ID
 * de texto a entero.
 */

// Script SQL para actualizar la base de datos PostgreSQL
export const SQL_CONVERSION_SCRIPT = `
-- Convertir IDs de tipo texto a entero en todas las tablas

-- 1. Tabla users - Convertir ID de texto a entero
ALTER TABLE users 
ADD COLUMN id_numeric INTEGER;

-- Actualizar la columna numérica con valores convertidos
UPDATE users 
SET id_numeric = CAST(id AS INTEGER);

-- Eliminar la columna antigua y renombrar la nueva
ALTER TABLE users 
DROP COLUMN id,
ADD COLUMN id INTEGER;

UPDATE users
SET id = id_numeric;

ALTER TABLE users
DROP COLUMN id_numeric,
ALTER COLUMN id SET NOT NULL,
ADD PRIMARY KEY (id);

-- 2. Actualizar referencias a user_id en otras tablas
-- Tabla tasks - Campo createdBy
ALTER TABLE tasks
ADD COLUMN created_by_numeric INTEGER;

UPDATE tasks
SET created_by_numeric = CAST(created_by AS INTEGER);

ALTER TABLE tasks
DROP COLUMN created_by,
ADD COLUMN created_by INTEGER;

UPDATE tasks
SET created_by = created_by_numeric;

ALTER TABLE tasks
DROP COLUMN created_by_numeric,
ALTER COLUMN created_by SET NOT NULL;

-- 3. Tabla task_assignments - Campo userId
ALTER TABLE task_assignments
ADD COLUMN user_id_numeric INTEGER;

UPDATE task_assignments
SET user_id_numeric = CAST(user_id AS INTEGER);

ALTER TABLE task_assignments
DROP COLUMN user_id,
ADD COLUMN user_id INTEGER;

UPDATE task_assignments
SET user_id = user_id_numeric;

ALTER TABLE task_assignments
DROP COLUMN user_id_numeric,
ALTER COLUMN user_id SET NOT NULL;

-- 4. Tabla task_attachments - Campo uploadedBy 
ALTER TABLE task_attachments
ADD COLUMN uploaded_by_numeric INTEGER;

UPDATE task_attachments
SET uploaded_by_numeric = CAST(uploaded_by AS INTEGER);

ALTER TABLE task_attachments
DROP COLUMN uploaded_by,
ADD COLUMN uploaded_by INTEGER;

UPDATE task_attachments
SET uploaded_by = uploaded_by_numeric;

ALTER TABLE task_attachments
DROP COLUMN uploaded_by_numeric,
ALTER COLUMN uploaded_by SET NOT NULL;

-- 5. Tabla time_entries - Campo userId
ALTER TABLE time_entries
ADD COLUMN user_id_numeric INTEGER;

UPDATE time_entries
SET user_id_numeric = CAST(user_id AS INTEGER);

ALTER TABLE time_entries
DROP COLUMN user_id,
ADD COLUMN user_id INTEGER;

UPDATE time_entries
SET user_id = user_id_numeric;

ALTER TABLE time_entries
DROP COLUMN user_id_numeric,
ALTER COLUMN user_id SET NOT NULL;

-- 6. Tabla vacation_days - Campo userId
ALTER TABLE vacation_days
ADD COLUMN user_id_numeric INTEGER;

UPDATE vacation_days
SET user_id_numeric = CAST(user_id AS INTEGER);

ALTER TABLE vacation_days
DROP COLUMN user_id,
ADD COLUMN user_id INTEGER;

UPDATE vacation_days
SET user_id = user_id_numeric;

ALTER TABLE vacation_days
DROP COLUMN user_id_numeric,
ALTER COLUMN user_id SET NOT NULL;

-- 7. Tabla work_schedule_users - Campo userId
ALTER TABLE work_schedule_users
ADD COLUMN user_id_numeric INTEGER;

UPDATE work_schedule_users
SET user_id_numeric = CAST(user_id AS INTEGER);

ALTER TABLE work_schedule_users
DROP COLUMN user_id,
ADD COLUMN user_id INTEGER;

UPDATE work_schedule_users
SET user_id = user_id_numeric;

ALTER TABLE work_schedule_users
DROP COLUMN user_id_numeric,
ALTER COLUMN user_id SET NOT NULL;

-- Verificar secuencias para autoincremento
SELECT pg_get_serial_sequence('users', 'id');

-- Crear secuencia si no existe
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
`;

/**
 * Instrucciones para aplicar las modificaciones:
 * 
 * 1. Realizar una copia de seguridad de la base de datos antes de aplicar los cambios.
 * 2. Ejecutar el script SQL anterior en la base de datos PostgreSQL.
 * 3. Verificar que todas las referencias a IDs de usuario en el código fuente usen el tipo 'number' en lugar de 'string'.
 * 4. Actualizar las interfaces TypeScript para usar 'number' en lugar de 'string' para los IDs de usuario.
 * 5. Reiniciar el servidor API después de aplicar los cambios.
 * 
 * Nota importante:
 * Asegúrate de que todas las funciones que pasan o reciben IDs de usuario manejen correctamente
 * el tipo 'number'. Algunas funciones pueden necesitar conversión explícita usando:
 * - Number(id) para convertir strings a números
 * - String(id) para convertir números a strings cuando se pasan a APIs que aún esperan strings
 */

/**
 * Cambios realizados en el código:
 * 
 * 1. src/utils/types.d.ts y src/utils/types.ts:
 *    - Modificado User.id de string a number
 *    - Modificado TaskAssignment.userId de string a number
 *    - Modificado TaskAttachment.uploadedBy de string a number
 *    - Modificado TimeEntry.userId de string a number
 *    - Modificado VacationDay.userId de string a number
 * 
 * 2. Componentes que usan IDs de usuario:
 *    - Actualizado TimeTrackingForm para usar userId como number
 *    - Actualizado Dashboard para convertir IDs en llamadas a API
 *    - Actualizado TaskForm para manejar IDs de usuario como números
 *    - Actualizado componentes de selección para convertir entre string y number según sea necesario
 * 
 * 3. Funciones API:
 *    - Actualizado getNextUserId para devolver explícitamente un number
 *    - Agregado manejo de conversión en funciones que interactúan con la API
 */

export default SQL_CONVERSION_SCRIPT;
