@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Dev Launcher
chcp 65001 >nul
color 0A

echo ===============================================================================
echo     PATROL ^& FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo                    UNIFIED DEV ENVIRONMENT LAUNCHER
echo ===============================================================================
echo.

:: 1. Berpindah ke direktori root project
cd /d "%~dp0"

:: 2. Periksa ketersediaan Node.js & npm
echo [1/5] Memeriksa environment Node.js...
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

:: 3. Periksa status Docker & jalankan container database/Redis
echo [2/5] Memeriksa status Docker engine ^& container infrastruktur...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERINGATAN] Docker Desktop belum berjalan atau tidak terdeteksi.
    echo Pastikan Docker Desktop aktif agar PostgreSQL PostGIS dan Redis dapat berjalan!
    echo.
) else (
    echo [INFO] Menjalankan PostgreSQL PostGIS 17 dan Redis 7 via Docker Compose...
    docker compose up -d
    if %errorlevel% equ 0 (
        echo [OK] Container database dan cache berhasil dijalankan.
    ) else (
        echo [PERINGATAN] Gagal menjalankan docker compose up. Silakan periksa Docker Anda.
    )
    echo.
)

:: 4. Bersihkan sisa proses port yang mungkin masih menggantung (Pre-Clean)
echo [3/5] Memastikan port 3000, 3001, 5173, dan 8080 bersih...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
echo [OK] Port siap digunakan tanpa konflik.
echo.

:: 5. Build TypeScript Shared Types (@patrol/types)
echo [4/5] Mengompilasi TypeScript shared types @patrol/types...
call npm run build --workspace=@patrol/types
if %errorlevel% neq 0 (
    echo [ERROR] Gagal mengompilasi @patrol/types!
    pause
    exit /b %errorlevel%
)
echo [OK] Shared types @patrol/types berhasil dikompilasi.
echo.

:: 6. Meluncurkan Semua Services ke Window Terminal Masing-Masing
echo [5/5] Meluncurkan service aplikasi dan gateway...
echo   [*] Backend API Gateway  : Port 3000 (NestJS Fastify + Socket.io)
echo   [*] Web Admin Center     : Port 3001 (Next.js 14)
echo   [*] PWA Field Mobile App : Port 5173 (Vite + React)
echo   [*] Unified Local Gateway: Port 8080 (Single-Port Gateway Hub)
echo.

:: Backend Server
start "Patrol-Backend-3000" cmd /k "title Patrol-Backend-3000 && echo [PATROL BACKEND API :3000] Menjalankan server NestJS Fastify... && npm run dev:backend"

:: Web Admin Dashboard
start "Patrol-Admin-3001" cmd /k "title Patrol-Admin-3001 && echo [PATROL WEB ADMIN :3001] Menjalankan server Next.js 14... && npm run dev:admin"

:: PWA Field App
start "Patrol-PWA-5173" cmd /k "title Patrol-PWA-5173 && echo [PATROL PWA FIELD :5173] Menjalankan server Vite PWA... && npm run dev:pwa"

:: Unified Local Gateway (Satu Pintu Port 8080)
start "Patrol-Gateway-8080" cmd /k "title Patrol-Gateway-8080 && echo [PATROL UNIFIED GATEWAY :8080] Menjalankan gateway satu pintu... && npm run gateway"

echo ===============================================================================
echo                 DAFTAR AKSES PORTAL (SATU PINTU UTAMA :8080)
echo ===============================================================================
echo   ★ PORTAL INDUK UTAMA        : http://localhost:8080
echo   ★ WEB ADMIN COMMAND CENTER  : http://localhost:8080/admin
echo   ★ PWA FIELD MOBILE APP      : http://localhost:8080/pwa
echo   ★ SMARTPHONE SIMULATOR DEMO : http://localhost:8080/simulator
echo   ★ BACKEND API GATEWAY       : http://localhost:8080/api/v1
echo.
echo   [Port Internal Tiap Service]
echo   - Web Admin Dev (:3001)     : http://localhost:3001
echo   - PWA Mobile Dev (:5173)    : http://localhost:5173
echo   - Backend Direct (:3000)    : http://localhost:3000/api/v1
echo   - PostgreSQL PostGIS        : localhost:5432 (DB: patrol_management)
echo   - Redis Server              : localhost:6379
echo ===============================================================================
echo.
echo Akun Demo Bawaan: superadmin / chiefsec / danru1 / testi ^| Password: admin123
echo.
echo [PETUNJUK PENGGUNAAN]
echo - Cukup buka http://localhost:8080 di browser Anda untuk mengakses semua fitur.
echo - Jendela terminal tiap service tetap terbuka agar Anda dapat memantau log / hot reload.
echo - Untuk mematikan seluruh service sekaligus, jalankan script: stop-dev.bat
echo.

:: Otomatis buka browser default ke portal satu pintu
echo Membuka portal utama di browser default Anda...
timeout /t 3 >nul 2>&1
start http://localhost:8080

pause
