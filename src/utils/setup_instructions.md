
# Instrucciones para configurar la aplicación de Control de Tarefas

Este documento contiene instrucciones detalladas para configurar la aplicación correctamente en un entorno de producción.

## 1. Requisitos previos

- PostgreSQL 12 o superior
- Node.js 14 o superior
- Acceso al repositorio del código fuente

## 2. Configuración de la base de datos PostgreSQL

### Paso 1: Crear la base de datos y el usuario

1. Inicia sesión en PostgreSQL como superusuario (normalmente 'postgres')
2. Ejecuta los siguientes comandos SQL:

```sql
CREATE USER task_control WITH PASSWORD 'dc0rralIplan';
CREATE DATABASE task_management OWNER task_control;
```

### Paso 2: Inicializar la base de datos con las tablas y datos base

Ejecuta el script de inicialización ubicado en `src/utils/database_reset.sql`:

**Usando psql:**
```bash
psql -U postgres -d task_management -p 5432 -f C:\Users\administrator\Documents\NODE\CONTROL TAREFAS\control_tarefas\src\utils\database_reset.sql
```

**Usando pgAdmin:**
1. Abre pgAdmin
2. Conéctate al servidor PostgreSQL
3. Selecciona la base de datos "task_management"
4. Abre la herramienta de consultas
5. Carga el archivo SQL y ejecútalo

### Paso 3: Verifica la creación correcta

```sql
SELECT * FROM users;
```

Deberías ver al menos 5 usuarios predefinidos en la tabla.

## 3. Configuración del servidor API

### Paso 1: Configura el archivo dbConfig.ts

Verifica que la configuración en `src/utils/dbConfig.ts` coincida con tu configuración de PostgreSQL:

```typescript
export const dbConfig = {
  host: 'localhost',  // Cambia a la dirección de tu servidor PostgreSQL
  port: 5432,         // Cambia si usas otro puerto
  database: 'task_management',
  user: 'task_control',
  password: 'dc0rralIplan',
};
```

### Paso 2: Configurar y ejecutar el servidor API

Sigue las instrucciones detalladas en `src/utils/api_server_setup.md` para configurar y ejecutar el servidor API que conecta con PostgreSQL.

## 4. Ejecución de la aplicación web

### Paso 1: Instalar dependencias

```bash
cd C:\Users\administrator\Documents\NODE\CONTROL TAREFAS\control_tarefas
npm install
```

### Paso 2: Iniciar la aplicación en modo desarrollo

```bash
npm run dev
```

### Paso 3: Para producción, construir la aplicación

```bash
npm run build
npm run preview
```

## 5. Accediendo a la aplicación

### Usuarios predeterminados para inicio de sesión

La aplicación incluye los siguientes usuarios predeterminados:

| Email                     | Rol      | Contraseña |
|---------------------------|----------|------------|
| admin@example.com         | Gerente  | Cualquiera |
| ana.pereira@example.com   | Gerente  | Cualquiera |
| carlos.silva@example.com  | Trabajador | Cualquiera |
| laura.mendez@example.com  | Trabajador | Cualquiera |
| miguel.gonzalez@example.com | Trabajador | Cualquiera |

Nota: Para fines de demostración, la aplicación aceptará cualquier contraseña para estos usuarios.

## 6. Creación de nuevos usuarios

### Opción 1: A través de la interfaz de usuario

1. Inicia sesión como administrador (admin@example.com)
2. Navega a la sección "Usuarios"
3. Haz clic en "Agregar Usuario"
4. Completa la información requerida

### Opción 2: Directamente en la base de datos

Ejecuta un comando SQL como este:

```sql
INSERT INTO users (id, name, email, role, avatar, active) 
VALUES 
('6', 'Nuevo Usuario', 'nuevo.usuario@example.com', 'worker', 'https://ui-avatars.com/api/?name=Nuevo+Usuario&background=0D8ABC&color=fff', true);
```

## 7. Solución de problemas comunes

### Problema de inicio de sesión

Si tienes problemas para iniciar sesión:

1. Asegúrate de que la aplicación esté configurada para usar PostgreSQL y no el almacenamiento local
2. Verifica que la base de datos PostgreSQL esté funcionando
3. Verifica que las credenciales en `dbConfig.ts` sean correctas
4. Comprueba que el usuario exista en la base de datos:
   ```sql
   SELECT * FROM users WHERE email = 'admin@example.com';
   ```
5. Si el problema persiste, intenta iniciar sesión con un usuario de demostración como fallback

### Configuración del servidor API

Si tienes problemas con el servidor API:

1. Verifica que el servidor API esté en ejecución
2. Comprueba que la URL en `API_URL` en `dbConfig.ts` apunte a la dirección correcta
3. Revisa los logs del servidor API para errores específicos

### Uso en modo local para desarrollo o demostración

Para usar la aplicación sin configurar PostgreSQL, puedes cambiar la aplicación para utilizar almacenamiento local. Esto no se recomienda para producción, pero es útil para desarrollo:

1. Ve a la página de Configuración en la aplicación
2. Cambia de "Usar PostgreSQL" a "Usar almacenamiento local"
3. Los datos se guardarán en el almacenamiento local del navegador

## 8. Contacto y soporte

Si necesitas ayuda adicional o tienes preguntas sobre la configuración, contacta al equipo de soporte en [correo@ejemplo.com]
