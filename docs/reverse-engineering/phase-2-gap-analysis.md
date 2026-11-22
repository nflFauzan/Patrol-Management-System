# PHASE 2 — EXISTING SYSTEM AUDIT & GAP ANALYSIS
> **Patrol & Facility Management System (Enterprise In-House Single-Tenant Beli Putus)**  
> **Status:** AUDITED & VERIFIED  
> **Date:** November 2026  
> **Benchmark Reference:** `https://patroli.site` (Reverse Engineering Phase 1 Discovery)

---

## 1. Executive Summary & Audit Scope

Audit ini membandingkan implementasi aktual pada monorepo `Patrol-Management-System` terhadap standar operasional enterprise dan blueprint Phase 1 hasil Reverse Engineering live `patroli.site`.

### Status Monorepo Baseline
- **Workspaces:**
  - `packages/types`: Kompilasi TypeScript bersih (`npm run build`).
  - `apps/backend`: NestJS 10 + Fastify + PostgreSQL 17 + PostGIS 3.5. 17 test suites (119 unit tests) lulus 100%.
  - `apps/pwa-field`: Vite 5 + React 18 PWA. Lulus kompilasi TypeScript.
  - `apps/web-admin`: Next.js 14 App Router + Tailwind CSS. 30 routes lulus build SSR/SSG.
- **Database Status:** Container PostgreSQL 17.11 + PostGIS 3.5 aktif dan terverifikasi live (`scripts/check-db.js`).

---

## 2. Matrix Audit per Modul & Gap Identification

