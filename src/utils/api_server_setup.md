
# API Server Setup Instructions

This document explains how to set up and run the API server for the Task Management application.

## Prerequisites

Before starting, make sure you have:

1. **Node.js** installed (v16 or higher)
2. **PostgreSQL** installed and running on port 5433
3. The **task_management** database created
4. The necessary database tables created (see database.sql)

## Installation Steps

1. **Install API Server Dependencies**

   Navigate to the API server directory and install dependencies:

   ```bash
   cd src/api
   npm install
   ```

2. **Configure PostgreSQL**

   Ensure PostgreSQL is running on port 5433. If your PostgreSQL is running on a different port, update the configuration in `server.js`:

   ```javascript
   const pool = new Pool({
     user: 'task_control',
     host: 'localhost',
     database: 'task_management',
     password: 'dc0rralIplan',
     port: 5433, // Change this to your PostgreSQL port if needed
   });
   ```

3. **Create Database and Tables**

   Create the database and necessary tables in PostgreSQL:

   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create the database (if not exists)
   CREATE DATABASE task_management;

   # Create the user with password
   CREATE USER task_control WITH PASSWORD 'dc0rralIplan';

   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE task_management TO task_control;

   # Exit PostgreSQL admin
   \q

   # Connect to the new database with the new user
   psql -U task_control -d task_management -h localhost -p 5433

   # Run the SQL from database.sql file (you can copy-paste it or use:)
   \i /path/to/src/api/database.sql
   ```

   Alternatively, you can run the SQL script directly from the command line:

   ```bash
   psql -U postgres -c "CREATE DATABASE task_management;"
   psql -U postgres -c "CREATE USER task_control WITH PASSWORD 'dc0rralIplan';"
   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE task_management TO task_control;"
   psql -U task_control -d task_management -p 5433 -f src/api/database.sql
   ```

## Running the API Server

1. **Start the API Server**

   From the api directory:

   ```bash
   npm start
   ```

   Or to run in development mode with auto-restart:

   ```bash
   npm run dev
   ```

2. **Verify the Server is Running**

   The server should start and listen on port 3000. You should see:

   ```
   API server running at http://localhost:3000/api
   ```

3. **Test the API Connection**

   Open a browser or use a tool like curl to test the API:

   ```bash
   curl http://localhost:3000/api/status
   ```

   You should receive a JSON response:

   ```json
   {
     "status": "online",
     "message": "API is running",
     "timestamp": "2023-xx-xxTxx:xx:xx.xxxZ"
   }
   ```

## Common Errors and Solutions

### PostgreSQL Connection Issues

1. **Error: Could not connect to database**

   Verify that PostgreSQL is running:

   ```bash
   # Windows
   sc query postgresql

   # Mac/Linux
   systemctl status postgresql
   ```

2. **Error: Password authentication failed**

   Check the credentials in `server.js` and ensure they match your PostgreSQL setup.

3. **Error: Database does not exist**

   Create the database:

   ```sql
   CREATE DATABASE task_management;
   ```

### Port Conflicts

1. **Error: Address already in use**

   If port 3000 is already in use, you can change the port in `server.js`:

   ```javascript
   const port = 3001; // Change to an available port
   ```

## Migrating Data from Local Storage to PostgreSQL

Once the API server is running, you can use the built-in migration feature in the application:

1. Go to the Settings page in the application
2. Navigate to the PostgreSQL tab
3. Enter the API URL: http://localhost:3000/api
4. Click "Verify Connection"
5. If connection is successful, click "Start Migration"

This will transfer all your local data to the PostgreSQL database.

## API Endpoints

The API server provides the following endpoints:

- `GET /api/status` - Check API status
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

And similar endpoints for tasks, time entries, vacations, etc.

For a complete list of endpoints, see the `server.js` file or test the API using a tool like Postman.

## Troubleshooting API Connection

If the front-end application can't connect to the API, verify:

1. CORS is properly configured (the API server includes CORS middleware)
2. The API URL in the application matches the actual API server address
3. No firewall or network restrictions are blocking the connection
4. The API server is running

You can modify the API URL in the application settings if needed.
