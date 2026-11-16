# IMPLEMENTATION EXECUTION PLAN
> **Patrol & Facility Management System (Enterprise In-House)**  
> **Author**: Lead Software Architect & Engineering Team  
> **Status**: Approved for Autonomous Engineering Execution  
> **Branch**: `feature/patrol-system-improvements`  
> **Date**: 2026-11-16  

---

## 1. Actual System Architecture

The Patrol & Facility Management System is a single-tenant enterprise system deployed across three core operational divisions (Satpam / Security, Cleaning Service, and Driver Logistik) under an integrated monorepo ecosystem.

```
+-------------------------------------------------------------------------------+
|                      ENTERPRISE UNIFIED GATEWAY (:8080)                       |
|           Reverse Proxy: / -> Hub, /admin -> Web Admin, /pwa -> PWA          |
|                   /api/v1 -> Fastify API, /socket.io -> WSS                   |
+------------------------------------+------------------------------------------+
                                     |
         +---------------------------+---------------------------+
         |                                                       |
+--------v-----------------------+             +-----------------v-----------------------+
|  apps/web-admin (Port 3001)    |             |   apps/pwa-field (Port 5173)            |
|  - Next.js 14 App Router       |             |   - Vite 5 + React 18 SPA               |
|  - Tailwind CSS + Skeuomorphism|             |   - Workbox Offline Service Worker      |
|  - Command Center Leaflet Map  |             |   - IndexedDB Offline Transaction Queue |
|  - Dynamic RBAC Management UI  |             |   - Camera (MediaDevices) + QR Scanner  |
|  - Registration Approval Queue |             |   - Unified Session with Admin          |
+--------------------------------+             +-----------------------------------------+
                                 \             /
                                  \           /
                       +-----------v---------v-----------+
                       |    apps/backend (Port 3000)     |
                       |    - NestJS 10 + Fastify 4      |
                       |    - Passport JWT (Dynamic RBAC)|
                       |    - Socket.io (SOS & Radar)    |
                       |    - Redis 7 Cache & Rate Limit |
                       +---------------------+-----------+
                                             |
                       +---------------------v-----------+
                       |    PostgreSQL 17.11 + PostGIS   |
                       |    - 20 Tables + ST_DWithin     |
                       |    - Database: patrol_management|
                       +---------------------------------+
```

---

## 2. Existing Modules & Package Dependencies

1. **`packages/types`** (`@patrol/types`):
   - TypeScript definitions for `User`, `Role`, `Permission`, `Attendance`, `Checkpoint`, `PatrolLog`, `SosEvent`, `OfflineTransaction`.
2. **`apps/backend`** (`@patrol/backend`):
   - Modules: `AuthModule`, `UsersModule`, `AttendanceModule`, `PatrolModule`, `CheckpointsModule`, `CleaningModule`, `DriverModule`, `SosModule`, `BroadcastModule`, `ReportsModule`, `DatabaseModule`.
   - Security: `JwtStrategy`, `PermissionsGuard`, `RolesGuard`.
3. **`apps/web-admin`** (`@patrol/web-admin`):
   - Next.js 14 App Router with 29 routes.
   - Context: `AuthContext` (state hydration, login, logout, permission checks).
   - Layout: `AppSidebar`, `AppNavbar`, `BentoGrid`.
4. **`apps/pwa-field`** (`@patrol/pwa-field`):
   - Vite 5 React SPA with Workbox PWA plugin.
   - Modules: Clock In/Out, Leave, Attendance History, Activity, Patrol Scan, Driver Trip, Reports, Panic SOS.
   - Storage: `idb` IndexedDB integration.
5. **`scripts/local-gateway.js`**:
   - Single-Port Reverse Proxy on port 8080 connecting all services under one origin.

---

## 3. Files & Modules Affected by Each Phase

### Phase 1: Authentication Stabilization
- `apps/backend/src/modules/auth/jwt.strategy.ts`: Join `user_roles` -> `role_permissions` -> `permissions` to attach `user.permissions` to `request.user`. Synchronize `JWT_SECRET` with `JWT_ACCESS_SECRET`.
- `apps/backend/src/modules/auth/auth.module.ts`: Unify JWT secret resolution (`JWT_ACCESS_SECRET` fallback to `JWT_SECRET`).
- `apps/backend/src/modules/auth/auth.service.ts`: Store `requested_role` during registration; do not grant active permissions until approved. Enforce rate limiting and sanitize error messages.
- `apps/web-admin/src/middleware.ts`: Eliminate arbitrary `length > 20` cookie check; check valid session tokens and avoid premature `/login` redirects.
- `apps/web-admin/src/lib/AuthContext.tsx`: Remove `DEMO_ACCOUNTS` fallback and synthetic token generation. Implement real server verification.
- `apps/pwa-field/src/context/AuthContext.tsx`: Create shared PWA auth context that synchronizes session with the unified backend.
- `apps/pwa-field/src/components/ProtectedRoute.tsx`: Wrap operational routes with authentication and permission checks.

