@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Dev Stopper
chcp 65001 >nul
color 0C

echo ===============================================================================
echo     PATROL ^& FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo                       DEV SERVICES SHUTDOWN UTILITY
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Menutup terminal window service Patrol...
taskkill /F /FI "WINDOWTITLE eq Patrol-Backend-3000*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Patrol-Admin-3001*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Patrol-PWA-5173*" /T >nul 2>&1
echo [OK] Jendela terminal service ditutup.
echo.

echo [2/3] Membebaskan port 3000, 3001, dan 5173 dari proses latar belakang...
:: Bebaskan port melalui PowerShell Get-NetTCPConnection
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: Fallback pembersihan via netstat jika terdapat proses tersisa
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3001 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
echo [OK] Port 3000, 3001, dan 5173 telah dibebaskan.
echo.

echo [3/3] Mematikan container Docker (PostGIS 17 ^& Redis 7)...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    docker compose down
    echo [OK] Docker containers berhasil dimatikan.
) else (
    echo [INFO] Docker tidak aktif atau tidak berjalan.
)

echo.
echo ===============================================================================
echo  [SELESAI] Seluruh service aplikasi, database, dan cache berhasil dimatikan!
echo ===============================================================================
echo.
pause
