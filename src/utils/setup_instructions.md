
# Instrucciones para configurar la aplicación en producción

## 1. Configuración de la base de datos PostgreSQL

### Requisitos previos
- PostgreSQL instalado (versión 12 o superior)
- Cliente pgAdmin o acceso a la línea de comandos psql

### Pasos para inicializar la base de datos

1. Inicia sesión en PostgreSQL como superusuario (generalmente 'postgres')
2. Crea un nuevo usuario para la aplicación:
   ```sql
   CREATE USER control_de_tarefas WITH PASSWORD 'dc0rralIplan';
   ```

3. Crea una nueva base de datos:
   ```sql
   CREATE DATABASE DBtarefas OWNER control_de_tarefas;
   ```

4. Ejecuta el script de inicialización de la base de datos que se encuentra en `src/utils/database_reset.sql`:
   
   **Usando psql:**
   ```bash
   psql -U postgres -d DBtarefas -p 5433 -f ruta/a/database_reset.sql
   ```
   
   **Usando pgAdmin:**
   1. Abre pgAdmin
   2. Conéctate al servidor PostgreSQL
   3. Selecciona la base de datos "DBtarefas"
   4. Abre la herramienta de consulta (Query Tool)
   5. Carga el archivo SQL y ejecútalo

5. Verifica que las tablas y los usuarios iniciales se han creado correctamente:
   ```sql
   SELECT * FROM users;
   ```
   Deberías ver al menos 5 usuarios incluyendo los usuarios de prueba.

## 2. Configuración del servidor API

1. Verifica que la configuración en `src/utils/dbConfig.ts` coincida con tu configuración de PostgreSQL:
   ```typescript
   export const dbConfig = {
     host: 'localhost',
     port: 5433,  // Ajusta según tu configuración
     database: 'DBtarefas',
     user: 'control_de_tarefas',
     password: 'dc0rralIplan',
   };
   ```

2. Configura y ejecuta el servidor API según las instrucciones en `src/utils/api_server_setup.md`

## 3. Ejecución de la aplicación web

1. Asegúrate de que todas las dependencias están instaladas:
   ```bash
   npm install
   ```

2. Inicia la aplicación en modo de desarrollo:
   ```bash
   npm run dev
   ```

3. Para producción, construye la aplicación:
   ```bash
   npm run build
   ```

4. Sirve la aplicación construida:
   ```bash
   npm run preview
   ```

## 4. Acceso a la aplicación

Una vez que la aplicación esté en funcionamiento, puedes iniciar sesión con cualquiera de los siguientes usuarios:

| Email                     | Rol      |
|---------------------------|----------|
| admin@example.com         | manager  |
| ana.pereira@example.com   | manager  |
| carlos.silva@example.com  | worker   |
| laura.mendez@example.com  | worker   |
| miguel.gonzalez@example.com | worker |

La autenticación está configurada para aceptar cualquier contraseña para estos usuarios de prueba.

## 5. Consideraciones para producción

- Configura un servicio web como Nginx o Apache para servir la aplicación construida
- Implementa seguridad HTTPS para la aplicación web y la API
- Configura copias de seguridad regulares de la base de datos
- Considera la implementación de políticas de contraseñas seguras para entornos de producción
