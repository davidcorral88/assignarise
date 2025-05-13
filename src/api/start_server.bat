
@echo off
echo Setting email environment variables...

REM Email server configuration for Gmail
set EMAIL_USER=iplanmovilidad@gmail.com
set EMAIL_PASS=pvgz mlke rrxw ttqb
set EMAIL_SERVER=smtp.gmail.com

REM Use Gmail with SSL on port 465
set EMAIL_PORT=465
set EMAIL_SECURE=true

REM Frontend URL for links in emails
set FRONTEND_URL=https://rexistrodetarefas.iplanmovilidad.com

echo Email configuration:
echo - Server: %EMAIL_SERVER%
echo - Port: %EMAIL_PORT%
echo - Secure: %EMAIL_SECURE%
echo - User: %EMAIL_USER%
echo - Frontend URL: %FRONTEND_URL%

REM Set NODE_TLS_REJECT_UNAUTHORIZED to 0 only during development to bypass SSL issues
REM IMPORTANT: This should be removed in production!
set NODE_TLS_REJECT_UNAUTHORIZED=0

echo Starting API server on port 3000...
node server.js