### Phase 2: Dynamic RBAC & Backend Authorization
- `apps/backend/src/common/guards/permissions.guard.ts`: Enforce strict permission matching. Protect last active Super Admin. Fail closed on missing/unknown permissions.
- `apps/backend/src/modules/users/roles.service.ts` & `roles.controller.ts`: Create CRUD endpoints for dynamic roles and permission assignment.
- `apps/backend/src/modules/users/users.service.ts`: Ensure role changes invalidate/refresh user sessions and update `user_roles`.
- `apps/backend/src/database/migrations/011_add_portal_permissions_and_requested_role.sql`: Add `ADMIN:DASHBOARD_ACCESS`, `FIELD:DASHBOARD_ACCESS`, and `requested_role` column to `users`.

### Phase 3: Dashboard & Navigation Restructuring
- `apps/web-admin/src/components/layout/AppSidebar.tsx`: Fix "Monitoring Patroli" menu to point to `/laporan/tracking-patroli` (admin monitoring) rather than `/validasi-patroli`.
- `apps/web-admin/src/app/monitoring-patroli/page.tsx`: Ensure administrative monitoring module is accessible and distinct from field PWA.
- `apps/pwa-field/src/pages/DashboardPage.tsx`: Dynamic dashboard responding to current user role and permissions instead of hardcoded mock profile.

### Phase 4: Role Management UI & Approval Workflow
- `apps/web-admin/src/app/datainduk/rbac/page.tsx`: Interactive Role & Permission matrix management UI with confirmation modals.
- `apps/web-admin/src/app/datainduk/approval/page.tsx`: Registration approval queue supporting role editing before final approval, rejection reason, and audit log.

### Phase 5: Offline-First Field PWA
- `apps/pwa-field/src/services/offlineQueue.ts`: IndexedDB transaction queue with idempotency keys, local timestamps, retry backoff, and statuses (`PENDING_OFFLINE`, `SYNCING`, `SYNCED`, `REJECTED`, `NEEDS_REVIEW`).
- `apps/pwa-field/src/services/syncManager.ts`: Automatic sync on network recovery (`navigator.onLine`), manual sync button, and conflict resolution.
- `apps/backend/src/modules/patrol/patrol.service.ts` & `attendance.service.ts`: Support idempotent transaction synchronization and device timestamps.

### Phase 6: Application Cleanup & Routing
- `apps/web-admin/src/field/`: Safely delete redundant field duplicate code after verifying PWA parity.
- `apps/web-admin/src/app/validasi-patroli/`: Redirect cleanly to `/pwa` or gateway route.
- Remove `.php` route aliases from client navigation while preserving legacy QR code redirects.

### Phase 7: Full System Verification
- Unit test suite expansion across all services.
- Integration tests for Auth, RBAC, Approval, and Offline Sync.
- Playwright E2E verification covering Super Admin, Admin, Security, Cleaner, and Driver personas.

---

## 4. Database Migration Dependencies

- **Pre-existing**: `010_rbac_and_approval.sql` (Tables `roles`, `permissions`, `role_permissions`, `user_roles`, `users` audit columns).
- **New Migration**: `011_add_portal_permissions_and_requested_role.sql`:
  1. Add `requested_role VARCHAR(50)` and `requested_division VARCHAR(50)` to `users`.
  2. Add permissions:
     - `ADMIN:DASHBOARD_ACCESS` (Hak Akses Dashboard Web Admin)
     - `FIELD:DASHBOARD_ACCESS` (Hak Akses Dashboard Lapangan PWA)
  3. Map `ADMIN:DASHBOARD_ACCESS` to `ADMIN_SUPER`, `OPS_MANAGER`, `SITE_SUPERVISOR`, `HRD_PAYROLL`.
  4. Map `FIELD:DASHBOARD_ACCESS` to `SECURITY_OFFICER`, `CLEANER`, `DRIVER`, `SITE_SUPERVISOR`.

