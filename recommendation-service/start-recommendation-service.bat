@echo off
setlocal
echo ===================================================
echo   EverestMart Recommendation Service Launcher
echo ===================================================

:: Set Python Path (Using MySQL Shell Python 3.12 as it is compatible)
set "PYTHON_EXE=C:\Program Files\MySQL\MySQL Shell 8.0\lib\Python3.12\Lib\venv\scripts\nt\python.exe"
set "SITE_PACKAGES=%~dp0site-packages"

:: Check if Python exists
if not exist "%PYTHON_EXE%" (
    echo [ERROR] Python not found at: %PYTHON_EXE%
    echo Please install Python 3.10, 3.11, or 3.12 and update this script.
    exit /b 1
)

:: Set PYTHONPATH to include local site-packages
set "PYTHONPATH=%SITE_PACKAGES%;%PYTHONPATH%"

:: Create site-packages directory if not exists
if not exist "%SITE_PACKAGES%" mkdir "%SITE_PACKAGES%"

:: Check for key dependency to skip install
if not exist "%SITE_PACKAGES%\fastapi" (
    echo [INFO] Installing required packages...
    "%PYTHON_EXE%" -m pip install -r "%~dp0requirements.txt" --target="%SITE_PACKAGES%" --trusted-host pypi.org --trusted-host files.pythonhosted.org
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies.
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed.
) else (
    echo [INFO] Dependencies already installed.
)

echo.
echo [INFO] Starting Recommendation Service on port 8001...
"%PYTHON_EXE%" "%~dp0app.py"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Service crashed.
    exit /b 1
)
endlocal
