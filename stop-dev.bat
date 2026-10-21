@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Dev Stopper
chcp 65001 >nul
color 0C

echo ===============================================================================
echo     PATROL AND FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo                    DEV SERVICES SHUTDOWN UTILITY
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Menutup terminal window service Patrol...
taskkill /F /FI "WINDOWTITLE eq Patrol-*" /T >nul 2>&1
echo [OK] Jendela terminal service ditutup.
echo.

echo [2/3] Membebaskan port 3000, 3001, 5173, dan 8080 dari proses latar belakang...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3001 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8080 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [OK] Port 3000, 3001, 5173, dan 8080 telah dibebaskan secara aman.
echo.

echo [3/3] Mematikan container Docker (PostgreSQL PostGIS)...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    docker compose down
    echo [OK] Docker container berhasil dimatikan.
) else (
    echo [INFO] Docker tidak aktif atau tidak berjalan.
)

echo.
echo ===============================================================================
echo  [SELESAI] Seluruh service aplikasi dan database berhasil dimatikan!
echo ===============================================================================
echo.
pause
