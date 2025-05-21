# Manual de Instalación en Producción
# Control de Tarefas - Guía de Despliegue en Producción

Este manual detalla el proceso completo para desplegar la aplicación Control de Tarefas en un entorno de producción utilizando Docker en un sistema Linux Debian 6.1.0-34-amd64.

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Conexión SSH inicial](#2-conexión-ssh-inicial)
3. [Instalación de Docker y Docker Compose](#3-instalación-de-docker-y-docker-compose)
4. [Configuración de PostgreSQL](#4-configuración-de-postgresql)
5. [Preparación de la aplicación](#5-preparación-de-la-aplicación)
6. [Configuración de Docker Compose](#6-configuración-de-docker-compose)
7. [Configuración de Apache como proxy inverso](#7-configuración-de-apache-como-proxy-inverso)
8. [Configuración de SSL/TLS con Certbot](#8-configuración-de-ssltls-con-certbot)
9. [Arranque y gestión de los servicios](#9-arranque-y-gestión-de-los-servicios)
10. [Comprobación de la instalación](#10-comprobación-de-la-instalación)
11. [Respaldo y restauración](#11-respaldo-y-restauración)
12. [Resolución de problemas comunes](#12-resolución-de-problemas-comunes)
13. [Actualización de la aplicación](#13-actualización-de-la-aplicación)

## 1. Requisitos previos

### 1.1. Hardware recomendado
- CPU: 2+ núcleos
- RAM: 4+ GB
- Almacenamiento: 20+ GB SSD
- Ancho de banda: 10+ Mbps

### 1.2. Software base
- Debian 6.1.0-34-amd64 o similar
- Acceso root o usuario con privilegios sudo
- Puerto 22 (SSH), 80 (HTTP), 443 (HTTPS) accesibles

### 1.3. Conocimientos necesarios
- Comandos básicos de Linux
- Conocimientos básicos de Docker
- Familiaridad con Apache y PostgreSQL

## 2. Conexión SSH inicial

Conéctate al servidor usando SSH:

```bash
ssh usuario@ip_del_servidor
```

Actualiza el sistema:

```bash
sudo apt update
sudo apt upgrade -y
```

Instala herramientas básicas:

```bash
sudo apt install -y curl wget gnupg2 apt-transport-https ca-certificates lsb-release software-properties-common
```

## 3. Instalación de Docker y Docker Compose

### 3.1. Instalar Docker

```bash
# Eliminar instalaciones antiguas si existen
sudo apt remove docker docker-engine docker.io containerd runc

# Añadir repositorio oficial de Docker
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar e instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

### 3.2. Verificar la instalación de Docker

```bash
sudo systemctl status docker
sudo docker run hello-world
```

### 3.3. Configurar Docker para ejecutarse sin sudo

```bash
sudo usermod -aG docker ${USER}
# Cierra la sesión y vuelve a entrar para aplicar los cambios
```

### 3.4. Instalar Docker Compose

```bash
sudo apt install -y docker-compose
```

## 4. Configuración de PostgreSQL

### 4.1. Crear directorio para datos persistentes

```bash
sudo mkdir -p /opt/controltarefas/postgresql/data
sudo chmod -R 777 /opt/controltarefas
```

### 4.2. Crear el archivo de inicialización de la base de datos

```bash
mkdir -p /opt/controltarefas/postgresql/init
```

Crea un archivo SQL de inicialización:

```bash
nano /opt/controltarefas/postgresql/init/init.sql
```

Añade el siguiente contenido (basado en el archivo database.sql de tu proyecto):

```sql
-- Crear usuario y base de datos
CREATE USER task_control WITH PASSWORD 'dc0rralIplan';
CREATE DATABASE task_management;
GRANT ALL PRIVILEGES ON DATABASE task_management TO task_control;

-- Conectar a la base de datos creada
\c task_management

-- Creación de tablas
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  organization VARCHAR(50),
  phone VARCHAR(50),
  email_notification VARCHAR(255),
  active BOOLEAN DEFAULT true,
  emailATSXPTPG VARCHAR(255)
);

CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE,
  priority VARCHAR(50) NOT NULL,
  category VARCHAR(255),
  project VARCHAR(255)
);

CREATE TABLE task_tags (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  PRIMARY KEY (task_id, tag)
);

CREATE TABLE task_assignments (
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  allocated_hours NUMERIC NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

CREATE TABLE time_entries (
  id VARCHAR(255) PRIMARY KEY,
  task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  hours NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  category VARCHAR(255),
  project VARCHAR(255),
  activity VARCHAR(255),
  time_format VARCHAR(50)
);

CREATE TABLE holidays (
  date DATE PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE vacation_days (
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, date)
);

CREATE TABLE work_schedule (
  id SERIAL PRIMARY KEY,
  regular_hours_monday_to_thursday NUMERIC NOT NULL,
  regular_hours_friday NUMERIC NOT NULL,
  reduced_hours_daily NUMERIC NOT NULL
);

CREATE TABLE reduced_periods (
  id SERIAL PRIMARY KEY,
  work_schedule_id INTEGER REFERENCES work_schedule(id) ON DELETE CASCADE,
  start_date VARCHAR(10) NOT NULL,  -- Format: MM-DD
  end_date VARCHAR(10) NOT NULL     -- Format: MM-DD
);

CREATE TABLE workday_schedules (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  start_date VARCHAR(10) NOT NULL,  -- Format: MM-DD
  end_date VARCHAR(10) NOT NULL,    -- Format: MM-DD
  monday_hours NUMERIC NOT NULL,
  tuesday_hours NUMERIC NOT NULL,
  wednesday_hours NUMERIC NOT NULL,
  thursday_hours NUMERIC NOT NULL,
  friday_hours NUMERIC NOT NULL
);

-- Insertar usuarios iniciales
INSERT INTO users (id, name, email, role, avatar, active) 
VALUES 
('1', 'Admin', 'admin@example.com', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff', true),
('2', 'Ana Pereira', 'ana.pereira@example.com', 'manager', 'https://ui-avatars.com/api/?name=Ana+Pereira&background=0D8ABC&color=fff', true),
('3', 'Carlos Silva', 'carlos.silva@example.com', 'worker', 'https://ui-avatars.com/api/?name=Carlos+Silva&background=0D8ABC&color=fff', true),
('4', 'Laura Méndez', 'laura.mendez@example.com', 'worker', 'https://ui-avatars.com/api/?name=Laura+Mendez&background=0D8ABC&color=fff', true),
('5', 'Miguel González', 'miguel.gonzalez@example.com', 'worker', 'https://ui-avatars.com/api/?name=Miguel+Gonzalez&background=0D8ABC&color=fff', true);

-- Insertar configuración de horarios
INSERT INTO work_schedule 
(regular_hours_monday_to_thursday, regular_hours_friday, reduced_hours_daily) 
VALUES (8, 7, 6);

-- Insertar festivos
INSERT INTO holidays (date, name)
VALUES 
('2025-01-01', 'Año Nuevo'),
('2025-01-06', 'Reyes Magos'),
('2025-04-18', 'Viernes Santo'),
('2025-05-01', 'Día del Trabajo'),
('2025-08-15', 'Asunción'),
('2025-10-12', 'Día de la Hispanidad'),
('2025-11-01', 'Todos los Santos'),
('2025-12-06', 'Día de la Constitución'),
('2025-12-08', 'Inmaculada Concepción'),
('2025-12-25', 'Navidad');
```

## 5. Preparación de la aplicación

### 5.1. Clonar el repositorio o transferir los archivos

```bash
# Opción 1: Clonar desde git
git clone https://tu_repositorio/control_tarefas.git /opt/controltarefas/app

# Opción 2: Transferir archivos desde tu máquina local
rsync -avz --exclude 'node_modules' --exclude '.git' ~/control_tarefas/ usuario@ip_del_servidor:/opt/controltarefas/app/
```

### 5.2. Crear los Dockerfiles

#### 5.2.1. Dockerfile para la aplicación React (Frontend)

```bash
nano /opt/controltarefas/app/Dockerfile.frontend
```

Contenido:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 5.2.2. Dockerfile para la API (Backend)

```bash
nano /opt/controltarefas/app/Dockerfile.api
```

Contenido:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY src/api/package*.json ./
RUN npm install

COPY src/api ./
COPY src/utils/types.ts ./src/utils/types.ts
COPY src/utils/types.d.ts ./src/utils/types.d.ts

EXPOSE 3000
CMD ["node", "server.js"]
```

#### 5.2.3. Crear archivo de configuración de Nginx

```bash
nano /opt/controltarefas/app/nginx.conf
```

Contenido:

```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Redireccionar todas las solicitudes a index.html para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Configuración de cache para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

## 6. Configuración de Docker Compose

### 6.1. Crear archivo docker-compose.yml

```bash
nano /opt/controltarefas/docker-compose.yml
```

Contenido:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: controltarefas-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: pgpassword
      POSTGRES_DB: postgres
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - ./postgresql/data:/var/lib/postgresql/data
      - ./postgresql/init:/docker-entrypoint-initdb.d
    ports:
      - "5433:5432"
    networks:
      - controltarefas-network

  api:
    build:
      context: ./app
      dockerfile: Dockerfile.api
    container_name: controltarefas-api
    restart: always
    environment:
      - DB_USER=task_control
      - DB_HOST=postgres
      - DB_DATABASE=task_management
      - DB_PASSWORD=dc0rralIplan
      - DB_PORT=5432
    volumes:
      - ./app/src/api:/app
      - /app/node_modules
    depends_on:
      - postgres
    ports:
      - "3000:3000"
    networks:
      - controltarefas-network

  frontend:
    build:
      context: ./app
      dockerfile: Dockerfile.frontend
    container_name: controltarefas-frontend
    restart: always
    ports:
      - "5551:80"
    depends_on:
      - api
    networks:
      - controltarefas-network

networks:
  controltarefas-network:
    driver: bridge
```

### 6.2. Actualizar el archivo de conexión a la base de datos

Edita el archivo `src/api/db/connection.js`:

```bash
nano /opt/controltarefas/app/src/api/db/connection.js
```

Reemplaza el contenido por:

```javascript
const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'task_control',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_DATABASE || 'task_management',
  password: process.env.DB_PASSWORD || 'dc0rralIplan',
  port: process.env.DB_PORT || 5432,
});

// Test database connection on initialization
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
    console.log('Using database:', process.env.DB_DATABASE || 'task_management');
  }
});

module.exports = pool;
```

### 6.3. Actualizar la configuración del cliente para que use la API dockerizada

Edita el archivo `src/utils/dbConfig.ts`:

```bash
nano /opt/controltarefas/app/src/utils/dbConfig.ts
```

Actualiza la configuración:

```typescript
// Database configuration
export const API_URL = typeof window !== 'undefined' ? 
  (window.location.hostname === 'localhost' 
    ? "http://localhost:3000/api"
    : `${window.location.protocol}//${window.location.hostname}/api`)
  : "http://localhost:3000/api";
  
export const DEFAULT_USE_POSTGRESQL = true;
export const POSTGRESQL_ONLY_MODE = true;

// Contraseña predeterminada para usuarios nuevos
export const DEFAULT_PASSWORD = 'dxm2025';

// PostgreSQL database connection config
export const dbConfig = {
  host: 'postgres',
  port: 5432,
  database: 'task_management',
  user: 'task_control',
  password: 'dc0rralIplan'
};

// PostgreSQL admin access config
export const pgAdminConfig = {
  user: 'task_control',
  password: 'dc0rralIplan'
};

// Default users for initial setup
export const defaultUsers = [
  {
    id: 1, // Agora usamos números para IDs
    name: 'Admin',
    email: 'admin@example.com',
    password: DEFAULT_PASSWORD,
    role: 'admin' as const,
    active: true
  }
];
```

## 7. Configuración de Apache como proxy inverso

### 7.1. Instalar Apache

```bash
sudo apt install -y apache2
```

### 7.2. Habilitar módulos necesarios

```bash
sudo a2enmod proxy proxy_http ssl headers rewrite
sudo systemctl restart apache2
```

### 7.3. Crear configuración de VirtualHost

```bash
sudo nano /etc/apache2/sites-available/controltarefas.conf
```

Contenido:

```apache
<VirtualHost *:80>
    ServerName rexistrodetarefas.iplanmovilidad.com
    ServerAdmin webmaster@iplanmovilidad.com
    
    # Redirect all HTTP traffic to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName rexistrodetarefas.iplanmovilidad.com
    ServerAdmin webmaster@iplanmovilidad.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/rexistrodetarefas.iplanmovilidad.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/rexistrodetarefas.iplanmovilidad.com/privkey.pem
    
    # Configuración para el frontend (React)
    ProxyPass / http://localhost:5551/
    ProxyPassReverse / http://localhost:5551/
    
    # Configuración para la API (Node.js)
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # Headers de seguridad
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # CORS headers
    <Location "/api">
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        Header always set Access-Control-Allow-Credentials "true"
        
        # Handle OPTIONS requests
        RewriteEngine On
        RewriteCond %{REQUEST_METHOD} OPTIONS
        RewriteRule ^(.*)$ $1 [R=200,L]
    </Location>
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/controltarefas-error.log
    CustomLog ${APACHE_LOG_DIR}/controltarefas-access.log combined
</VirtualHost>
```

### 7.4. Habilitar el sitio y reiniciar Apache

```bash
sudo a2ensite controltarefas.conf
sudo systemctl restart apache2
```

## 8. Configuración de SSL/TLS con Certbot

### 8.1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-apache
```

### 8.2. Obtener certificado SSL

```bash
sudo certbot --apache -d rexistrodetarefas.iplanmovilidad.com
```

Sigue las instrucciones en pantalla para completar la configuración.

### 8.3. Verificar la renovación automática

```bash
sudo certbot renew --dry-run
```

## 9. Arranque y gestión de los servicios

### 9.1. Construir y iniciar los contenedores Docker

```bash
cd /opt/controltarefas
docker-compose build
docker-compose up -d
```

### 9.2. Verificar el estado de los contenedores

```bash
docker-compose ps
```

### 9.3. Ver logs de los contenedores

```bash
# Ver logs de todos los contenedores
docker-compose logs

# Ver logs de un contenedor específico
docker-compose logs api
docker-compose logs frontend
docker-compose logs postgres
```

### 9.4 Crear un script de arranque automático

```bash
sudo nano /etc/systemd/system/controltarefas.service
```

Contenido:

```ini
[Unit]
Description=Control Tarefas Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/controltarefas
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Habilitar el servicio:

```bash
sudo systemctl enable controltarefas.service
sudo systemctl start controltarefas.service
```

## 10. Comprobación de la instalación

### 10.1. Verificar acceso a la aplicación

Abre un navegador y visita: `https://rexistrodetarefas.iplanmovilidad.com`

### 10.2. Verificar acceso a la API

```bash
curl -k https://rexistrodetarefas.iplanmovilidad.com/api/status
```

Deberías recibir una respuesta JSON indicando que la API está funcionando.

### 10.3. Verificar la conexión a PostgreSQL

```bash
# Entrar al contenedor de PostgreSQL
docker exec -it controltarefas-postgres psql -U task_control -d task_management

# Una vez dentro, ejecutar:
\dt
# Debería mostrar todas las tablas de la base de datos
```

## 11. Respaldo y restauración

### 11.1. Respaldo de la base de datos

Crear un script de respaldo:

```bash
nano /opt/controltarefas/backup.sh
```

Contenido:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/opt/controltarefas/backups"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Realizar backup
docker exec controltarefas-postgres pg_dump -U task_control -d task_management > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Comprimir el backup
gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Eliminar backups antiguos (mantener los últimos 7 días)
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -type f -mtime +7 -delete

echo "Backup completado: $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
```

Hacer el script ejecutable:

```bash
chmod +x /opt/controltarefas/backup.sh
```

Configurar un cron job para backups automáticos:

```bash
sudo crontab -e
```

Añadir la siguiente línea para hacer un backup diario a las 2 AM:

```
0 2 * * * /opt/controltarefas/backup.sh >> /var/log/controltarefas-backup.log 2>&1
```

### 11.2. Restauración de la base de datos

```bash
# Descomprimir el archivo de backup si es necesario
gunzip /opt/controltarefas/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz

# Restaurar la base de datos
cat /opt/controltarefas/backups/db_backup_YYYYMMDD_HHMMSS.sql | docker exec -i controltarefas-postgres psql -U task_control -d task_management
```

## 12. Resolución de problemas comunes

### 12.1. La aplicación no carga

Verificar que todos los contenedores estén en ejecución:

```bash
docker-compose ps
```

Verificar los logs de la aplicación:

```bash
docker-compose logs frontend
```

Verificar que Apache está ejecutándose:

```bash
sudo systemctl status apache2
```

### 12.2. Error de conexión a la API

Verificar los logs de la API:

```bash
docker-compose logs api
```

Comprobar que la API está escuchando en el puerto correcto:

```bash
docker exec controltarefas-api netstat -tulpn | grep 3000
```

### 12.3. Error de conexión a PostgreSQL

Verificar los logs de PostgreSQL:

```bash
docker-compose logs postgres
```

Comprobar que PostgreSQL está escuchando:

```bash
docker exec controltarefas-postgres pg_isready -h localhost -p 5432 -U task_control -d task_management
```

### 12.4. Certificado SSL caducado

Renovar manualmente el certificado:

```bash
sudo certbot renew
```

## 13. Actualización de la aplicación

### 13.1. Actualizar el código fuente

```bash
# Ir al directorio de la aplicación
cd /opt/controltarefas/app

# Si usas git:
git pull

# O si actualizas manualmente:
rsync -avz --exclude 'node_modules' --exclude '.git' ~/control_tarefas_actualizado/ /opt/controltarefas/app/
```

### 13.2. Reconstruir y reiniciar los contenedores

```bash
cd /opt/controltarefas
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 13.3. Verificar la actualización

```bash
# Comprobar que los contenedores están en ejecución:
docker-compose ps

# Ver los logs para detectar posibles errores:
docker-compose logs
```

---

## Apéndice A: Configuración de seguridad

### A.1. Configuración de Firewall (UFW)

```bash
# Instalar UFW si no está instalado
sudo apt install -y ufw

# Permitir SSH (importante hacerlo primero para no perder la conexión)
sudo ufw allow ssh

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar el firewall
sudo ufw enable

# Verificar estado
sudo ufw status
```

### A.2. Configuración de fail2ban para protección SSH

```bash
# Instalar fail2ban
sudo apt install -y fail2ban

# Crear configuración local
sudo nano /etc/fail2ban/jail.local
```

Contenido:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
action = iptables-multiport
logpath = %(sshd_log)s
maxretry = 3
bantime = 86400
```

Reiniciar fail2ban:

```bash
sudo systemctl restart fail2ban
```

## Apéndice B: Monitorización

### B.1. Instalación de herramientas básicas de monitorización

```bash
sudo apt install -y htop iotop sysstat
```

### B.2. Configurar monitorización de disco

```bash
sudo nano /opt/controltarefas/monitor-disk.sh
```

Contenido:

```bash
#!/bin/bash
THRESHOLD=90
USAGE=$(df -h / | grep / | awk '{print $5}' | sed 's/%//')

if [ $USAGE -gt $THRESHOLD ]; then
    echo "Alerta: El uso del disco es de $USAGE%, superando el umbral de $THRESHOLD%" | mail -s "Alerta de espacio en disco en servidor Control Tarefas" admin@example.com
fi
```

Hacer ejecutable y añadir a crontab:

```bash
chmod +x /opt/controltarefas/monitor-disk.sh
sudo crontab -e
# Añadir:
0 * * * * /opt/controltarefas/monitor-disk.sh
```

## Apéndice C: Script de inicialización completo

Este script automatiza gran parte del proceso de instalación:

```bash
sudo nano /opt/controltarefas/setup.sh
```

Contenido:

```bash
#!/bin/bash
# Script de inicialización completa para Control Tarefas
set -e

echo "=== Instalando Control de Tarefas en Producción ==="
echo "Este script configurará todo el entorno necesario."

# Actualizar el sistema
echo "Actualizando el sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Docker y dependencias
echo "Instalando Docker y dependencias..."
sudo apt install -y curl wget gnupg2 apt-transport-https ca-certificates lsb-release software-properties-common
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose

# Configurar usuario para Docker
sudo usermod -aG docker ${USER}

# Instalar Apache y módulos
echo "Instalando Apache y módulos..."
sudo apt install -y apache2
sudo a2enmod proxy proxy_http ssl headers rewrite

# Instalar Certbot
echo "Instalando Certbot..."
sudo apt install -y certbot python3-certbot-apache

# Crear estructura de directorios
echo "Creando estructura de directorios..."
sudo mkdir -p /opt/controltarefas/postgresql/{data,init}
sudo mkdir -p /opt/controltarefas/backups
sudo chmod -R 777 /opt/controltarefas

echo "====================================="
echo "Instalación básica completada."
echo "Para continuar:"
echo "1. Transfiere los archivos de la aplicación a /opt/controltarefas/app/"
echo "2. Configura Docker Compose y los Dockerfiles según el manual"
echo "3. Configura Apache y Certbot para tu dominio"
echo "4. Inicia los contenedores con: cd /opt/controltarefas && docker-compose up -d"
echo "====================================="
```

Hacer el script ejecutable:

```bash
chmod +x /opt/controltarefas/setup.sh
```

## Apéndice D: Recomendaciones de seguridad adicionales

1. **Actualiza regularmente el sistema y los contenedores**
   ```bash
   # Actualizar el sistema
   sudo apt update && sudo apt upgrade
   
   # Actualizar imágenes Docker
   docker-compose pull
   docker-compose up -d
   ```

2. **Habilita autocompletado de actualizaciones de seguridad**
   ```bash
   sudo apt install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. **Configura chequeos regulares de seguridad con Lynis**
   ```bash
   sudo apt install -y lynis
   sudo lynis audit system
   ```

## Apéndice E: Contacto de soporte

Para soporte técnico adicional, contactar con:
- Email: soporte@example.com
- Teléfono: +34 XXXXXXXXX
- Horario: L-V 9:00-18:00

---

*Documento generado en abril de 2025. Última actualización: 02/05/2025*
