# 03 — ROUTE AND PERMISSION MATRIX
> **Patrol & Facility Management System (Enterprise In-House / Single-Tenant)**  
> Comprehensive Inventory of Page Routes, API Endpoints, Current Protections, and Proposed RBAC Rules

---

## 1. Matrix Overview & Governance Principles

True enterprise security enforces authorization at **both layers**:
1. **Frontend Route Protection**: User interface visibility and navigation guards that direct users to their assigned workspace and prevent unauthorized route entry.
2. **Backend API Gatekeeping**: Cryptographic JWT validation, token expiration enforcement, and granular `@Permissions(...)` verification on every controller endpoint.

Hiding a menu item in the sidebar is **not** authorization. Every protected operation must require an explicit, granular permission verified by the backend.

---

## 2. Web Admin (Desktop Interface) Route Matrix

| Route Path | Module / Feature Name | Target User Roles | Required Permission | Current Protection Status | Current Behavior & Defect | Expected Behavior & Proposed Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Portal Gateway Landing | Public / All | *None (Public)* | Public route in `middleware.ts` | Displays "MASUK" and "DAFTAR" buttons. | Renders corporate landing page. If valid authenticated session exists, displays "Lanjut ke Dashboard / App" button. |
| `/login` | Authentication Portal | Public / All | *None (Public)* | Public route in `middleware.ts` | **BUG:** If cookie exists (>20 chars), immediately redirects to `/dashboard` without displaying login form. | Displays credential form. If user already logged in, shows active session with "Ganti Akun" or "Lanjut ke Aplikasi" options. |
| `/register` | Personnel Registration | Public Candidates | *None (Public)* | Public route in `middleware.ts` | Submits candidate profile with `is_approved=false`. | Form with NIK, name, desired division. Honeypot + IP rate limiter (max 5/hr). |
| `/dashboard` | Executive Command Center | Super Admin, Ops Manager, Site Supervisor, Chief | `DASHBOARD:VIEW` | `middleware.ts` checks token length > 20 | Accessible by any user if cookie present. In `AuthContext`, non-admin users get redirected. | Accessible to management roles. Displays real-time metrics, live radar, and alert feeds. Non-management field users redirected to `/validasi-patroli`. |
| `/monitoring-patroli` *(New Target)* | Admin Patrol Monitoring | Super Admin, Ops Manager, Site Supervisor | `PATROL:VIEW` | Currently missing; sidebar linked to `/validasi-patroli` | **BUG:** Admin clicking sidebar was taken to mobile PWA! `HourlyPatrolMatrixTab.tsx` was unmounted. | Dedicated desktop page mounting `HourlyPatrolMatrixTab` (24h hourly matrix 00-23) and active patrol officer map. |
| `/absensi` | Attendance Monitoring Hub | Super Admin, Ops Manager, HRD Payroll | `ABSENSI:VIEW` | `canViewAbsensi` in sidebar; `JwtAuthGuard` on API | Displays 31-day shift matrix and attendance log table. | Accessible to HR and Management. View attendance photos, lateness calculations, and geofence verification. |
| `/emergency` | SOS Emergency Center | Super Admin, Ops Manager, Site Supervisor | `SOS:VIEW` | Unprotected in sidebar; Socket.io listener | Displays Leaflet radar map with active SOS siren. | Immediate real-time audio/visual alert for active panic triggers with resolution workflow. |
| `/datainduk/area` | Facility & Site Management | Super Admin, Ops Manager | `DATA_INDUK:MANAGE` | `DATA_INDUK:VIEW` in sidebar; `JwtAuthGuard` on API | CRUD for sites, geofence radius, and 5 shift schedules. | Strict management access. Create/edit facility coordinates with Leaflet geofence circle. |
| `/datainduk/checkpoint` | Checkpoint QR Management | Super Admin, Site Supervisor | `DATA_INDUK:MANAGE` | `DATA_INDUK:VIEW` in sidebar; `JwtAuthGuard` on API | Checkpoint CRUD and batch printable QR code sheet. | Filterable by facility site & division. Printable QR with HMAC tamper-evident signature. |
| `/datainduk/personil` | Personnel & ID Cards | Super Admin, HRD, Ops Manager | `USER:MANAGE` | `DATA_INDUK:VIEW` in sidebar; `JwtAuthGuard` on API | Employee management, salary attributes, ID card generation. | **BUG:** Editing user profile in UI does not synchronize with `user_roles` table in PostgreSQL. Must sync both. |
| `/datainduk/approval` | Account Approval Queue | Super Admin, Ops Manager, HRD | `USER:APPROVE` | `canApproveUser` in sidebar; `@Permissions('USER:APPROVE')` on backend | Displays pending registrations with approval & rejection modals. | Review NIK, assign verified Role, facility Site, and wage attributes. |
| `/datainduk/rbac` | Role & Permissions RBAC | Super Admin | `RBAC:MANAGE` | `canManageRbac` in sidebar; backend has partial controller | **BUG:** Displays candidate approval queue instead of role permissions manager. | Dedicated dual-column matrix: create/edit roles, toggle active status, assign/remove granular permissions. Protect last `ADMIN_SUPER`. |
| `/gaji` | Payroll Calculation | Super Admin, HRD Payroll | `GAJI:ACCESS` | `canAccessGaji` in sidebar; `JwtAuthGuard` on API | Tabular payroll summary, deductions, printable pay slip. | Calculates gross wages, BPJS, overtime, alpa deductions, net pay. PDF print. |
| `/pesan-siaran` | Broadcast Messaging | Super Admin, Ops Manager | `BROADCAST:SEND` | `canSendBroadcast` in sidebar; `JwtAuthGuard` on API | Composes broadcast announcement pushed to field staff. | Pushes notification to target site or all personnel via WebSocket. |
| `/export-laporan` | Document Export Center | Super Admin, Ops Manager, HRD | `LAPORAN:EXPORT` | `canViewLaporan` in sidebar; `JwtAuthGuard` on API | Multi-tab export wizard for Excel and PDF HRIS summaries. | Streams verified attendance, patrol completion, and hours to formatted Excel/CSV. |
| `/laporan` | Operational Reports Hub | Super Admin, Ops Manager, Supervisors | `LAPORAN:VIEW` | `canViewLaporan` in sidebar; `JwtAuthGuard` on API | Segmented tabs for Security, Cleaning, Driver, Staff, Tracking. | Unified operational log audit. Sub-routes in `app/laporan/*` consolidated under clean tab routing. |

