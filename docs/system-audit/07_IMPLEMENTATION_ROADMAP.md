# 07 — IMPLEMENTATION ROADMAP & PHASED EXECUTION PLAN (REVISED)
> **Patrol & Facility Management System (Enterprise In-House / Single-Tenant)**  
> Architecture Decision: Option B (Single-Origin Reverse Proxy, Distinct Frontends, Elimination of Duplicate Field Code)  
> Document Version: 2.0.0 — Status: Revised for Final Review

---

## 1. Engineering Governance & Implementation Prerequisites

In strict accordance with enterprise standards and `AGENTS.md`, implementation is governed by the following prerequisites:

### 1.1 Pre-Implementation Baseline Verification
Prior to writing or modifying any source code:
1. **Source Code Baseline Archive**:
   A clean git branch `feature/unified-architecture-revised` must be branched from `main`. A full source archive snapshot is saved:
   ```bash
   git checkout -b feature/unified-architecture-revised
   git status
   ```
2. **Database Backup**:
   Full schema and data dump of the live PostgreSQL container:
   ```bash
   docker exec -t postgres_container pg_dump -U postgres -d patrol_db --format=custom > backup_baseline_pre_phase1.dump
   ```
3. **Automated Baseline Verification**:
   - `npm run typecheck --workspace=@patrol/web-admin` (Pass: 0 errors).
   - `npm run test --workspace=@patrol/backend` (Pass: 15/15 test suites, 109/109 tests).
   - `node scripts/check-db.js` & `node scripts/check-rbac-db.js` (Pass: DB connection active).

### 1.2 Definition of Done (DoD) per Phase
Every phase is **independently testable** and must satisfy the 4 DoD criteria before moving to the next phase:

```
[Phase Tasks] ➔ [TypeScript Typecheck] ➔ [Unit & Logic Spec Test] ➔ [Live PostGIS DB Verify] ➔ [Phase Sign-Off]
```

No phase may claim success without concrete terminal output evidence.

---

## 2. Phased Implementation Roadmap Overview

```
[ Phase 1: Authentication & Edge Middleware Stabilization ] (P0)
                          │
                          ▼
[ Phase 2: Dynamic RBAC Backend & Guard Repair ] (P0 / P1)
                          │
                          ▼
[ Phase 3: Admin Navigation & Patrol Monitoring Integration ] (P1)
                          │
                          ▼
[ Phase 4: Dynamic RBAC Management Portal UI & Approval Flow ] (P1)
                          │
                          ▼
[ Phase 5: Offline-First IndexedDB Queue & Idempotency Engine ] (P0 / P1)
                          │
                          ▼
[ Phase 6: Codebase Unification (Option B) & Clean Semantic Routing ] (P1 / P2)
                          │
                          ▼
[ Phase 7: Comprehensive Regression Verification & DoD Sign-Off ] (All)
```

---

## 3. Phased Task Breakdown & Execution Specifications

### Phase 1: Authentication & Edge Middleware Stabilization
- **Primary Objective**: Fix premature login redirection, eliminate unverified cookie checks, remove client-side mock account fallbacks, and secure the public registration endpoint.
- **Scope**:
  - Refactor `apps/web-admin/src/middleware.ts` to decode JWT expiration and remove `/validasi-patroli` from `isPublicRoute`.
  - Update `apps/web-admin/src/app/login/page.tsx` and `AdminLoginPage.tsx` so the login form is always accessible, providing a clean account switch option if an active session exists.
  - Remove the client-side mock login fallback (`DEMO_ACCOUNTS.find(...)`) in `AuthContext.tsx`.
  - Add rate limiting (`@Throttle({ default: { limit: 5, ttl: 60000 } })`) to `POST /api/v1/auth/register` in backend.
