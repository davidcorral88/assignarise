
# Manual de Gestión de Base de Datos para Control de Tarefas v7

Este documento detalla el estado actual de la base de datos del sistema Control de Tarefas, así como las consideraciones para posibles modificaciones futuras.

## Estado Actual de la Base de Datos

La base de datos actual ya incluye el soporte necesario para todas las funcionalidades implementadas, incluyendo:

- Gestión de usuarios y roles
- Gestión de tareas y asignaciones
- Registro de tiempos
- Gestión de festivos
- Gestión de vacaciones
- Configuración de horarios de trabajo

### Tabla de Festivos (holidays)

La tabla `holidays` tiene la siguiente estructura:

```sql
CREATE TABLE holidays (
  date DATE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);
```

Esta tabla almacena la información de días festivos, donde:
- `date`: Fecha del festivo (clave primaria)
- `name`: Nombre descriptivo del festivo
- `description`: Descripción opcional más detallada

## Instrucciones para Modificaciones Futuras

### 1. Respaldo de Datos

Antes de realizar cualquier modificación en la estructura de la base de datos, es fundamental crear una copia de seguridad:

```bash
pg_dump -U task_control -p 5433 controltarefasv2 > backup_controltarefasv2_$(date +%Y%m%d).sql
```

### 2. Modificación de Tablas Existentes

Para modificar tablas existentes, utilice comandos `ALTER TABLE`. Por ejemplo:

```sql
-- Añadir una columna
ALTER TABLE holidays ADD COLUMN is_regional BOOLEAN DEFAULT FALSE;

-- Modificar una columna
ALTER TABLE holidays ALTER COLUMN name TYPE VARCHAR(300);

-- Añadir restricciones
ALTER TABLE holidays ADD CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES regions(id);
```

### 3. Creación de Nuevas Tablas

Para crear nuevas tablas relacionadas con la gestión de festivos, utilice la siguiente sintaxis:

```sql
CREATE TABLE holiday_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE holiday_regions (
  holiday_date DATE REFERENCES holidays(date),
  region_id INTEGER REFERENCES regions(id),
  PRIMARY KEY (holiday_date, region_id)
);
```

### 4. Migración de Datos

Al realizar cambios estructurales que requieran migración de datos:

```sql
-- Crear tabla temporal
CREATE TABLE holidays_new (
  date DATE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type_id INTEGER REFERENCES holiday_types(id)
);

-- Migrar datos
INSERT INTO holidays_new (date, name, description)
SELECT date, name, description FROM holidays;

-- Reemplazar tabla
DROP TABLE holidays;
ALTER TABLE holidays_new RENAME TO holidays;
```

### 5. Optimización

Considere añadir índices para mejorar el rendimiento de consultas frecuentes:

```sql
CREATE INDEX idx_holidays_name ON holidays (name);
CREATE INDEX idx_holidays_year ON holidays (EXTRACT(YEAR FROM date));
```

## Instrucciones de Reinicio

Si necesita reiniciar completamente la base de datos:

1. Conéctese a PostgreSQL:
```bash
psql -U task_control -p 5433 -d controltarefasv2
```

2. Ejecute el script de restablecimiento:
```sql
\i /ruta/completa/al/archivo/reset_controldetarefasv2.sql
```

## Recomendaciones para el Desarrollo

1. **Pruebas en Entorno de Desarrollo**: Siempre pruebe las modificaciones en un entorno de desarrollo antes de aplicarlas en producción.

2. **Versionado de Scripts**: Mantenga un versionado claro de los scripts de modificación de base de datos.

3. **Documentación**: Documente todos los cambios realizados en la estructura de la base de datos.

## Notas sobre la Versión Actual (v7)

En la versión actual (v7) no se requieren cambios estructurales en la base de datos. Las funcionalidades implementadas utilizan correctamente las estructuras existentes:

- La tabla `holidays` ya soporta la gestión completa de festivos.
- Las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) funcionan con la estructura actual.
- La interfaz de usuario está completamente integrada con esta estructura.

Si en versiones futuras se implementan funcionalidades como la gestión regional de festivos o categorización de los mismos, se podrán utilizar las instrucciones detalladas en este documento para realizar las modificaciones necesarias.
