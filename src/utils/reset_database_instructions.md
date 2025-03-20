
# Instrucciones para resetear la base de datos PostgreSQL

Estos pasos te ayudarán a borrar todas las tablas existentes y recrearlas con la estructura correcta.

## Opción 1: Usando psql (línea de comandos)

1. Abre una terminal o línea de comandos
2. Ejecuta el siguiente comando (ajusta los parámetros según sea necesario):

```bash
psql -U postgres -d DBtarefas -p 5433 -f ruta/a/database_reset.sql
```

Donde:
- `-U postgres` es el usuario (reemplaza con el usuario administrador)
- `-d DBtarefas` es el nombre de la base de datos
- `-p 5433` es el puerto
- `-f ruta/a/database_reset.sql` es la ruta al archivo SQL

## Opción 2: Usando pgAdmin

1. Abre pgAdmin
2. Conéctate a tu servidor PostgreSQL
3. Selecciona la base de datos "DBtarefas"
4. Haz clic derecho y selecciona "Query Tool"
5. Haz clic en el botón "Open File" (ícono de carpeta)
6. Navega y selecciona el archivo `database_reset.sql`
7. Haz clic en el botón "Execute/Refresh" (ícono de Play)

## Opción 3: Usando DBeaver u otro cliente SQL

1. Conéctate a tu base de datos
2. Abre una nueva consulta SQL
3. Carga el contenido del archivo `database_reset.sql`
4. Ejecuta la consulta

## Después de restablecer la base de datos

Una vez que hayas ejecutado el script:

1. Reinicia el servidor API si está en ejecución
2. En la aplicación web, ve a la sección "Configuración" -> "PostgreSQL"
3. Verifica la conexión con el botón "Verificar conexión"
4. Si la conexión es exitosa, haz clic en "Iniciar migración" para migrar los datos
5. Activa la opción "Usar PostgreSQL como almacenamiento principal"

Si sigues experimentando errores después de este proceso, verifica:
- Que los datos de conexión sean correctos (host, puerto, nombre de base de datos, usuario, contraseña)
- Que el servidor API esté funcionando correctamente
- Los logs del servidor API para más detalles sobre los errores
