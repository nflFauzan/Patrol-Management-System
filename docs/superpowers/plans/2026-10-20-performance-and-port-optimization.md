# Performance, Port Consolidation, and Memory Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate system sluggishness and high resource usage by reclaiming 1.5 GB RAM, optimizing bundle sizes (lazy-loading heavy libraries), disabling unused Redis, providing a selective dev launcher (2 ports vs 6 ports), and eliminating cold-start freezing.

**Architecture:** 
1. Reclaim RAM by terminating orphaned node worker processes and hardening shutdown scripts.
2. Remove Redis container overhead from local Docker environment since backend uses PostgreSQL directly.
3. Optimize Web Admin bundle using `next/dynamic` for heavy client modules (`ExcelJS`, `jsPDF`, `xlsx-js-style`) and enable Next.js Turbopack (`--turbo`).
4. Upgrade `start-dev.bat` with a smart selective launcher (Admin-only mode, PWA-only mode, or Full-stack) with active port-readiness checks before launching the browser.
5. Create a standalone `start-preview.bat` for instant (<50ms) production-grade demos requiring <200MB RAM.

**Tech Stack:** Next.js 14 (Turbopack, dynamic imports), NestJS Fastify, Docker Compose, Windows Batch / PowerShell.

**Spec:** User performance investigation report on Windows 8GB RAM environment.

## Global Constraints
- Preserve single-tenant corporate hierarchy and PostGIS functionality (DoD requirement).
- Zero compilation errors across all workspaces (`@patrol/types`, `@patrol/backend`, `@patrol/web-admin`, `@patrol/pwa-field`).
- Do not break existing API routes or Socket.io real-time SOS alerts.
- Keep backwards-compatibility for existing npm scripts.

## Review Focus
1. Verify `next/dynamic` modals still open correctly without SSR hydration mismatches.
2. Verify PDF and Excel export functions continue working after lazy loading.
3. Ensure PostgreSQL container starts properly when Redis is disabled in Docker Compose.
4. Ensure `start-dev.bat` does not leave dangling node processes when stopped.
5. Ensure browser is opened only when target ports are ready and responding.

---

### Task 1: Reclaim System RAM & Clean Orphaned Node Processes

**Files:**
- Create: `scripts/clean-node.bat`
- Modify: `stop-dev.bat`
- Modify: `start-dev.bat`

- [ ] **Step 1: Create `scripts/clean-node.bat` to terminate orphaned node and dev processes**
  Create a script that forcefully terminates hanging `node.exe` processes spawned by npm/next/nest without affecting system services.
- [ ] **Step 2: Update `stop-dev.bat` to call process cleanup**
  Ensure running `stop-dev.bat` frees all memory and stops all lingering worker processes.
- [ ] **Step 3: Execute cleanup and verify RAM recovery**
  Run cleanup script and verify with PowerShell `(Get-Process node).Count` drops to 0 and free RAM increases.

---

### Task 2: Disable Unused Redis in Docker Compose

**Files:**
- Modify: `docker-compose.yml`
- Modify: `scripts/local-gateway.js`

- [ ] **Step 1: Set Redis to optional/profile mode in `docker-compose.yml`**
  Add `profiles: ["redis"]` or comment out the redis service so `docker compose up -d` only runs PostgreSQL 17 + PostGIS 3.5.
- [ ] **Step 2: Update `scripts/local-gateway.js` healthcheck**
  Remove Redis TCP polling or make it optional so it doesn't cause false offline warnings or wasted TCP connections.
- [ ] **Step 3: Verify PostgreSQL starts and Redis is no longer consuming memory**
  Run `docker compose up -d` and check running containers with `docker ps`.

---

### Task 3: Lazy-Load Heavy Libraries in Web Admin (`GlobalModals` & Exports)

**Files:**
- Modify: `apps/web-admin/src/components/GlobalModals.tsx`
- Modify: `apps/web-admin/src/components/AttendanceMonitoringView.tsx`
- Modify: `apps/web-admin/package.json`
- Modify: `apps/web-admin/next.config.mjs`

- [ ] **Step 1: Convert `GlobalModals.tsx` to use `next/dynamic` for modal components**
  Use `dynamic(() => import(...), { ssr: false })` for `BulkImportModal`, `PrintQrModal`, `BatchPrintQrModal`, and `PrintIdCardModal`. This removes `ExcelJS` from the initial root bundle.
- [ ] **Step 2: Convert `AttendanceMonitoringView.tsx` to lazy load `jspdf` and `xlsx-js-style`**
  Dynamically import `jspdf`, `jspdf-autotable`, and `xlsx-js-style` inside `handleExportPdf` and `handleExportExcel` functions instead of top-level imports.
- [ ] **Step 3: Add Next.js rewrites in `next.config.mjs`**
  Map `/api/:path*` directly to `http://localhost:3000/api/:path*` and `/socket.io/:path*` to `http://localhost:3000/socket.io/:path*`.
- [ ] **Step 4: Enable Turbopack in `apps/web-admin/package.json`**
  Update `"dev"` script to `next dev --turbo -p 3001` or add an optimized script.
- [ ] **Step 5: Run typecheck and build to verify zero compile errors**
  Run `npm run typecheck --workspace=@patrol/web-admin` and verify clean output.

---

### Task 4: Upgrade `start-dev.bat` with Selective Launcher & Smart Port Wait

**Files:**
- Modify: `start-dev.bat`

- [ ] **Step 1: Implement pre-clean check in `start-dev.bat`**
  Ensure any leftover processes from previous crashes are cleaned up before launching new services.
- [ ] **Step 2: Add interactive selection menu**
  - Option 1: Web Admin Mode (Backend + Web Admin only -> 2 ports)
  - Option 2: PWA Mobile Mode (Backend + PWA only -> 2 ports)
  - Option 3: Full Stack Unified Gateway (All services)
  - Option 4: Cleanup & Exit
- [ ] **Step 3: Replace arbitrary 3-second timeout with port readiness polling**
  Poll until target port responds before launching browser, preventing cold start freeze.

---

### Task 5: Create Standalone Ultra-Light Demo Mode (`start-preview.bat`)

**Files:**
- Create: `start-preview.bat`

- [ ] **Step 1: Create `start-preview.bat` script**
  Build production assets once and run Fastify backend directly with Web Admin static assets, running everything on a single port (3000) with minimal RAM (<200MB).
- [ ] **Step 2: Test launching and verify response speed (<50ms) and low RAM consumption**
  Verify opening the app loads instantly without any JIT compilation delays.
