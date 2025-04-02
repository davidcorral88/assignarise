
# Guía de configuración de la base de datos task_management_v04

Este documento describe los pasos para crear y configurar la base de datos `task_management_v04` para la aplicación Control de Tarefas.

## Requisitos previos

- PostgreSQL 12 o superior instalado
- Acceso con privilegios de superusuario o capacidad para crear bases de datos

## Pasos para la creación de la base de datos

### 1. Crear la base de datos

Conéctese a PostgreSQL como superusuario y ejecute:

```sql
CREATE DATABASE task_management_v04;
```

### 2. Crear el usuario de la aplicación (si aún no existe)

```sql
CREATE USER task_control WITH PASSWORD 'dc0rralIplan';
GRANT ALL PRIVILEGES ON DATABASE task_management_v04 TO task_control;
```

### 3. Conectarse a la base de datos recién creada

```
\c task_management_v04
```

### 4. Ejecutar el script SQL para crear las tablas

Utilice el script que se encuentra en `/src/utils/crear_task_management_v04.sql`.

Puede ejecutarlo directamente desde la consola psql:

```
\i ruta/completa/a/crear_task_management_v04.sql
```

O copiar y pegar el contenido del script en una sesión psql conectada a la base de datos.

## Estructura de la base de datos

La base de datos utiliza el siguiente esquema:

- **users**: Almacena la información de usuarios con ID de tipo INTEGER
- **user_passwords**: Almacena las contraseñas de los usuarios
- **tasks**: Tareas del sistema con referencias a usuarios como creadores
- **task_tags**: Etiquetas asociadas a las tareas
- **task_assignments**: Asignaciones de usuarios a tareas
- **time_entries**: Registros de tiempo trabajado
- **holidays**: Días festivos
- **vacation_days**: Días de vacaciones de los usuarios
- **work_schedule**: Configuración global de horarios
- **reduced_periods**: Períodos de jornada reducida
- **workday_schedules**: Configuraciones personalizadas de horarios

## Cambios importantes respecto a versiones anteriores

1. El campo `id` en la tabla `users` ahora es de tipo INTEGER (anteriormente VARCHAR)
2. Todas las referencias (claves foráneas) a `users.id` también han sido actualizadas a INTEGER
3. Se ha agregado una secuencia para auto-incrementar los IDs de usuario
4. Se mantienen las relaciones entre tablas con las mismas restricciones de integridad referencial

## Datos iniciales

El script crea:
- Un usuario administrador con ID 0
- Algunos usuarios de ejemplo
- Una tarea de ejemplo
- Algunos días festivos básicos
- Una configuración básica de horario de trabajo

## Configuración en la aplicación

Asegúrese de modificar los archivos de configuración de la aplicación para que apunten a la nueva base de datos:

1. Actualizar en `src/api/db/connection.js` el nombre de la base de datos a `task_management_v04`
2. Reiniciar el servidor de la API
3. Reiniciar la aplicación cliente

## Resolución de problemas

Si encuentra errores al ejecutar el script:

1. Verifique que no haya conexiones activas a la base de datos antes de eliminar/recrear tablas
2. Asegúrese de que el usuario `task_control` tenga los permisos necesarios
3. Revise los logs de PostgreSQL para obtener información detallada sobre los errores

Para cualquier problema adicional, contacte al administrador del sistema.
