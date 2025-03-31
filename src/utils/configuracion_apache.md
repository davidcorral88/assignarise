# Manual de Configuración de Apache para Registro de Tarefas

Este manual detalla cómo configurar correctamente Apache como servidor proxy inverso para permitir que la aplicación web de Registro de Tarefas se comunique con la API y la base de datos PostgreSQL.

## Índice

1. [Arquitectura general](#arquitectura-general)
2. [Requisitos previos](#requisitos-previos)
3. [Configuración de Apache](#configuración-de-apache)
   - [Instalación de módulos necesarios](#instalación-de-módulos-necesarios)
   - [Configuración del VirtualHost HTTPS](#configuración-del-virtualhost-https)
   - [Configuración del proxy para la API](#configuración-del-proxy-para-la-api)
   - [Configuración de CORS](#configuración-de-cors)
4. [Configuración de la aplicación](#configuración-de-la-aplicación)
   - [Configuración de la URL de la API](#configuración-de-la-url-de-la-api)
5. [Configuración de PostgreSQL](#configuración-de-postgresql)
6. [Pruebas y verificación](#pruebas-y-verificación)
7. [Solución de problemas comunes](#solución-de-problemas-comunes)
8. [Mantenimiento y actualización](#mantenimiento-y-actualización)

## Arquitectura general

La aplicación consta de tres componentes principales:

1. **Frontend (React)**: Ejecutándose en el puerto 5551
2. **API (Node.js)**: Ejecutándose en el puerto 3000
3. **Base de datos (PostgreSQL)**: Ejecutándose en el puerto 5433

Apache actúa como un proxy inverso que dirige las solicitudes entrantes a los servicios adecuados.

```
[Usuario] → HTTPS (443) → [Apache] → [Frontend: Puerto 5551]
                                    → [API: Puerto 3000] → [PostgreSQL: Puerto 5433]
```

## Requisitos previos

- Apache 2.4 o superior instalado
- Módulos de Apache habilitados: proxy, proxy_http, ssl, headers
- Certificados SSL válidos
- Node.js instalado y configurado
- PostgreSQL instalado y configurado

## Configuración de Apache

### Instalación de módulos necesarios

Asegúrate de que los módulos requeridos estén habilitados en Apache:

```bash
# En sistemas basados en Debian/Ubuntu
sudo a2enmod proxy proxy_http ssl headers rewrite

# En sistemas Windows (editar httpd.conf y descomentar estas líneas)
# LoadModule proxy_module modules/mod_proxy.so
# LoadModule proxy_http_module modules/mod_proxy_http.so
# LoadModule ssl_module modules/mod_ssl.so
# LoadModule headers_module modules/mod_headers.so
# LoadModule rewrite_module modules/mod_rewrite.so

# Reiniciar Apache después de habilitar los módulos
# Linux:
sudo systemctl restart apache2
# Windows:
httpd -k restart
```

### Configuración del VirtualHost HTTPS

Crea o modifica el archivo de configuración del VirtualHost para tu dominio (`rexistrodetarefas.iplanmovilidad.com`):

```apache
# VirtualHost para la aplicación web (Frontend)
<VirtualHost *:443>
    ServerName rexistrodetarefas.iplanmovilidad.com
    ServerAdmin admin@example.com
    
    # Configuración SSL/TLS
    SSLEngine on
    SSLCertificateFile "C:/Certbot/live/rexistrodetarefas.iplanmovilidad.com/fullchain.pem"
    SSLCertificateKeyFile "C:/Certbot/live/rexistrodetarefas.iplanmovilidad.com/privkey.pem"
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1 +TLSv1.2 +TLSv1.3
    
    # Configuraciones de seguridad SSL recomendadas
    SSLHonorCipherOrder on
    SSLCompression off
    SSLSessionTickets off
    
    # Configuración del proxy inverso para el frontend
    ProxyPreserveHost On
    ProxyPass / http://localhost:5551/
    ProxyPassReverse / http://localhost:5551/
    
    # Configuración del proxy inverso para la API
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # IMPORTANTE: Proxy para WebSockets (necesario para HMR en desarrollo)
    ProxyPass /ws ws://localhost:8080/ws
    ProxyPassReverse /ws ws://localhost:8080/ws
    
    # Configuraciones de caché y compresión
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>
    
    # Headers de seguridad
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/rexistrodetarefas-error.log
    CustomLog ${APACHE_LOG_DIR}/rexistrodetarefas-access.log combined
</VirtualHost>

# Redirección de HTTP a HTTPS (opcional pero recomendado)
<VirtualHost *:80>
    ServerName rexistrodetarefas.iplanmovilidad.com
    Redirect permanent / https://rexistrodetarefas.iplanmovilidad.com/
</VirtualHost>
```

### Configuración de CORS

Si experimentas problemas de CORS, asegúrate de que Apache permita los encabezados necesarios:

```apache
# Añadir estas líneas dentro del VirtualHost *:443
<Location "/api">
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    Header always set Access-Control-Allow-Credentials "true"
    
    # Manejo de solicitudes OPTIONS (preflight)
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</Location>
```

## Configuración de la aplicación

### Configuración de la URL de la API

Asegúrate de que tu aplicación esté configurada para usar la URL correcta de la API. En el archivo `src/utils/dbConfig.ts`:

```typescript
// API URL that connects to PostgreSQL
// When accessing remotely, use the same domain as the application (HTTPS if the site uses HTTPS)
export const API_URL = typeof window !== 'undefined' ? 
  (window.location.hostname === 'localhost' 
    ? "http://localhost:3000/api"
    : `https://${window.location.hostname}/api`) // Note: No port needed when proxied through Apache
  : "http://localhost:3000/api";
```

### Importante: Configuración de Apache para proxying de la API

Cuando configures Apache como proxy inverso, asegúrate de que las solicitudes a `/api` se redirijan al servidor Node.js correctamente. Con esta configuración, la aplicación web llamará a `https://rexistrodetarefas.iplanmovilidad.com/api` (sin puerto) y Apache redirigirá estas solicitudes a `http://localhost:3000/api`.

## Configuración de PostgreSQL

Para que PostgreSQL acepte conexiones desde la API:

1. Edita el archivo `postgresql.conf`:
   ```
   listen_addresses = 'localhost'    # o '0.0.0.0' para todas las interfaces
   port = 5433                      # Puerto personalizado
   ```

2. Edita el archivo `pg_hba.conf` para permitir conexiones desde la API:
   ```
   # Conexiones locales para el usuario task_control
   host    task_management    task_control    127.0.0.1/32    md5
   host    task_management    task_control    ::1/128         md5
   ```

3. Reinicia PostgreSQL para aplicar los cambios.

## Pruebas y verificación

Después de configurar Apache, realiza las siguientes pruebas:

1. **Acceso al frontend**: Visita `https://rexistrodetarefas.iplanmovilidad.com` en un navegador.
2. **Acceso a la API**: Prueba un endpoint de la API con curl o un navegador, por ejemplo:
   ```
   curl https://rexistrodetarefas.iplanmovilidad.com/api/users
   ```
3. **Prueba de inicio de sesión**: Intenta iniciar sesión con un usuario existente.
4. **Prueba de operaciones CRUD**: Verifica que puedas crear, leer, actualizar y eliminar datos.

## Solución de problemas comunes

### Problemas de conexión con la API

1. Revisa los registros de Apache:
   ```
   tail -f /var/log/apache2/rexistrodetarefas-error.log
   ```

2. Verifica que la API esté en ejecución:
   ```
   curl http://localhost:3000/api/health
   ```

3. Comprueba la configuración del proxy:
   ```
   apache2ctl -t
   ```

### Problemas de CORS

Si ves errores de CORS en la consola del navegador:

1. Verifica que los encabezados de CORS estén configurados correctamente.
2. Asegúrate de que estés usando la URL correcta para la API.
3. Comprueba si hay firewalls o reglas de seguridad que bloqueen las solicitudes.

### Problemas de PostgreSQL

1. Verifica que PostgreSQL esté escuchando en el puerto correcto:
   ```
   netstat -an | grep 5433
   ```

2. Comprueba que el usuario y la base de datos existen:
   ```
   psql -U postgres -c "\l"
   psql -U postgres -c "\du"
   ```

3. Prueba la conexión directamente:
   ```
   psql -U task_control -d task_management -h localhost -p 5433
   ```

## Mantenimiento y actualización

### Actualización de certificados SSL

Los certificados SSL suelen tener una validez limitada. Para renovarlos con Certbot:

```bash
# En Linux
sudo certbot renew

# En Windows
certbot renew
```

### Respaldo de configuraciones

Regularmente haz copias de seguridad de tus configuraciones de Apache:

```bash
# En Linux
sudo cp /etc/apache2/sites-available/rexistrodetarefas.conf /etc/apache2/sites-available/rexistrodetarefas.conf.bak

# En Windows
copy C:\Apache24\conf\extra\httpd-vhosts.conf C:\Apache24\conf\extra\httpd-vhosts.conf.bak
```

### Monitorización

Configura un sistema de monitorización para verificar periódicamente que la aplicación, la API y la base de datos estén funcionando correctamente. Herramientas como Nagios, Zabbix o Prometheus pueden ser útiles para esto.

---

## Notas adicionales

- Esta configuración asume que tanto el frontend como la API se ejecutan en la misma máquina. Si están en máquinas separadas, ajusta las direcciones IP según corresponda.
- Si necesitas balancear carga entre múltiples instancias, considera utilizar Apache con `mod_proxy_balancer` o una solución como NGINX.
- Para entornos de producción críticos, considera implementar redundancia y alta disponibilidad tanto para Apache como para PostgreSQL.

---

Para obtener asistencia adicional, contacta al equipo de soporte técnico o consulta la documentación oficial de Apache y PostgreSQL.
