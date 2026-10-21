const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const cleanNodeContent = `@echo off
setlocal EnableExtensions
title Patrol Management System - Process Cleaner
chcp 65001 >nul
color 0E

echo ===============================================================================
echo     PATROL AND FACILITY MANAGEMENT SYSTEM - PROCESS AND RAM CLEANER
echo ===============================================================================
echo.

echo [1/3] Menghentikan proses terminal service...
taskkill /F /FI "WINDOWTITLE eq Patrol-*" /T >nul 2>&1

echo [2/2] Membebaskan port 3000, 3001, 5173, dan 8080...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo.
echo [OK] Seluruh port dev berhasil dibersihkan dengan aman!
echo RAM sistem telah dipulihkan tanpa mematikan Antigravity IDE.
echo ===============================================================================
`;

const stopDevContent = `@echo off
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
`;

const startDevContent = `@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Patrol Management System - Dev Launcher
chcp 65001 >nul
color 0B

echo ===============================================================================
echo     PATROL AND FACILITY MANAGEMENT SYSTEM (ENTERPRISE IN-HOUSE)
echo                    OPTIMIZED DEV LAUNCHER
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
if not exist "node_modules\\" (
    echo [PERINGATAN] Folder node_modules belum ditemukan!
    echo Menjalankan npm install...
    call npm install
)
echo [OK] Runtime Node.js siap digunakan.
echo.

echo [2/4] Membersihkan proses latar belakang dan port...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
echo [OK] Port telah dibebaskan secara aman.
echo.

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
echo   [4] STOP AND BERSIHKAN SEMUA (Bebaskan Port and RAM)
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
echo [OK] APLIKASI TELAH SIAP DIGUNAKAN!
echo Membuka %TARGET_URL% di browser Anda...
echo ===============================================================================
start %TARGET_URL%
pause
exit /b 0

:do_stop
echo.
call stop-dev.bat
exit /b 0
`;

const startPreviewContent = `@echo off
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
if not exist "packages\\types\\dist\\" (
    echo Mengompilasi @patrol/types...
    call npm run build --workspace=@patrol/types
)
if not exist "apps\\backend\\dist\\" (
    echo Mengompilasi @patrol/backend...
    call npm run build --workspace=@patrol/backend
)
if not exist "apps\\web-admin\\.next\\" (
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
`;

const files = {
  'scripts/clean-node.bat': cleanNodeContent,
  'stop-dev.bat': stopDevContent,
  'start-dev.bat': startDevContent,
  'start-preview.bat': startPreviewContent,
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(root, relPath);
  // Ensure CRLF
  const crlfContent = content.replace(/\r?\n/g, '\r\n');
  fs.writeFileSync(fullPath, crlfContent, { encoding: 'ascii' });
  console.log(`Successfully wrote CRLF ASCII: ${relPath}`);
}
