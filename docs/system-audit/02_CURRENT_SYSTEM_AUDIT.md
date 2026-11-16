# 02 — COMPREHENSIVE CURRENT SYSTEM AUDIT
> **Patrol & Facility Management System (Enterprise In-House / Single-Tenant)**  
> Empirical Evidence-Based Code Audit & Vulnerability Assessment

---

## 1. Audit Methodology & Classification Standards

This audit evaluates the codebase strictly through source code inspection, AST verification, and runtime behavior analysis without speculative assertions. Each finding is classified under one of six standardized categories:

- **`[WORKING]`**: Functionality verified and behaving as specified in architecture.
- **`[BUG]`**: Existing functionality behaves incorrectly, produces unexpected side effects, or fails under known conditions.
- **`[GAP]`**: Required functional capability or architectural requirement is missing from the implementation.
- **`[INCONSISTENCY]`**: Conflicting paradigms, duplicate logic, or mismatched implementations between components.
- **`[SECURITY_RISK]`**: Confirmed or potential security vulnerability compromising confidentiality, integrity, or availability.
- **`[TECHNICAL_DEBT]`**: Architecture, dependencies, or conventions that hinder maintainability, testability, or scalability.

---

## 2. Findings by Architectural Domain

### Domain A: Authentication, Login, and Session Lifecycle

#### Finding A.1 — `[BUG]` `[INCONSISTENCY]` Premature Redirection from Login to Dashboard
- **Evidence**:
  - `apps/web-admin/src/middleware.ts` (lines 6-7, 30-32):
    ```typescript
    const rawToken = request.cookies.get('patrol_session')?.value?.trim();
    const isAuthenticated = !!(rawToken && rawToken.length > 20);
    // ...
    if (isAuthenticated && (pathname === '/login' || pathname === '/login.php' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    ```
  - `apps/web-admin/src/lib/AuthContext.tsx` (lines 156-159):
    ```typescript
    } else if (user && isAuthRoute) {
      router.replace('/dashboard');
    }
    ```
- **Observed Behavior**:
  Opening `http://localhost:3001` renders the public portal with "MASUK" and "DAFTAR". When the user clicks "MASUK" (`/login`), the browser is immediately bounced to `/dashboard` without displaying the credential input form.
- **Root Cause**:
  Both the edge middleware and the React `AuthContext` indiscriminately check for the existence of an old `patrol_session` cookie or localStorage string. If any token string with length > 20 exists, navigation to `/login` is automatically intercepted and redirected to `/dashboard`. Users cannot view the login form, switch users, or log in with another account unless cookies and localStorage are manually wiped via developer tools.
- **Severity**: **HIGH (P0 User Experience Blocker)**.

---

#### Finding A.2 — `[SECURITY_RISK]` Unverified Cookie Acceptance in Middleware
- **Evidence**:
  - `apps/web-admin/src/middleware.ts` (line 7):
    ```typescript
    const isAuthenticated = !!(rawToken && rawToken.length > 20);
    ```
- **Observed Behavior**:
  Next.js middleware considers any arbitrary string exceeding 20 characters in the `patrol_session` cookie as a valid, authenticated user.
- **Root Cause**:
  No JWT signature verification, HMAC token check, or expiration timestamp decoding occurs at the middleware layer. An attacker or client inserting `patrol_session="abcdefghijklmnopqrstuvwxyz"` gains access to all non-public client-side routes, failing only when a downstream component executes an authenticated API call.
- **Severity**: **HIGH (Security Risk)**.

---

#### Finding A.3 — `[SECURITY_RISK]` Client-Side Demo Account Fallback in AuthContext
- **Evidence**:
  - `apps/web-admin/src/lib/AuthContext.tsx` (lines 188-219):
    ```typescript
    } catch (backendError: any) {
      console.warn('Backend API login error, checking seeded credentials fallback:', backendError.message);
      const matchedDemo = DEMO_ACCOUNTS.find(
        (acc) => acc.username.toLowerCase() === cleanUsername && acc.password === cleanPassword
      );
      if (matchedDemo) {
        authenticatedUser = { /* hardcoded mock user */ };
        sessionToken = `demo_jwt_token_${cleanUsername}_${Date.now()}`;
      }
    ```
