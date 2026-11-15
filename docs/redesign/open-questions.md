# PATROLI SITE — OPEN QUESTIONS & ARCHITECTURAL CLARIFICATIONS
> **Documented Technical Decisions, Codebase Ambiguities, and Confirmation Points for Stakeholder Alignment**  
> Document Version: 1.0.0 — Target Monorepo: `Patrol-Management-System`

---

## 1. Purpose of This Document

In strict compliance with **Phase 0 Rules** ("Never silently assume missing business requirements. If you discover missing information, document it in an open questions section rather than making assumptions"), this document logs all architectural ambiguities discovered during the repository audit that require explicit stakeholder clarification prior to code execution.

---

## 2. Open Questions & Decision Targets

### Question 1: Codebase Duplication Strategy (`apps/web-admin/src/field` vs `apps/pwa-field`)
- **Discovered Situation**: The entire set of mobile operational screens (`ClockInPage`, `ClockOutPage`, `PatrolScanPage`, `DriverTripPage`, `CommanderReportPage`, `ChiefReportPage`, `StaffActivityPage`) exists in **two separate directories**:
  1. `apps/pwa-field/src/pages/` (Standalone Vite PWA application).
  2. `apps/web-admin/src/field/pages/` (Embedded mirror for Next.js web admin simulation under `/field` and `/validasi-patroli`).
- **Open Decision**:
  - *Option A (Recommended)*: Refactor the shared field components into a common workspace package (e.g. `packages/field-ui` or shared export) so redesign changes are automatically reflected in both apps simultaneously without manual duplication.
  - *Option B (Status Quo)*: Maintain dual synchronization manually during Phases 7–10, updating both directories in parallel to avoid touching package structure.
- **Impact**: Affects implementation velocity and long-term maintainability.

---

### Question 2: Mobile Navigation — Drawer vs Bottom Bar Directive
- **Discovered Situation**: The uploaded reference image (`media_1794764962295_9157fa84.jpg`) contains a mobile screen mockup displaying a 4-tab bottom navigation bar (`Beranda`, `Patroli`, `Laporan`, `Profil`). However, the project specification explicitly mandates:
  > *"Use a slide-out drawer triggered by a compact menu button. DO NOT use a permanent bottom navigation bar. DO NOT replace the sidebar with a horizontal navbar. Ensure the drawer supports role-specific navigation."*
- **Resolution in Planning**: We have strictly followed the prompt's explicit instruction and designed a **Slide-Out Navigation Drawer (`MobileNavigationDrawer`)** triggered by a compact header hamburger icon, with zero permanent bottom navigation bar.
- **Open Clarification**: Please confirm this resolution. Should a floating persistent SOS button be permitted in the bottom right corner of the mobile viewport, or should the SOS button remain inside the dashboard feed and slide-out drawer?

---

### Question 3: Development / Demo Role Switcher in Production Builds
- **Discovered Situation**: `apps/pwa-field/src/pages/DashboardPage.tsx` currently contains an inline role switcher in the greeting header (`👋 HELLO, HENDRA CHIEF`), allowing instantaneous switching between Chief (Hendra), Danru (Dandan), Satpam (Budi), Driver (Joko), and Staff (Siti).
- **Open Decision**:
  - *Option A*: Retain the role switcher as a discrete floating developer tool enabled only in `process.env.NODE_ENV !== 'production'`.
  - *Option B (Recommended for Enterprise)*: In production, completely remove the role switcher and bind the active user profile strictly to the authenticated JWT session stored in `AuthContext`.

---

### Question 4: Self-Hosted Font Strategy for Air-Gapped Corporate Networks
- **Discovered Situation**: The current `globals.css` imports Font-Awesome from an external public CDN (`cdnjs.cloudflare.com`). Many enterprise corporate sites, high-security factories, and logistics warehouses operate on isolated intranet networks (air-gapped or restricted firewall) where external CDNs fail to load.
- **Open Decision**:
  - *Recommendation*: Use Next.js 14 `@next/font/google` for **Plus Jakarta Sans** and **Inter**, which automatically downloads and self-hosts the font files at build time into the application bundle, requiring zero external CDN requests during runtime.

---

### Question 5: Dynamic RBAC Roles Representation in the Sidebar
- **Discovered Situation**: The database supports dynamic custom roles created via `/datainduk/rbac`.
- **Open Decision**:
  - When an administrator creates a new custom role (e.g. `INSPEKTOR_K3`), should it automatically inherit a standard operational sidebar layout with items filtered strictly by its assigned permissions (`PermissionDefinition`), or should there be a dedicated visual role-tag badge in the sidebar header?
  - *Planned Behavior*: The new `AppSidebar` dynamically filters menu groups and items strictly based on `hasPermission(...)`, ensuring any custom role only sees the exact pages it has been granted.

---

### Question 6: Shift Matrix Cell Visual Color Standardization
- **Discovered Situation**: In `AttendanceMatrixTab.tsx`, monthly attendance days are rendered with single-letter codes:
  - `M` = Masuk (Present on time)
  - `P` = Pulang (Clocked out)
  - `P+` = Pulang Cross-Midnight
  - `X` = Lupa Absen Pulang (Penalty)
  - `I` = Izin / Sakit
  - `-` = Off / Libur
- **Open Decision**:
  - Should the redesign standardize these matrix cells with the new skeuomorphic semantic palette:
    - `M` / `P`: Emerald green badge (`#DCFCE7` / `#15803D`)
    - `P+`: Sky blue badge (`#E0F2FE` / `#0284C7`)
    - `X`: Crimson red badge (`#FEE2E2` / `#B91C1C`)
    - `I`: Amber gold badge (`#FEF3C7` / `#B45309`)
    - `-`: Slate neutral badge (`#F1F5F9` / `#64748B`)
