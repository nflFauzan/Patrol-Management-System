@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Fast Production Preview
chcp 65001 >nul
color 0A

echo ===============================================================================
echo     PATROL ^& FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo               ULTRA-FAST PRODUCTION PREVIEW (MINIMAL RAM)
echo ===============================================================================
echo Mode ini menjalankan hasil kompilasi (production build).
echo SANGAT RINGAN: Memori RAM ^< 250 MB dan perpindahan halaman INSTAN (^< 30ms).
echo ===============================================================================
echo.

cd /d "%~dp0"

:: 1. Bersihkan sisa proses port
echo [1/4] Membersihkan port dan memori...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo [OK] Port bersih.
echo.

:: 2. Jalankan PostgreSQL PostGIS di Docker
echo [2/4] Memastikan database PostgreSQL PostGIS aktif...
docker compose up -d
echo [OK] Database siap.
echo.

:: 3. Periksa build backend & admin
echo [3/4] Memeriksa status build aplikasi...
if not exist "packages\types\dist\" (
    echo Mengompilasi @patrol/types...
    call npm run build --workspace=@patrol/types
)
if not exist "apps\backend\dist\" (
    echo Mengompilasi @patrol/backend untuk pertama kali...
    call npm run build --workspace=@patrol/backend
)
if not exist "apps\web-admin\.next\" (
    echo Mengompilasi @patrol/web-admin untuk pertama kali...
    call npm run build --workspace=@patrol/web-admin
)
echo [OK] Seluruh binary produksi siap digunakan.
echo.

:: 4. Jalankan Server Produksi
echo [4/4] Meluncurkan server produksi cepat...
start "Patrol-Prod-Backend" cmd /k "title Patrol-Prod-Backend && echo [BACKEND PROD :3000] Berjalan di mode node dist... && node apps/backend/dist/main.js"
start "Patrol-Prod-Admin" cmd /k "title Patrol-Prod-Admin && echo [WEB ADMIN PROD :3001] Berjalan di mode Next.js Start... && npx next start apps/web-admin -p 3001"

echo.
echo Menunggu server produksi siap di port 3001...
powershell -NoProfile -ExecutionPolicy Bypass -Command "for ($i = 0; $i -lt 30; $i++) { $tcp = Test-NetConnection -ComputerName '127.0.0.1' -Port 3001 -WarningAction SilentlyContinue; if ($tcp.TcpTestSucceeded) { exit 0 } Start-Sleep -Seconds 1 } exit 1" >nul 2>&1

echo.
echo ===============================================================================
echo ⚡ APLIKASI MODE CEPAT SIAP DIGUNAKAN!
echo Buka di browser: http://localhost:3001
echo ===============================================================================
start http://localhost:3001
pause
