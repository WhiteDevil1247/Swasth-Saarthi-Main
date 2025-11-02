@echo off
echo ================================
echo SWASTH SAATHI - STARTING ALL SERVICES
echo ================================
echo.

echo [1/3] Starting Backend and Frontend...
start "Backend+Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 5 /nobreak >nul

echo [2/3] Starting AI Service...
start "AI Service" cmd /k "cd /d %~dp0swasthsaathi-backend\ai-service && python app.py"
timeout /t 3 /nobreak >nul

echo [3/3] Opening Website...
timeout /t 5 /nobreak >nul
start http://127.0.0.1:3000

echo.
echo ================================
echo ALL SERVICES STARTED!
echo ================================
echo.
echo Backend:  http://localhost:8083
echo Frontend: http://127.0.0.1:3000
echo AI Service: http://localhost:5001
echo.
echo Press any key to exit this window...
pause >nul
