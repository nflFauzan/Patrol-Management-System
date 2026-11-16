# Testing Strategy & Quality Assurance Framework
> **Patrol & Facility Management System (Enterprise In-House)**  
> Multi-Tiered Verification, TDD Methodology, and Continuous Integration Standards.

---

## 1. Testing Philosophy & Definition of Done (DoD)

Quality assurance in this system operates on a zero-tolerance principle for fake green checks and mock production paths. Every business feature and architectural change must satisfy four tiers of verification:

```
[Tier 1: Typecheck & Build] ➔ [Tier 2: Unit Logic (Jest/Vitest)] ➔ [Tier 3: Live PostGIS DB] ➔ [Tier 4: E2E Scenarios (Playwright)]
```

---

## 2. Test Pyramid & Directory Layout

### Tier 1: Static Type & Build Compilation
- `@patrol/types`: `npm run build --workspace=@patrol/types`
- `@patrol/backend`: `npm run build --workspace=@patrol/backend`
- `@patrol/pwa-field`: `npm run build --workspace=@patrol/pwa-field`
- `@patrol/web-admin`: `npm run build --workspace=@patrol/web-admin`

### Tier 2: Unit & Business Logic Tests (Jest / Fastify)
Located in `apps/backend/src/**/*.spec.ts`:
- **Attendance & Shift Engine**:
  - `attendance.service.spec.ts`: Grace period tolerance, night shift overtime calculations, geofence boundary checks.
- **Dynamic RBAC & Authorization**:
  - `jwt.strategy.spec.ts`: Verification of permissions join, rejection of unapproved users, secret alignment.
  - `rbac.spec.ts`: Custom role creation, unique role codes, permission assignment, Super Admin protection.
  - `approval.spec.ts`: Approval queue filtration, role/site assignment, rejection reason enforcement.
- **Operational Domains**:
  - `patrol.service.spec.ts`: Checkpoint QR verification, proximity calculation, auto-incident ticket generation.
  - `cleaning.service.spec.ts`: Periodic zone checklists, before/after photo verification.
  - `driver.service.spec.ts`: Trip logging, odometer validation, logistics delivery status.
  - `sos.service.spec.ts`: Emergency broadcast, WhatsApp gateway payload assembly, false-alarm mitigation.

### Tier 3: Live Database & Integration Testing
- Real PostgreSQL 17 + PostGIS container queries:
  - `scripts/check-db.js`: Connection latency, extension readiness, seed verification.
  - `scripts/check-rbac-db.js`: Table schema, role-permission junction verification.
  - `scripts/test-rbac-approval-e2e.js`: 7-step automated scenario on live database.

### Tier 4: Robotic Browser End-to-End Testing (Playwright)
Located in `tests/e2e/`:
- Multi-persona validation:
  - **Persona A (Super Admin)**: Command center dashboard, approval queue processing, role creation, emergency dispatch view.
  - **Persona B (Field Officer - Satpam/Cleaning/Driver)**: Login flow, selfie camera verification, GPS location detection, checkpoint scanning, offline queue persistence.
  - **Persona C (Pending Candidate)**: Self-registration with requested role/division, login attempt blocking (403), password lockout after 5 failed attempts (423).
