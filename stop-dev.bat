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

echo [1/3] Menutup terminal window service Patrol (Antigravity IDE aman)...
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Backend*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Admin*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Prod*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Gateway*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-PWA*" >nul 2>&1
echo [OK] Jendela terminal service ditutup.
echo.

echo [2/3] Membebaskan port 3000 dan 3001 dari proses latar belakang...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; if ($p -and $p.ProcessName -notlike '*Antigravity*') { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } }" >nul 2>&1

echo [OK] Port 3000 dan 3001 telah dibebaskan secara aman.
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
echo  Antigravity IDE tetap aman dan tidak ikut tertutup.
echo ===============================================================================
echo.
pause
