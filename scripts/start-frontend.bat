@echo off
title FashionEcom — Frontend (Next.js :3300)
echo ========================================
echo   FashionEcom — Frontend (Next.js)
echo ========================================
echo.

cd /d %~dp0..\frontend

:: Kiem tra node_modules
if not exist node_modules (
    echo [1/2] Cai dat dependencies...
    call npm install
) else (
    echo [1/2] Dependencies OK
)

echo [2/2] Khoi dong frontend dev server...
echo.
echo   Web:  http://localhost:3300
echo.
echo   Nhan Ctrl+C de dung
echo ========================================
echo.

call npm run dev
