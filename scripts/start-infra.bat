@echo off
title FashionEcom — MySQL + Redis
echo ========================================
echo   FashionEcom — Khoi dong MySQL + Redis
echo ========================================
echo.

cd /d %~dp0..

:: Kiem tra Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo [LOI] Docker chua chay. Hay mo Docker Desktop truoc!
    pause
    exit /b 1
)

echo [1/2] Dang khoi dong MySQL (port 3309) + Redis (port 6382)...
docker compose up -d mysql redis

echo.
echo [2/2] Doi MySQL + Redis san sang...
:wait_loop
docker compose ps --format "table {{.Name}}\t{{.Status}}" 2>nul | findstr /i "healthy" >nul
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto wait_loop
)

echo.
echo ========================================
echo   MySQL:  localhost:3309
echo   Redis:  localhost:6382
echo ========================================
echo   San sang! Co the chay start-backend.bat
echo ========================================
pause
