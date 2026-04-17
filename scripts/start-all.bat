@echo off
title FashionEcom — Start All
echo ========================================
echo   FashionEcom — Khoi dong tat ca
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

echo [1/3] Khoi dong MySQL + Redis...
docker compose up -d mysql redis

echo.
echo [2/3] Doi MySQL + Redis healthy...
:wait_loop
docker compose ps --format "table {{.Name}}\t{{.Status}}" 2>nul | findstr /i "healthy" >nul
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto wait_loop
)
echo   MySQL (3309) + Redis (6382) — OK

echo.
echo [3/3] Mo Backend + Frontend trong 2 cua so rieng...
start "FashionEcom Backend" cmd /k "cd /d %~dp0..\backend && npm run start:dev"
start "FashionEcom Frontend" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo.
echo ========================================
echo   MySQL:    localhost:3309
echo   Redis:    localhost:6382
echo   Backend:  http://localhost:4300
echo   Frontend: http://localhost:3300
echo ========================================
echo   Tat ca dang chay trong cac cua so rieng.
echo   Dong cua so nay khong anh huong.
echo ========================================
pause