- **Observed Behavior**:
  If the backend Fastify server is offline, restarting, or returns an HTTP error (e.g. 403 Forbidden for unapproved accounts or 500 error), `AuthContext` silently catches the error and authenticates the user locally using hardcoded demo accounts, generating a pseudo-JWT (`demo_jwt_token_...`).
- **Security Impact**:
  If an account is rejected or pending approval in the real database, entering demo credentials bypasses backend authorization entirely in the browser UI, granting access to protected views.
- **Severity**: **CRITICAL (Security Risk & Architectural Defect)**.

---

#### Finding A.4 — `[SECURITY_RISK]` Route Protection Bypass for Field and Validation Routes
- **Evidence**:
  - `apps/web-admin/src/middleware.ts` (lines 9-20):
    ```typescript
    const isPublicRoute =
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/login.php' ||
      pathname === '/register' ||
      pathname.startsWith('/validasi-patroli') ||
      pathname.startsWith('/field') ||
      // ...
    ```
- **Observed Behavior**:
  `/validasi-patroli` and all sub-slugs (`/validasi-patroli/clock-in`, `/validasi-patroli/panic`, `/validasi-patroli/patrol-scan`) are classified as `isPublicRoute`.
- **Root Cause**:
  Unauthenticated anonymous users can open operational field modules directly in their browser without any authentication challenge.
- **Severity**: **HIGH (Broken Access Control)**.

---

#### Finding A.5 — `[WORKING]` Backend Brute-Force Lockout & Approval Enforcement
- **Evidence**:
  - `apps/backend/src/modules/auth/auth.service.ts` (lines 116-161):
    - Brute-force lockout triggers after 5 failed attempts (`locked_until = NOW() + INTERVAL '15 minutes'`).
    - Unapproved accounts throw `ForbiddenException: Akun Anda sedang dalam antrean verifikasi Administrator`.
    - Rejected accounts throw `ForbiddenException: Pendaftaran Anda ditolak oleh Administrator: <rejectionReason>`.
    - Deactivated accounts throw `UnauthorizedException: This account has been deactivated`.
  - Verified by 15 passing unit tests in `apps/backend/src/modules/auth/auth-rbac.spec.ts`.
- **Status**: **WORKING as intended on the backend layer**.

---

### Domain B: Navigation, Sidebar, and Route Mappings

#### Finding B.1 — `[BUG]` Mismapped "Monitoring Patroli" Sidebar Destination
- **Evidence**:
  - `apps/web-admin/src/components/layout/AppSidebar.tsx` (lines 117-134):
    ```tsx
    {/* Monitoring Patroli */}
    <Link
      href="/validasi-patroli"
      className="..."
    >
      <QrCode className="..." />
      <span className="truncate">Monitoring Patroli</span>
    </Link>
    ```
  - `apps/web-admin/src/app/validasi-patroli/page.tsx` (lines 4-7):
    ```tsx
    import { DashboardPage } from '../../field/pages/DashboardPage';
    export default function FieldDashboardRoute() {
      return <DashboardPage />;
    }
    ```
- **Observed Behavior**:
  An administrator sitting at a desktop command center clicks "Monitoring Patroli" expecting to view a patrol monitoring dashboard, but is redirected to `/validasi-patroli`, which renders the mobile field officer's 8-button PWA interface.
- **Root Cause**:
  The sidebar destination was mistakenly hardcoded to `/validasi-patroli` instead of linking to an administrative patrol overview or matrix monitoring page.
- **Severity**: **HIGH (P1 Functional Mismatch)**.

---

#### Finding B.2 — `[GAP]` Orphaned Administrative Patrol Matrix Component
- **Evidence**:
  - `apps/web-admin/src/components/HourlyPatrolMatrixTab.tsx` (lines 1-272):
    Contains a fully realized 24-hour checkpoint matrix (hours 00:00 to 23:00) with category filtering, real-time scan indicators, and CSV export.
  - Search across `apps/web-admin/src/app` confirms `HourlyPatrolMatrixTab` is **not imported anywhere** in the Next.js App Router tree!
- **Observed Behavior**:
  The enterprise feature built for administrative patrol monitoring is completely disconnected and inaccessible to end users.
- **Severity**: **MEDIUM (P1 Missing Integration)**.

---

