# 08 — DECISION LOG & REMAINING TECHNICAL QUESTIONS (REVISED)
> **Patrol & Facility Management System (Enterprise In-House / Single-Tenant)**  
> Resolved Architecture Decisions, Remaining Technical Inquiries, and Approval Gates  
> Document Version: 2.0.0 — Status: Revised for Final Review

---

## 1. Resolved Business & Architectural Decisions

The following architectural and operational decisions have been finalized by the stakeholder and incorporated into the revised specifications:

| Decision Domain | Stakeholder Resolution | Incorporated Into Specifications |
| :--- | :--- | :--- |
| **Application Architecture Strategy** | **Option B Adopted**: Keep `apps/web-admin` (Next.js 14) and `apps/pwa-field` (Vite + React 18) as distinct frontends. Eliminate the duplicate field code in `apps/web-admin/src/field`. Serve both under one domain/origin via reverse proxy. | [`04_TARGET_ARCHITECTURE.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/04_TARGET_ARCHITECTURE.md), [`06_IMPROVEMENT_PLAN.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/06_IMPROVEMENT_PLAN.md) |
| **Authentication & Authorization** | Single authentication system; dynamic database RBAC; no client-side mock fallbacks; explicit interface access separation via `admin.dashboard.access` and `field.dashboard.access`. | [`04_TARGET_ARCHITECTURE.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/04_TARGET_ARCHITECTURE.md), [`05_DATABASE_AND_DATA_MODEL_REVIEW.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/05_DATABASE_AND_DATA_MODEL_REVIEW.md) |
| **Registration & Approval Flow** | Candidate selects a requested role stored as a preference (`requested_role_id`) granting zero permissions. Admin reviews request and assigns final role upon approval. | [`04_TARGET_ARCHITECTURE.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/04_TARGET_ARCHITECTURE.md), [`05_DATABASE_AND_DATA_MODEL_REVIEW.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/05_DATABASE_AND_DATA_MODEL_REVIEW.md) |
| **Multi-Site Personnel Resolution** | If user is assigned to 1 site, resolve automatically. If assigned to multiple sites, prompt user with explicit site selection modal before clock-in. Do not guess facility purely from GPS proximity. GPS is used as geofence validation. | [`04_TARGET_ARCHITECTURE.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/04_TARGET_ARCHITECTURE.md), [`06_IMPROVEMENT_PLAN.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/06_IMPROVEMENT_PLAN.md) |
| **Offline Attendance Verification** | Preserve both `device_timestamp` and `synced_at`. Clock discrepancies > 60 minutes must be flagged as `NEEDS_REVIEW` with `clock_skew_flag = true` for supervisor verification before affecting payroll. | [`04_TARGET_ARCHITECTURE.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/04_TARGET_ARCHITECTURE.md), [`05_DATABASE_AND_DATA_MODEL_REVIEW.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/05_DATABASE_AND_DATA_MODEL_REVIEW.md) |
| **Offline Emergency Hotline** | Do not hardcode a national hotline. Configure corporate control room telephone number in `company_profile.emergency_phone_number`. When offline, clearly inform user that real-time alert is delayed and provide telephone dialer fallback. | [`04_TARGET_ARCHITECTURE.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/04_TARGET_ARCHITECTURE.md), [`06_IMPROVEMENT_PLAN.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/06_IMPROVEMENT_PLAN.md) |
| **Offline Transaction States** | 5 distinct transaction states enforced: `PENDING_OFFLINE`, `SYNCING`, `SYNCED`, `REJECTED`, `NEEDS_REVIEW`. Never display offline transactions as server-confirmed successes. | [`04_TARGET_ARCHITECTURE.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/04_TARGET_ARCHITECTURE.md), [`06_IMPROVEMENT_PLAN.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/06_IMPROVEMENT_PLAN.md) |
| **Implementation Approval** | **No implementation approval granted yet.** Strict stop after documentation revision. | [`07_IMPLEMENTATION_ROADMAP.md`](file:///c:/all%20project/Patrol-Management-System/docs/system-audit/07_IMPLEMENTATION_ROADMAP.md) |

---

## 2. Remaining Unresolved Technical Questions

The following implementation-level inquiries remain for technical alignment:

### Question 1: Existing Physical QR Placard Compatibility
- **Context**: The database seed data and legacy PHP system used simple string/integer tokens (e.g. `"1001"`, `"1002"`). The target architecture introduces cryptographic HMAC signatures (`HMAC-SHA256(checkpoint_id, secret_salt)`).
- **Inquiry**: Are there physical QR code stickers already printed and mounted on customer facility walls that must remain valid during initial deployment, or will new placards be printed from `/datainduk/checkpoint` prior to go-live?
- **Recommendation**: Implement **Dual Validation** in `PatrolService` during Phase 2 (supporting both legacy tokens and HMAC tokens) so existing physical tags continue to function without disruption.

### Question 2: 180-Day Media Retention Purge Execution Mechanism
- **Context**: Media retention policy mandates purging selfie photos and inspection uploads after 180 days (6 months).
- **Inquiry**: Should the purge worker execute as an in-process scheduled NestJS cron job (`@nestjs/schedule`), or will an external object storage lifecycle rule (e.g. AWS S3 / MinIO bucket lifecycle expiration) manage the deletion?
- **Recommendation**: Use a NestJS in-process scheduled task (`@Cron('0 2 * * *')`) that removes local filesystem upload files older than 180 days and sets `photo_key = NULL` in the database, with compatibility for S3 presigned URLs.

### Question 3: Production Domain & Reverse Proxy Infrastructure
- **Context**: In local development, `scripts/local-gateway.js` serves as the single-port reverse proxy at `:8080`.
- **Inquiry**: For the on-premise production server, will the deployment environment use standard Nginx / Traefik on port 80/443, or will a Docker Compose reverse proxy container be deployed alongside Postgres and Redis?
- **Recommendation**: Provide a standard production `docker/nginx.conf` and `docker-compose.prod.yml` mapping ports 80/443 directly to internal services.

---

## 3. Explicit List of Actions Requiring Owner Approval

To initiate the implementation phase, explicit owner approval is required for the following items:

1. **Authorization to Begin Phase 1**:
   - Permission to refactor `apps/web-admin/src/middleware.ts` to decode JWT expiration and eliminate premature login redirects.
   - Permission to remove client-side mock account fallbacks from `AuthContext.tsx`.
   - Permission to add rate-limiting (`@Throttle`) to `POST /api/v1/auth/register`.
2. **Approval of Database Migration `011_target_architecture_sync.sql`**:
   - Permission to execute migration adding `requested_role_id`, `client_transaction_id`, sync audit columns, and anti-lockout triggers in Phase 2.
3. **Approval to Delete Duplicated Field Directory**:
   - Permission to remove `apps/web-admin/src/field` in Phase 6, establishing `apps/pwa-field` as the sole authoritative source of truth.
