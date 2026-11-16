# Security Verification & Hardening Report
> **Patrol & Facility Management System (Enterprise In-House)**  
> Comprehensive audit of authentication, session management, RBAC, input sanitization, and protection mechanisms.

---

## 1. Security Baseline & Vulnerability Remediations

### A. Elimination of Synthetic/Demo Bypass
- **Baseline Finding**: `apps/web-admin/src/lib/AuthContext.tsx` contained hardcoded `DEMO_ACCOUNTS` that generated mock JWT tokens on the client side without communicating with the backend.
- **Remediation**: All mock accounts, synthetic token generators, and client-side credential fallbacks were completely purged. Authentication now strictly requires cryptographic server-side validation against `POST /api/v1/auth/login` and `GET /api/v1/auth/me`.

### B. Middleware Session Validation
- **Baseline Finding**: `apps/web-admin/src/middleware.ts` evaluated authentication simply by checking `cookies.get('patrol_session')?.value?.length > 20`, causing premature and unauthorized redirection from `/login`.
- **Remediation**: Replaced arbitrary string-length checks with proper path-based routing that allows `/login` to render while permitting the authenticated client to verify sessions against `/api/v1/auth/me`.

### C. Granular Backend Authorization & Secret Alignment
- **Baseline Finding**: `JwtStrategy` did not query the `user_roles` and `role_permissions` tables, causing `request.user.permissions` to be undefined, and used mismatched JWT secrets.
- **Remediation**:
  - `JwtStrategy.validate()` joins `user_roles` ➔ `role_permissions` ➔ `permissions` to populate `request.user.permissions`.
  - Unapproved (`is_approved = false`) and rejected users are denied access immediately with HTTP 403 Forbidden.
  - Unified JWT secret across `AuthModule` and `JwtStrategy` using `JWT_ACCESS_SECRET`.

### D. Super Admin Protection Mechanism
- **Security Requirement**: Prevent accidental or malicious lockout where all Super Admins are deleted or stripped of permissions.
- **Implementation**: `UsersService.updateRole()`, `assignUserRole()`, and `deactivateRole()` check the total count of active `ADMIN_SUPER` users. If a requested operation would demote or deactivate the last remaining Super Admin, the request is blocked with HTTP 400 Bad Request.

---

## 2. Authentication Protection Controls

### A. Password Hashing
- Passwords are encrypted using Bcrypt with a minimum salt rounds / cost factor of 10.
- Raw passwords are never persisted or printed to application logs.

### B. Brute-Force & Account Lockout
- Failed login attempts are incremented in `users.failed_login_attempts`.
- Reaching 5 consecutive failed attempts automatically triggers a 15-minute account lockout (`locked_until = NOW() + INTERVAL '15 minutes'`), returning HTTP 423 Locked.
- Successful authentication resets the failed attempts counter to 0.

### C. Bot & Spam Registration Prevention
- Registration forms include an invisible honeypot field (`hp_input`). If populated by automated bots, the registration is immediately rejected with HTTP 400 without touching database resources.

---

## 3. Spatial & Input Sanitization

### A. PostGIS Spatial Validation
- All latitude and longitude coordinates submitted from mobile devices are validated as finite numbers before insertion into `ST_SetSRID(ST_MakePoint(lon, lat), 4326)`.
- Geofence calculations compute spherical distances using PostGIS geography casts to prevent spatial distortion.

### B. Idempotency & Replay Protection
- Field transactions (presensi masuk/pulang, checkpoint scan) carry a client-generated UUID idempotency key (`id`). Resubmitting the same key returns the existing record instead of creating duplicate attendance or patrol records.