#### Finding B.3 — `[INCONSISTENCY]` Fragmented Laporan Route Sub-paths vs Tab Parameters
- **Evidence**:
  - In `apps/web-admin/src/app/laporan/`:
    There are 9 subdirectories (`cleaning-service`, `driver`, `monitoring-kegiatan`, `rekap-kegiatan`, `security/anggota`, `security/chief`, `security/komandan`, `staff`, `tracking-patroli`).
  - However, `apps/web-admin/src/app/laporan/page.tsx` ignores subdirectories and implements a tab switcher driven by URL search params: `?tab=security&role=anggota`, `?tab=cleaning`, `?tab=driver`, `?tab=tracking`.
  - The sub-pages in `apps/web-admin/src/app/laporan/*` duplicate the view components or serve as obsolete wrappers.
- **Severity**: **MEDIUM (Technical Debt & Route Confusion)**.

---

### Domain C: Dashboard and PWA Application Integration

#### Finding C.1 — `[TECHNICAL_DEBT]` Complete Codebase Duplication Across Apps
- **Evidence**:
  - `apps/pwa-field/src/pages/`:
    `ClockInPage.tsx`, `ClockOutPage.tsx`, `PatrolScanPage.tsx`, `PanicPage.tsx`, `DriverTripPage.tsx`, `StaffActivityPage.tsx`, `LeavePage.tsx`, `ProfilePage.tsx`, etc.
  - `apps/web-admin/src/field/pages/`:
    Identical copy of all the above files, using Next.js wrappers instead of Vite React Router.
- **Observed Behavior**:
  The developer team previously copy-pasted the entire mobile PWA source tree into `apps/web-admin/src/field/` in an attempt to serve the PWA from Next.js.
- **Impact**:
  Two competing sources of truth exist for field operations. Modifying a bug in `pwa-field` leaves `web-admin/src/field` broken, and vice versa.
- **Severity**: **HIGH (Technical Debt & Architectural Anti-Pattern)**.

---

#### Finding C.2 — `[TECHNICAL_DEBT]` Legacy Masked Filenames (`xxxxx_xx.php`)
- **Evidence**:
  - `apps/pwa-field/src/App.tsx` (lines 33-58) & `apps/web-admin/src/app/validasi-patroli/[slug]/page.tsx` (lines 23-75):
    ```tsx
    case 'xxxxx_xx.php': return <ClockInPage />;
    case 'xxxxx_xxx.php': return <ClockOutPage />;
    case 'xxxxx_xxxx.php': return <LeavePage />;
    case 'xxxxx_xxxxxxx.php': return <PanicPage />;
    case 'xxxxx_xxxxxxxxx.php': return <PatrolScanPage />;
    ```
- **Observed Behavior**:
  Pages are indexed by obfuscated PHP script names originally extracted from reverse-engineering the legacy monolithic PHP website.
- **Impact**:
  Violates enterprise engineering standards, introduces debugging confusion, and clutters route handlers.
- **Severity**: **MEDIUM (Technical Debt)**.

---

### Domain D: Dynamic Role-Based Access Control (RBAC)

#### Finding D.1 — `[CRITICAL BUG]` `[SECURITY_RISK]` Permissions Not Loaded in `JwtStrategy`
- **Evidence**:
  - `apps/backend/src/modules/auth/jwt.strategy.ts` (lines 21-33):
    ```typescript
    async validate(payload: { sub: string; username: string; role: string }): Promise<User> {
      const user = await this.db.queryOne<User>(
        `SELECT id, username, email, full_name as "fullName", phone, role, division, site_id as "siteId", is_active as "isActive", avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
         FROM users WHERE id = $1 AND is_active = true`,
        [payload.sub],
      );
      if (!user) throw new UnauthorizedException('User account no longer active or exists');
      return user;
    }
    ```
  - `apps/backend/src/common/guards/permissions.guard.ts` (lines 32-37):
    ```typescript
    const userPermissions: string[] = user.permissions || [];
    const hasPermission = requiredPermissions.some((perm) => userPermissions.includes(perm));
    if (!hasPermission) {
      throw new ForbiddenException('Anda tidak memiliki hak akses yang memadai untuk tindakan ini.');
    }
    ```
