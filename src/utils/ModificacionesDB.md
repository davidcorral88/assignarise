
# Modificaciones de la Base de Datos PostgreSQL

Este documento describe las modificaciones necesarias para adaptar la base de datos PostgreSQL para usar IDs de usuario de tipo entero (integer) en lugar de texto (varchar).

## Cambios requeridos en la base de datos

### 1. Modificar la tabla de usuarios

```sql
-- Primero, crear una tabla temporal con la nueva estructura
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

-- Migrar los datos existentes, convirtiendo los IDs a números
-- Nota: Esto asume que los IDs actuales son convertibles a enteros
INSERT INTO users_new (id, name, email, role, avatar, organization, phone, email_notification, active)
SELECT 
  CAST(id AS INTEGER), 
  name, 
  email, 
  role, 
  avatar, 
  organization, 
  phone, 
  email_notification, 
  active
FROM users;

-- Eliminar la tabla original
DROP TABLE users CASCADE;

-- Renombrar la nueva tabla
ALTER TABLE users_new RENAME TO users;

-- Recrear los índices y restricciones
CREATE UNIQUE INDEX users_email_idx ON users(email);
```

### 2. Actualizar tablas relacionadas

Para todas las tablas que hacen referencia a `users.id`, es necesario modificar también las referencias. A continuación se muestra un ejemplo para cada tabla:

```sql
-- Para la tabla task_assignments
-- Primero, crear una tabla temporal
CREATE TABLE task_assignments_new (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

-- Migrar los datos existentes
INSERT INTO task_assignments_new (task_id, user_id, allocated_hours)
SELECT task_id, CAST(user_id AS INTEGER), allocated_hours
FROM task_assignments;

-- Eliminar la tabla original
DROP TABLE task_assignments;

-- Renombrar la nueva tabla
ALTER TABLE task_assignments_new RENAME TO task_assignments;
```

Repite el proceso similar para otras tablas que tienen referencias a `users.id`:

- `time_entries`
- `vacation_days`
- `tasks` (columna created_by)

### 3. Actualizar secuencias y valores por defecto

```sql
-- Crear una secuencia para la generación automática de IDs de usuario
CREATE SEQUENCE users_id_seq START WITH 1000;

-- Establecer el valor actual de la secuencia al máximo ID existente
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users), true);

-- Modificar la columna id para que use la secuencia por defecto
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
```

## Consideraciones importantes

1. **Backup de datos**: Antes de realizar cualquier cambio, asegúrate de tener un backup completo de la base de datos.

2. **Periodo de mantenimiento**: Estos cambios requieren un periodo de inactividad en la aplicación. Programa el mantenimiento en un momento adecuado.

3. **Pruebas**: Después de aplicar los cambios, realiza pruebas exhaustivas para verificar que la aplicación funciona correctamente con la nueva estructura.

4. **Conversión de IDs**: Si algún ID actual no puede convertirse a entero, será necesario manejar estos casos específicamente antes de la migración.

## Script completo

En el archivo `src/utils/database_id_conversion.sql` encontrarás el script completo para realizar todas estas modificaciones de una vez.

