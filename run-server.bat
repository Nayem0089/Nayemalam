@echo off
title WARZONE OFFICIAL - ESPORTS TOURNAMENT STANDINGS MANAGER
cd /d "%~dp0"

echo ==========================================================
echo  WARZONE OFFICIAL - ESPORTS TOURNAMENT STANDINGS MANAGER
echo ==========================================================
echo Starting local standings server...
echo URL: http://localhost:8080/index.html
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Node.js detected. Running Node Express SQLite server...
    cd server
    if not exist node_modules (
        echo Installing dependencies...
        call npm install
    )
    call npm start
) else (
    echo Node.js not found in PATH. Using built-in Windows Standalone Server...
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-server.ps1"
)

pause
