
# Manual de Reinicio de Control de Tarefas 5

Este manual detalla o procedemento para reiniciar completamente a base de datos "controltarefasv2" e configurala cun único usuario administrador.

## Requisitos Previos

- PostgreSQL instalado e en funcionamento
- Acceso ao servidor PostgreSQL con credenciais de administrador
- Conexión establecida á base de datos

## Procedemento de Reinicio

### 1. Preparación

Asegúrese de ter unha copia de seguridade de calquera dato importante antes de proceder.

### 2. Acceder a PostgreSQL

Acceda ao servidor PostgreSQL:

```bash
# Usando psql coa contrasinal no comando:
psql -U task_control -p 5433 -d controltarefasv2

# Ou usando psql interactivo:
psql -U task_control -p 5433
```

Cando se lle solicite, introduza a contrasinal configurada.

### 3. Executar Script de Reinicio

Unha vez conectado a PostgreSQL, execute o script de reinicio:

```sql
\i /ruta/completa/ao/arquivo/reset_controldetarefas5.sql
```

Alternativamente, pode executar o script desde a liña de comandos:

```bash
psql -U task_control -p 5433 -d controltarefasv2 -f /ruta/completa/ao/arquivo/reset_controldetarefas5.sql
```

### 4. Verificación

Para verificar que o reinicio completouse correctamente, execute:

```sql
SELECT * FROM users;
SELECT * FROM user_passwords;
```

Debería ver un único usuario administrador co correo `admin@ticmoveo.com`.

### 5. Credenciais do Administrador

- **Email**: admin@ticmoveo.com
- **Contrasinal**: dc0rralIplan
- **Rol**: admin

### 6. Notas Importantes

- Este script elimina TODAS as táboas existentes e os seus datos.
- Os novos usuarios deberán ser creados manualmente ou a través da aplicación.
- Os contrasinais almacénanse na táboa `user_passwords` separada dos datos de usuario.
- Non se crean rexistros de exemplo adicionais en ningunha táboa.
- Os IDs de usuarios manéxanse como tipo INTEGER para maior eficiencia e consistencia.
- As asignacións de tarefas (task_assignments) utilizan user_id de tipo INTEGER.
- Os rexistros de tempo (time_entries) aseguran que tanto user_id como task_id son de tipo INTEGER.
- O almacenamento de horas realízase en formato decimal para permitir a entrada e visualización en formato horario HH:MM.

## Estrutura da Base de Datos

A base de datos recén reiniciada contén as seguintes táboas principais:

- `users` - Información de usuarios (ID de tipo INTEGER)
- `user_passwords` - Contrasinais de usuario (separadas por seguridade)
- `tasks` - Tarefas do sistema (ID de tipo INTEGER)
- `task_tags` - Etiquetas de tarefas
- `task_assignments` - Asignacións de tarefas a usuarios (user_id de tipo INTEGER)
- `time_entries` - Rexistros de tempo (user_id e task_id de tipo INTEGER)
- `holidays` - Días festivos
- `vacation_days` - Días de vacacións (user_id de tipo INTEGER)
- `workday_schedules` - Horarios de traballo (user_id de tipo INTEGER)

## Importante para time_entries

Ao crear ou actualizar rexistros de tempo (time_entries), é crucial asegurarse de que:

1. Tanto `task_id` como `user_id` manéxanse sempre como valores INTEGER na base de datos
2. As datas pásanse en formato 'YYYY-MM-DD'
3. As horas almacénanse como valores numéricos (poden ser decimais)
4. O formato de visualización é HH:MM pero almacénase como decimal na base de datos
5. Os IDs dos rexistros son sempre valores numéricos secuenciais

Todas as táboas usan IDs numéricos para maior eficiencia e consistencia.
