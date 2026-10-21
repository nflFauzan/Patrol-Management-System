# Fix Batch Scripts CRLF Encoding & Production Preview Launcher Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix execution failure of `start-preview.bat`, `start-dev.bat`, and `stop-dev.bat` caused by Unix LF line endings in Windows `cmd.exe`, clean ASCII formatting, and ensure both dev and preview launchers start all services reliably.

**Architecture:** 
1. Convert all Windows batch scripts (`*.bat`) to strict Windows CRLF (`\r\n`) line endings with clean ASCII text to eliminate the `cmd.exe` 1-byte seek misalignment bug.
2. Ensure `start-preview.bat` uses canonical npm workspace commands (`npm run start:prod --workspace=@patrol/backend` and `npm run start --workspace=@patrol/web-admin`) instead of ad-hoc paths.
3. Add Docker PostgreSQL readiness polling in both scripts before launching backend, preventing DB connection failures on startup.
4. Verify execution of both batch scripts in clean environments.

**Tech Stack:** Windows Batch (CMD), PowerShell, Node.js 20, Next.js 14, NestJS Fastify, Docker Compose.

**Spec:** User reported: "kok gabisa ya jalankan nya. coba analisis dan buat plan gimana cara memperbaiki nya".

## Global Constraints
- Batch scripts MUST have CRLF (`\r\n`) line endings.
- Do not use multi-byte Unicode/emojis inside `.bat` files to prevent cmd.exe code page encoding conflicts.
- Retain all business scope from AGENTS.md (Single-tenant in-house, PostGIS, no SaaS multi-tenancy).
- Zero compilation errors across all workspaces.

## Review Focus
1. Verify `cmd /c start-dev.bat` parses commands without any `'cho'/'ho'/'d'` truncation errors.
2. Verify `cmd /c start-preview.bat` parses commands and starts production backend and web-admin.
3. Ensure Docker PostgreSQL PostGIS container is verified active before backend initiates connection.
4. Ensure `stop-dev.bat` cleans up all listening ports and node processes.

---

### Task 1: Normalize All Batch Files to CRLF & ASCII

**Files:**
- Modify: `start-dev.bat`
- Modify: `start-preview.bat`
- Modify: `stop-dev.bat`
- Modify: `scripts/clean-node.bat`

- [ ] **Step 1: Write clean CRLF batch file generator script or convert existing files**
  Create a PowerShell normalization step that reads content and writes with `[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::ASCII)` ensuring exact `\r\n` line endings and 0 multi-byte characters.
- [ ] **Step 2: Test syntax parsing with `cmd /c`**
  Run `cmd /c <script.bat>` to verify zero `'cho' is not recognized` or `'tlocal' is not recognized` syntax errors.

---

### Task 2: Fix Service Launch Commands in `start-preview.bat`

**Files:**
- Modify: `start-preview.bat`

- [ ] **Step 1: Use canonical npm workspace scripts**
  - Change backend launch to: `npm run start:prod --workspace=@patrol/backend`
  - Change admin launch to: `npm run start --workspace=@patrol/web-admin`
- [ ] **Step 2: Add database readiness check before launching backend**
  Add a quick loop checking `Test-NetConnection -ComputerName '127.0.0.1' -Port 5432` so backend doesn't launch while PostgreSQL is still initializing.

---

### Task 3: Test and Verify End-to-End Execution

**Files:**
- Verify: `start-dev.bat`
- Verify: `start-preview.bat`
- Verify: `stop-dev.bat`

- [ ] **Step 1: Verify `start-preview.bat` launches and responds at port 3001**
  Verify port 3000 and 3001 listen and return HTTP 200.
- [ ] **Step 2: Verify `stop-dev.bat` terminates all services cleanly**
  Verify ports 3000, 3001, 5173, 8080 are released.
