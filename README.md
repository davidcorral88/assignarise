
# Rexistro de Tarefas do Plan de Transporte Público de Galicia

## Información do proxecto

Aplicación para o rexistro e seguimento de tarefas e tempo do Plan de Transporte Público de Galicia.

## Requisitos previos

Antes de iniciar a aplicación, asegúrate de ter instalado:

1. **Node.js** (versión 18 ou superior)
2. **PostgreSQL** (versión 14 ou superior)
3. **Servidor API** (para a conexión co PostgreSQL)

## Instrucións para a instalación e execución

### 1. Preparación da base de datos PostgreSQL

1. Crear unha base de datos chamada `DBtarefas` en PostgreSQL:
   ```sql
   CREATE DATABASE "DBtarefas";
   ```

2. Crear un usuario para a aplicación:
   ```sql
   CREATE USER control_de_tarefas WITH PASSWORD 'dc0rralIplan';
   GRANT ALL PRIVILEGES ON DATABASE "DBtarefas" TO control_de_tarefas;
   ```

3. Executar o script de creación de táboas. Este script atópase no repositorio en `src/utils/database_reset.sql`:
   
   Usando psql:
   ```bash
   psql -U postgres -d DBtarefas -p 5433 -f src/utils/database_reset.sql
   ```
   
   Ou podes usar pgAdmin ou calquera outro cliente SQL para executar o contido do arquivo.

### 2. Configuración e inicio do servidor API

A aplicación require dun servidor API que xestione as comunicacións coa base de datos PostgreSQL. Consulta a documentación específica do servidor API para a súa instalación e configuración.

O servidor API debe estar en execución na URL configurada no arquivo `src/utils/dbConfig.ts` (por defecto: `http://localhost:3000/api`).

### 3. Instalación e inicio da aplicación web

```bash
# Clonar o repositorio
git clone https://github.com/TeuUsuario/control_tarefas.git
cd control_tarefas

# Instalar dependencias
npm install

# Iniciar a aplicación en modo desenvolvemento
npm run dev

# Para compilar a aplicación para producción
npm run build

# Para servir a versión compilada
npm run preview
```

### 4. Configuración inicial na aplicación

1. Accede á aplicación no navegador (por defecto: `http://localhost:8080`)
2. Inicia sesión co usuario administrador predeterminado:
   - Email: admin@example.com
   - (En produción, deberías cambiar este usuario inmediatamente)
3. Vai a Configuración > PostgreSQL
4. Verifica a conexión coa base de datos e asegúrate de que o enlace co PostgreSQL estea activo

## Configuración para produción

Para un entorno de produción, revisa e actualiza os seguintes valores:

1. No arquivo `src/utils/dbConfig.ts`:
   - Actualiza os datos de conexión á base de datos
   - Actualiza a URL da API

2. Configura un servidor web (como Nginx ou Apache) para servir os ficheiros compilados da carpeta `dist`

3. Asegúrate de que o servidor API estea correctamente configurado e en execución

## Solución de problemas

Se atopas algún problema ao conectar coa base de datos:

1. Verifica que PostgreSQL estea en execución no porto configurado
2. Comproba que o servidor API estea accesible
3. Revisa os logs da consola do navegador para mensaxes de erro detalladas
4. Comproba a configuración de conexión na sección Configuración > PostgreSQL da aplicación

## Contacto e soporte

Para calquera dúbida ou problema, contacta co equipo de soporte en [correo_de_soporte@exemplo.com]
