@echo off
title TrueHire - AI Service
echo.
echo  ============================================
echo   TrueHire AI Service - Starting on :5000
echo  ============================================
echo.
cd /d "%~dp0"
python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload
pause