| No | Modul / Fungsionalitas | Kondisi Eksisting Monorepo | Standar Benchmark (Phase 1 RE) | Gap / Temuan Kritis | Tingkat Urgensi |
|---|---|---|---|---|---|
| **1** | **Master Data & Multi-Tenancy** | Single-tenant murni (tidak ada `tenant_id`). Hirarki: Site ➔ Pos/Checkpoint ➔ User. | Single-tenant corporate internal beli putus. 7 site, 11 checkpoint. | **Terpenuhi (MATCH)**. Struktur data sudah murni single-tenant tanpa SaaS leakage. | Normal |
| **2** | **RBAC & User Approval** | Tabel `roles`, `permissions`, `role_permissions`, `user_roles`, `is_approved`, `approved_by`. | 8 Role sistem + Approval registrasi oleh Superadmin/Manager. | **Minor Gap**: Default permissions portal (`ADMIN:DASHBOARD_ACCESS` & `FIELD:DASHBOARD_ACCESS`) belum otomatis di-check di beberapa route guard PWA. | High |
| **3** | **Presensi & Shift Engine** | Mendukung shift pagi, siang, malam, staff. Kalkulasi keterlambatan & lembur. | Grace period 15 menit, penalti lupa absen (X), cross-midnight (P+), matriks 31 hari. | **Minor Gap**: UI PWA Clock-Out perlu verifikasi shift aktif agar tidak ambigu saat cross-midnight. | Medium |
| **4** | **Patroli Security & QR Scanning** | QR scanning dengan PostGIS proximity, idempotency ID, incident ticketing auto-creation. | Rute sekuensial (opsional per site), verifikasi rank (Anggota, Danru, Chief), pelaporan tindak lanjut (`#myModaltl`). | **Gap**: PWA `PatrolScanPage.tsx` masih meng-hardcode `siteId` dummy dan belum memiliki dropdown pilihan "Perlu Tindak Lanjut" dengan catatan kejadian. | **CRITICAL** |
| **5** | **Cleaning Service Sanitation** | Checklist endpoint `/cleaning/checklist` dan reporting di Web Admin. | 6 sub-checklist sanitasi (Lantai, Tempat Sampah, Sabun, Cermin, Tisu/Hand Dryer, Pengharum) + foto bukti. | **Gap**: PWA belum memiliki dedicated page untuk 6 sub-checklists cleaning; `StaffActivityPage.tsx` mencampuradukkan cleaning dan staff. | **CRITICAL** |
| **6** | **Logistik Armada Driver** | Endpoint `/driver/trips/start` dan `/driver/trips/:id/complete` sudah tersedia di backend. | Siklus lengkap: Mulai perjalanan (odometer awal + GPS) ➔ Selesaikan perjalanan (odometer akhir + foto + kalkulasi jarak KM). | **Gap**: PWA `DriverTripPage.tsx` hanya memiliki form "Mulai Jalan"; belum ada UI untuk menyelesaikan perjalanan aktif (input odometer akhir). | **CRITICAL** |
| **7** | **Logbook Staf Operasional** | Tabel `staff_activity_logs` di database. Reporting staff di Web Admin. | 8 Kategori aktivitas baku (Administrasi, Meeting, Dokumentasi, Penginputan Data, Koordinasi Lapangan, Pemeliharaan Aset, Pelatihan, Lain-lain). | **Gap**: PWA `StaffActivityPage.tsx` memanggil mock `insert_staf.php` lama dan bukan API backend NestJS yang valid. | **CRITICAL** |
| **8** | **Panic Button SOS & WhatsApp** | WebSocket broadcast ke Web Admin, WhatsApp dispatch via Fonnte/Wablas, spatial Leaflet map. | Tahan 3 detik di mobile PWA, Google Maps link, modal pop-up darurat audio alarm di Command Center. | **Terpenuhi (MATCH)**. Backend dan Web Admin sudah sinkron; tombol tahan 3 detik terverifikasi di PWA `PanicPage.tsx`. | Normal |
| **9** | **Pusat Laporan & Dashboard** | 7 Laporan terpadu (Security, Cleaning, Driver, Staff, Tracking, Rekap, Monitoring) + 24-hr Hourly Matrix + Payroll A4. | DataTables server-side paging, filter lokasi, filter tanggal/bulan, export Excel & PDF slip gaji. | **Minor Gap**: Beberapa komponen laporan masih memiliki fallback data dummy lokal saat database kosong; harus menampilkan empty state yang rapi. | Medium |
| **10**| **Offline Capability & Sync** | Workbox service worker, IndexedDB table `offline_queue`, dual-timestamp (`deviceTimestamp` & `serverTimestamp`). | Menyimpan mutasi patroli saat offline dan auto-drain saat online kembali. | **Terpenuhi (MATCH)**. Service worker dan queue engine sudah ada, perlu dipastikan seluruh page PWA memanggil `enqueueOfflineTransaction`. | High |

---

## 3. Detail Analisis Gap & Akar Masalah

### Gap 1: PWA Field App Hardcoded Parameters & Missing Workflow Forms
- **Lokasi Kode:** `apps/pwa-field/src/pages/PatrolScanPage.tsx`, `DriverTripPage.tsx`, `StaffActivityPage.tsx`.
- **Akar Masalah:**
  - `siteId` di-hardcode ke UUID dummy `'11111111-1111-1111-1111-111111111111'` alih-alih mengambil dari `user.siteId` pada AuthContext.
  - `DriverTripPage.tsx` hanya mengimplementasikan form Mulai Perjalanan. Ketika driver kembali ke pool, tidak ada form untuk menginput Odometer Akhir, foto speedometer kepulangan, dan mencatat status `COMPLETED`.
  - `StaffActivityPage.tsx` belum terhubung ke `staffApi` backend (`/staff/activities` atau `/api/v1/legacy/insert_staf`), masih menggunakan legacy raw axios `/insert_staf.php`.
  - `PatrolScanPage.tsx` secara otomatis mengirim status `Situasi Aman Terkendali`. Jika satpam menemukan insiden darurat atau pintu rusak, satpam tidak bisa memilih `Perlu Tindak Lanjut` beserta foto temuan.

