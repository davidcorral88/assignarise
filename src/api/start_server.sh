
#!/bin/bash

# Set email environment variables
export EMAIL_USER=atsxptpg_tecnoloxico@iplanmovilidad.com
export EMAIL_PASS="H4.4n0iKuxkA"
export EMAIL_SERVER=mail.temagc.com

# Try port 587 with STARTTLS instead of 465 with SSL
export EMAIL_PORT=587
export EMAIL_SECURE=false

# Show configuration
echo "Email configuration:"
echo "- Server: $EMAIL_SERVER"
echo "- Port: $EMAIL_PORT"
echo "- Secure: $EMAIL_SECURE"
echo "- User: $EMAIL_USER"

# Start the API server
echo "Starting API server on port 3000..."
node server.js
