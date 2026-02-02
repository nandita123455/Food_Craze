@echo off
echo ============================================
echo Starting EverestMart with Automation
echo ============================================

REM Check if Redis is installed
where redis-server >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Redis not found!
    echo Automation requires Redis to be installed.
    echo.
    echo Quick Install Options:
    echo 1. Chocolatey: choco install redis-64
    echo 2. Manual: Download from https://github.com/microsoftarchive/redis/releases
    echo.
    echo Starting without automation...
    timeout /t 5
) else (
    echo [OK] Redis found, starting Redis server...
    start "Redis Server" redis-server
    timeout /t 2
)

echo.
echo Starting Backend...
cd myshop-backend
start "Backend Server" cmd /k "npm run dev"

timeout /t 3

echo.
echo Starting Frontend...
cd ..\myshop
start "Frontend" cmd /k "npm run dev"

timeout /t 3

echo.
echo Starting Admin Panel...
cd ..\everestmart-admin
start "Admin Panel" cmd /k "npm start"

echo.
echo ============================================
echo All services started!
echo.
echo Backend: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
echo Frontend: http://localhost:5173
echo Admin: http://localhost:3001
echo Redis: localhost:6379
echo.
echo Automation is ACTIVE if Redis is running!
echo ============================================
pause
