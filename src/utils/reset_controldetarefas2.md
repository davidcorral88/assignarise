
# Manual de Reinicio de Control de Tarefas 2

Este manual detalla el procedimiento para reiniciar completamente la base de datos "controltarefasv2" y configurarla con un único usuario administrador.

## Requisitos Previos

- PostgreSQL instalado y en funcionamiento
- Acceso al servidor PostgreSQL con credenciales de administrador
- Conexión establecida a la base de datos

## Procedimiento de Reinicio

### 1. Preparación

Asegúrese de tener backup de cualquier dato importante antes de proceder.

### 2. Acceder a PostgreSQL

Acceda al servidor PostgreSQL:

```bash
# Usando psql con la contraseña en el comando:
psql -U task_control -p 5433 -d controltarefasv2

# O usando psql interactivo:
psql -U task_control -p 5433
```

Cuando se le solicite, introduzca la contraseña: `dc0rralIplan`

### 3. Ejecutar Script de Reinicio

Una vez conectado a PostgreSQL, ejecute el script de reinicio:

```sql
\i /ruta/completa/al/archivo/reset_controldetarefas2.sql
```

Alternativamente, puede ejecutar el script desde la línea de comandos:

```bash
psql -U task_control -p 5433 -d controltarefasv2 -f /ruta/completa/al/archivo/reset_controldetarefas2.sql
```

### 4. Verificación

Para verificar que el reinicio se ha completado correctamente, ejecute:

```sql
SELECT * FROM users;
SELECT * FROM user_passwords;
```

Debería ver un único usuario administrador con el correo `admin@ticmoveo.com`.

### 5. Credenciales del Administrador

- **Email**: admin@ticmoveo.com
- **Contraseña**: dc0rralIplan
- **Rol**: admin

### 6. Notas Importantes

- Este script elimina TODAS las tablas existentes y sus datos.
- Los nuevos usuarios deberán ser creados manualmente o a través de la aplicación.
- Las contraseñas se almacenan en la tabla `user_passwords` separada de los datos de usuario.
- No se crean registros de ejemplo adicionales en ninguna tabla.
- Los IDs de usuarios se manejan como tipo INTEGER para mayor eficiencia y consistencia.
- Las asignaciones de tareas (task_assignments) utilizan user_id de tipo INTEGER.
- Los registros de tiempo (time_entries) aseguran que tanto user_id como task_id son de tipo INTEGER.

## Estructura de la Base de Datos

La base de datos recién reiniciada contiene las siguientes tablas principales:

- `users` - Información de usuarios (ID de tipo INTEGER)
- `user_passwords` - Contraseñas de usuario (separadas por seguridad)
- `tasks` - Tareas del sistema
- `task_tags` - Etiquetas de tareas
- `task_assignments` - Asignaciones de tareas a usuarios (user_id de tipo INTEGER)
- `time_entries` - Registros de tiempo (user_id y task_id de tipo INTEGER)
- `holidays` - Días festivos
- `vacation_days` - Días de vacaciones (user_id de tipo INTEGER)
- `workday_schedules` - Horarios de trabajo (user_id de tipo INTEGER)

Todas las tablas usan IDs numéricos para mayor eficiencia y consistencia.