### Gap 2: Cleaning Service Checklist Sub-Tasks
- **Lokasi Kode:** `apps/backend/src/modules/cleaning/cleaning.service.ts` & `apps/pwa-field/src/pages/StaffActivityPage.tsx`.
- **Akar Masalah:**
  - Backend `cleaning_checklists` memiliki kolom `floor_cleaned`, `trash_emptied`, `supplies_restocked`, `odor_normal`.
  - Di Patroli.site, terdapat 6 sub-checklist spesifik per ruangan:
    1. Kebersihan lantai & sudut ruangan
    2. Tempat sampah dikosongkan & dipasang plastik baru
    3. Sabun cuci tangan / hand sanitizer terisi
    4. Cermin & wastafel bersih tanpa bercak air
    5. Ketersediaan tisu / hand dryer berfungsi
    6. Pengharum ruangan / aroma segar
  - Di PWA, belum ada form mandiri khusus Cleaning Service yang menampilkan 6 checkbox ini setelah memindai QR code zona sanitasi.

### Gap 3: Data Consistency & Real Backend Endpoints
- **Lokasi Kode:** `apps/backend/src/modules/legacy/legacy.controller.ts`, `apps/web-admin/src/lib/api.ts`.
- **Akar Masalah:**
  - Web Admin memiliki komponen yang masih merujuk ke field mock jika respon backend berstatus array kosong.
  - Filter lokasi pada Data Context Web Admin harus selalu sinkron dengan daftar `sites` aktual di database PostgreSQL.

---

## 4. Rencana Perbaikan & Action Items (Prioritas Eksekusi)

1. **Paket Types (`packages/types`):**
   - Lengkapi interface `DriverTripLog`, `SubmitCleaningDto` (6 sub-checklists), dan `StaffActivityDto`.
2. **Backend Engine (`apps/backend`):**
   - Tambahkan endpoint `StaffController` / kegiatan staf operasional (`/staff/activities`).
   - Sempurnakan `DriverService` untuk mendukung pengecekan status perjalanan aktif (`/driver/trips/active`) dan penutupan perjalanan (`/driver/trips/:id/complete`).
   - Sempurnakan `CleaningService` untuk mendukung 6 sub-checklist sanitasi.
   - Sempurnakan `PatrolService` untuk validasi rute sekuensial dan pemilihan status hasil patroli langsung dari input scanner.
3. **PWA Mobile (`apps/pwa-field`):**
   - Perbaiki integrasi konteks autentikasi agar `siteId` dan `userId` selalu dinamis sesuai user yang login.
   - Perbarui `PatrolScanPage.tsx`: tambahkan toggle kondisi temuan ("Situasi Aman Terkendali" vs "Perlu Tindak Lanjut") + foto insiden + rute sekuensial.
   - Perbarui `DriverTripPage.tsx`: sediakan mode dinamis (Form Mulai Perjalanan jika belum ada trip aktif, atau Form Selesaikan Perjalanan jika ada trip aktif dengan kalkulasi KM).
   - Buat halaman khusus `CleaningChecklistPage.tsx` dengan 6 sub-checklist sanitasi zona.
   - Perbaiki `StaffActivityPage.tsx` agar menggunakan API backend resmi dan mendukung offline sync.
4. **Web Admin Command Center (`apps/web-admin`):**
   - Pastikan seluruh tabel laporan (Cleaning, Driver, Staff, Security) mengambil data real-time via API tanpa ketergantungan pada dummy data mock.
   - Verifikasi modal tindak lanjut insiden (`PatroliTindakLanjutModal` dan `CleaningTindakLanjutModal`) mengupdate database secara live.
5. **Verifikasi & QA:**
   - Jalankan build kompilasi di 4 workspace.
   - Jalankan unit tests backend.
   - Jalankan pengujian database live PostGIS dan skenario E2E Playwright.

---
**Status Audit Phase 2:** SELESAI. Siap melangkah ke Phase 3 (Final PRD & System Blueprint).

