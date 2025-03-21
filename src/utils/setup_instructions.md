
# Instructions for setting up the application in production

## 1. PostgreSQL Database Configuration

### Prerequisites
- PostgreSQL installed (version 12 or higher)
- pgAdmin or access to psql command line

### Steps to initialize the database

1. Log in to PostgreSQL as superuser (typically 'postgres')
2. Create a new user for the application:
   ```sql
   CREATE USER task_control WITH PASSWORD 'dc0rralIplan';
   ```

3. Create a new database:
   ```sql
   CREATE DATABASE task_management OWNER task_control;
   ```

4. Run the database initialization script located at `src/utils/database_reset.sql`:
   
   **Using psql:**
   ```bash
   psql -U postgres -d task_management -p 5432 -f C:\Users\administrator\Documents\NODE\CONTROL TAREFAS\control_tarefas\src\utils\database_reset.sql
   ```
   
   **Using pgAdmin:**
   1. Open pgAdmin
   2. Connect to the PostgreSQL server
   3. Select the "task_management" database
   4. Open the Query Tool
   5. Load the SQL file and execute it

5. Verify that the tables and initial users have been created correctly:
   ```sql
   SELECT * FROM users;
   ```
   You should see at least 5 users including the test users.

## 2. API Server Configuration

1. Make sure the configuration in `src/utils/dbConfig.ts` matches your PostgreSQL configuration:
   ```typescript
   export const dbConfig = {
     host: 'localhost',
     port: 5432,  // Adjust according to your configuration
     database: 'task_management',
     user: 'task_control',
     password: 'dc0rralIplan',
   };
   ```

2. Configure and run the API server according to the instructions in `src/utils/api_server_setup.md`

## 3. Running the Web Application

1. Make sure all dependencies are installed:
   ```bash
   cd C:\Users\administrator\Documents\NODE\CONTROL TAREFAS\control_tarefas
   npm install
   ```

2. Start the application in development mode:
   ```bash
   npm run dev
   ```

3. For production, build the application:
   ```bash
   npm run build
   ```

4. Serve the built application:
   ```bash
   npm run preview
   ```

## 4. Accessing the Application

Once the application is running, you can log in with any of the following users:

| Email                     | Role      |
|---------------------------|----------|
| admin@example.com         | manager  |
| ana.pereira@example.com   | manager  |
| carlos.silva@example.com  | worker   |
| laura.mendez@example.com  | worker   |
| miguel.gonzalez@example.com | worker |

Authentication is configured to accept any password for these test users.

## 5. Creating New Users

To create new users in the application:

1. Log in using an admin account (like admin@example.com)
2. Navigate to the "Users" section
3. Click on "Add User"
4. Fill in the required information:
   - Name
   - Email (must be unique)
   - Role (manager or worker)
   - Other optional fields

Alternatively, you can add users directly to the database:

```sql
INSERT INTO users (id, name, email, role, avatar, active) 
VALUES 
('6', 'New User', 'new.user@example.com', 'worker', 'https://ui-avatars.com/api/?name=New+User&background=0D8ABC&color=fff', true);
```

## 6. Production Considerations

- Configure a web server like Nginx or Apache to serve the built application
- Implement HTTPS security for both the web application and API
- Set up regular database backups
- Consider implementing secure password policies for production environments

## 7. Troubleshooting

If you encounter issues with logging in:

1. Verify the database connection by checking the application logs
2. Confirm the user exists in the database:
   ```sql
   SELECT * FROM users WHERE email = 'admin@example.com';
   ```
3. Check that the API server is running and accessible
4. Look for errors in the browser console (F12 Developer Tools)
5. Verify the `API_URL` configuration in `src/utils/dbConfig.ts`
