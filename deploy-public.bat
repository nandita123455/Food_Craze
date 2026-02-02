@echo off
echo ============================================
echo   EverestMart Public Deployment Setup
echo ============================================
echo.
echo This script will make your laptop a public server
echo that anyone can access from anywhere in the world!
echo.
echo ============================================

echo.
echo Step 1: Starting ngrok tunnels...
echo.

echo Starting Frontend tunnel (Port 5173)...
start "ngrok-frontend" cmd /k "ngrok http 5173"
timeout /t 3 >nul

echo Starting Backend tunnel (Port 5000)...
start "ngrok-backend" cmd /k "ngrok http 5000"
timeout /t 3 >nul

echo Starting ML Service tunnel (Port 8001)...
start "ngrok-ml" cmd /k "ngrok http 8001"
timeout /t 3 >nul

echo.
echo ============================================
echo   ngrok Tunnels Started!
echo ============================================
echo.
echo Three new windows have opened showing your public URLs:
echo.
echo 1. Frontend (Share this URL with users!)
echo 2. Backend API
echo 3. ML Recommendation Service
echo.
echo ============================================
echo   IMPORTANT NEXT STEPS:
echo ============================================
echo.
echo 1. Copy the HTTPS URLs from each ngrok window
echo    Example: https://abc123.ngrok-free.app
echo.
echo 2. Update your environment files with these URLs:
echo.
echo    Frontend (.env):
echo      VITE_API_URL=https://YOUR-BACKEND-URL.ngrok-free.app/api
echo      VITE_RECOMMENDATION_API_URL=https://YOUR-ML-URL.ngrok-free.app
echo.
echo    Backend (.env):
echo      CLIENT_URL=https://YOUR-FRONTEND-URL.ngrok-free.app
echo.
echo 3. Restart your frontend (Ctrl+C and npm run dev)
echo.
echo 4. Share the FRONTEND URL with anyone!
echo.
echo ============================================
echo   Your Site is Now PUBLIC!
echo ============================================
echo.
echo Keep all windows open while people are accessing your site.
echo Your laptop is now a public server! 🚀
echo.
pause
