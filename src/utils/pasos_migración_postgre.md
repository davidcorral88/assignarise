
# Manual detallado de migración a PostgreSQL

## Índice
1. [Requisitos previos](#requisitos-previos)
2. [Preparación del entorno](#preparación-del-entorno)
3. [Exportación de datos locales](#exportación-de-datos-locales)
4. [Preparación de PostgreSQL](#preparación-de-postgresql)
5. [Migración de datos](#migración-de-datos)
6. [Verificación y pruebas](#verificación-y-pruebas)
7. [Resolución de problemas](#resolución-de-problemas)
8. [Post-migración](#post-migración)

## 1. Requisitos previos

### 1.1. Software necesario
- PostgreSQL 15 o superior instalado
- pgAdmin 4 (recomendado) o DBeaver como cliente SQL
- Node.js 18 o superior
- API REST funcionando localmente (backend)

### 1.2. Credenciales y accesos
- Usuario administrador de PostgreSQL
- Credenciales de la base de datos de desarrollo
- Acceso al servidor donde se desplegará la API

### 1.3. Archivos necesarios
- Script de creación de tablas (`database_reset.sql`)
- Datos del almacenamiento local actuales
- Configuración de conexión a la base de datos

## 2. Preparación del entorno

### 2.1. Verificación del entorno PostgreSQL
```bash
# Verificar la instalación de PostgreSQL
psql --version

# Verificar el estado del servicio
# En Windows (PowerShell como administrador):
Get-Service postgresql*

# En Linux:
systemctl status postgresql
```

### 2.2. Configuración de la base de datos
1. Crear nueva base de datos:
```sql
CREATE DATABASE task_management;
```

2. Crear usuario específico:
```sql
CREATE USER task_control WITH PASSWORD 'dc0rralIplan';
GRANT ALL PRIVILEGES ON DATABASE task_management TO task_control;
```

### 2.3. Configuración del servidor API
1. Verificar que el archivo `dbConfig.ts` contiene los valores correctos:
```typescript
export const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'task_management',
  user: 'task_control',
  password: 'dc0rralIplan',
};
```

2. Asegurar que la API está escuchando en el puerto correcto:
```typescript
export const API_URL = 'http://localhost:3000/api';
```

## 3. Exportación de datos locales

### 3.1. Respaldo del localStorage
1. Acceder a la sección de Configuración en la aplicación
2. Hacer clic en "Crear respaldo"
3. Guardar el archivo JSON generado
4. Verificar el contenido del respaldo:
   - Usuarios (`mockUsers`)
   - Tareas (`mockTasks`)
   - Registros de tiempo (`mockTimeEntries`)
   - Días festivos (`mockHolidays`)
   - Días de vacaciones (`mockVacationDays`)
   - Horarios de trabajo (`mockWorkdaySchedules`)
   - Configuración de horarios (`mockWorkSchedule`)

### 3.2. Preparación de datos para importación
1. Revisar el formato de los datos exportados
2. Verificar que los IDs sean únicos
3. Validar las relaciones entre entidades
4. Comprobar la integridad de los datos

## 4. Preparación de PostgreSQL

### 4.1. Ejecución del script de creación de tablas
1. Abrir pgAdmin o DBeaver
2. Conectar a la base de datos `task_management`
3. Ejecutar el script `database_reset.sql`:
```bash
psql -U postgres -d task_management -f ruta/a/database_reset.sql
```

### 4.2. Verificación de la estructura
1. Comprobar que todas las tablas se han creado:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. Verificar las restricciones y claves foráneas:
```sql
SELECT tc.table_name, kcu.column_name, tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public';
```

## 5. Migración de datos

### 5.1. Orden de migración
1. Usuarios (`users`)
2. Configuración de horarios (`work_schedule`)
3. Horarios diarios (`workday_schedules`)
4. Días festivos (`holidays`)
5. Tareas (`tasks`)
6. Registros de tiempo (`time_entries`)
7. Días de vacaciones (`vacation_days`)

### 5.2. Proceso de migración paso a paso
1. Iniciar la migración desde la interfaz:
   - Ir a Configuración > PostgreSQL
   - Verificar conexión
   - Hacer clic en "Iniciar migración"

2. Monitorear el progreso:
   - Observar la barra de progreso
   - Revisar los logs en la consola del navegador
   - Verificar los mensajes de estado

3. En caso de error:
   - Anotar el mensaje de error
   - Identificar la entidad afectada
   - Consultar la sección de resolución de problemas

### 5.3. Verificación durante la migración
Para cada tipo de dato:
1. Comprobar el conteo de registros:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tasks;
-- etc.
```

2. Verificar la integridad de las relaciones:
```sql
-- Ejemplo para tareas y asignaciones
SELECT t.id, COUNT(ta.user_id) as assignments
FROM tasks t
LEFT JOIN task_assignments ta ON t.id = ta.task_id
GROUP BY t.id;
```

## 6. Verificación y pruebas

### 6.1. Verificación de datos
1. Comparar totales:
   - Número de usuarios
   - Número de tareas
   - Registros de tiempo
   - Días de vacaciones

2. Verificar integridad:
   - Relaciones entre tareas y usuarios
   - Asignaciones de tiempo
   - Períodos de vacaciones

3. Comprobar datos específicos:
   - Usuarios críticos
   - Tareas importantes
   - Períodos de tiempo clave

### 6.2. Pruebas funcionales
1. Login y autenticación
2. Creación de nuevas tareas
3. Asignación de tiempo
4. Gestión de vacaciones
5. Configuración de horarios
6. Generación de informes

### 6.3. Pruebas de rendimiento
1. Tiempo de carga de listados
2. Velocidad de búsqueda
3. Rendimiento en operaciones masivas

## 7. Resolución de problemas

### 7.1. Problemas comunes y soluciones

#### Error de conexión
```
Error: No se pudo establecer conexión con PostgreSQL
```
Soluciones:
1. Verificar que PostgreSQL está ejecutándose
2. Comprobar credenciales
3. Verificar firewall y permisos

#### Error de migración de datos
```
Error durante la migración: Error al migrar users
```
Soluciones:
1. Verificar formato de datos
2. Comprobar restricciones de la tabla
3. Revisar logs detallados

#### Error de integridad referencial
```
Error: violación de clave foránea
```
Soluciones:
1. Migrar tablas en orden correcto
2. Verificar IDs y referencias
3. Corregir datos inconsistentes

### 7.2. Comandos útiles

Verificar conexiones activas:
```sql
SELECT * FROM pg_stat_activity;
```

Reiniciar secuencias:
```sql
ALTER SEQUENCE nombre_secuencia RESTART WITH valor;
```

Verificar espacio en disco:
```sql
SELECT pg_size_pretty(pg_database_size('task_management'));
```

## 8. Post-migración

### 8.1. Activación del modo PostgreSQL
1. En la interfaz de configuración:
   - Activar "Usar PostgreSQL como almacenamiento principal"
   - Verificar que la conexión sigue activa

### 8.2. Limpieza
1. Opcional: Borrar datos locales
   - Hacer clic en "Limpiar almacenamiento local"
   - Confirmar la acción

### 8.3. Monitorización
1. Configurar monitorización:
   - Revisar logs de la API
   - Configurar alertas de errores
   - Establecer métricas de rendimiento

2. Plan de mantenimiento:
   - Programar backups
   - Establecer política de retención
   - Planificar actualizaciones

### 8.4. Documentación
1. Actualizar documentación técnica
2. Registrar cambios realizados
3. Documentar problemas encontrados y soluciones

## Apéndice A: Comandos SQL útiles

### Consultas de verificación

Verificar usuarios y sus tareas:
```sql
SELECT u.name, COUNT(t.id) as total_tasks
FROM users u
LEFT JOIN tasks t ON t.created_by = u.id
GROUP BY u.name;
```

Verificar registros de tiempo por usuario:
```sql
SELECT u.name, SUM(te.hours) as total_hours
FROM users u
LEFT JOIN time_entries te ON te.user_id = u.id
GROUP BY u.name;
```

### Comandos de mantenimiento

Vacuum y análisis:
```sql
VACUUM ANALYZE;
```

Reindexación:
```sql
REINDEX DATABASE task_management;
```

## Apéndice B: Checklist de migración

### Antes de la migración
- [ ] Backup de datos locales realizado
- [ ] PostgreSQL instalado y configurado
- [ ] Base de datos creada
- [ ] Usuario con permisos creado
- [ ] Tablas creadas correctamente
- [ ] API configurada y funcionando

### Durante la migración
- [ ] Migración de usuarios completada
- [ ] Migración de horarios completada
- [ ] Migración de tareas completada
- [ ] Migración de registros de tiempo completada
- [ ] Migración de vacaciones completada

### Después de la migración
- [ ] Verificación de datos completada
- [ ] Pruebas funcionales exitosas
- [ ] Modo PostgreSQL activado
- [ ] Backup post-migración realizado
- [ ] Documentación actualizada

## Apéndice C: Contactos de soporte

Para asistencia técnica durante la migración:
- Soporte técnico: soporte@example.com
- Administrador de base de datos: dba@example.com
- Equipo de desarrollo: dev@example.com

---

**Nota**: Este manual debe ser utilizado en conjunto con el equipo técnico y adaptado según las necesidades específicas del entorno de despliegue.

