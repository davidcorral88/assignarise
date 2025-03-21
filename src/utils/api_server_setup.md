
# API Server Configuration for PostgreSQL Connection

This document details how to configure and run the API server that connects the web application to the PostgreSQL database.

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- PostgreSQL configured and running

## API Server Configuration

### 1. Clone or download the API server repository

```bash
git clone https://github.com/YourUsername/task-control-api.git
cd task-control-api
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project with the following information:

```
# Server configuration
PORT=3000

# PostgreSQL configuration
PGHOST=localhost
PGPORT=5432
PGDATABASE=task_management
PGUSER=task_control
PGPASSWORD=dc0rralIplan

# Other settings
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080
```

Adjust the values according to your specific environment. `CORS_ORIGIN` should point to the URL where the web application is hosted.

### 4. Run the server

For development:
```bash
npm run dev
# or
yarn dev
```

For production:
```bash
npm run build
npm start
# or
yarn build
yarn start
```

The API server should be accessible at `http://localhost:3000` (or the port you've configured).

## Available Endpoints

The API server provides the following main endpoints:

- `GET /api/status` - Check the status of the PostgreSQL connection
- `GET /api/users` - Get all users
- `GET /api/tasks` - Get all tasks
- ... (all endpoints corresponding to system entities)

## Maintenance and Troubleshooting

### Logs

Server logs are saved in the `logs/` folder and also displayed in the console during execution.

### Restarting the server

In production, it's recommended to use a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the server with PM2
pm2 start dist/index.js --name task-control-api

# View logs
pm2 logs task-control-api

# Restart the server
pm2 restart task-control-api
```

### Common issues

1. **PostgreSQL connection error**:
   - Verify that PostgreSQL is running
   - Check the credentials in the `.env` file
   - Verify that the database exists and has the necessary tables

2. **CORS errors**:
   - Make sure that `CORS_ORIGIN` in the `.env` file matches the web application URL

3. **Server not responding**:
   - Check the logs to identify potential errors
   - Verify that the port is not being used by another application

## Updates and Maintenance

To update the API server:

1. Stop the current server
2. Get the latest changes (`git pull` or download the new version)
3. Install dependencies (`npm install` or `yarn install`)
4. Restart the server

## Contact and Support

If you encounter problems or have questions about the API server configuration, contact the support team at [support_email@example.com]
