@echo off
title FashionEcom — Backend (NestJS :4300)
echo ========================================
echo   FashionEcom — Backend (NestJS)
echo ========================================
echo.

cd /d %~dp0..\backend

:: Kiem tra node_modules
if not exist node_modules (
    echo [1/2] Cai dat dependencies...
    call npm install
) else (
    echo [1/2] Dependencies OK
)

echo [2/2] Khoi dong backend dev server...
echo.
echo   API:  http://localhost:4300
echo   Swagger: http://localhost:4300/api/docs
echo.
echo   Nhan Ctrl+C de dung
echo ========================================
echo.

call npm run start:dev
