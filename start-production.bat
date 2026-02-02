@echo off
echo ===========================================
echo   EverestMart Production Server Starter
echo ===========================================
echo.

echo Starting Backend API...
start "Backend API" cmd /k "cd /d %~dp0Everestmart\myshop-backend && npm run dev"
timeout /t 3 >nul

echo Starting ML Recommendation Service...
start "ML Service" cmd /k "cd /d %~dp0recommendation-service && python app.py"
timeout /t 3 >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0EverestMart\myshop && npm run dev"
timeout /t 5 >nul

echo.
echo ===================================
echo   All Services Started!
echo ===================================
echo.
echo Local URLs:
echo   Frontend:  http://localhost:5173
echo   Backend:   ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}
echo   ML Service: http://localhost:8001
echo.
echo ===================================
echo   Starting ngrok Tunnels...
echo ===================================
echo.
echo Follow the instructions in PRODUCTION_DEPLOYMENT.md
echo to install ngrok and expose your services publicly.
echo.

choice /c YN /m "Do you want to start ngrok tunnels now? (Y/N)"
if errorlevel 2 goto :END
if errorlevel 1 goto :NGROK

:NGROK
echo.
echo Starting ngrok tunnels...
start "ngrok - Frontend" cmd /k "ngrok http 5173"
timeout /t 2 >nul
start "ngrok - Backend" cmd /k "ngrok http 5000"
timeout /t 2 >nul
start "ngrok - ML Service" cmd /k "ngrok http 8001"

echo.
echo ===================================
echo   ngrok tunnels started!
echo ===================================
echo.
echo Copy the HTTPS URLs from the ngrok windows
echo and update your .env files accordingly.
echo See PRODUCTION_DEPLOYMENT.md for details.
echo.

:END
pause
