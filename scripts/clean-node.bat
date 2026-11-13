@echo off
setlocal EnableExtensions
title Patrol Management System - Process Cleaner
chcp 65001 >nul
color 0E

echo ===============================================================================
echo     PATROL AND FACILITY MANAGEMENT SYSTEM - PROCESS AND RAM CLEANER
echo ===============================================================================
echo.

echo [1/2] Menghentikan terminal service Patrol (Antigravity IDE aman)...
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Backend*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Admin*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Prod*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-Gateway*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq Patrol-PWA*" >nul 2>&1

echo [2/2] Membebaskan port 3000 dan 3001...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000,3001,5173,8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; if ($p -and $p.ProcessName -notlike '*Antigravity*') { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } }" >nul 2>&1

echo.
echo [OK] Seluruh port dev berhasil dibersihkan dengan aman!
echo RAM sistem telah dipulihkan tanpa mematikan Antigravity IDE.
echo ===============================================================================