- **Files Affected**:
  - `apps/web-admin/src/middleware.ts`
  - `apps/web-admin/src/app/login/page.tsx`
  - `apps/web-admin/src/components/AdminLoginPage.tsx`
  - `apps/web-admin/src/lib/AuthContext.tsx`
  - `apps/backend/src/modules/auth/auth.controller.ts`
- **Dependencies**: None.
- **Rollback Procedure**: Revert modified files via `git checkout` on the affected paths.
- **Testing Requirements**:
  - Access `http://localhost:3001/login`: Credential form must render cleanly.
  - Submit invalid credentials: Error alert must display.
  - Attempt login with unapproved account: HTTP 403 Forbidden with exact queue message must display.
  - Unauthenticated access to `/validasi-patroli/clock-in`: Redirects to `/login`.
- **Completion Criteria**: Zero login bypasses; unapproved users strictly blocked; login form always functional.

---

### Phase 2: Dynamic RBAC Backend & Guard Repair
- **Primary Objective**: Repair `JwtStrategy.validate()` to load dynamic permissions, complete CRUD endpoints in `RbacController`, execute database migration `011`, synchronize `users.role` with `user_roles`, and implement the Super Admin anti-lockout safeguard.
- **Scope**:
  - Update `apps/backend/src/modules/auth/jwt.strategy.ts` to join `user_roles`, `roles`, `role_permissions`, and `permissions`, attaching `user.permissions: string[]`.
  - Execute SQL migration `011_target_architecture_sync.sql` (adds `requested_role_id`, idempotency keys, anti-lockout trigger, sync trigger, interface permissions `admin.dashboard.access` and `field.dashboard.access`).
  - Implement missing endpoints in `RbacController`: `PUT /rbac/roles/:id`, `DELETE /rbac/roles/:id`, `PUT /rbac/roles/:id/permissions`, and `POST /rbac/users/:id/roles`.
  - Update `UsersService.update` to keep `users.role` and `user_roles` synchronized.
- **Files Affected**:
  - `apps/backend/src/modules/auth/jwt.strategy.ts`
  - `apps/backend/src/modules/users/rbac.controller.ts`
  - `apps/backend/src/modules/users/users.service.ts`
  - `apps/backend/src/database/migrations/011_target_architecture_sync.sql`
- **Dependencies**: Phase 1.
- **Rollback Procedure**: Execute SQL rollback script dropping newly added columns/triggers, revert backend service modifications.
- **Testing Requirements**:
  - Unit tests verifying `JwtStrategy` returns populated permissions array.
  - Test calling permission-protected endpoints with a non-admin role: must succeed if permission assigned, fail with 403 if omitted.
  - Attempt to delete or deactivate the sole remaining `ADMIN_SUPER`: database trigger must abort with error.
- **Completion Criteria**: All dynamic permissions correctly evaluated on every request; anti-lockout verified in live DB.

---

### Phase 3: Administrative Navigation & Patrol Monitoring Integration
- **Primary Objective**: Correct the sidebar navigation, mount the unmounted 24-hour patrol matrix, and eliminate hardcoded `localhost:3000` URLs across all administrative views.
- **Scope**:
  - Create new page `apps/web-admin/src/app/monitoring-patroli/page.tsx` mounting `HourlyPatrolMatrixTab.tsx`.
  - Update `AppSidebar.tsx` to link "Monitoring Patroli" to `/monitoring-patroli`.
  - Refactor all 26 instances of `http://localhost:3000` in `apps/web-admin/src/components/*` and `lib/DataContext.tsx` to use relative API paths (`/api/v1/...`).
- **Files Affected**:
  - `apps/web-admin/src/components/layout/AppSidebar.tsx`
  - `apps/web-admin/src/app/monitoring-patroli/page.tsx` (New file)
  - 26 components in `apps/web-admin/src/components/`
