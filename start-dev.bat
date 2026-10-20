@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Dev Launcher
chcp 65001 >nul
color 0B

echo ===============================================================================
echo     PATROL ^& FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo                    OPTIMIZED DEV LAUNCHER
echo ===============================================================================
echo.

:: 1. Berpindah ke direktori root project
cd /d "%~dp0"

:: 2. Periksa ketersediaan Node.js & npm
echo [1/4] Memeriksa environment Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan! Silakan install Node.js v20 ke atas terlebih dahulu.
    pause
    exit /b 1
)
if not exist "node_modules\" (
    echo [PERINGATAN] Folder node_modules belum ditemukan!
    echo Menjalankan npm install...
    call npm install
)
echo [OK] Runtime Node.js siap digunakan.
echo.

:: 3. Bersihkan sisa proses port dan zombie node.exe dari sesi sebelumnya
echo [2/4] Membersihkan proses latar belakang dan port...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo [OK] Port dan RAM telah dibebaskan sepenuhnya.
echo.

:: 4. Periksa status Docker & jalankan PostgreSQL PostGIS (Redis di-profile opsional)
echo [3/4] Menjalankan database PostgreSQL PostGIS 17 via Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERINGATAN] Docker Desktop belum berjalan atau tidak terdeteksi.
    echo Pastikan Docker Desktop aktif agar PostgreSQL PostGIS dapat berjalan!
    echo.
) else (
    docker compose up -d
    if %errorlevel% equ 0 (
        echo [OK] Container database PostgreSQL PostGIS 17 aktif.
    ) else (
        echo [PERINGATAN] Gagal menjalankan docker compose up. Silakan periksa Docker Anda.
    )
    echo.
)

:: 5. Kompilasi TypeScript Shared Types (@patrol/types)
echo [4/4] Mengompilasi TypeScript shared types @patrol/types...
call npm run build --workspace=@patrol/types
if %errorlevel% neq 0 (
    echo [ERROR] Gagal mengompilasi @patrol/types!
    pause
    exit /b %errorlevel%
)
echo [OK] Shared types @patrol/types siap.
echo.

:: Menu Pilihan Mode Layanan
echo ===============================================================================
echo                PILIH MODE LAYANAN YANG INGIN DIJALANKAN
echo ===============================================================================
echo   [1] WEB ADMIN SAJA (Paling Ringan - Hemat RAM 8 GB)
echo       Hanya menjalankan Backend (:3000) + Next.js Admin (:3001).
echo.
echo   [2] PWA FIELD MOBILE SAJA (Paling Ringan - Hemat RAM 8 GB)
echo       Hanya menjalankan Backend (:3000) + Vite PWA (:5173).
echo.
echo   [3] FULL STACK LENGKAP (Semua Service via Gateway :8080)
echo       Menjalankan Backend (:3000) + Admin (:3001) + PWA (:5173) + Gateway (:8080).
echo.
echo   [4] STOP ^& BERSIHKAN SEMUA (Bebaskan Port ^& RAM)
echo ===============================================================================
set /p MODE="Ketik angka pilihan [1-4] lalu tekan Enter (Default: 1): "

if "%MODE%"=="" set MODE=1
if "%MODE%"=="4" goto do_stop
if "%MODE%"=="2" goto mode_pwa
if "%MODE%"=="3" goto mode_full
goto mode_admin

:mode_admin
echo.
echo -------------------------------------------------------------------------------
echo [MODE 1] Meluncurkan Backend Fastify (:3000) dan Web Admin (:3001)...
echo -------------------------------------------------------------------------------
start "Patrol-Backend-3000" cmd /k "title Patrol-Backend-3000 && echo [BACKEND :3000] Menjalankan NestJS Fastify... && npm run dev:backend"
start "Patrol-Admin-3001" cmd /k "title Patrol-Admin-3001 && echo [WEB ADMIN :3001] Menjalankan Next.js 14 Turbopack... && npm run dev:admin"

set TARGET_PORT=3001
set TARGET_URL=http://localhost:3001
goto wait_and_open

:mode_pwa
echo.
echo -------------------------------------------------------------------------------
echo [MODE 2] Meluncurkan Backend Fastify (:3000) dan PWA Field Mobile (:5173)...
echo -------------------------------------------------------------------------------
start "Patrol-Backend-3000" cmd /k "title Patrol-Backend-3000 && echo [BACKEND :3000] Menjalankan NestJS Fastify... && npm run dev:backend"
start "Patrol-PWA-5173" cmd /k "title Patrol-PWA-5173 && echo [PWA FIELD :5173] Menjalankan Vite React PWA... && npm run dev:pwa"

set TARGET_PORT=5173
set TARGET_URL=http://localhost:5173
goto wait_and_open

:mode_full
echo.
echo -------------------------------------------------------------------------------
echo [MODE 3] Meluncurkan Full Stack (Backend, Admin, PWA, Gateway)...
echo -------------------------------------------------------------------------------
start "Patrol-Backend-3000" cmd /k "title Patrol-Backend-3000 && echo [BACKEND :3000] Menjalankan NestJS Fastify... && npm run dev:backend"
start "Patrol-Admin-3001" cmd /k "title Patrol-Admin-3001 && echo [WEB ADMIN :3001] Menjalankan Next.js 14 Turbopack... && npm run dev:admin"
start "Patrol-PWA-5173" cmd /k "title Patrol-PWA-5173 && echo [PWA FIELD :5173] Menjalankan Vite React PWA... && npm run dev:pwa"
start "Patrol-Gateway-8080" cmd /k "title Patrol-Gateway-8080 && echo [GATEWAY :8080] Menjalankan Gateway Hub... && npm run gateway"

set TARGET_PORT=8080
set TARGET_URL=http://localhost:8080
goto wait_and_open

:wait_and_open
echo.
echo Menunggu server siap di port %TARGET_PORT% (Mencegah Cold Start Freeze)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = %TARGET_PORT%; for ($i = 0; $i -lt 45; $i++) { $tcp = Test-NetConnection -ComputerName '127.0.0.1' -Port $port -WarningAction SilentlyContinue; if ($tcp.TcpTestSucceeded) { Write-Host '[OK] Service siap merespons!'; exit 0 } Start-Sleep -Seconds 1 } exit 1" >nul 2>&1

echo.
echo ===============================================================================
echo 🚀 APLIKASI TELAH SIAP DIGUNAKAN!
echo Membuka %TARGET_URL% di browser Anda...
echo ===============================================================================
start %TARGET_URL%
pause
exit /b 0

:do_stop
echo.
call stop-dev.bat
exit /b 0
