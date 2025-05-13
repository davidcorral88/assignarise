
@echo off
echo Setting email environment variables...

REM Email server configuration
set EMAIL_USER=atsxptpg_tecnoloxico@iplanmovilidad.com
set EMAIL_PASS=H4.4n0iKuxkA
set EMAIL_SERVER=mail.temagc.com

REM First try port 587 with STARTTLS
set EMAIL_PORT=587
set EMAIL_SECURE=false

REM Frontend URL for links in emails
set FRONTEND_URL=https://rexistrodetarefas.iplanmovilidad.com

echo Email configuration:
echo - Server: %EMAIL_SERVER%
echo - Port: %EMAIL_PORT%
echo - Secure: %EMAIL_SECURE%
echo - User: %EMAIL_USER%
echo - Frontend URL: %FRONTEND_URL%

echo Starting API server on port 3000...
node server.js
