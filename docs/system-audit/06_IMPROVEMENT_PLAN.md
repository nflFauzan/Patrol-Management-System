# 06 — PRIORITIZED IMPROVEMENT PLAN (REVISED)
> **Patrol & Facility Management System (Enterprise In-House / Single-Tenant)**  
> Architecture Decision: Option B (Single-Origin Reverse Proxy, Distinct Frontends, No Field Code Duplication)  
> Document Version: 2.0.0 — Status: Revised for Final Review

---

## 1. Improvement Prioritization Framework

All proposed remediations are categorized under four standardized engineering levels:

- **`[P0]` Critical Security & System-Breaking Issues**: Immediate fixes for broken authentication, permission loss, false-positive patrol checkmarks, and data loss.
- **`[P1]` Essential Functionality & Architectural Corrections**: Core system capabilities, single-origin routing, code duplication elimination, and dynamic RBAC.
- **`[P2]` Important Operational Improvements**: Offline life-safety protocols, clock fraud detection, and rate limiting.
- **`[P3]` Technical Debt Cleanup**: Performance optimizations and directory consolidation.

---

## 2. Prioritized Improvement Catalog

### [P0] Critical Security & System-Breaking Issues

#### Improvement P0.1 — Remediate Middleware Login Redirect & Enforce JWT Verification
- **Problem**:
  Users navigating to `/login` are prematurely redirected to `/dashboard` if any cookie named `patrol_session` with length > 20 exists. The credential form is completely bypassed, and token integrity is not verified at the edge.
- **Proposed Solution**:
  1. Refactor `apps/web-admin/src/middleware.ts` to decode and verify JWT signature and expiration.
  2. If expired or invalid, clear the session cookie and render `/login`.
  3. On `/login`, always render the credential form. If an active session is detected, show a clean indicator card with the logged-in username and options: `[ Lanjut ke Dashboard ]` and `[ Masuk dengan Akun Lain / Keluar ]`.
  4. Remove `/validasi-patroli` from `isPublicRoute` in middleware.
- **Business Justification**: Users must be able to log in, switch accounts, and see authentication errors without manual browser cache clearing.
- **Technical Impact**: Affects `apps/web-admin/src/middleware.ts` and `apps/web-admin/src/components/AdminLoginPage.tsx`.
- **Dependencies**: None.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - Accessing `http://localhost:3001/login` renders the login form.
  - Logging in with invalid credentials displays an explicit error message.
  - Navigating to `/login` with an existing session provides an account-switch option.
  - Unauthenticated access to `/validasi-patroli/*` redirects to `/login`.

---

#### Improvement P0.2 — Eliminate Client-Side Mock Account Fallback in AuthContext
- **Problem**:
  `AuthContext.tsx` silently catches backend API errors and falls back to hardcoded client-side demo accounts, issuing a fake token (`demo_jwt_token_...`). This allows unapproved or rejected accounts to bypass backend security.
- **Proposed Solution**:
  1. Remove the `DEMO_ACCOUNTS.find(...)` fallback from `AuthContext.login()`.
  2. All authentication must be verified by the backend Fastify API via `POST /api/v1/auth/login`.
  3. Propagate backend rejection reasons (e.g. 403 Forbidden with approval queue status) cleanly to the UI.
  4. Move demo account buttons strictly to the login UI input layer (pre-filling inputs, but still submitting them to the real API).
- **Business Justification**: Eliminates unauthorized privilege escalation and guarantees that disabled/unapproved users cannot access the system.
- **Technical Impact**: Affects `apps/web-admin/src/lib/AuthContext.tsx`.
- **Dependencies**: P0.1.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - Login fails with an explicit error when backend is offline or credentials are wrong.
  - Unapproved accounts receive the exact message: *"Akun Anda sedang dalam antrean verifikasi Administrator."*
  - No synthetic JWT tokens are created in the browser.

---

#### Improvement P0.3 — Inject Permissions into Backend `JwtStrategy` Validation
- **Problem**:
  `JwtStrategy.validate()` queries `users` but fails to query `user_roles ➔ role_permissions ➔ permissions`. As a result, `request.user.permissions` is `undefined`, causing `PermissionsGuard` to throw HTTP 403 Forbidden on all non-superadmin users for any permission-guarded endpoint.
- **Proposed Solution**:
  Update `apps/backend/src/modules/auth/jwt.strategy.ts` to execute a join with `user_roles`, `roles`, `role_permissions`, and `permissions`, populating `user.permissions: string[]`.
