
# Instrucións para resetear a base de datos PostgreSQL

Estes pasos axudarante a borrar todas as táboas existentes e recrealas coa estrutura correcta.

## Opción 1: Usando psql (liña de comandos)

1. Abre unha terminal ou liña de comandos
2. Executa o seguinte comando (axusta os parámetros segundo sexa necesario):

```bash
psql -U postgres -d DBtarefas -p 5433 -f ruta/a/database_reset.sql
```

Onde:
- `-U postgres` é o usuario (reemplaza co usuario administrador)
- `-d DBtarefas` é o nome da base de datos
- `-p 5433` é o porto
- `-f ruta/a/database_reset.sql` é a ruta ao arquivo SQL

## Opción 2: Usando pgAdmin

1. Abre pgAdmin
2. Conéctate ao teu servidor PostgreSQL
3. Selecciona a base de datos "DBtarefas"
4. Fai clic dereito e selecciona "Query Tool"
5. Fai clic no botón "Open File" (ícono de carpeta)
6. Navega e selecciona o arquivo `database_reset.sql`
7. Fai clic no botón "Execute/Refresh" (ícono de Play)

## Opción 3: Usando DBeaver ou outro cliente SQL

1. Conéctate á túa base de datos
2. Abre unha nova consulta SQL
3. Carga o contido do arquivo `database_reset.sql`
4. Executa a consulta

## Despois de restablecer a base de datos

Unha vez que executaras o script:

1. Reinicia o servidor API se está en execución
2. Na aplicación web, vai á sección "Configuración" -> "PostgreSQL"
3. Verifica a conexión co botón "Verificar conexión"
4. Se a conexión é exitosa, fai clic en "Iniciar migración" para migrar os datos
5. Activa a opción "Usar PostgreSQL como almacenamento principal"

Se segues experimentando erros despois deste proceso, verifica:
- Que os datos de conexión sexan correctos (host, porto, nome de base de datos, usuario, contrasinal)
- Que o servidor API estea funcionando correctamente
- Os logs do servidor API para máis detalles sobre os erros
