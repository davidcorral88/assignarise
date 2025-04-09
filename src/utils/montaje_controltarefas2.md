
# Manual de Instalación e Configuración de ControlTareasV2

Este manual detalla os pasos necesarios para configurar e poñer en marcha a aplicación ControlTareasV2, incluíndo a configuración da nova base de datos PostgreSQL.

## Índice
1. Requisitos previos
2. Configuración da base de datos PostgreSQL
3. Configuración do servidor API
4. Execución da aplicación
5. Resolución de problemas comúns

## 1. Requisitos previos

- Node.js (v18 ou superior)
- PostgreSQL (v14 ou superior)
- Git (para clonar o repositorio)

## 2. Configuración da base de datos PostgreSQL

### 2.1 Crear a nova base de datos

Conectándose ao servidor PostgreSQL existente coas mesmas credenciais da base de datos antiga:

```bash
# Conectar ao servidor PostgreSQL (usando as credenciais existentes)
psql -h localhost -p 5433 -U task_control -d postgres
```

Unha vez conectado, executar os seguintes comandos:

```sql
-- Crear nova base de datos
CREATE DATABASE controltarefasv2;

-- Conectarse á nova base de datos
\c controltarefasv2

-- Saír de PostgreSQL
\q
```

### 2.2 Inicializar a estrutura da base de datos

Executar o script de inicialización da base de datos:

```bash
# Desde o directorio raíz do proxecto
psql -h localhost -p 5433 -U task_control -d controltarefasv2 -f src/utils/controltarefasv2_schema.sql
```

Este script creará todas as táboas necesarias e insertará datos iniciais.

## 3. Configuración do servidor API

### 3.1 Actualizar a configuración da base de datos

O arquivo `src/utils/dbConfig.ts` xa contén a configuración actualizada para conectarse á nova base de datos. Asegúrate de que os seguintes valores estean correctos:

```typescript
// PostgreSQL database connection config
export const dbConfig = {
  host: 'localhost',
  port: 5433,
  database: 'controltarefasv2',  // Nome da nova base de datos
  user: 'task_control',          // Mesmo usuario ca anteriormente
  password: 'dc0rralIplan'       // Mesmo contrasinal ca anteriormente
};
```

### 3.2 Configurar o servidor API

```bash
# Entrar no directorio da API
cd src/api

# Instalar dependencias se non están instaladas
npm install

# Iniciar o servidor API
npm start
```

Alternativamente, podes usar os scripts proporcionados:

- En Windows: `start_server.bat`
- En Linux/Mac: `./start_server.sh`

## 4. Execución da aplicación

### 4.1 Instalar dependencias do frontend

```bash
# Desde o directorio raíz do proxecto
npm install
```

### 4.2 Iniciar a aplicación en modo desenvolvemento

```bash
npm run dev
```

A aplicación estará dispoñible en http://localhost:5173 por defecto.

### 4.3 Construir para produción

```bash
npm run build
```

Os arquivos de produción xeraranse no directorio `dist`.

## 5. Resolución de problemas comúns

### 5.1 Erro de conexión á base de datos

Se atopas erros de conexión á base de datos:

1. Verifica que o servidor PostgreSQL estea en execución no porto 5433
2. Comproba que as credenciais en `dbConfig.ts` sexan correctas
3. Asegúrate de que a base de datos `controltarefasv2` exista

### 5.2 O servidor API non inicia

1. Comproba se hai algún outro servizo utilizando o porto 3000
2. Verifica os logs de erro no terminal onde iniciaches o servidor API
3. Asegúrate de que todas as dependencias estean instaladas correctamente

### 5.3 Problemas de autenticación

A aplicación seguirá utilizando o mesmo sistema de autenticación ca antes, con contrasinal predeterminado `dxm2025` para novos usuarios.

Para calquera problema de autenticación, podes utilizar o usuario administrador predefinido:
- Email: admin@example.com
- Contrasinal: dxm2025

### 5.4 Migración de datos desde a base de datos antiga

Para migrar os datos da base de datos antiga (`task_management_v04`) á nova (`controltarefasv2`):

```bash
# Desde o directorio raíz do proxecto
node src/utils/migrate_data.js
```

Este script copiará todos os datos existentes mantendo a integridade referencial.

## Contacto para soporte

Para calquera problema adicional, contacta co administrador do sistema ou abre un problema no repositorio do proxecto.
