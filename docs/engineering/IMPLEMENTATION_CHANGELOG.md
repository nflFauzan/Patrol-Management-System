# Implementation Changelog
> **Patrol & Facility Management System (Enterprise In-House)**  
> Comprehensive record of modifications across Phase 1 through Phase 7.

---

## [Phase 1] Authentication Stabilization & Portal Authorization

### Added
- **Database Migration `011_add_portal_permissions_and_requested_role.sql`**:
  - Added permissions `ADMIN:DASHBOARD_ACCESS` and `FIELD:DASHBOARD_ACCESS`.
  - Added columns `requested_role` (VARCHAR 100) and `requested_division` (VARCHAR 50) to `users` table.
  - Linked `ADMIN:DASHBOARD_ACCESS` to `ADMIN_SUPER`, `ADMIN_AREA`, and `OPS_MANAGER`.
  - Linked `FIELD:DASHBOARD_ACCESS` to `SECURITY_OFFICER`, `CLEANING_STAFF`, `DRIVER_LOGISTICS`, and `SITE_SUPERVISOR`.
- **`apps/backend/src/modules/auth/jwt.strategy.ts`**:
  - Enforced query join across `user_roles` -> `role_permissions` -> `permissions` to populate `request.user.permissions`.
  - Strict guard rejecting unapproved users (`is_approved = false`) and rejected users (`rejection_reason IS NOT NULL`).
  - Aligned JWT secret across auth module and JWT strategy using `JWT_ACCESS_SECRET`.
- **`apps/backend/src/modules/auth/jwt.strategy.spec.ts`**:
  - 4 automated unit tests verifying JWT payload validation, permissions resolution, approval check, and rejection check.
- **`apps/pwa-field/src/context/AuthContext.tsx`**:
  - Unified field authentication context with `/auth/me` session validation and local cache fallback.
- **`apps/pwa-field/src/components/ProtectedRoute.tsx`**:
  - Route wrapper enforcing authenticated state and `FIELD:DASHBOARD_ACCESS` / granular permission check.

### Changed
- **`apps/web-admin/src/middleware.ts`**:
  - Removed arbitrary `cookie.value.length > 20` check.
  - Allowed `/login` to render without premature client redirect.
- **`apps/web-admin/src/lib/AuthContext.tsx`**:
  - Completely purged synthetic `DEMO_ACCOUNTS` and fake JWT token generator.
  - Replaced with genuine server validation against `GET /api/v1/auth/me`.
- **`apps/web-admin/src/components/AdminLoginPage.tsx`**:
  - Removed default prefilled credentials.
  - Implemented smart redirection based on `ADMIN:DASHBOARD_ACCESS` vs `FIELD:DASHBOARD_ACCESS`.
- **`apps/web-admin/src/app/register/page.tsx`**:
  - Added role preference selector (`requestedRole` and `requestedDivision`).

---

## [Phase 2] Dynamic RBAC & Backend Authorization

### Added
- **`apps/backend/src/modules/users/users.service.ts`**:
  - Added `getAllRoles()`, `createRole()`, `updateRole()`, `deactivateRole()`, `getAllPermissions()`, and `assignUserRole()`.
  - Implemented **Super Admin Protection**: blocks deactivation, role demotion, or deletion of the last active `ADMIN_SUPER`.
- **`apps/backend/src/modules/users/users.controller.ts`**:
  - Exposed endpoints:
    - `GET /users/rbac/roles`
    - `POST /users/rbac/roles`
    - `PUT /users/rbac/roles/:id`
    - `DELETE /users/rbac/roles/:id`
    - `GET /users/rbac/permissions`
    - `PUT /users/:id/role`
- **`apps/backend/src/modules/users/rbac.spec.ts`**:
  - 5 comprehensive tests validating role creation, duplicate code rejection, permission mapping, deactivation, and super admin protection.

---

## [Phase 3] Dashboard & Navigation Restructuring

### Added
- **`apps/web-admin/src/app/monitoring-patroli/page.tsx`**:
  - Dedicated administrative live patrol tracking view (`LaporanTrackingPatroliView`).
- **`apps/web-admin/src/lib/api.ts`**:
  - Centralized API service consolidating `rbacApi`, `approvalApi`, `authApi`, `sitesApi`, and `usersApi`.