---

## 3. Field Operational (PWA Responsive Interface) Route Matrix

The Field Operational Interface is a **mobile-first, responsive PWA** accessed by all non-admin personnel. When accessed on a tablet or desktop, it renders in a centered, responsive container.

| Route Path | Screen Name | Intended User Roles | Required Permission | Current Protection Status | Current Behavior & Defect | Expected Behavior & Proposed Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/validasi-patroli` | Field Operations Dashboard | Security, Cleaner, Driver, Staff, Chief | `FIELD:ACCESS` | Marked as `isPublicRoute` in middleware! | Displays greeting, 4-stat cards, dynamic module shortcuts. | Protected route. Dynamically renders module action buttons according to user's permissions and current attendance status. |
| `/validasi-patroli/clock-in` | Presensi Masuk (Clock-In) | All Field Personnel | `ATTENDANCE:CHECK_IN` | Public in middleware; no offline queue | Front camera selfie + GPS geofence check. **BUG:** Hardcodes dummy `siteId`. Fails completely when offline. | Validates GPS within site geofence radius. Offline queue in IndexedDB with local timestamp if offline. |
| `/validasi-patroli/clock-out` | Presensi Pulang (Clock-Out) | All Field Personnel | `ATTENDANCE:CHECK_OUT` | Public in middleware; no offline queue | Front selfie + GPS coordinates. Calculates work duration. | Validates check-out. Queues in IndexedDB if offline. Updates daily effective minutes. |
| `/validasi-patroli/patrol-scan` | Scan QR Checkpoint | Security Officers | `PATROL:SCAN` | Public in middleware; no offline queue | Scans physical QR. **CRITICAL BUG:** Shows green success modal even if API call fails! Hardcodes dummy `siteId`. | Decodes QR token, captures GPS. If offline, stores in IndexedDB `pending_scans` with sync status badge. |
| `/validasi-patroli/panic` | Panic Button SOS | All Personnel | `SOS:TRIGGER` | Public in middleware; no offline queue | 3-second continuous hold triggers WebSocket + WhatsApp. **BUG:** If offline, throws network alert with no guidance. | Immediate WebSocket dispatch. If offline, shows emergency telephone hotline (`tel:112` / internal radio reminder) & queues alert. |
| `/validasi-patroli/leave` | Pengajuan Izin / Sakit | All Personnel | `ATTENDANCE:LEAVE` | Public in middleware; no offline queue | Form with leave reason and document/doctor note attachment. | Submits leave request. Reflected in HR attendance monitoring. |
| `/validasi-patroli/attendance-history` | Riwayat Absensi Pribadi | All Personnel | `ATTENDANCE:VIEW_OWN` | Public in middleware | 30-day personal clock-in/out log with selfie previews. | Reads from local IndexedDB cache when offline, syncs with backend when online. |
| `/validasi-patroli/activity-history` | Riwayat Kegiatan Pribadi | All Personnel | `ACTIVITY:VIEW_OWN` | Public in middleware | Chronological stream of completed patrols/cleanings. | Displays personal task records. |
| `/validasi-patroli/profile` | Profil & Ganti Sandi | All Personnel | `PROFILE:MANAGE` | Public in middleware | Profile details & password update form. | Self-service password change. Invalidate old JWT on password update. |
| `/validasi-patroli/driver-trip` | Log Armada & Odometer | Logistics Drivers | `DRIVER:LOG_TRIP` | Public in middleware | Odometer camera snapshot, plate number, route notes. | Starts/completes vehicle journey. Captures odometer image with timestamp watermark. |
| `/validasi-patroli/staff-activity` | Checklist Sanitasi & Tugas | Cleaners & Staff | `CLEANING:SUBMIT` | Public in middleware | Zone sanitation checklist (toilet, floor) + photo evidence. | Zone-based checklist with before/after photos. Offline queuing enabled. |
| `/validasi-patroli/commander-report`| Serah Terima Shift Danru | Security Commanders (Danru) | `PATROL:HANDOVER` | Public in middleware | Shift handover briefing, weapons/inventory check. | Submitted by Danru at shift transitions. |
| `/validasi-patroli/chief-report` | Evaluasi Supervisi Chief | Chief Security | `CHIEF:EVALUATE` | Public in middleware | Multi-criteria scorecards for commanders on duty. | Evaluates Danru discipline, coordination, and attendance. |

---

## 4. Backend API Endpoints Authorization Matrix

| HTTP Method | API Endpoint Path | Controller & Module | Required Backend Guard | Required Permission Code | Identified Vulnerabilities & Audit Findings |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | `AuthController` | None *(Public)* | *Public with Honeypot* | Working honeypot, but **unthrottled**. Vulnerable to registration floods. |
| `POST` | `/api/v1/auth/login` | `AuthController` | None *(Public)* | *Public with Honeypot* | Working 5x brute force lockout & approval check. |
| `GET` | `/api/v1/auth/me` | `AuthController` | `JwtAuthGuard` | *Authenticated User* | Returns user profile. Does not return freshly updated permissions if role changed after login. |
| `GET` | `/api/v1/users/approval-queue` | `UsersController` | `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard` | `USER:APPROVE` | **BUG:** Fails for non-superadmin because `JwtStrategy` fails to load `user.permissions`! |
| `POST` | `/api/v1/users/:id/approve` | `UsersController` | `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard` | `USER:APPROVE` | Working approval logic, but suffers from `JwtStrategy` permissions bug. |
| `POST` | `/api/v1/users/:id/reject` | `UsersController` | `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard` | `USER:APPROVE` | Working rejection logic, but suffers from `JwtStrategy` permissions bug. |
| `GET` | `/api/v1/users` | `UsersController` | `JwtAuthGuard` | `DATA_INDUK:VIEW` | Currently missing permission decorator; open to any authenticated user! |
| `POST` | `/api/v1/users` | `UsersController` | `JwtAuthGuard`, `RolesGuard` | Hardcoded `@Roles(...)` | **TECHNICAL DEBT:** Uses static role enum instead of dynamic `USER:MANAGE` permission. |
| `PUT` | `/api/v1/users/:id` | `UsersController` | `JwtAuthGuard`, `RolesGuard` | Hardcoded `@Roles(...)` | **BUG:** Modifies `users.role` varchar but does not update `user_roles` junction table. |
| `POST` | `/api/v1/users/verify-delete` | `UsersController` | `JwtAuthGuard`, `RolesGuard` | Hardcoded `@Roles(...)` | Working password re-verification, but uses hardcoded role enum. |
| `GET` | `/api/v1/rbac/roles` | `RbacController` | `JwtAuthGuard` | `RBAC:MANAGE` | Missing permission guard; currently returns roles to any authenticated user. |
| `POST` | `/api/v1/rbac/roles` | `RbacController` | `JwtAuthGuard`, `PermissionsGuard` | `RBAC:MANAGE` | Creates new role, but suffers from `JwtStrategy` permissions bug. |
| `PUT` | `/api/v1/rbac/roles/:id` | `RbacController` | *(Missing Endpoint)* | `RBAC:MANAGE` | **GAP:** Cannot update role name, description, or assigned permissions. |
| `DELETE` | `/api/v1/rbac/roles/:id` | `RbacController` | *(Missing Endpoint)* | `RBAC:MANAGE` | **GAP:** Cannot deactivate or delete custom roles. Must protect system roles. |
| `GET` | `/api/v1/rbac/permissions` | `RbacController` | `JwtAuthGuard` | `RBAC:MANAGE` | Returns master permissions list. |
| `GET` | `/api/v1/attendance/today` | `AttendanceController` | `JwtAuthGuard` | `ATTENDANCE:CHECK_IN` | Returns caller's attendance status for the current day. |
| `GET` | `/api/v1/attendance/history` | `AttendanceController` | `JwtAuthGuard` | `ATTENDANCE:VIEW_OWN` | Returns caller's personal 30-day attendance history. |
| `GET` | `/api/v1/attendance/monitoring-matrix` | `AttendanceController` | `JwtAuthGuard` | `ABSENSI:VIEW` | **SECURITY GAP:** Has NO permission guard! Any junior cleaner can view company-wide attendance and lateness records! |
| `GET` | `/api/v1/attendance/records` | `AttendanceController` | `JwtAuthGuard` | `ABSENSI:VIEW` | **SECURITY GAP:** Missing permission check. Must be restricted to `ABSENSI:VIEW`. |
| `POST` | `/api/v1/attendance/clock-in` | `AttendanceController` | `JwtAuthGuard` | `ATTENDANCE:CHECK_IN` | Uses `@CurrentUser()`. Must validate GPS coordinates against site geofence radius. |
| `POST` | `/api/v1/attendance/clock-out` | `AttendanceController` | `JwtAuthGuard` | `ATTENDANCE:CHECK_OUT` | Uses `@CurrentUser()`. Calculates overtime and effective working minutes. |
| `POST` | `/api/v1/attendance/leave` | `AttendanceController` | `JwtAuthGuard` | `ATTENDANCE:LEAVE` | Submits leave request. |
| `GET` | `/api/v1/patrol/hourly-monitoring` | `PatrolController` | `JwtAuthGuard` | `PATROL:VIEW` | **SECURITY GAP:** Missing permission check. Serves 24h checkpoint matrix. |
| `POST` | `/api/v1/patrol/scan` | `PatrolController` | `JwtAuthGuard` | `PATROL:SCAN` | Validates QR code and records checkpoint scan log. |
| `POST` | `/api/v1/patrol/:id/tl` | `PatrolController` | `JwtAuthGuard` | `PATROL:VALIDATE` | **SECURITY GAP:** Missing permission check. Any user can resolve/alter patrol findings. |
| `POST` | `/api/v1/sos/trigger` | `SosController` | `JwtAuthGuard` | `SOS:TRIGGER` | Triggers WebSocket broadcast and WhatsApp emergency alert. |
| `POST` | `/api/v1/sos/:id/acknowledge` | `SosController` | `JwtAuthGuard`, `PermissionsGuard` | `SOS:RESOLVE` | Acknowledges active emergency alert. |
| `POST` | `/api/v1/sos/:id/resolve` | `SosController` | `JwtAuthGuard`, `PermissionsGuard` | `SOS:RESOLVE` | Resolves emergency incident with resolution notes. |
| `GET` | `/api/v1/reports/hris-attendance` | `ReportsController` | `JwtAuthGuard` | `LAPORAN:EXPORT` | **SECURITY GAP:** Missing permission check. Exports employee working hours. |

---

## 5. Proposed Granular Permissions Catalog

```
DATA INDUK:
├── DATA_INDUK:VIEW           # View facilities, checkpoints, and personnel lists
└── DATA_INDUK:MANAGE         # Create, update, delete facilities & checkpoints

