
# API Server for Task Management

This API server provides endpoints to interact with the PostgreSQL database for the task management application.

## Prerequisites

- Node.js (v18+)
- PostgreSQL server running on port 5433
- Database 'task_management' created
- User 'task_control' with proper permissions

## Setup and Installation

1. Navigate to the API server directory:
   ```
   cd src/api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the API server:
   ```
   node server.js
   ```

The server will start on port 3000 and provide the following endpoints:

- `GET /api/status` - Check API status
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user
- ... and similar endpoints for tasks, time_entries, etc.

## Database Connection

The API server connects to PostgreSQL using the following configuration:
- Host: localhost
- Port: 5433
- Database: task_management
- User: task_control
- Password: dc0rralIplan

## Testing the API

You can test the API using tools like Postman or cURL:

```bash
# Check API status
curl http://localhost:3000/api/status

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1
```

## Troubleshooting

If you encounter issues, check the following:

1. Ensure PostgreSQL is running on port 5433
2. Verify the database 'task_management' exists
3. Confirm the user 'task_control' has proper permissions
4. Check server logs for specific error messages
```
