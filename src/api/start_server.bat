
@echo off
echo Setting email environment variables...

REM Email server configuration
set EMAIL_USER=atsxptpg_tecnoloxico@iplanmovilidad.com
set EMAIL_PASS=H4.4n0iKuxkA
set EMAIL_SERVER=mail.temagc.com

REM Try port 587 with STARTTLS instead of 465 with SSL
set EMAIL_PORT=587
set EMAIL_SECURE=false

echo Email configuration:
echo - Server: %EMAIL_SERVER%
echo - Port: %EMAIL_PORT%
echo - Secure: %EMAIL_SECURE%
echo - User: %EMAIL_USER%

echo Starting API server on port 3000...
node server.js
