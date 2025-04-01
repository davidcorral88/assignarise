
/**
 * Documentación para la modificación de la base de datos PostgreSQL
 * 
 * Este archivo documenta los cambios necesarios para convertir los IDs de usuario
 * de tipo texto a tipo entero en la base de datos PostgreSQL.
 */

/**
 * Consulta SQL para modificar la columna id de la tabla users:
 * 
 * ALTER TABLE users 
 * ALTER COLUMN id TYPE INTEGER USING (id::integer);
 * 
 * Nota: Esta consulta convierte los IDs existentes en tipo entero. Asegúrate de que todos los IDs son valores
 * numéricos antes de ejecutar esta consulta.
 */

/**
 * Consultas para modificar las columnas de clave foránea que hacen referencia a user.id:
 * 
 * -- Modifica la columna user_id en la tabla task_assignments
 * ALTER TABLE task_assignments 
 * ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);
 * 
 * -- Modifica la columna created_by en la tabla tasks
 * ALTER TABLE tasks 
 * ALTER COLUMN created_by TYPE INTEGER USING (created_by::integer);
 * 
 * -- Modifica la columna uploaded_by en la tabla task_attachments
 * ALTER TABLE task_attachments 
 * ALTER COLUMN uploaded_by TYPE INTEGER USING (uploaded_by::integer);
 * 
 * -- Modifica la columna user_id en la tabla time_entries
 * ALTER TABLE time_entries 
 * ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);
 * 
 * -- Modifica la columna user_id en la tabla vacation_days
 * ALTER TABLE vacation_days 
 * ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);
 * 
 * -- Modifica la columna user_id en la tabla user_schedules (si existe)
 * ALTER TABLE user_schedules 
 * ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);
 */

/**
 * Después de ejecutar estas modificaciones, es importante actualizar cualquier 
 * script o servicio que interactúe con la base de datos para que trate los IDs 
 * de usuario como enteros en lugar de cadenas de texto.
 * 
 * Secuencia de pasos recomendada:
 * 
 * 1. Hacer una copia de seguridad de la base de datos
 * 2. Ejecutar las consultas de modificación en un entorno de prueba
 * 3. Verificar que todas las relaciones y datos son correctos
 * 4. Implementar los cambios en el código de la aplicación
 * 5. Actualizar la API para manejar IDs numéricos
 * 6. Aplicar los cambios a la base de datos de producción
 */

/**
 * Script SQL completo para realizar todas las modificaciones:
 */
export const SQL_CONVERSION_SCRIPT = `
-- Respaldo de la base de datos (ejecutar en línea de comandos)
-- pg_dump -U username -h hostname -p port -d database_name > backup_before_id_change.sql

-- Inicio de la transacción
BEGIN;

-- Convertir IDs de usuario de texto a entero
ALTER TABLE users 
ALTER COLUMN id TYPE INTEGER USING (id::integer);

-- Actualizar las claves foráneas en todas las tablas relacionadas
ALTER TABLE task_assignments 
ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);

ALTER TABLE tasks 
ALTER COLUMN created_by TYPE INTEGER USING (created_by::integer);

ALTER TABLE task_attachments 
ALTER COLUMN uploaded_by TYPE INTEGER USING (uploaded_by::integer);

ALTER TABLE time_entries 
ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);

ALTER TABLE vacation_days 
ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);

-- Solo ejecutar si existe la tabla user_schedules
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_schedules'
    ) THEN
        ALTER TABLE user_schedules 
        ALTER COLUMN user_id TYPE INTEGER USING (user_id::integer);
    END IF;
END
$$;

-- Confirmar la transacción si todo fue exitoso
COMMIT;
`;

export default SQL_CONVERSION_SCRIPT;
