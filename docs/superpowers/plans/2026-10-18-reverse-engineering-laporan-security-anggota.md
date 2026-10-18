# Laporan Security Anggota (KEGIATAN SECURITY) & Modal Detail 100% Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec Evidence Source:** Playwright MCP Live Extraction from `https://patroli.site/xxxx_xxxxxxxxxxx` (User: `testi`, Tenant: `tes-pt`).  
**Visual Screenshots:**  
- Main Table & Filter: `docs/superpowers/screenshots/patroli_site_laporan_security_anggota.png`  
- Modal Detail Patroli: `docs/superpowers/screenshots/patroli_site_laporan_security_anggota_modal_detail.png`  
**Raw HTML & CSS Source:** `docs/superpowers/plans/raw_detail_patroli.html`

---

## 1. Feature Parity Matrix

| Fitur / Komponen | patroli.site Live Reference | Target di apps/web-admin |
|---|---|---|
| **Container & Header** | `<div class="card-header alert bg-primary text-light"><i class="fa fa-qrcode"></i> <small>Kegiatan Security</small></div>` | 100% Identik (`.card-header.alert.bg-primary.text-light`) |
| **Card Body Border** | `.card-body.border.border-primary.rounded` | 100% Identik |
| **DataTables Controls** | Show [5, 10, 20, 50, 100, 1000] entries, Search input | 100% Identik interaktif DataTables header bar |
| **Header Kolom 1** | `SORT LOKASI / SITE` dengan dropdown `<select name="category" id="category" class="custom-select border border-danger text-uppercase">` | 100% Identik dengan `SEMUA LOKASI` dan list site |
| **Header Kolom 2** | `NAMA PERSONIL` (centered) | 100% Identik |
| **Header Kolom 3** | `KEGIATAN / TEMUAN` (centered) | 100% Identik |
| **Header Kolom 4** | `WAKTU` (centered) | 100% Identik |
| **Header Kolom 5** | `AKSI` (centered) | 100% Identik |
| **Isi Baris Tabel** | - Kolom 1: `<p class="text text-center text-success">{siteName}</p>`<br>- Kolom 2: `<p class="text text-center text-mute">{personilName}</p>`<br>- Kolom 3: `<strong>🟢 SITUASI AMAN TERKENDALI</strong>` + deskripsi<br>- Kolom 4: `<p class="text text-center text-primary">{Hari, DD Mon YYYY \| HH:mm:ss}</p>`<br>- Kolom 5: `<a href="#" class="detail-record btn btn-primary"><i class="fa fa-search-plus"></i> <small>Detail</small></a>` | 100% Identik |
| **Modal Detail Patroli (`#myModalpat`)** | Size `modal-lg`, `.modal-body-patroli` dengan CSS `.patroli-detail`: Header shield gradient, green close button, profile card (avatar, nama, role `anggota`, lokasi site, status badge `Hasil Kegiatan: [● Selesai]`), 4-grid cards (Aset, Kegiatan, Deskripsi, Hasil), Leaflet map card dengan circle merah `radius: 30`, link Google Maps, dan foto kegiatan. | 100% Identik |
| **Modal Tindak Lanjut (`#myModaltl`)** | Modal konfirmasi dengan pilihan "Belum di TL" dan "Ya sudah di TL". | 100% Identik |
| **Routing & Navigation** | Akses via Navbar `Laporan > Security > Anggota` (`/laporan/security/anggota` atau `/laporan?tab=security-anggota`). | 100% Identik |

---

## 2. File Architecture

- **`packages/types/src/index.ts`**:
  - Add `PatrolRecordItem`, `PatrolRecordsResponse`, `PatrolDetailResponse` for SSOT type safety.
- **`apps/backend/src/modules/patrol/patrol.controller.ts` & `patrol.service.ts`**:
  - Add `GET /api/v1/patrol/records` (server-side pagination, site filtering, search).
  - Add `GET /api/v1/patrol/:id/detail` (returns rich asset info, checkpoint info, officer info, GPS coordinates, photo).
  - Add `POST /api/v1/patrol/:id/tindak-lanjut` (updates TL status).
- **`apps/web-admin/src/components/PatroliDetailModal.tsx`**:
  - Exact `#myModalpat` modal implementation using extracted CSS rules and dynamic Leaflet map with red circle (radius: 30) & layer control.
- **`apps/web-admin/src/components/PatroliTindakLanjutModal.tsx`**:
  - Exact `#myModaltl` modal implementation.
- **`apps/web-admin/src/components/LaporanSecurityAnggotaView.tsx`**:
  - Complete DataTables UI/UX matching `https://patroli.site/xxxx_xxxxxxxxxxx`.
- **`apps/web-admin/src/app/laporan/security/anggota/page.tsx`**:
  - Dedicated route matching hierarchical structure.
- **`apps/web-admin/src/app/laporan/page.tsx` & `apps/web-admin/src/components/Navbar.tsx`**:
  - Update navigation links and tab routing.

---

## 3. Tasks

### Task 1: Type Definitions SSOT
- [ ] In `packages/types/src/index.ts`, define `PatrolRecordItem`, `PatrolRecordsResponse`, `PatrolDetailResponse`.
- [ ] Build workspace `@patrol/types`: `npm run build --workspace=@patrol/types`.

### Task 2: Backend API Endpoints for Patrol Records & Detail
- [ ] In `apps/backend/src/modules/patrol/patrol.service.ts`, add:
  - `getPatrolRecords(query)`
  - `getPatrolDetail(id)`
  - `updateTindakLanjut(id, tl)`
- [ ] In `apps/backend/src/modules/patrol/patrol.controller.ts`, expose:
  - `GET /patrol/records`
  - `GET /patrol/:id/detail`
  - `POST /patrol/:id/tl`
- [ ] Write unit spec in `apps/backend/src/modules/patrol/patrol.service.spec.ts` for records & detail.
- [ ] Build workspace `@patrol/backend`: `npm run build --workspace=@patrol/backend`.

### Task 3: Modal Detail Patroli Component (`#myModalpat`)
- [ ] Create `apps/web-admin/src/components/PatroliDetailModal.tsx`.
- [ ] Embed exact extracted CSS styles `.patroli-detail`, `.patroli-header`, `.patroli-close`, `.patroli-profile`, `.patroli-grid`, `.patroli-card`, `.patroli-map`, `.patroli-photo`.
- [ ] Initialize Leaflet map with `L.circle([lat, lng], { color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: 30 })` and layer switcher (OpenStreetMap, Streets, Satellite).
- [ ] Provide offline fallback mock so the modal works reliably in tests and offline environments.

### Task 4: Modal Tindak Lanjut Component (`#myModaltl`)
- [ ] Create `apps/web-admin/src/components/PatroliTindakLanjutModal.tsx` matching `tl.php` and `myModaltl`.

### Task 5: Laporan Security Anggota View Component
- [ ] Create `apps/web-admin/src/components/LaporanSecurityAnggotaView.tsx`.
- [ ] Implement card container `.card-header.alert.bg-primary.text-light` with `<i class="fa fa-qrcode"></i> <small>Kegiatan Security</small>`.
- [ ] Implement DataTables filter, pagination, entries per page selector [5, 10, 20, 50, 100, 1000].
- [ ] Implement `#category` site filter dropdown inside the table `<th>`.
- [ ] Render data rows matching exact colors and markup (`text-success` site, `text-mute` personil, `🟢 SITUASI AMAN TERKENDALI`, `text-primary` waktu, `.detail-record.btn.btn-primary` button).
- [ ] Connect action click to open `PatroliDetailModal` and `PatroliTindakLanjutModal`.

### Task 6: Routing & Navbar Integration
- [ ] Create route `apps/web-admin/src/app/laporan/security/anggota/page.tsx`.
- [ ] Update `apps/web-admin/src/components/Navbar.tsx` so `Laporan > Security > Anggota` links directly to `/laporan/security/anggota`.
- [ ] Update `apps/web-admin/src/app/laporan/page.tsx` with a clean tab bar or direct access to `LaporanSecurityAnggotaView`.

### Task 7: Build, Testing & DoD Verification
- [ ] Run full build: `npm run build --workspace=@patrol/web-admin`.
- [ ] Run backend unit tests: `npm run test --workspace=@patrol/backend`.
- [ ] Test using Playwright MCP to visit local web-admin, take screenshots of table and open modal detail, and verify 100% parity with `docs/superpowers/screenshots/patroli_site_laporan_security_anggota_modal_detail.png`.