- **Business Justification**: Restores the core dynamic RBAC authorization engine across the entire enterprise backend.
- **Technical Impact**: Affects `apps/backend/src/modules/auth/jwt.strategy.ts`.
- **Dependencies**: None.
- **Risk Level**: Medium (affects all authenticated API requests).
- **Acceptance Criteria**:
  - Non-superadmin users with valid roles successfully access endpoints protected by `@Permissions()`.
  - Calling an endpoint without the required permission correctly returns HTTP 403 Forbidden.
  - All 15 backend Jest test suites continue to pass 100%.

---

#### Improvement P0.4 — Eliminate False Positive QR Scans & Implement IndexedDB Offline Queue
- **Problem**:
  In `PatrolScanPage.tsx`, catching an API network error still triggers `setScanSuccessModal`, misleading security guards into believing a checkpoint was recorded when it was actually lost. Furthermore, zero offline queuing exists.
- **Proposed Solution**:
  1. In `PatrolScanPage.tsx`, do **not** trigger success modal on caught errors unless the transaction has been safely committed to the local offline IndexedDB queue.
  2. Implement `idb` client storage (`pending_transactions`) to store scans, clock-ins, and checklists when `!navigator.onLine` or when an API call fails with network error.
  3. Attach a unique `clientTransactionId` (UUIDv4) to every offline record.
  4. Introduce the 5 transaction lifecycle states:
     - `PENDING_OFFLINE`: Stored in IndexedDB, waiting for network.
     - `SYNCING`: Currently in flight to server.
     - `SYNCED`: Server acknowledged and committed to database.
     - `REJECTED`: Rejected during server revalidation.
     - `NEEDS_REVIEW`: Flagged for supervisor review (e.g. clock skew > 60m).
  5. Display a distinct yellow/orange badge: *"Tersimpan di Perangkat (Menunggu Sinkronisasi)"* instead of a false green online confirmation.
- **Business Justification**: Prevents lost patrol logs and maintains audit data integrity in facilities with spotty coverage.
- **Technical Impact**: Affects `apps/pwa-field/src/pages/PatrolScanPage.tsx`, `ClockInPage.tsx`, and services.
- **Dependencies**: Database migration `011_target_architecture_sync.sql`.
- **Risk Level**: Medium.
- **Acceptance Criteria**:
  - Disconnecting internet and scanning a QR code saves the scan to IndexedDB with status `PENDING_OFFLINE`.
  - UI displays "Tersimpan Offline" with pending sync count badge.
  - False positive green success modal is eliminated.

---

### [P1] Essential Functionality & Architectural Corrections

#### Improvement P1.1 — Eliminate Field Code Duplication & Establish Single Source of Truth
- **Problem**:
  `apps/pwa-field` and `apps/web-admin/src/field` are identical duplicate codebases. Developers must modify both files to make a single change.
- **Proposed Solution (Option B Implementation)**:
  1. Designate `apps/pwa-field` as the **sole authoritative source of truth** for all field operational screens.
  2. Delete the duplicated directory `apps/web-admin/src/field`.
  3. Configure the reverse proxy to route `/validasi-patroli/*` directly to `apps/pwa-field` (:5173 in dev, static build in prod).
- **Business Justification**: Cuts frontend maintenance overhead by 50% and eliminates code divergence.
- **Technical Impact**: Monorepo build and directory cleanup.
- **Dependencies**: None.
- **Risk Level**: Medium.
- **Acceptance Criteria**:
  - Field operational screens are edited in `apps/pwa-field` only.
  - Zero duplicate files in `web-admin`.
  - Full TypeScript typecheck passes across all workspaces.

---

#### Improvement P1.2 — Correct Sidebar Navigation & Mount 24h Patrol Matrix
- **Problem**:
  Clicking "Monitoring Patroli" in `AppSidebar.tsx` redirects to `/validasi-patroli` (the mobile field interface). The existing administrative `HourlyPatrolMatrixTab.tsx` component is completely unmounted and unreachable.
- **Proposed Solution**:
  1. Create a dedicated administrative page at `apps/web-admin/src/app/monitoring-patroli/page.tsx`.
  2. Mount `HourlyPatrolMatrixTab` alongside an active patrol status feed and facility site selector.
  3. Update `AppSidebar.tsx` to link "Monitoring Patroli" directly to `/monitoring-patroli`.
