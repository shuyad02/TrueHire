@echo off
title TrueHire - Launch All Services
color 0B
echo.
echo  =============================================================
echo       TrueHire Platform - Launching All Services (3/3)
echo  =============================================================
echo.
echo  [1/3] Starting AI Service on http://localhost:5000 ...
start "TrueHire AI Service [Port 5000]" cmd /k "cd /d "%~dp0ai-service" && python -m uvicorn main:app --host 0.0.0.0 --port 5000"

timeout /t 3 /nobreak > nul

echo  [2/3] Starting Backend API on http://localhost:4000 ...
start "TrueHire API Server [Port 4000]" cmd /k "cd /d "%~dp0api" && npm run dev"

timeout /t 3 /nobreak > nul

echo  [3/3] Starting Frontend Portal on http://localhost:3000 ...
start "TrueHire Web Portal [Port 3000]" cmd /k "cd /d "%~dp0web" && npm run dev"

echo.
echo  =============================================================
echo       All TrueHire services are now LIVE!
echo  =============================================================
echo.
echo   - Web Frontend  : http://localhost:3000
echo   - Backend API   : http://localhost:4000
echo   - AI Service    : http://localhost:5000
echo.
echo  Do NOT close the opened terminal windows while using TrueHire.
echo.
pause
