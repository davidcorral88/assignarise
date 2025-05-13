
#!/bin/bash

# Set email environment variables
export EMAIL_USER=atsxptpg_tecnoloxico@iplanmovilidad.com
export EMAIL_PASS="H4.4n0iKuxkA"
export EMAIL_SERVER=mail.temagc.com

# First try port 587 with STARTTLS
export EMAIL_PORT=587
export EMAIL_SECURE=false

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
