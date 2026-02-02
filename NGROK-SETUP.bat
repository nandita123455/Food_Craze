@echo off
color 0B
cls
echo.
echo ========================================
echo     NGROK QUICK SETUP - 3 STEPS
echo ========================================
echo.
echo STEP 1: Sign Up for ngrok (FREE)
echo --------------------------------
echo.
echo 1. Open your browser
echo 2. Go to: https://dashboard.ngrok.com/signup
echo 3. Click "Sign up with Google" or "Sign up with GitHub"
echo 4. It takes 30 seconds!
echo.
pause
echo.
echo ========================================
echo STEP 2: Get Your Auth Token
echo ========================================
echo.
echo 1. After signup, you'll see a page with your authtoken
echo 2. OR go to: https://dashboard.ngrok.com/get-started/your-authtoken
echo 3. COPY the token (it looks like: 2abc123def456...)
echo.
set /p token="Paste your authtoken here and press ENTER: "
echo.

if "%token%"=="" (
    echo ERROR: No token provided!
    pause
    exit
)

echo Configuring ngrok with your token...
cd c:\Users\drago\OneDrive\Desktop\EverestMart\ngrok
ngrok.exe config add-authtoken %token%

echo.
echo ========================================
echo STEP 3: Starting Your Public Server
echo ========================================
echo.
echo Opening ngrok tunnel window...
echo YOUR PUBLIC URL will appear in that window!
echo.

start "NGROK - Your Public URL is Here!" cmd /k "cd c:\Users\drago\OneDrive\Desktop\EverestMart\ngrok && ngrok.exe http 5173"

timeout /t 3 >nul

echo.
echo ========================================
echo          SUCCESS!
echo ========================================
echo.
echo Look at the ngrok window that just opened!
echo.
echo You'll see a line like:
echo   Forwarding  https://abc123.ngrok-free.app -^> localhost:5173
echo.
echo THAT HTTPS URL IS YOUR PUBLIC LINK!
echo Share it with anyone in the world!
echo.
echo ========================================
echo.
echo IMPORTANT:
echo - Keep the ngrok window open
echo - Your site stays live as long as it's open
echo - No password needed for visitors!
echo - First visitors might see a brief ngrok warning
echo   (just click Continue)
echo.
echo Want to stop? Close the ngrok window.
echo.
pause
