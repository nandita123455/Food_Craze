@echo off
echo ============================================
echo   Installing ngrok...
echo ============================================
echo.

echo Downloading ngrok...
powershell -Command "Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile '%TEMP%\ngrok.zip'"

echo Extracting ngrok...
powershell -Command "Expand-Archive -Path '%TEMP%\ngrok.zip' -DestinationPath '%USERPROFILE%\ngrok' -Force"

echo Adding ngrok to PATH...
setx PATH "%PATH%;%USERPROFILE%\ngrok"

echo.
echo ============================================
echo   ngrok installed successfully!
echo ============================================
echo.
echo Please close this window and run:
echo   deploy-public.bat
echo.
pause