- **Observed Behavior**:
  When a request is authenticated via JWT Bearer token, Passport calls `JwtStrategy.validate()`. The SQL query selects from `users` only and does **not** join `user_roles`, `role_permissions`, or `permissions`. As a result, `user.permissions` is `undefined`.
- **Consequence**:
  Except for `ADMIN_SUPER` (which has a hardcoded bypass in line 28 of `PermissionsGuard`), **every single non-admin user is rejected with HTTP 403 Forbidden on any endpoint protected by `@Permissions()`**!
- **Severity**: **CRITICAL (P0 Backend Authorization Defect)**.

---

#### Finding D.2 — `[GAP]` Missing CRUD Operations in `RbacController`
- **Evidence**:
  - `apps/backend/src/modules/users/rbac.controller.ts`:
    Implements only 3 endpoints:
    - `GET /rbac/roles`
    - `POST /rbac/roles`
    - `GET /rbac/permissions`
- **Missing Capabilities**:
  - No `PUT /rbac/roles/:id` to rename or update description.
  - No `DELETE /rbac/roles/:id` or toggle active state.
  - No `PUT /rbac/roles/:id/permissions` to dynamically assign/remove permissions from roles.
  - No `POST /rbac/users/:id/roles` to reassign roles to existing staff.
- **Severity**: **HIGH (P1 Core RBAC Requirement)**.

---

#### Finding D.3 — `[INCONSISTENCY]` UI for Role Management Renders Approval Queue
- **Evidence**:
  - `apps/web-admin/src/app/datainduk/rbac/page.tsx` (lines 1-26):
    ```tsx
    export default function RbacPage() {
      return (
        <div className="space-y-4">
          {/* Header says: Data Induk ➔ Manajemen Role & Dynamic RBAC */}
          <ApprovalQueueView />
        </div>
      );
    }
    ```
- **Observed Behavior**:
  Clicking "Hak Akses & Role" (`/datainduk/rbac`) displays the exact same candidate approval table as `/datainduk/approval`.
- **Root Cause**:
  Although `ApprovalQueueView` contains an internal `activeTab === 'rbac'` view, `/datainduk/rbac` does not set the default tab state, forcing users to see the pending user queue. Furthermore, the role view only renders read-only cards without permission assignment checkboxes or user role reassignment tools.
- **Severity**: **HIGH (P1 Functional Defect)**.

---

#### Finding D.4 — `[BUG]` Updating Personnel Profiles Bypasses `user_roles` Relation
- **Evidence**:
  - `apps/backend/src/modules/users/users.service.ts` (in `updateUser` method) and `apps/web-admin/src/components/PersonilManagementView.tsx`:
    Editing personnel updates `users.role` (varchar column), but **never updates the `user_roles` many-to-many junction table**.
- **Impact**:
  If a supervisor promotes a security officer or alters a role in the master personnel list, their dynamic permissions in `user_roles` remain unchanged, creating a data desynchronization between `users.role` and `user_roles`.
- **Severity**: **HIGH (Data Integrity & Authorization Defect)**.

---

### Domain E: Registration and Admin Approval Workflow

#### Finding E.1 — `[WORKING]` Secure Honeypot Registration & Status Gating
- **Evidence**:
  - `apps/backend/src/modules/auth/auth.service.ts` (`register()` method):
    - Submissions with `hp_input != ''` are blocked with `BadRequestException`.
    - NIK must be unique and passwords are validated for minimum 6 characters.
    - Password is hashed with `bcrypt.hash(password, 10)`.
    - Newly created records explicitly enforce `is_approved = false` and `is_active = false`.
  - `apps/web-admin/src/app/register/page.tsx`:
    - Full 16-digit NIK validation, phone formatting, password confirmation check, and division selection.
- **Status**: **WORKING as specified**.

---

#### Finding E.2 — `[GAP]` Lack of Rate Limiting on Public Registration Endpoint
- **Evidence**:
  - `apps/backend/src/modules/auth/auth.controller.ts`:
    Endpoint `@Post('register')` has no `@Throttle()` decorator or IP rate limiter attached.
- **Vulnerability**:
  While the honeypot field prevents basic bots, automated scripts can flood the `users` table with pending candidate registrations, exhausting database connection pools and cluttering the approval queue.
