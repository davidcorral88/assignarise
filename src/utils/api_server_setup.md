
# Configuración del Servidor API para la conexión con PostgreSQL

Este documento detalla cómo configurar y ejecutar el servidor API que conecta la aplicación web con la base de datos PostgreSQL.

## Requisitos previos

- Node.js (versión 14 o superior)
- npm o yarn
- PostgreSQL configurado y en ejecución

## Configuración del servidor API

### 1. Clonar o descargar el repositorio del servidor API

```bash
git clone https://github.com/TuUsuario/control-tarefas-api.git
cd control-tarefas-api
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente información:

```
# Configuración del servidor
PORT=3000

# Configuración de PostgreSQL
PGHOST=localhost
PGPORT=5433
PGDATABASE=DBtarefas
PGUSER=control_de_tarefas
PGPASSWORD=dc0rralIplan

# Otros ajustes
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080
```

Ajusta los valores según tu entorno específico. `CORS_ORIGIN` debe apuntar a la URL donde se aloja la aplicación web.

### 4. Ejecutar el servidor

Para desarrollo:
```bash
npm run dev
# o
yarn dev
```

Para producción:
```bash
npm run build
npm start
# o
yarn build
yarn start
```

El servidor API debería estar accesible en `http://localhost:3000` (o el puerto que hayas configurado).

## Endpoints disponibles

El servidor API proporciona los siguientes endpoints principales:

- `GET /api/status` - Verifica el estado de la conexión a PostgreSQL
- `GET /api/users` - Obtiene todos los usuarios
- `GET /api/tasks` - Obtiene todas las tareas
- ... (todos los endpoints correspondientes a las entidades del sistema)

## Mantenimiento y solución de problemas

### Registros (logs)

Los registros del servidor se guardan en la carpeta `logs/` y también se muestran en la consola durante la ejecución.

### Reinicio del servidor

En producción, se recomienda usar un gestor de procesos como PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar el servidor con PM2
pm2 start dist/index.js --name control-tarefas-api

# Ver logs
pm2 logs control-tarefas-api

# Reiniciar el servidor
pm2 restart control-tarefas-api
```

### Solución de problemas comunes

1. **Error de conexión a PostgreSQL**:
   - Verifica que PostgreSQL esté en ejecución
   - Comprueba las credenciales en el archivo `.env`
   - Verifica que la base de datos exista y tenga las tablas necesarias

2. **Errores CORS**:
   - Asegúrate de que `CORS_ORIGIN` en el archivo `.env` coincida con la URL de la aplicación web

3. **El servidor no responde**:
   - Verifica los logs para identificar posibles errores
   - Comprueba que el puerto no esté siendo utilizado por otra aplicación

## Actualizaciones y mantenimiento

Para actualizar el servidor API:

1. Detén el servidor actual
2. Obtén los últimos cambios (`git pull` o descarga la nueva versión)
3. Instala las dependencias (`npm install` o `yarn install`)
4. Reinicia el servidor

## Contacto y soporte

Si encuentras problemas o tienes preguntas sobre la configuración del servidor API, contacta con el equipo de soporte en [correo_de_soporte@ejemplo.com]
