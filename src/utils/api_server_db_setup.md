
# Configuración del Servidor API y Base de Datos PostgreSQL

Este documento contiene instrucciones para configurar correctamente el servidor API y la base de datos PostgreSQL para la aplicación de Control de Tarefas.

## 1. Instalación de PostgreSQL

Asegúrate de tener PostgreSQL instalado y en funcionamiento.

## 2. Configuración de la Base de Datos

Ejecuta los siguientes comandos SQL para crear las tablas necesarias:

```sql
-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  active BOOLEAN DEFAULT TRUE
);

-- Crear tabla de contraseñas de usuarios
CREATE TABLE IF NOT EXISTS user_passwords (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL
);

-- Crear tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  priority VARCHAR(50) DEFAULT 'medium',
  category VARCHAR(255),
  project VARCHAR(255)
);

-- Crear tabla de etiquetas de tareas
CREATE TABLE IF NOT EXISTS task_tags (
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Crear tabla de asignaciones de tareas
CREATE TABLE IF NOT EXISTS task_assignments (
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC(10,2) DEFAULT 0,
  PRIMARY KEY (task_id, user_id)
);

-- Crear tabla de registros de tiempo
CREATE TABLE IF NOT EXISTS time_entries (
  id SERIAL PRIMARY KEY,
  task_id VARCHAR(50) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Crear tabla de días festivos
CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL
);

-- Crear tabla de días de vacaciones
CREATE TABLE IF NOT EXISTS vacation_days (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  UNIQUE (user_id, date)
);

-- Crear tabla de horarios de trabajo
CREATE TABLE IF NOT EXISTS workday_schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  UNIQUE (user_id, day_of_week)
);
```

## 3. Configuración del Servidor API

1. Asegúrate de que el archivo de conexión a la base de datos (`src/api/db/connection.js`) tenga la configuración correcta:

```javascript
const { Pool } = require('pg');

// Configura la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',  // Cambia esto a tu usuario
  host: 'localhost', // Cambia esto a tu host
  database: 'controldetarefas', // Cambia esto a tu base de datos
  password: 'tu_contraseña', // Cambia esto a tu contraseña
  port: 5432, // Puerto por defecto de PostgreSQL
});

module.exports = pool;
```

2. Asegúrate de que todos los archivos de rutas están correctamente configurados en `src/api/server.js`.

## 4. Comprobando la Configuración

Para comprobar que todo está correctamente configurado:

1. Inicia el servidor API desde la carpeta `src/api`:

```
node server.js
```

2. El servidor debería iniciarse sin errores y mostrar un mensaje indicando que está escuchando en un puerto (por defecto, el 5000).

## 5. Resolución de Problemas Comunes

### Error: Módulo no encontrado

Si ves un error como `Cannot find module '../../utils/dbConfig'`, asegúrate de que:

1. Las rutas en el archivo `passwords.js` no dependan de archivos externos a la carpeta de API.
2. La constante `DEFAULT_PASSWORD` esté definida directamente en `passwords.js`.

### Error de Conexión a PostgreSQL

Si hay problemas conectando a PostgreSQL:

1. Verifica que PostgreSQL esté en funcionamiento.
2. Comprueba las credenciales en `db/connection.js`.
3. Asegúrate de que la base de datos exista con `CREATE DATABASE controldetarefas;`.

### Error en las Rutas API

Si las rutas API no funcionan:

1. Comprueba que todas las rutas están correctamente registradas en `server.js`.
2. Verifica que los nombres de las tablas en las consultas SQL coincidan con los creados en la base de datos.