- **Severity**: **MEDIUM (Denial of Service & Spam Risk)**.

---

### Domain F: Offline-First PWA Capabilities

#### Finding F.1 — `[CRITICAL GAP]` Complete Absence of Client-Side Offline Queue
- **Evidence**:
  - `apps/pwa-field/package.json` & `apps/web-admin/package.json`:
    Both include `"idb": "^8.0.4"`.
  - Codebase search for `openDB`, `indexedDB`, or `idb` yields **zero operational usage** across all components and services.
  - `apps/pwa-field/src/services/api.ts`:
    All API calls (`clockIn`, `clockOut`, `recordScan`, `scanCheckpoint`, `submitChecklist`, `startTrip`, `triggerAlert`) execute raw Axios HTTP requests.
- **Observed Behavior**:
  If a security officer in a basement, parking lot, or remote facility without cellular signal attempts to clock in, scan a QR code checkpoint, or log a cleaning checklist, the app fails with an unhandled Axios network error. Transactions are completely lost.
- **Severity**: **CRITICAL (P0 Architecture Violation)**.

---

#### Finding F.2 — `[BUG]` False Positive Success Indication on Failed QR Scans
- **Evidence**:
  - `apps/pwa-field/src/pages/PatrolScanPage.tsx` (lines 50-76):
    ```typescript
    try {
      await patrolApi.scanCheckpoint({ ... });
    } catch (e) {
      console.warn('API sync warning:', e);
    }
    setScanSuccessModal({ token: decodedText, time: timeStr });
    ```
- **Observed Behavior**:
  When a QR code scan fails due to network outage, geofence rejection, or server error, the code catches the exception, logs a warning to the console, and **still opens the green Success Modal** (`setScanSuccessModal`)!
- **Consequence**:
  The guard believes their patrol checkpoint was validated and continues their route, while the server recorded nothing.
- **Severity**: **CRITICAL (Operational Integrity Failure)**.

---

#### Finding F.3 — `[GAP]` Panic Button SOS Offline Behavior Unhandled
- **Evidence**:
  - `apps/pwa-field/src/pages/PanicPage.tsx` (lines 79-84):
    ```typescript
    } catch (err: any) {
      alert('Gagal mengirim SOS: ' + (err.response?.data?.message || err.message));
      setIsTriggering(false);
      setStatusMessage(null);
      setHoldProgress(0);
    }
    ```
- **Observed Behavior**:
  When offline, pressing the Panic SOS button simply triggers a browser `alert('Gagal mengirim SOS: Network Error')`.
- **Architectural Reality**:
  A device without cellular/Wi-Fi connection physically cannot transmit WebSockets or HTTP requests to the server or WhatsApp gateway. The system currently fails to inform the user of this physical reality, provides no fallback emergency telephone hotline dialer (`tel:112` or internal command center radio channel reminder), and does not queue the incident timestamp for immediate prioritized dispatch upon reconnection.
- **Severity**: **HIGH (Critical Life Safety & Emergency Defect)**.

---

### Domain G: Clean URLs, Routing, and Integration

#### Finding G.1 — `[TECHNICAL_DEBT]` Hardcoded `localhost:3000` in 26 Administrative Views
- **Evidence**:
  Hardcoded `http://localhost:3000` URLs exist across 26 files:
  - `apps/web-admin/src/components/AttendanceMatrixTab.tsx` (line 27)
  - `apps/web-admin/src/components/AttendanceMonitoringView.tsx` (line 72)
  - `apps/web-admin/src/components/AttendanceSemuaDataView.tsx` (lines 65, 117)
  - `apps/web-admin/src/components/BroadcastTab.tsx` (line 29)
  - `apps/web-admin/src/components/BulkImportModal.tsx` (lines 196, 197)
  - `apps/web-admin/src/components/HourlyPatrolMatrixTab.tsx` (line 24)
  - `apps/web-admin/src/components/LaporanSecurityAnggotaView.tsx` (line 51)
  - `apps/web-admin/src/components/LaporanCleaningServiceView.tsx` (line 71)
  - `apps/web-admin/src/components/LaporanDriverView.tsx` (line 63)
  - `apps/web-admin/src/components/PayrollTab.tsx` (line 55)
  - `apps/web-admin/src/lib/DataContext.tsx` (lines 230, 287, 322, 363)
