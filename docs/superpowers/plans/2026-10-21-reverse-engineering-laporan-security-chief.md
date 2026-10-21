# Laporan Security Chief & Modal Detail 100% Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec Evidence Source:** Playwright MCP Live Extraction from `https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (User: `testi`, Tenant: `tes-pt`).  
**Visual Screenshots:**  
- Main Table & Filter: `docs/superpowers/screenshots/patroli_site_chief_page_loaded.png`  
- Modal Detail Open: `docs/superpowers/screenshots/patroli_site_chief_detail_modal_open.png`  
**Raw HTML & CSS Source:**  
- `docs/superpowers/plans/chief_page_raw.html`  
- `docs/superpowers/plans/ajax_response_1792555250952.html` (Modal `#myModalChief` content returned by `POST detail-chief.php`)  
- `docs/superpowers/plans/ajax_response_1792555247787.html` (Table data returned by `POST serverside-chief.php`)

---

## 1. Feature Parity Matrix

| Fitur / Komponen | patroli.site Live Reference | Target di apps/web-admin |
|---|---|---|
| **Container & Header** | `<div class="card-header alert bg-dark text-light"><i class="fa fa-user"></i> <small>Kegiatan Chief</small></div>` | 100% Identik (`.card-header.alert.bg-dark.text-light`) |
| **Card Body Border** | `.card-body.border.border-dark.rounded` | 100% Identik |
| **DataTables Controls** | Show [10, 25, 50, 100] entries, Search input | 100% Identik DataTables header bar |
| **Header Kolom 1** | `SEMUA LOKASI` dropdown `<select id="filterAreaChief" class="custom-select border border-danger text-uppercase">` | 100% Identik dropdown filter lokasi |
| **Header Kolom 2-7** | `Nama Komandan`, `Kedisiplinan`, `Koordinasi`, `Kehadiran`, `Insiden`, `AKSI` | 100% Identik |
| **Pills & Badges Kolom** | - Lokasi: `<span class="badge badge-info">site proyek demo</span>`<br>- Komandan: `<span class="badge badge-secondary">DANDAN KOMANDAN</span>`<br>- Kedisiplinan: `<span class="badge badge-success">Baik</span>`<br>- Koordinasi: `<span class="badge badge-success">Baik</span>`<br>- Kehadiran: `<span class="badge badge-primary">Lengkap</span>`<br>- Insiden: `<span class="badge badge-success">Tidak Ada</span>`<br>- AKSI: `<a href="#" class="btn btn-info btn-sm detail-record" data-id="6"><i class="fa fa-search"></i> Detail</a>` | 100% Identik styling & warna badge |
| **Modal Detail Container** | `#myModalChief` (`modal-dialog modal-lg modal-dialog-centered`, `.modal-header.alert.bg-dark.text-light`, title `DETAIL KEGIATAN CHIEF`, close button `×`) | 100% Identik modal container |
| **Modal Detail Body** | CSS `.komandan-detail`, Header Icon `linear-gradient(135deg, #4f46e5, #3730a3)` dengan `fa fa-user-secret`, Title `Detail Komandan`, Subtitle `Informasi laporan dan evaluasi komandan regu` | 100% Identik |
| **Profile Card** | Top gradient border `#4f46e5` to `#818cf8`, circle avatar with user icon, Name `DANDAN KOMANDAN`, Position `Komandan Regu`, Role `Laporan Komandan` with shield icon, status badge `Status Laporan`: `● Selesai` | 100% Identik |
| **Grid Card 1: Penilaian Komandan** | Icon `fa fa-bar-chart`, 4 items: Kedisiplinan (`fa fa-check-square-o`), Koordinasi (`fa fa-random`), Kehadiran Regu (`fa fa-users`), Insiden (`fa fa-warning`) | 100% Identik |
| **Grid Card 2: Kehadiran Regu** | Icon `fa fa-users`, 2 items: Regu Hadir (`fa fa-user-plus`), Regu Izin (`fa fa-user-times`) | 100% Identik |
| **Grid Card 3: Detail Insiden** | Icon `fa fa-warning`, note with border-left `#4f46e5` | 100% Identik |
| **Grid Card 4: Catatan** | Icon `fa fa-sticky-note`, note with border-left `#4f46e5` | 100% Identik |
| **Grid Card 5: Informasi Laporan** | Full width card (`grid-column: 1 / -1`), Icon `fa fa-calendar`, Tanggal Lapor | 100% Identik |

---

## 2. File Architecture

- **`packages/types/src/index.ts`**:
  - Add `ChiefEvaluationItem` and `ChiefEvaluationDetailResponse`.
- **`apps/backend/src/modules/reports/reports.controller.ts` & `reports.service.ts`**:
  - Enhance `GET /api/v1/reports/chief-evaluations` to return full parity fields (`namaKomandan`, `siteName`, `kedisiplinan`, `koordinasi`, `kehadiran`, `insiden`, `reguHadir`, `reguIzin`, `detailInsiden`, `catatan`, `statusLaporan`, `tanggalLapor`).
  - Add `GET /api/v1/reports/chief-evaluations/:id` for specific modal detail fetch.
  - Create `reports.service.spec.ts` for unit test verification.
- **`apps/web-admin/src/components/ChiefDetailModal.tsx`**:
  - Implement exact 100% modal matching extracted HTML/CSS (`.komandan-detail`, `.komandan-header`, `.komandan-profile`, `.komandan-grid`, etc.).
- **`apps/web-admin/src/components/LaporanSecurityChiefView.tsx`**:
  - Connect to backend API with fallback sample data, render exact DataTables badges and buttons, wire up `Detail` button click to open `ChiefDetailModal`.
- **`tests/e2e/laporan-chief-flow.spec.ts`**:
  - Playwright E2E test verifying table rendering and modal opening with 100% visual parity.

---

## 3. Tasks

### Task 1: Type Definitions SSOT
- [x] Add `ChiefEvaluationItem` in `packages/types/src/index.ts`.
- [x] Run build `@patrol/types`: `npm run build --workspace=@patrol/types`.

### Task 2: Backend API & Service Extension
- [x] Enhance `getChiefEvaluations(siteId?: string)` in `apps/backend/src/modules/reports/reports.service.ts`.
- [x] Add `getChiefEvaluationDetail(id: string)` in `apps/backend/src/modules/reports/reports.service.ts`.
- [x] Expose `GET /reports/chief-evaluations/:id` in `apps/backend/src/modules/reports/reports.controller.ts`.
- [x] Create unit tests in `apps/backend/src/modules/reports/reports.service.spec.ts`.
- [x] Run backend tests: `npm run test --workspace=@patrol/backend`.
- [x] Build backend: `npm run build --workspace=@patrol/backend`.

### Task 3: ChiefDetailModal Component
- [x] Create `apps/web-admin/src/components/ChiefDetailModal.tsx`.
- [x] Inject exact extracted CSS from `ajax_response_1792555250952.html`.
- [x] Render modal dialog, backdrop, close handler, and responsive cards.

### Task 4: LaporanSecurityChiefView Integration
- [x] Update `apps/web-admin/src/components/LaporanSecurityChiefView.tsx` to render exact table badges, filter, and open `ChiefDetailModal`.
- [x] Build web-admin: `npm run build --workspace=@patrol/web-admin`.

### Task 5: Live Database Seeding & Verification
- [x] Seed sample record in PostgreSQL `chief_evaluations` table matching `patroli.site` sample data (`DANDAN KOMANDAN`, `Baik`, `Lengkap`, `Tidak Ada`).
- [x] Verify query results with a verification script.

### Task 6: Playwright E2E Parity Verification & Screenshot
- [x] Create `tests/e2e/laporan-chief-parity.spec.ts` to test visiting `/laporan/security/chief`, verifying the table, clicking the `Detail` button, and verifying the modal.
- [x] Run the Playwright test and capture the screenshot.
