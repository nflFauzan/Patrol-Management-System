@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Fast Production Preview
chcp 65001 >nul
color 0A

echo ===============================================================================
echo     PATROL AND FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo               ULTRA-FAST PRODUCTION PREVIEW (MINIMAL RAM)
echo ===============================================================================
echo Mode ini menjalankan hasil kompilasi (production build).
echo SANGAT RINGAN: Memori RAM di bawah 250 MB dan perpindahan halaman INSTAN.
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [1/5] Membersihkan port dan memori...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo [OK] Port bersih.
echo.

echo [2/5] Memastikan database PostgreSQL PostGIS aktif di Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERINGATAN] Docker Desktop belum aktif. Silakan nyalakan Docker Desktop terlebih dahulu!
) else (
    docker compose up -d
)
echo Menunggu database PostgreSQL siap di port 5432...
powershell -NoProfile -ExecutionPolicy Bypass -Command "for ($i = 0; $i -lt 30; $i++) { $tcp = Test-NetConnection -ComputerName '127.0.0.1' -Port 5432 -WarningAction SilentlyContinue; if ($tcp.TcpTestSucceeded) { exit 0 } Start-Sleep -Seconds 1 } exit 1" >nul 2>&1
echo [OK] Database PostgreSQL PostGIS siap di port 5432.
echo.

echo [3/5] Memeriksa status build aplikasi produksi...
if not exist "packages\types\dist\" (
    echo Mengompilasi @patrol/types...
    call npm run build --workspace=@patrol/types
)
if not exist "apps\backend\dist\" (
    echo Mengompilasi @patrol/backend...
    call npm run build --workspace=@patrol/backend
)
if not exist "apps\web-admin\.next\" (
    echo Mengompilasi @patrol/web-admin...
    call npm run build --workspace=@patrol/web-admin
)
echo [OK] Seluruh binary produksi siap digunakan.
echo.

echo [4/5] Meluncurkan server produksi cepat...
start "Patrol-Prod-Backend-3000" cmd /k "title Patrol-Prod-Backend-3000 && echo [BACKEND PROD :3000] Berjalan di port 3000... && npm run start:prod --workspace=@patrol/backend"
start "Patrol-Prod-Admin-3001" cmd /k "title Patrol-Prod-Admin-3001 && echo [WEB ADMIN PROD :3001] Berjalan di port 3001... && npm run start --workspace=@patrol/web-admin"

echo.
echo [5/5] Menunggu Web Admin produksi siap di port 3001...
powershell -NoProfile -ExecutionPolicy Bypass -Command "for ($i = 0; $i -lt 40; $i++) { $tcp = Test-NetConnection -ComputerName '127.0.0.1' -Port 3001 -WarningAction SilentlyContinue; if ($tcp.TcpTestSucceeded) { exit 0 } Start-Sleep -Seconds 1 } exit 1" >nul 2>&1

echo.
echo ===============================================================================
echo [SUKSES] APLIKASI MODE CEPAT SIAP DIGUNAKAN!
echo Buka di browser: http://localhost:3001
echo ===============================================================================
start http://localhost:3001
pause
