@echo off
REM ========================================
REM Quixo - Build All Components
REM ========================================
REM This script builds all three components for production deployment

echo.
echo ========================================
echo  Building Quixo for Production
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

REM ========================================
REM 1. BUILD FRONTEND (myshop)
REM ========================================
echo [1/3] Building Frontend (myshop)...
echo ========================================

cd /d "%~dp0myshop"

REM Check if .env.production exists
if not exist ".env.production" (
    echo WARNING: .env.production not found
    echo Creating from .env.production.example...
    if exist ".env.production.example" (
        copy ".env.production.example" ".env.production"
        echo Please edit .env.production with your production URLs
        pause
    ) else (
        echo ERROR: .env.production.example not found
        pause
        exit /b 1
    )
)

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Build
echo Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo ✓ Frontend build complete: myshop\dist
echo.

REM ========================================
REM 2. BUILD ADMIN PANEL (everestmart-admin)
REM ========================================
echo [2/3] Building Admin Panel (everestmart-admin)...
echo ========================================

cd /d "%~dp0everestmart-admin"

REM Check if .env.production exists
if not exist ".env.production" (
    echo WARNING: .env.production not found
    if exist ".env.example" (
        copy ".env.example" ".env.production"
        echo Please edit .env.production with your production URLs
        pause
    )
)

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install admin dependencies
    pause
    exit /b 1
)

REM Build
echo Building admin panel...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Admin panel build failed
    pause
    exit /b 1
)

echo ✓ Admin panel build complete: everestmart-admin\build
echo.

REM ========================================
REM 3. PREPARE BACKEND (myshop-backend)
REM ========================================
echo [3/3] Preparing Backend (myshop-backend)...
echo ========================================

cd /d "%~dp0myshop-backend"

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env not found
    echo Creating from .env.production.example...
    if exist ".env.production.example" (
        copy ".env.production.example" ".env"
        echo Please edit .env with your production configuration
        pause
    ) else (
        echo ERROR: .env.production.example not found
        pause
        exit /b 1
    )
)

REM Install dependencies
echo Installing dependencies...
call npm install --production
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✓ Backend prepared: myshop-backend
echo.

REM ========================================
REM BUILD SUMMARY
REM ========================================
echo ========================================
echo  Build Summary
echo ========================================
echo.
echo ✓ Frontend:     %~dp0myshop\dist
echo ✓ Admin Panel:  %~dp0everestmart-admin\build
echo ✓ Backend:      %~dp0myshop-backend
echo.
echo ========================================
echo  Next Steps
echo ========================================
echo.
echo 1. Review and update environment variables:
echo    - myshop\.env.production
echo    - everestmart-admin\.env.production
echo    - myshop-backend\.env
echo.
echo 2. Deploy frontend: Upload myshop\dist to your hosting
echo 3. Deploy admin: Upload everestmart-admin\build to hosting
echo 4. Deploy backend: Upload myshop-backend folder to server
echo.
echo 5. Start backend in production:
echo    cd myshop-backend
echo    npm start
echo.
echo For detailed deployment instructions, see DEPLOYMENT.md
echo.

pause
