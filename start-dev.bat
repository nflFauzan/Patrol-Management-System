@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Dev Launcher
chcp 65001 >nul
color 0B

echo ===============================================================================
echo     PATROL AND FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo                       DEV SERVICES LAUNCHER
echo ===============================================================================
echo.

cd /d "%~dp0"

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

echo [2/4] Membersihkan port 3000 dan 3001 dari proses lama...
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Backend*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Admin*" >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; if ($p -and $p.ProcessName -notlike '*Antigravity*') { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } }" >nul 2>&1
echo [OK] Port 3000 dan 3001 telah dibebaskan secara aman.
echo.

echo [3/4] Menjalankan database PostgreSQL PostGIS 17 via Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [PERINGATAN] Docker Desktop belum berjalan atau tidak terdeteksi.
    echo Pastikan Docker Desktop aktif agar PostgreSQL PostGIS dapat berjalan!
    echo.
) else (
    docker compose up -d postgres
    if %errorlevel% equ 0 (
        echo [OK] Container database PostgreSQL PostGIS 17 aktif.
    ) else (
        echo [PERINGATAN] Gagal menjalankan docker compose up postgres.
    )
    echo.
)

echo [4/4] Mengompilasi TypeScript shared types @patrol/types...
call npm run build --workspace=@patrol/types
if %errorlevel% neq 0 (
    echo [ERROR] Gagal mengompilasi @patrol/types!
    pause
    exit /b %errorlevel%
)
echo [OK] Shared types @patrol/types siap.
echo.

echo ===============================================================================
echo     MELUNCURKAN SERVICE BACKEND (:3000) DAN UNIFIED WEB ADMIN DAN FIELD (:3001)
echo ===============================================================================
echo.
start "Patrol-Backend-3000" cmd /k "title Patrol-Backend-3000 && echo [BACKEND :3000] Menjalankan NestJS Fastify... && npm run dev:backend"
start "Patrol-Admin-3001" cmd /k "title Patrol-Admin-3001 && echo [UNIFIED WEB :3001] Menjalankan Next.js 14 Turbopack... && npm run dev:admin"

set TARGET_PORT=3001
set TARGET_URL=http://localhost:3001

echo Menunggu server siap di port %TARGET_PORT%...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = %TARGET_PORT%; for ($i = 0; $i -lt 45; $i++) { $tcp = Test-NetConnection -ComputerName '127.0.0.1' -Port $port -WarningAction SilentlyContinue; if ($tcp.TcpTestSucceeded) { Write-Host '[OK] Service siap merespons!'; exit 0 } Start-Sleep -Seconds 1 } exit 1" >nul 2>&1

echo.
echo ===============================================================================
echo [SUKSES] APLIKASI PATROL MANAGEMENT SYSTEM BERHASIL DIAKTIFKAN!
echo  - Command Center Web Admin : http://localhost:3001
echo  - Aplikasi Mobile Lapangan  : http://localhost:3001/validasi-patroli
echo  - Backend API Fastify      : http://localhost:3000/api/v1
echo ===============================================================================
echo Membuka %TARGET_URL% di browser Anda...
start %TARGET_URL%
echo.
echo Catatan: Untuk menghentikan semua service, silakan jalankan stop-dev.bat
pause
exit /b 0