- **Business Justification**: Gives Chief Security and Facility Managers direct visibility into 24-hour patrol compliance without showing a field mobile layout.
- **Technical Impact**: Affects `AppSidebar.tsx` and adds `apps/web-admin/src/app/monitoring-patroli/page.tsx`.
- **Dependencies**: None.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - Clicking "Monitoring Patroli" navigates to `/monitoring-patroli`.
  - The 24-hour matrix loads checkpoint rows across all 24 hours (00:00 to 23:00).
  - Export CSV button downloads the matrix successfully.

---

#### Improvement P1.3 — Candidate Requested Role & Admin-Controlled Approval
- **Problem**:
  Candidates registering on `/register` cannot select their requested role; the system assigns a hardcoded default role.
- **Proposed Solution**:
  1. Add `requested_role_id UUID REFERENCES roles(id)` to `users` table.
  2. In `/register`, candidate selects their **requested role** from active operational roles.
  3. Candidate account remains `is_approved = false`, `is_active = false`. The requested role is stored **strictly as a preference and grants zero permissions**.
  4. In `/datainduk/approval`, administrator reviews candidate details (NIK, phone, requested role). Administrator can approve with the requested role or modify it to another role, site, and wage structure.
  5. Only upon administrator approval is the final role committed to `user_roles`.
- **Business Justification**: Streamlines candidate onboarding while strictly preserving administrative control over security privileges.
- **Technical Impact**: Affects `apps/backend/src/modules/auth/auth.service.ts`, `apps/backend/src/modules/users/users.service.ts`, and frontend approval components.
- **Dependencies**: Database migration `011_target_architecture_sync.sql`.
- **Risk Level**: Medium.
- **Acceptance Criteria**:
  - Registration captures `requestedRoleId` without granting permissions.
  - Approval queue displays candidate's requested role.
  - Admin can change the role before final approval.

---

#### Improvement P1.4 — Implement Dedicated Dynamic RBAC Management View
- **Problem**:
  `/datainduk/rbac` renders `<ApprovalQueueView />` instead of a dedicated Role & Permissions editor. `RbacController` lacks endpoints to update roles, assign permissions, or deactivate roles.
- **Proposed Solution**:
  1. Implement backend endpoints: `PUT /rbac/roles/:id`, `DELETE /rbac/roles/:id`, `PUT /rbac/roles/:id/permissions`, and `POST /rbac/users/:id/roles`.
  2. Build a dedicated UI at `/datainduk/rbac` with a dual-column layout:
     - Left column: List of roles (system roles highlighted, custom roles with edit/delete).
     - Right column: Permission matrix organized by categories with interactive checkboxes.
  3. Enforce the anti-lockout rule protecting the last active `ADMIN_SUPER`.
  4. Enforce interface separation via `admin.dashboard.access` and `field.dashboard.access`.
- **Business Justification**: Enables corporate administrators to adapt permissions to changing facility staffing without code modifications.
- **Technical Impact**: Affects `RbacController`, `UsersService`, and `apps/web-admin/src/app/datainduk/rbac/page.tsx`.
- **Dependencies**: P0.3.
- **Risk Level**: Medium.
- **Acceptance Criteria**:
  - Admin can create a custom role (e.g. "Senior Patrol Officer") and toggle permissions.
  - Assigning a role to a user updates their active permissions immediately upon next token refresh.
  - Attempting to delete the last Super Admin throws an explicit rejection.

---

#### Improvement P1.5 — Replace Hardcoded `http://localhost:3000` with Configurable Client
- **Problem**:
  26 files in `apps/web-admin` hardcode direct fetch calls to `http://localhost:3000`, bypassing proxies and breaking LAN/mobile access.
- **Proposed Solution**:
  1. Standardize all API calls in `apps/web-admin` to use relative URLs (`/api/v1/...`) via Next.js rewrites or a shared Axios instance.
  2. Configure `NEXT_PUBLIC_API_URL` environment variable for production builds.
- **Business Justification**: Enables deployment to on-premise servers and LAN testing from mobile smartphones.
- **Technical Impact**: Refactoring 26 component files in `web-admin`.
- **Dependencies**: None.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - Zero instances of `localhost:3000` remaining in source code.
  - Admin portal functions properly through reverse proxy (`:8080`) and LAN IP addresses.

---

### [P2] Important Operational Improvements

