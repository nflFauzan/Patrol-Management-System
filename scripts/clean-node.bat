@echo off
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

echo [2/3] Membebaskan port 3000, 3001, 5173, dan 8080...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [3/3] Membersihkan proses latar belakang node.exe...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo [OK] Seluruh proses Node.js dan port dev berhasil dibersihkan!
echo RAM sistem telah dipulihkan.
echo ===============================================================================