- **Dependencies**: Phase 1, Phase 2.
- **Rollback Procedure**: Restore previous `AppSidebar.tsx` and delete `monitoring-patroli/page.tsx`.
- **Testing Requirements**:
  - Click "Monitoring Patroli" in sidebar: page opens showing 24-hour matrix.
  - Verify CSV export of hourly patrol matrix.
  - Verify zero `localhost:3000` network requests in browser Network tab when accessing via port 8080 or LAN IP.
- **Completion Criteria**: Admin patrol monitoring works seamlessly; no hardcoded host addresses remain.

---

### Phase 4: Dynamic RBAC Management Portal UI & Approval Flow
- **Primary Objective**: Deliver a dedicated, intuitive management interface for roles and permissions at `/datainduk/rbac`, and update the registration approval queue to review requested roles.
- **Scope**:
  - Rebuild `apps/web-admin/src/app/datainduk/rbac/page.tsx` into a dedicated dual-column layout:
    - Left column: List of all roles (system roles with badges, custom roles with edit/delete buttons, "Tambah Role Baru" CTA).
    - Right column: Granular permissions grouped by category (Data Induk, User & RBAC, Presensi, Patroli, Kebersihan, Driver, SOS, Laporan) with interactive toggle switches.
  - Update `/register` to allow candidates to select a **requested role** stored as a preference (`requested_role_id`).
  - Update `/datainduk/approval` to display the candidate's requested role, allowing the administrator to approve with that role or reassign a different final role, site, and wage structure.
  - Add user role reassignment modal inside `PersonilManagementView.tsx` allowing supervisors to change staff roles and immediate dynamic permissions.
- **Files Affected**:
  - `apps/web-admin/src/app/datainduk/rbac/page.tsx`
  - `apps/web-admin/src/components/RbacManagementView.tsx` (New component)
  - `apps/web-admin/src/app/register/page.tsx`
  - `apps/web-admin/src/components/ApprovalQueueView.tsx`
  - `apps/web-admin/src/components/PersonilManagementView.tsx`
- **Dependencies**: Phase 2, Phase 3.
- **Rollback Procedure**: Revert modified UI views.
- **Testing Requirements**:
  - Register new candidate with requested role "Petugas Keamanan". Verify candidate has zero access while pending.
  - In approval queue, verify admin sees requested role, modifies it to "Komandan Regu", and approves.
  - Verify approved user logs in and receives permissions of the final assigned role.
- **Completion Criteria**: Full role and permission lifecycle manageable through UI without touching source code.

---

### Phase 5: Offline-First IndexedDB Queue & Idempotency Engine
- **Primary Objective**: Implement client-side IndexedDB persistence, the 5-state transaction lifecycle, clock fraud detection, UUID idempotency deduplication, and offline Panic SOS life-safety protocols.
- **Scope**:
  - Implement client offline storage utility using `idb` (`lib/offlineDb.ts`) with stores for `pending_transactions` and `cached_master_data`.
  - Implement the 5 transaction states: `PENDING_OFFLINE`, `SYNCING`, `SYNCED`, `REJECTED`, `NEEDS_REVIEW`.
  - Update `PatrolScanPage.tsx`: eliminate false-positive green modals on failure; queue scan with `clientTransactionId` in IndexedDB if offline.
  - Update `ClockInPage.tsx`, `ClockOutPage.tsx`, `StaffActivityPage.tsx`, and `DriverTripPage.tsx` to support offline queuing.
  - Build `OfflineSyncManager.ts` to automatically detect reconnection and flush pending queues with exponential backoff.
  - Implement clock skew check: if `|device_timestamp - synced_at| > 60 minutes`, mark transaction as `NEEDS_REVIEW` and `clock_skew_flag = true`.
  - Update `PanicPage.tsx`: if offline, display prominent emergency warning, one-tap emergency telephone hotline dialer (`tel:<emergency_phone_number>` from `company_profile`), and queue SOS alert for prioritized dispatch upon reconnection.
  - Implement backend `SyncController` with `POST /api/v1/sync/flush` using `ON CONFLICT (client_transaction_id) DO NOTHING`.
