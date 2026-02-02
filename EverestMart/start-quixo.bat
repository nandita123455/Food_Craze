@echo off
echo ========================================
echo  Quixo - Starting Frontend + Backend
echo ========================================
echo.

REM Start backend server in a new window
echo Starting Backend Server on ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}...
start "Quixo Backend" cmd /k "cd /d %~dp0myshop-backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in a new window
echo Starting Frontend on http://localhost:5173...
start "Quixo Frontend" cmd /k "cd /d %~dp0myshop && npm run dev"

echo.
echo ========================================
echo  Both servers are starting!
echo ========================================
echo  Backend:  ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
echo  Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul
