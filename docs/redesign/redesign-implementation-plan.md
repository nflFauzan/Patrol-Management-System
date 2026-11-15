# PATROLI SITE — PHASED REDESIGN IMPLEMENTATION PLAN
> **Step-by-Step Architectural Roadmap, File Mapping, Verification Gates, and Acceptance Criteria**  
> Document Version: 1.0.0 — Target Monorepo: `Patrol-Management-System`

---

## 1. Execution Philosophy & Quality Gates

This roadmap details a controlled, non-disruptive migration from the existing fragmented UI to the **Modern Skeuomorphism — Light Gray + Sky Blue** design system.

### Absolute Ground Rules:
1. **Zero Business Logic Modification**: All API contracts, PostGIS database queries, WebSocket event signatures, and business validation rules remain intact.
2. **Phase Completion Definition of Done (DoD)**: No phase is complete without passing the 4 DoD criteria defined in `AGENTS.md`:
   - `npm run build --workspaces` (Zero TypeScript compilation errors).
   - Vitest / Jest unit tests pass 100%.
   - Live PostgreSQL 17 + PostGIS database integration verified.
   - Playwright E2E scenarios validated.
3. **Rollback Safety**: File changes are isolated to presentation and layout components.

---

## 2. Implementation Phases Overview

```
[ PHASE 1: Design Tokens & Foundations ]
       │
       ▼
[ PHASE 2: Shared Layout & AppSidebar ]
       │
       ▼
[ PHASE 3: Admin Operational Dashboard ]
       │
       ▼
[ PHASE 4: Admin Master Data (Area, Checkpoint, Personil, RBAC) ]
       │
       ▼
[ PHASE 5: Admin Operational Modules (Absensi, Emergency SOS, Siaran) ]
       │
       ▼
[ PHASE 6: Admin Reporting & Payroll (Laporan Hub, Gaji, Export Center) ]
       │
       ▼
[ PHASE 7: Security Mobile Experience (PWA Clock-In, QR Scanner, Panic) ]
       │
       ▼
[ PHASE 8: Cleaning Service Mobile Experience (Checklist, Photo Evidence) ]
       │
       ▼
[ PHASE 9: Driver Logistics Mobile Experience (Trip Log, Odometer Camera) ]
       │
       ▼
[ PHASE 10: Staff & Karyawan Mobile Experience (Activity & Profile) ]
       │
       ▼
[ PHASE 11: Cross-Viewport Responsive Refinement (1440px / 768px / 390px) ]
       │
       ▼
[ PHASE 12: End-to-End Regression Testing & Visual QA ]
```

---

## 3. Phase Specifications

### Phase 1: Design Tokens & Foundations
- **Objective**: Establish the core Modern Skeuomorphism tokens, typography, and atomic base styles across both web-admin and pwa-field without touching layout components.
- **Scope**:
  - Extend Tailwind configurations with semantic colors (`canvas-base`, `sidebar-base`, `primary-blue`, `sky-accent`, `surface-card`, `surface-inset`).
  - Configure skeuomorphic shadow and highlight utilities (`shadow-skeuo-card`, `shadow-skeuo-inset`, `shadow-skeuo-button`).
  - Configure font loading for Plus Jakarta Sans and Inter.
  - Purge legacy PHP CSS classes (`.btn-tambah-area`, `.patroli-nav`, CDN font-awesome) from `globals.css`.
- **Files Likely to Change**:
  - `apps/web-admin/tailwind.config.ts`
  - `apps/web-admin/src/app/globals.css`
  - `apps/web-admin/src/app/layout.tsx`
  - `apps/pwa-field/tailwind.config.js`
  - `apps/pwa-field/src/index.css`
- **Dependencies**: None.
- **Testing Strategy**: `npm run build --workspaces` to verify Tailwind compilation and font bundle resolution.
- **Rollback Strategy**: Revert `tailwind.config.*` and `globals.css` via Git. Zero impact on components since existing class names are unaffected.
- **Acceptance Criteria**: All CSS variables and Tailwind utility classes compile with zero warnings; body renders clean matte cool light gray (`#E5E9EE`).
- **Risk Level**: **LOW**.

---

### Phase 2: Shared Layout, Dark Sidebar & Navigation
- **Objective**: Implement the unified shell layout with the dark charcoal sidebar (`#263442`), glowing Sky Blue active pill, and mobile slide-out drawer.
- **Scope**:
  - Replace `FixedSidebar.tsx` with skeuomorphic `AppSidebar.tsx` supporting expandable tree submenus for Data Induk and Laporan.
  - Build `AppHeader.tsx` containing the recessed search well, live system status pill, notification bell counter, and user profile summary.
  - Build `MobileNavigationDrawer.tsx` for responsive viewports (`<1024px`) with role-filtered links.
  - Integrate layout into `AppProviders.tsx` / `ProtectedLayout`.
- **Files Likely to Change**:
  - `apps/web-admin/src/components/FixedSidebar.tsx` ➔ refactor / replace with `AppSidebar.tsx`
  - `apps/web-admin/src/components/TopUtilityBar.tsx` ➔ refactor / replace with `AppHeader.tsx`
  - `apps/web-admin/src/components/AppProviders.tsx`
  - New component: `apps/web-admin/src/components/layout/MobileNavigationDrawer.tsx`
- **Dependencies**: Phase 1 tokens.
- **Testing Strategy**: Manual verification of navigation across all admin routes; verify drawer opening/closing on 390px and 768px viewports.
- **Rollback Strategy**: Revert `AppProviders.tsx` import to original `FixedSidebar.tsx` and `TopUtilityBar.tsx`.
- **Acceptance Criteria**: Desktop shows fixed `#263442` sidebar with glowing sky blue active navigation; mobile shows compact header with drawer; zero broken route links.
- **Risk Level**: **MEDIUM** (Affects all administrative routes).

---

### Phase 3: Admin Operational Dashboard
- **Objective**: Rebuild the main command center dashboard to match the primary visual reference image.
- **Scope**:
  - Implement Hero Welcome Banner with officer graphic, greeting text, and live WIB digital clock.
  - Implement the 5-item stat card row (Total Personel, Total Area, Total Site, Absensi Hari Ini, Patroli Aktif) with circular icon receptacles and trend pills.
  - Build the 3-column Bento grid: Aktivitas Patroli line chart, Peta Lokasi Patroli Leaflet preview with Live badge, and Notifikasi Terbaru feed.
- **Files Likely to Change**:
  - `apps/web-admin/src/app/dashboard/page.tsx`
  - New sub-components: `DashboardStatCard.tsx`, `DashboardActivityChart.tsx`, `DashboardMapPreview.tsx`, `NotificationPanel.tsx`
- **Dependencies**: Phase 1, Phase 2, `DataContext.tsx`.
- **Testing Strategy**: Verify live site and checkpoint counts match database queries; verify Leaflet map tiles render without SSR errors.
- **Rollback Strategy**: Restore previous `apps/web-admin/src/app/dashboard/page.tsx` from git history.
- **Acceptance Criteria**: Visual layout matches `media_1794764962295_9157fa84.jpg` desktop preview with pixel-level precision.
- **Risk Level**: **MEDIUM**.

---

### Phase 4: Admin Master Data (Area, Checkpoint, Personil, RBAC)
- **Objective**: Redesign all master data management views under the unified `DataTable`, `SurfaceCard`, `InsetInput`, and `ModalDialog` system.
- **Scope**:
  - **Fasilitas & Area (`/datainduk/area`)**: Redesign table, Leaflet geofence map modal, and shift schedule time pickers. Implement the split "Tambah Area" modal with 3D map pin illustration.
  - **Titik Checkpoint QR (`/datainduk/checkpoint`)**: Redesign filter bar, table, modal tambah/edit, and batch print sheet modal.
  - **Data Personil (`/datainduk/personil`)**: Redesign card/table views, webcam photo capture modal, and ID card batch generator.
  - **Persetujuan Akun & RBAC (`/datainduk/approval` & `/datainduk/rbac`)**: Redesign candidate approval queue, salary assignment modal, and dual-column role permission manager.
- **Files Likely to Change**:
  - `apps/web-admin/src/components/AreaManagementView.tsx`
  - `apps/web-admin/src/components/CheckpointManagementView.tsx`
  - `apps/web-admin/src/components/PersonilManagementView.tsx`
  - `apps/web-admin/src/components/ApprovalQueueView.tsx`
  - `apps/web-admin/src/app/datainduk/*`
- **Dependencies**: Phase 1, Phase 2, Leaflet, DataContext.
- **Testing Strategy**: Create, update, and delete mock site, checkpoint, and personnel records; verify webcam streaming and canvas snapshot functionality.
- **Rollback Strategy**: Revert modified view files individually; each view component is isolated and does not affect the others.
- **Acceptance Criteria**: Tables and modals match skeuomorphic design; all CRUD operations persist correctly to PostGIS backend.
- **Risk Level**: **HIGH** (Contains complex form states, webcam streams, and map pickers).

---

### Phase 5: Admin Operational Modules (Absensi, Emergency SOS, Siaran)
- **Objective**: Redesign the operational monitoring interfaces for attendance, panic alerts, and broadcast messaging.
- **Scope**:
  - **Presensi & Kehadiran (`/absensi`)**: Redesign "Semua Data" log and "Monitoring Matriks" 31-day table.
  - **Pusat Darurat SOS (`/emergency`)**: Redesign emergency radar map, siren controls, and incident resolution log. Implement the dedicated 3D siren Panic Alert Modal.
  - **Pesan Siaran (`/pesan-siaran`)**: Redesign broadcast composer and history table with auto-dismiss banners.
- **Files Likely to Change**:
  - `apps/web-admin/src/app/absensi/page.tsx`
  - `apps/web-admin/src/components/AttendanceSemuaDataView.tsx`
  - `apps/web-admin/src/components/AttendanceMonitoringView.tsx`
  - `apps/web-admin/src/app/emergency/page.tsx`
  - `apps/web-admin/src/components/EmergencyLeafletMap.tsx`
  - `apps/web-admin/src/components/PanicAlertModal.tsx`
  - `apps/web-admin/src/components/BroadcastTab.tsx`
- **Dependencies**: Phase 1, Phase 2, Leaflet, Socket.io.
- **Testing Strategy**: Trigger mock WebSocket `sos:new` event; verify Panic Alert Modal pops up immediately with audio alert and coordinates.
- **Rollback Strategy**: Revert attendance/emergency views to their previous versions. WebSocket listeners remain intact.
- **Acceptance Criteria**: Attendance photos and coordinates display cleanly; SOS alerts update in real-time without browser reload.
- **Risk Level**: **MEDIUM**.

---

### Phase 6: Admin Reporting & Payroll Modules
- **Objective**: Redesign operational reporting hubs, multi-role report viewers, payroll slip generator, and export wizards.
- **Scope**:
  - **Pusat Laporan (`/laporan`)**: Redesign segmented division tabs (Security [Anggota, Danru, Chief], Cleaning Service, Driver, Staff, Tracking Patroli).
  - **Tracking Patroli (`/laporan/tracking-patroli`)**: Redesign waypoint route playback on Leaflet map.
  - **Penggajian (`/gaji`)**: Redesign payroll calculation table and printable salary slip modal with Indonesian Rupiah formatting.
  - **Pusat Ekspor (`/export-laporan`)**: Redesign PDF/Excel export wizard.
- **Files Likely to Change**:
  - `apps/web-admin/src/app/laporan/page.tsx`
  - `apps/web-admin/src/components/LaporanSecurityAnggotaView.tsx`
  - `apps/web-admin/src/components/LaporanSecurityKomandanView.tsx`
  - `apps/web-admin/src/components/LaporanSecurityChiefView.tsx`
  - `apps/web-admin/src/components/LaporanCleaningServiceView.tsx`
  - `apps/web-admin/src/components/LaporanDriverView.tsx`
  - `apps/web-admin/src/components/LaporanStaffView.tsx`
  - `apps/web-admin/src/components/LaporanTrackingPatroliView.tsx`
  - `apps/web-admin/src/components/PayrollTab.tsx`
  - `apps/web-admin/src/components/ExportCenterTab.tsx`
- **Dependencies**: Phase 1, Phase 2, ExcelJS, jsPDF.
- **Testing Strategy**: Trigger Excel and PDF downloads; verify exported files open properly with intact styling and data formulas.
- **Rollback Strategy**: Restore individual report view components from git. Export utility functions remain untouched.
- **Acceptance Criteria**: All 5 report tabs load data correctly; payroll slip prints cleanly; export downloads generate without memory leaks.
- **Risk Level**: **MEDIUM**.

---

### Phase 7: Security Mobile Experience (PWA Field App)
- **Objective**: Modernize the mobile field interface for Security Officers (Satpam) while replacing the legacy 8-button kiosk with clean tactile skeuomorphic cards and drawer navigation.
- **Scope**:
  - **PWA Dashboard (`DashboardPage.tsx`)**: Rebuild with greeting card, 4-grid stats, active task card, and recent timeline.
  - **Absen Masuk / Pulang (`ClockInPage`, `ClockOutPage`)**: Implement elevated camera card with face oval guide and real-time geofence radius check.
  - **Scan QR Checkpoint (`PatrolScanPage`)**: Rebuild camera viewfinder with animated laser line, flashlight toggle, and instant feedback sheet.
  - **Panic Button SOS (`PanicPage`)**: Rebuild with massive 3D tactile red SOS button requiring 3-second hold.
- **Files Likely to Change**:
  - `apps/pwa-field/src/pages/DashboardPage.tsx`
  - `apps/pwa-field/src/pages/ClockInPage.tsx`
  - `apps/pwa-field/src/pages/ClockOutPage.tsx`
  - `apps/pwa-field/src/pages/PatrolScanPage.tsx`
  - `apps/pwa-field/src/pages/PanicPage.tsx`
  - Mirror files in `apps/web-admin/src/field/pages/*`
- **Dependencies**: Phase 1 tokens, `html5-qrcode`, Geolocation API, MediaDevices API.
- **Testing Strategy**: Execute Playwright mobile tests with mocked geolocation and mock webcam video feed; verify QR decoding triggers attendance API.
- **Rollback Strategy**: Revert PWA field pages and mirror files in `web-admin/src/field`. Both apps run independently.
- **Acceptance Criteria**: Field interface matches mobile screens in the visual reference (`media_1794764962295_9157fa84.jpg`); 3s SOS hold prevents false alarms.
- **Risk Level**: **HIGH** (Critical field operational workflow; hardware camera/GPS interaction).

---

### Phase 8: Cleaning Service Mobile Experience
- **Objective**: Implement the dedicated mobile sanitation workflow for Cleaning Service staff.
- **Scope**:
  - Zone selector for sanitation areas (Toilet, Lobby, Meeting Room).
  - Sanitation checklist with tactile toggles (Kloset, Wastafel, Cermin, Lantai).
  - Before/After photo evidence capture with timestamp watermark.
  - Submittal confirmation and history overview.
- **Files Likely to Change**:
  - `apps/pwa-field/src/pages/StaffActivityPage.tsx` (Sanitation Mode)
  - `apps/pwa-field/src/pages/ActivityHistoryPage.tsx`
  - Mirror files in `apps/web-admin/src/field/*`
- **Dependencies**: Phase 7 camera and watermark engine.
- **Testing Strategy**: Submit mock cleaning log with photo attachment; verify record appears immediately in `/laporan/cleaning-service`.
- **Rollback Strategy**: Revert `StaffActivityPage.tsx` to prior version.
- **Acceptance Criteria**: Cleaner can submit checklist within 3 taps; photo upload compresses cleanly.
- **Risk Level**: **LOW**.

---

### Phase 9: Driver Logistics Mobile Experience
- **Objective**: Modernize the fleet trip registration workflow for Logistics Drivers.
- **Scope**:
  - Dedicated vehicle selector (Plate Number, Vehicle Type).
  - Odometer camera capture module with clear guide framing.
  - Destination and cargo notes form with tactile submit button.
  - Departure vs Arrival trip state toggle.
- **Files Likely to Change**:
  - `apps/pwa-field/src/pages/DriverTripPage.tsx`
  - Mirror files in `apps/web-admin/src/field/pages/DriverTripPage.tsx`
- **Dependencies**: Phase 7 camera and geolocation engine.
- **Testing Strategy**: Log complete departure and arrival lifecycle; verify odometer numbers and photo proofs display in `/laporan/driver`.
- **Rollback Strategy**: Revert `DriverTripPage.tsx` to prior version.
- **Acceptance Criteria**: Driver can log departure in < 30 seconds; arrival updates odometer and trip duration correctly.
- **Risk Level**: **LOW**.

---

### Phase 10: Staff & Karyawan Mobile Experience
- **Objective**: Polish general employee workflows (attendance, leave requests, activity logs, profile updates).
- **Scope**:
  - **Pengajuan Izin / Sakit (`LeavePage.tsx`)**: Inset reason dropdown, doctor note photo attachment, tactile submission.
  - **Riwayat Absensi (`AttendanceHistoryPage.tsx`)**: Date cards with status pills and photo popup modal.
  - **Pembaruan Profil (`ProfilePage.tsx`)**: Password change with inset fields and show/hide password toggle.
  - **Laporan Staff (`StaffActivityPage.tsx`)**: General administrative activity submission.
- **Files Likely to Change**:
  - `apps/pwa-field/src/pages/LeavePage.tsx`
  - `apps/pwa-field/src/pages/AttendanceHistoryPage.tsx`
  - `apps/pwa-field/src/pages/ProfilePage.tsx`
  - `apps/pwa-field/src/pages/StaffActivityPage.tsx`
- **Dependencies**: Phase 7 tokens and auth services.
- **Testing Strategy**: Submit leave request; verify status reflects in `/absensi`; change password and verify re-login.
- **Rollback Strategy**: Revert individual page files.
- **Acceptance Criteria**: Form validation provides clear error feedback; history logs load with infinite scroll or pagination.
- **Risk Level**: **LOW**.

---

### Phase 11: Cross-Viewport Responsive Refinement
- **Objective**: Conduct rigorous visual and interaction audits across Desktop (1440px), Tablet (768px), and Mobile (390px) viewports.
- **Scope**:
  - Fine-tune padding, margins, and card borders across all responsive breakpoints.
  - Ensure all tables degrade gracefully on mobile with horizontal scrolling and sticky identifier columns.
  - Verify touch targets strictly meet the 44px × 44px minimum.
  - Verify zero horizontal viewport overflow (`overflow-x: hidden`).
- **Files Likely to Change**:
  - Shared layout components (`AppLayout.tsx`, `AppHeader.tsx`, `AppSidebar.tsx`, `DataTable.tsx`).
- **Dependencies**: Phases 1 through 10.
- **Testing Strategy**: Viewport resize testing using Playwright browser emulators (iPhone 14, iPad Mini, 1440p Desktop).
- **Rollback Strategy**: Revert responsive utility classes via git.
- **Acceptance Criteria**: Zero layout breaks, zero horizontal scrolling on body, consistent skeuomorphic depth at every scale.
- **Risk Level**: **MEDIUM**.

---

### Phase 12: Regression Testing & Visual Quality Assurance
- **Objective**: Final comprehensive verification gate ensuring zero functional regression and 100% fidelity to the visual reference.
- **Scope**:
  - Full TypeScript typecheck across all workspaces.
  - Unit test suite execution (`npm run test`).
  - Live PostGIS database verification with Docker container.
  - End-to-end user scenario testing (Login ➔ Clock-In ➔ Scan QR ➔ Trigger SOS ➔ Admin Verification ➔ Export HRIS).
- **Files Likely to Change**:
  - Test suites (`tests/*.spec.ts`) if selectors need updating.
- **Dependencies**: All prior phases.
- **Testing Strategy**: Automated CI pipeline and manual visual QA against `media_1794764962295_9157fa84.jpg`.
- **Rollback Strategy**: Fix test assertions or restore targeted components.
- **Acceptance Criteria**: 100% tests pass; zero visual slop; system fully operational.
- **Risk Level**: **LOW** (Verification and stabilization phase).