---

## 5. Implementation Sequence & Execution Gates

```
Phase 1: Auth Stabilization (RED -> GREEN -> VERIFY)
   Gate 1: Zero mock auth, valid JWT verification, auth tests pass
     |
Phase 2: Dynamic RBAC & Authorization (RED -> GREEN -> VERIFY)
   Gate 2: Permission joins active, dynamic role CRUD working, Super Admin protected
     |
Phase 3: Navigation Restructuring (RED -> GREEN -> VERIFY)
   Gate 3: Sidebar fixed, Monitoring Patroli administrative, PWA dynamic
     |
Phase 4: Role UI & Approval Workflow (RED -> GREEN -> VERIFY)
   Gate 4: RBAC management functional, approval queue changes role dynamically
     |
Phase 5: Offline-First PWA (RED -> GREEN -> VERIFY)
   Gate 5: IndexedDB queue active, sync engine idempotent, offline survives refresh
     |
Phase 6: Cleanup & Routing (RED -> GREEN -> VERIFY)
   Gate 6: Duplicates eliminated, no broken imports, clean builds across all 3 apps
     |
Phase 7: Full Verification & E2E Testing (RED -> GREEN -> VERIFY)
   Gate 7: All test suites green, E2E personas verified, security checks pass
```

---

## 6. Testing Strategy

1. **Unit Tests (Jest)**:
   - Auth, JWT Strategy, Permissions Guard, Roles Service, Users Service, Offline Queue logic.
   - Strict Red-Green-Refactor pattern.
2. **Integration Tests (Supertest & Database)**:
   - Real PostgreSQL queries executed against local database container.
   - Tests verify that revoked permissions actually reject HTTP requests with 403 Forbidden.
3. **End-to-End Tests (Playwright)**:
   - Personas: Super Admin, HR Manager, Chief Security, Satpam, Cleaner, Driver, Pending User.
   - Offline PWA scenario: online load -> network disconnect -> offline clock-in -> browser reload -> reconnect -> sync acknowledged.
4. **Security Tests**:
   - Forged JWT rejection, expired session rejection, brute force lockout, IDOR protection, honeypot spam bot trapping.

---

## 7. Rollback Strategy

1. **Database Rollback**:
   - The verified backup `backups/patrol_management_backup_20261116_174238.dump` was tested and successfully restored into a test database.
   - In case of critical corruption, run:
     ```bash
     docker exec patrol_postgres psql -U patrol_admin -d postgres -c "DROP DATABASE patrol_management WITH (FORCE); CREATE DATABASE patrol_management;"
     docker cp backups/patrol_management_backup_20261116_174238.dump patrol_postgres:/tmp/restore.dump
     docker exec patrol_postgres pg_restore -U patrol_admin -d patrol_management --no-owner --no-privileges /tmp/restore.dump
     ```
2. **Code Rollback**:
   - All work is isolated in Git branch `feature/patrol-system-improvements`.
   - Each phase is committed atomically with descriptive commit messages.

---

## 8. Known Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Breaking Existing Token Sessions** | Medium | Provide fallback token compatibility during migration; clear invalid cookies cleanly rather than redirect loops. |
| **PWA Cache Invalidation** | High | Increment PWA Workbox cache version (`cacheId: 'patrol-pwa-v2'`) to ensure clients update service workers immediately. |
| **Super Admin Lockout** | Critical | Database constraint and backend check prevents deleting or deactivating the last active `ADMIN_SUPER` user. |
| **Offline Timestamp Manipulation** | Medium | Server records both `device_timestamp` and `server_received_at`; flag discrepancies greater than 15 minutes for supervisor review. |

---

## 9. Acceptance Criteria

- [x] Phase 0 baseline verified and documented.
- [ ] Phase 1: Authentication stabilized, zero mock fallback, JWT strategy joins permissions.
- [ ] Phase 2: Dynamic RBAC with permission guard and Super Admin protection.
- [ ] Phase 3: Web-admin and PWA navigations cleanly separated.
- [ ] Phase 4: Dynamic role management UI and registration approval queue active.
- [ ] Phase 5: IndexedDB offline transaction queue and idempotent sync engine complete.
- [ ] Phase 6: Duplicated field implementations removed; single source of truth established.
- [ ] Phase 7: All test suites pass, E2E verified, security audit confirmed.