### Changed
- **`apps/web-admin/src/components/layout/AppSidebar.tsx`**:
  - Re-pointed "Monitoring Patroli" menu from `/validasi-patroli` to `/monitoring-patroli`.
- **`apps/web-admin/src/app/validasi-patroli/page.tsx` & `field/page.tsx`**:
  - Replaced embedded PWA iframe/duplicates with smart redirects (`/monitoring-patroli` for Admin, `/pwa` for Field).
- **`scripts/local-gateway.js`**:
  - Added `/monitoring-patroli` to `adminPages` reverse proxy routing.

---

## [Phase 4] Dynamic Role Management UI & Approval Workflow

### Added
- **`apps/web-admin/src/components/ApprovalQueueView.tsx`**:
  - Role Creation & Configuration Modal with categorized permission selectors (Portal Access, Patrol, Attendance, Incident, SOS, Data Induk, Payroll).
  - Ability to create custom roles, edit permissions of existing roles, and deactivate custom roles.
  - Display of candidate `requestedRole` and `requestedDivision` badges in the approval queue.
  - Automatic pre-selection of candidate's requested role and division upon clicking "Setujui".
- **`apps/backend/src/modules/users/approval.spec.ts`**:
  - 5 unit tests verifying queue retrieval, approval, role/site assignment, rejection with mandatory reason, and data consistency.

---

## [Phase 5] Offline-First Field PWA

### Added
- **`packages/types/src/index.ts`**:
  - Defined `OfflineTransaction`, `OfflineTransactionType`, and `OfflineTransactionStatus`.
  - Added optional `id?: string; deviceTimestamp?: string;` across `ClockInRequestDto`, `ClockOutRequestDto`, `RecordScanDto`, and `ScanCheckpointRequestDto`.
- **`apps/pwa-field/src/services/db.ts`**:
  - IndexedDB schema definition (`patrol_field_db`) using `idb` with object stores: `offline_queue`, `cached_sites`, `cached_checkpoints`, `meta_cache`.
- **`apps/pwa-field/src/services/offlineQueue.ts`**:
  - Local transaction persistence with RFC4122 v4 UUID generation, status state machine, query helpers, and 7-day retention cleanup.
- **`apps/pwa-field/src/services/syncManager.ts`**:
  - Background queue drainer executing upon `window.addEventListener('online')` or manual sync tap.
  - Error classification: distinguishes network disconnection (reverted to `PENDING_OFFLINE`) from business validation rejection (marked `NEEDS_REVIEW`).
- **`apps/pwa-field/src/components/OfflineStatusBar.tsx`**:
  - Visual status bar indicating offline state, number of pending transactions, and active synchronization spinner.
- **Backend Idempotency & Historical Timestamp Support**:
  - `apps/backend/src/modules/attendance/attendance.service.ts`: `clockIn` and `clockOut` accept `dto.id` for idempotency and `dto.deviceTimestamp` for accurate shift duration.
  - `apps/backend/src/modules/patrol/patrol.service.ts`: `recordScan` accepts `data.id` for idempotency and `data.deviceTimestamp` for `scanned_at`.

---

## [Phase 6] Application Cleanup & Route Alignment

### Removed
- **`apps/web-admin/src/field/`**:
  - Removed 32 redundant duplicate files (-7,377 lines of redundant code) establishing `apps/pwa-field` as the single authoritative source of truth.

### Changed
- **`apps/pwa-field/src/App.tsx`**:
  - Registered canonical semantic paths (`/dashboard`, `/clock-in`, `/clock-out`, `/leave`, `/attendance-history`, `/activity-history`, `/panic`, `/profile`, `/patrol-scan`, `/driver-trip`) while preserving legacy compatibility paths.
- **`scripts/local-gateway.js`**:
  - Reverse proxy updated to route `/clock-in`, `/clock-out`, `/patrol-scan`, `/driver-trip`, and `.php` requests directly to Vite PWA on port 5173.

---

## [Phase 7] Verification & Final Delivery
- All 4 packages pass 100% compilation (`@patrol/types`, `@patrol/backend`, `@patrol/pwa-field`, `@patrol/web-admin`).
- All 17 backend test suites pass (119/119 tests green).
- Live PostgreSQL + PostGIS integration verified via `check-db.js`, `check-rbac-db.js`, and `test-rbac-approval-e2e.js`.