USER & RBAC:
├── USER:VIEW                 # View user details and profile records
├── USER:MANAGE               # Create, update personnel profiles & wage attributes
├── USER:APPROVE              # Review, approve, or reject candidate registrations
└── RBAC:MANAGE               # Create roles, modify permissions, assign roles to users

ATTENDANCE:
├── ATTENDANCE:CHECK_IN       # Submit clock-in with selfie and GPS verification
├── ATTENDANCE:CHECK_OUT      # Submit clock-out with work duration calculation
├── ATTENDANCE:LEAVE          # Submit permission / sick leave request
├── ATTENDANCE:VIEW_OWN       # View own 30-day personal attendance log
└── ABSENSI:VIEW              # View company-wide attendance logs & 31-day shift matrix

PATROL & FIELD:
├── PATROL:SCAN               # Scan QR code checkpoints on physical routes
├── PATROL:VIEW               # View 24h hourly patrol compliance matrix
└── PATROL:VALIDATE           # Follow up and resolve abnormal patrol findings

OPERATIONAL DIVISIONS:
├── CLEANING:SUBMIT           # Submit periodic zone sanitation checklists
├── CLEANING:VERIFY           # Review and verify hygiene sanitation proofs
├── DRIVER:LOG_TRIP           # Log fleet departure/arrival with odometer snapshot
└── DRIVER:MONITOR            # Monitor fleet movements and vehicle mileages

EMERGENCY & COMMUNICATIONS:
├── SOS:TRIGGER               # Trigger Panic Button SOS emergency alert
├── SOS:VIEW                  # View live emergency radar map and active sirens
├── SOS:RESOLVE               # Acknowledge and resolve emergency incidents
└── BROADCAST:SEND            # Dispatch push broadcasts to facility personnel

REPORTING & PAYROLL:
├── GAJI:ACCESS               # View payroll calculations, deductions, & print salary slips
└── LAPORAN:EXPORT            # Export official PDF / Excel audit and HRIS reports
```
