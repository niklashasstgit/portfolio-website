@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
if not defined PORT set "PORT=3000"
start http://localhost:%PORT%
call npm run dev -- -p %PORT%
