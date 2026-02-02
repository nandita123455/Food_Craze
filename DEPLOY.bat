@echo off
color 0A
cls
echo.
echo     ====================================================
echo              EVERESTMART PUBLIC DEPLOYMENT
echo     ====================================================
echo.
echo     Your services must be running:
echo       [X] Frontend (Port 5173)
echo       [X] Backend  (Port 5000)
echo       [X] ML Service (Port 8001)
echo.
echo     ====================================================
echo.

:MENU
echo.
echo     Choose deployment method:
echo.
echo     1. ngrok (Recommended - Fastest, Most Reliable)
echo     2. Serveo (Free - No Signup Required)
echo     3. LocalTunnel (Alternative Free Option)
echo     4. View Complete Guide
echo     5. Exit
echo.
set /p choice="     Enter your choice (1-5): "

if "%choice%"=="1" goto NGROK
if "%choice%"=="2" goto SERVEO
if "%choice%"=="3" goto LOCALTUNNEL
if "%choice%"=="4" goto GUIDE
if "%choice%"=="5" goto EXIT

echo     Invalid choice! Please try again.
goto MENU

:NGROK
cls
echo.
echo     ====================================================
echo                    ngrok DEPLOYMENT
echo     ====================================================
echo.
echo     STEP 1: Get ngrok Auth Token
echo     ----------------------------
echo     1. Open: https://dashboard.ngrok.com/signup
echo     2. Sign up (FREE - use Google/GitHub)
echo     3. Copy your authtoken from: 
echo        https://dashboard.ngrok.com/get-started/your-authtoken
echo.
set /p token="     Paste your authtoken here: "

if "%token%"=="" (
    echo     No token provided!
    pause
    goto MENU
)

echo.
echo     Configuring ngrok...
cd c:\Users\drago\OneDrive\Desktop\EverestMart\ngrok
ngrok.exe config add-authtoken %token%

echo.
echo     ====================================================
echo     STEP 2: Starting ngrok Tunnels
echo     ====================================================
echo.
echo     Opening 3 tunnel windows...
echo     Copy the HTTPS URLs from each window!
echo.

start "ngrok - Frontend (SHARE THIS URL!)" cmd /k "cd c:\Users\drago\OneDrive\Desktop\EverestMart\ngrok && ngrok.exe http 5173"
timeout /t 2 >nul

start "ngrok - Backend API" cmd /k "cd c:\Users\drago\OneDrive\Desktop\EverestMart\ngrok && ngrok.exe http 5000"
timeout /t 2 >nul

start "ngrok - ML Service" cmd /k "cd c:\Users\drago\OneDrive\Desktop\EverestMart\ngrok && ngrok.exe http 8001"
timeout /t 2 >nul

echo.
echo     ====================================================
echo                YOUR SITE IS NOW PUBLIC!
echo     ====================================================
echo.
echo     Next Steps:
echo     -----------
echo     1. Copy the 3 HTTPS URLs from the ngrok windows
echo     2. Update .env files:
echo.
echo        Frontend/.env:
echo          VITE_API_URL=https://backend-url.ngrok-free.app/api
echo          VITE_RECOMMENDATION_API_URL=https://ml-url.ngrok-free.app
echo.
echo        Backend/.env:
echo          CLIENT_URL=https://frontend-url.ngrok-free.app
echo.
echo     3. Restart frontend: Ctrl+C then "npm run dev"
echo     4. Share FRONTEND URL with anyone!
echo.
echo     See DEPLOY_NOW.md for detailed instructions.
echo.
pause
goto EXIT

:SERVEO
cls
echo.
echo     ====================================================
echo                   SERVEO DEPLOYMENT
echo     ====================================================
echo.
echo     Starting SSH tunnels (No signup required!)...
echo.

start "Serveo - Frontend" cmd /k "ssh -R 80:localhost:5173 serveo.net"
timeout /t 2 >nul

start "Serveo - Backend" cmd /k "ssh -R 80:localhost:5000 serveo.net"
timeout /t 2 >nul

start "Serveo - ML Service" cmd /k "ssh -R 80:localhost:8001 serveo.net"
timeout /t 2 >nul

echo.
echo     ====================================================
echo                YOUR SITE IS NOW PUBLIC!
echo     ====================================================
echo.
echo     Copy the URLs from each Serveo window
echo     and follow the same .env update steps as ngrok.
echo.
pause
goto EXIT

:LOCALTUNNEL
cls
echo.
echo     ====================================================
echo                LOCALTUNNEL DEPLOYMENT
echo     ====================================================
echo.
echo     Installing LocalTunnel...
call npm install -g localtunnel

echo.
echo     Starting tunnels...
echo.

start "LocalTunnel - Frontend" cmd /k "lt --port 5173"
timeout /t 2 >nul

start "LocalTunnel - Backend" cmd /k "lt --port 5000"
timeout /t 2 >nul

start "LocalTunnel - ML Service" cmd /k "lt --port 8001"
timeout /t 2 >nul

echo.
echo     ====================================================
echo                YOUR SITE IS NOW PUBLIC!
echo     ====================================================
echo.
echo     Copy the URLs and update .env files.
echo.
pause
goto EXIT

:GUIDE
cls
echo.
echo     Opening complete deployment guide...
start DEPLOY_NOW.md
timeout /t 2 >nul
goto MENU

:EXIT
echo.
echo     Thank you for using EverestMart Deployment!
echo     Keep the tunnel windows open to keep your site live.
echo.
pause
exit
