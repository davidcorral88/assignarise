
#!/bin/bash

# Set email environment variables
export EMAIL_USER=iplanmovilidad@gmail.com
export EMAIL_PASS="pvgz mlke rrxw ttqb"
export EMAIL_SERVER=smtp.gmail.com

# Use Gmail with SSL on port 465
export EMAIL_PORT=465
export EMAIL_SECURE=true

# Frontend URL for links in emails
export FRONTEND_URL=https://rexistrodetarefas.iplanmovilidad.com

# Show configuration
echo "Email configuration:"
echo "- Server: $EMAIL_SERVER"
echo "- Port: $EMAIL_PORT"
echo "- Secure: $EMAIL_SECURE"
echo "- User: $EMAIL_USER"
echo "- Frontend URL: $FRONTEND_URL"

# Start the API server
echo "Starting API server on port 3000..."
node server.js
