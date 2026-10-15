@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Dev Launcher
chcp 65001 >nul
color 0A

echo ===============================================================================
echo     PATROL ^& FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo                       DEVELOPMENT ENVIRONMENT LAUNCHER
echo ===============================================================================
echo.

:: 1. Berpindah ke root folder project ini
cd /d "%~dp0"

:: 2. Periksa ketersediaan Node.js & npm
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan! Silakan install Node.js v20 ke atas terlebih dahulu.
    pause
    exit /b 1
)

:: 3. Periksa status Docker & jalankan container database/Redis
echo [1/4] Memeriksa status Docker engine ^& container infrastruktur...
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

:: 4. Build TypeScript Shared Types (@patrol/types)
echo [2/4] Mengompilasi TypeScript shared types @patrol/types...
call npm run build --workspace=@patrol/types
if %errorlevel% neq 0 (
    echo [ERROR] Gagal mengompilasi @patrol/types!
    pause
    exit /b %errorlevel%
)
echo [OK] Shared types @patrol/types siap digunakan.
echo.

:: 5. Meluncurkan Semua Services dalam Window Terpisah
echo [3/4] Meluncurkan service aplikasi ke terminal interaktif masing-masing...
echo   [*] Backend API Gateway  : Port 3000 (NestJS Fastify + Socket.io)
echo   [*] Web Admin Center     : Port 3001 (Next.js 14)
echo   [*] PWA Field Mobile App : Port 5173 (Vite + React)
echo   [*] Unified Local Gateway: Port 8080 (Single-Port Gateway Hub)
echo.

:: Backend Server
start "Patrol-Backend-3000" cmd /k "title Patrol-Backend-3000 && echo [PATROL BACKEND API :3000] Menjalankan server NestJS... && npm run dev:backend"

:: Web Admin Dashboard
start "Patrol-Admin-3001" cmd /k "title Patrol-Admin-3001 && echo [PATROL WEB ADMIN :3001] Menjalankan server Next.js 14... && npm run dev:admin"

:: PWA Field App
start "Patrol-PWA-5173" cmd /k "title Patrol-PWA-5173 && echo [PATROL PWA FIELD :5173] Menjalankan server Vite PWA... && npm run dev:pwa"

:: Unified Single-Port Gateway
start "Patrol-Gateway-8080" cmd /k "title Patrol-Gateway-8080 && echo [PATROL UNIFIED GATEWAY :8080] Menjalankan gateway satu pintu... && npm run gateway"

echo [4/4] Seluruh service pengembangan berhasil diluncurkan!
echo.
echo ===============================================================================
echo                 DAFTAR AKSES PORTAL (SATU PINTU UTAMA :8080)
echo ===============================================================================
echo   ★ PORTAL INDUK UTAMA        : http://localhost:8080
echo   ★ WEB ADMIN COMMAND CENTER  : http://localhost:8080/admin
echo   ★ PWA FIELD MOBILE APP      : http://localhost:8080/pwa
echo   ★ SMARTPHONE SIMULATOR DEMO : http://localhost:8080/simulator
echo   ★ BACKEND API GATEWAY       : http://localhost:8080/api/v1
echo.
echo   [Port Langsung Masing-masing]
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
pause