- **Files Affected**:
  - `apps/pwa-field/src/utils/offlineDb.ts` (New file)
  - `apps/pwa-field/src/services/syncManager.ts` (New file)
  - `apps/pwa-field/src/pages/PatrolScanPage.tsx`
  - `apps/pwa-field/src/pages/ClockInPage.tsx`
  - `apps/pwa-field/src/pages/PanicPage.tsx`
  - `apps/backend/src/modules/sync/sync.controller.ts` (New module)
- **Dependencies**: Phase 2 (migration for `client_transaction_id`).
- **Rollback Procedure**: Revert PWA offline manager and sync controller.
- **Testing Requirements**:
  - Simulate offline mode in DevTools Network tab: Clock-in and QR scans must save locally with "Tersimpan Offline" indicator.
  - Toggle back to online: transactions auto-flush to PostgreSQL; verify records in database.
  - Re-syncing duplicate records must not create duplicate database rows.
  - Submit offline attendance with > 60m clock difference: verify record receives status `NEEDS_REVIEW`.
- **Completion Criteria**: Complete offline resilience; zero lost field records; transparent offline status badges.

---

### Phase 6: Codebase Unification (Option B) & Clean Semantic Routing
- **Primary Objective**: Eliminate duplicated field code in `apps/web-admin/src/field`, establish `apps/pwa-field` as the sole SSOT, eliminate legacy masked URLs (`xxxxx_xx.php`), implement the multi-site selection modal, and replace hardcoded mock site UUIDs.
- **Scope**:
  - Delete the duplicate directory `apps/web-admin/src/field`.
  - Configure the reverse proxy / Next.js rewrites to route `/validasi-patroli/*` directly to `apps/pwa-field`.
  - Replace hardcoded dummy `siteId: '11111111-1111-1111-1111-111111111111'` in field pages with active user's assigned `siteId`.
  - Implement multi-site resolution: if assigned to 1 site, resolve automatically; if assigned to multiple sites, show explicit site selector modal before clock-in.
  - Unify routing to clean semantic URLs (`/validasi-patroli/clock-in`, `/validasi-patroli/patrol-scan`, etc.).
  - Configure rewrite rules mapping legacy `xxxxx_xx.php` requests to clean URLs for bookmark and QR placard backwards compatibility.
- **Files Affected**:
  - `apps/pwa-field/src/App.tsx`
  - `apps/pwa-field/src/pages/*`
  - Delete: `apps/web-admin/src/field/` (Entire duplicated directory)
  - `scripts/local-gateway.js` / reverse proxy configuration
- **Dependencies**: Phase 5.
- **Rollback Procedure**: Restore `apps/web-admin/src/field` from git history if required.
- **Testing Requirements**:
  - Access clean URL `/validasi-patroli/patrol-scan`: loads camera scanner.
  - Access legacy URL `/validasi-patroli/xxxxx_xxxxxxxxx.php`: transparently loads scanner.
  - Multi-site user clocks in: site selection modal appears and saves chosen site.
- **Completion Criteria**: Clean modern routing; zero code duplication; 100% backwards compatibility preserved.

---

### Phase 7: Comprehensive Regression Verification & DoD Sign-Off
- **Primary Objective**: Execute full automated and manual testing against all four Definition of Done criteria.
- **Scope**:
  - Run `npm run build --workspaces` (Zero TypeScript compilation errors).
  - Run full backend test suite (`npm run test --workspace=@patrol/backend`) with 100% pass rate.
  - Run database verification script against PostgreSQL 17 + PostGIS 3.5 container.
  - Run Playwright E2E scenarios across all user roles (Admin, Chief, Danru, Satpam, Cleaner, Driver).
- **Dependencies**: All prior phases.
- **Completion Criteria**: All 4 DoD criteria passed; zero regression; verified ready for production handover.