- **Impact**:
  Any attempt to deploy the web admin application, access it via local IP (e.g. `192.168.1.x`), or route through reverse proxies causes immediate CORS errors or connection failures.
- **Severity**: **HIGH (P1 Configuration Defect)**.

---

#### Finding G.2 — `[BUG]` Hardcoded Mock Site UUID in Field Modules
- **Evidence**:
  - `apps/pwa-field/src/pages/ClockInPage.tsx` (line 129):
    `siteId: '11111111-1111-1111-1111-111111111111'`
  - `apps/pwa-field/src/pages/PatrolScanPage.tsx` (line 56):
    `siteId: '11111111-1111-1111-1111-111111111111'`
  - `apps/pwa-field/src/services/api.ts` (line 208):
    `siteId: payload.siteId || '11111111-1111-1111-1111-111111111111'`
- **Observed Behavior**:
  Field operational submissions hardcode a dummy UUID `'11111111-1111-1111-1111-111111111111'` rather than reading the logged-in user's assigned site from their profile session.
- **Impact**:
  Officers stationed at other facilities (e.g. Factory, Warehouse, Branch) have their transactions stamped against the wrong site, corrupting multi-facility audit logs and payroll reports.
- **Severity**: **HIGH (P1 Data Integrity Defect)**.

---

## 3. Findings Summary Matrix

| Finding ID | Classification | Severity | Affected Area | Core Issue |
| :--- | :--- | :--- | :--- | :--- |
| **A.1** | `BUG` / `INCONSISTENCY` | **P0 (Critical)** | Auth / Login | Indiscriminate redirect from `/login` to `/dashboard` bypassing credential form |
| **A.2** | `SECURITY_RISK` | **P1 (High)** | Middleware | Unsigned, unverified cookie length check in Next.js middleware |
| **A.3** | `SECURITY_RISK` | **P0 (Critical)** | AuthContext | Hardcoded mock account login fallback on network error |
| **A.4** | `SECURITY_RISK` | **P1 (High)** | Middleware | Field routes (`/validasi-patroli/*`) marked as public |
| **B.1** | `BUG` | **P1 (High)** | AppSidebar | "Monitoring Patroli" links to field officer PWA interface |
| **B.2** | `GAP` | **P1 (High)** | Web Admin | `HourlyPatrolMatrixTab.tsx` unmounted in route tree |
| **B.3** | `INCONSISTENCY` | **P2 (Medium)**| Laporan Routes | Duplicate folder routes vs query param tab switcher |
| **C.1** | `TECHNICAL_DEBT`| **P1 (High)** | Monorepo Apps | Complete duplication of PWA field pages in `web-admin/src/field` |
| **C.2** | `TECHNICAL_DEBT`| **P2 (Medium)**| URL Routing | Legacy masked PHP route filenames (`xxxxx_xx.php`) |
| **D.1** | `CRITICAL BUG` | **P0 (Critical)** | JwtStrategy | `user.permissions` undefined in JWT validation, breaking non-admin access |
| **D.2** | `GAP` | **P1 (High)** | RbacController | Missing update, delete, and permission assignment endpoints |
| **D.3** | `INCONSISTENCY` | **P1 (High)** | `/datainduk/rbac`| RBAC management page displays candidate approval queue |
| **D.4** | `BUG` | **P1 (High)** | UsersService | Editing user profile does not sync with `user_roles` junction table |
| **E.2** | `SECURITY_RISK` | **P2 (Medium)**| Auth API | Unthrottled registration endpoint |
| **F.1** | `CRITICAL GAP` | **P0 (Critical)** | Field PWA | No IndexedDB offline queue; transactions fail immediately when offline |
| **F.2** | `BUG` | **P0 (Critical)** | PatrolScanPage | Displays green success modal even when API call fails |
| **F.3** | `GAP` | **P1 (High)** | PanicPage | No offline SOS emergency hotline fallback or queued emergency dispatch |
| **G.1** | `TECHNICAL_DEBT`| **P1 (High)** | Web Admin | 26 instances of hardcoded `http://localhost:3000` |
| **G.2** | `BUG` | **P1 (High)** | Field Pages | Hardcoded dummy siteId `'11111111-1111-1111-1111-111111111111'` |