#### Improvement P2.1 — Multi-Site Personnel Selection & Geofence Verification
- **Problem**:
  Field operational pages currently hardcode dummy `siteId: '11111111-1111-1111-1111-111111111111'`.
- **Proposed Solution**:
  1. If a user is assigned to exactly one facility, resolve `siteId` automatically from their session.
  2. If assigned to multiple facilities, prompt the user with an explicit selection modal: *"Pilih Lokasi Fasilitas Penugasan Hari Ini"* before allowing clock-in.
  3. Do not rely solely on GPS proximity to choose the facility. GPS is used as a strict geofence validation check against the selected site.
- **Business Justification**: Eliminates cross-facility data corruption for roaming personnel.
- **Technical Impact**: Affects `ClockInPage.tsx`, `PatrolScanPage.tsx`, and session services.
- **Dependencies**: None.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - Roaming guards select facility explicitly before clock-in.
  - Clock-in and patrol scan payloads include the user's verified `siteId`.

---

#### Improvement P2.2 — Offline Panic SOS Life-Safety Protocol & Configurable Hotline
- **Problem**:
  Pressing SOS offline triggers an unhandled network error alert with no practical emergency guidance.
- **Proposed Solution**:
  1. Detect network state prior to trigger.
  2. If offline, display a high-contrast emergency screen:
     - Clear warning that internet is unavailable and real-time dispatch is delayed.
     - One-tap phone dialer button to call the administrator-configured emergency hotline (`company_profile.emergency_phone_number`).
     - Instruction to utilize two-way radio (HT).
  3. Store the SOS alert in IndexedDB with priority flag and dispatch it first upon reconnection.
- **Business Justification**: Ensures personnel safety in subterranean basements or power outage scenarios.
- **Technical Impact**: Affects `PanicPage.tsx` and `SosService`.
- **Dependencies**: P0.4, Database migration `011`.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - Triggering SOS offline displays emergency phone dialer with configured control room number.
  - Reconnecting to internet automatically dispatches the queued emergency alert.

---

#### Improvement P2.3 — Clock Manipulation Detection & Audit Thresholds
- **Problem**:
  A worker could alter their device clock backwards while offline to appear on-time.
- **Proposed Solution**:
  1. Store `device_timestamp` and `synced_at` on every transaction.
  2. If `|device_timestamp - synced_at| > 60 minutes`, mark the transaction with `sync_status = 'NEEDS_REVIEW'` and `clock_skew_flag = true`.
  3. Records flagged as `NEEDS_REVIEW` are excluded from automatic payroll calculations until verified by a supervisor in `/absensi`.
- **Business Justification**: Prevents attendance fraud and maintains HR compliance integrity.
- **Technical Impact**: Affects `SyncService` and `AttendanceService`.
- **Dependencies**: Database migration `011`.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - Clock discrepancy > 60 minutes flags record as `NEEDS_REVIEW`.
  - Supervisor must explicitly sign off on flagged attendance records.

---

#### Improvement P2.4 — Add Rate Limiting to Public Registration Endpoint
- **Problem**:
  `POST /api/v1/auth/register` is unthrottled, allowing automated scripts to flood the pending approval queue.
- **Proposed Solution**:
  Attach NestJS `@Throttle({ default: { limit: 5, ttl: 60000 } })` to limit registration submissions per IP.
- **Business Justification**: Protects database against spam records and denial of service.
- **Technical Impact**: Affects `auth.controller.ts`.
- **Dependencies**: None.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - Submitting more than 5 registrations within 1 minute returns HTTP 429 Too Many Requests.

---

### [P3] Technical Debt Cleanup

#### Improvement P3.1 — Clean Semantic URLs with Legacy Rewrites
- **Problem**:
  Field routes are mapped to obfuscated PHP script names (`xxxxx_xx.php`).
- **Proposed Solution**:
  1. Migrate all navigation links and router paths to clean semantic URLs (`/validasi-patroli/clock-in`, `/validasi-patroli/patrol-scan`, etc.).
  2. Maintain transparent 301/rewrite rules for legacy paths to preserve compatibility with existing QR code printouts.
- **Business Justification**: Improves code maintainability, debugging speed, and aligns with modern enterprise engineering standards.
- **Technical Impact**: Affects `apps/pwa-field/src/App.tsx`.
- **Dependencies**: None.
- **Risk Level**: Low.
- **Acceptance Criteria**:
  - All field pages accessible via clean URLs.
  - Legacy URLs automatically redirect to clean targets without breaking.
