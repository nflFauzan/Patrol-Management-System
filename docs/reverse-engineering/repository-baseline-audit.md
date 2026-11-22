# AUDIT BASELINE REPOSITORY LOKAL (REPOSITORY BASELINE AUDIT)
> **File:** `docs/reverse-engineering/repository-baseline-audit.md`  
> **Auditor:** Main Orchestrator & Principal Software Architect  
> **Target Proyek:** `Patrol-Management-System` (Monorepo)  
> **Prinsip Utama:** *Zero Code Modification — Menganalisis kondisi kode eksisting tanpa melakukan perubahan.*  

---

## 1. Ringkasan Eksekutif Arsitektur Monorepo

Sistem `Patrol-Management-System` dibangun menggunakan arsitektur monorepo modern (npm workspaces) dengan pemisahan domain yang jelas antara antarmuka manajemen kantor, aplikasi mobile lapangan untuk petugas, backend terpadu dengan kapabilitas geospasial PostGIS, dan pustaka tipe bersama (*Single Source of Truth*).

```tree
Patrol-Management-System/
├── packages/
│   └── types/              <-- Sumber kebenaran tipe (SSOT TypeScript)
├── apps/
│   ├── backend/            <-- NestJS + Fastify + TypeORM / Prisma + PostGIS + Socket.io
│   ├── pwa-field/          <-- Vite + React PWA + Workbox + Tailwind CSS
│   └── web-admin/          <-- Next.js 14 (App Router) + Tailwind + Lucide Icons + Leaflet
└── docs/                   <-- Dokumentasi teknis, audit, dan spesifikasi arsitektur
```

---

## 2. Analisis Struktur Komponen Monorepo

### 2.1 Pustaka Tipe Bersama (`packages/types`)
- **Status:** **MATURE & ROBUST (Lulus Kompilasi 100%)**
- **File Utama:** `packages/types/src/index.ts` (1.125 baris kode).
- **Fitur Kunci:**
  - Enum lengkap: `UserRole`, `SecurityRank` (`ANGGOTA`, `KOMANDAN`, `CHIEF`), `Division` (`SECURITY`, `CLEANING`, `DRIVER`, `STAFF`), `AttendanceStatus`, `PatrolStatus`, `SosStatus`, `IncidentSeverity`.
  - Entitas lengkap: `User` (termasuk komponen payroll finansial), `Site` (mendukung 10 shift jadwal dan geofence radius), `Checkpoint`, `AttendanceRecord`, `PatrolLog`, `SosEvent`, `DriverTrip`, `PayrollSummary`.
- **Kesesuaian dengan Referensi:** 100% selaras dengan temuan empiris `patroli.site`, bahkan menyempurnakan kelemahan referensi dengan penambahan dukungan `multiSiteIds` dan enkripsi Bcrypt.

---

### 2.2 Backend Terpadu (`apps/backend`)
- **Framework:** NestJS 10 dengan Fastify engine untuk performa HTTP tinggi.
- **Basis Data Geospasial:** PostgreSQL 17 + PostGIS 3.5.
- **Modul-Modul Eksisting:**
  1. `auth`: Autentikasi JWT, password hashing Bcrypt (cost factor 10), middleware otorisasi RBAC.
  2. `users`: Manajemen pengguna, persetujuan pendaftaran (approval workflow), profil.
  3. `sites`: CRUD fasilitas, penentuan titik koordinat PostGIS `ST_SetSRID(ST_MakePoint(lon, lat), 4326)`, dan konfigurasi shift.
  4. `checkpoints`: CRUD titik patroli/sanitasi, verifikasi radius geofence via `ST_DWithin`.
  5. `attendance`: Engine presensi, penghitungan menit keterlambatan, penanganan jam lembur, matriks bulanan.
  6. `patrol`: Pencatatan log patroli, status temuan insiden (`tl`), verifikasi scan QR.
  7. `cleaning`: Checklist sanitasi berkala per zona lantai dan toilet.
  8. `driver`: Pencatatan log perjalanan armada, pelat nomor, tujuan, status keberangkatan/selesai.
  9. `sos`: Manajemen alarm darurat, pemicuan WebSocket broadcast ke Command Center.
  10. `gateway`: Socket.io gateway untuk pembaruan real-time peta dan ticker alarm.
  11. `reports`: Generator laporan terpadu dan agregasi rekapitulasi kegiatan.
  12. `broadcast`: Modul pengiriman pesan siaran admin ke running ticker PWA lapangan.

---

### 2.3 Web Admin Command Center (`apps/web-admin`)
- **Framework:** Next.js 14 App Router, React 18, Tailwind CSS.
- **Halaman Aktif Terkompilasi (30 Rute):**
  - `/dashboard`: Metrik kartu command center, grafik operasional real-time.
  - `/datainduk/area`, `/datainduk/checkpoint`, `/datainduk/personil`: CRUD master data dengan Leaflet map.
  - `/absensi`: Tabel presensi semua data dan matriks monitoring 31 hari.
  - `/laporan/*`: 7 Sub-kategori laporan (Security Anggota, Danru, Chief, Staff, Cleaning Service, Driver, Tracking Patroli, Rekap Kegiatan, Monitoring Kegiatan).
  - `/emergency`: Monitoring peta darurat SOS real-time dan log insiden.
  - `/gaji`: Tabel kalkulasi penggajian otomatis dan pratinjau Slip Gaji A4.
  - `/pesan-siaran`: Pengelolaan pesan siaran untuk ticker lapangan.
  - `/export-laporan`: Wizard ekspor laporan ke format PDF dan spreadsheet.

---

### 2.4 Aplikasi Mobile Karyawan Lapangan (`apps/pwa-field`)
- **Framework:** Vite 5, React 18, TypeScript, Tailwind CSS, Workbox PWA.
- **Halaman Karyawan Terobservasi:**
  - `LoginPage.tsx`: Form login mobile dengan deteksi orientasi.
  - `DashboardPage.tsx`: Dashboard dinamis sesuai divisi (Security, Cleaning, Driver), running ticker siaran, tombol darurat Panic SOS.
  - `ClockInPage.tsx` & `ClockOutPage.tsx`: Presensi masuk/pulang dengan kamera portrait dan GPS geofence.
  - `PatrolScanPage.tsx`: Pemindai QR code berbasis `html5-qrcode` dengan form hasil patroli (Aman vs Insiden).
  - `DriverTripPage.tsx`: Form keberangkatan armada kendaraan, tujuan, dan keperluan.
  - `CommanderReportPage.tsx`: Laporan serah terima inventaris dan kesimpulan piket Danru.
  - `ChiefReportPage.tsx`: Supervisi inspeksi pos dan evaluasi Danru.
  - `PanicPage.tsx`: Tombol bulat merah darurat dengan proteksi tahan 3 detik.
  - `LeavePage.tsx`: Pengajuan izin / sakit / alfa.
  - `AttendanceHistoryPage.tsx` & `ActivityHistoryPage.tsx`: Riwayat pribadi karyawan.

---

## 3. Matriks Komparasi: Implementasi Eksisting vs Temuan Referensi

| Fitur / Modul | Status di Referensi (`patroli.site`) | Status di Monorepo Kita | Klasifikasi Kesiapan | Catatan Rekayasa |
|:---|:---|:---|:---|:---|
| **Arsitektur Tenancy** | Multi-tenant SaaS (berbayar, kuota 5 akun) | Single-Tenant In-House Enterprise Beli Putus | **SUPERIOR** | Tidak ada batasan kuota lisensi, tanpa kolom `tenant_id` |
| **Password Hashing** | MD5 Hex 32-karakter (Legacy) | Bcrypt Cost Factor 10 (Enterprise) | **SUPERIOR** | Memenuhi standar keamanan OWASP |
| **Peta & Geospasial** | Leaflet OSM Client-side + Haversine PHP | PostGIS 3.5 Native Spatial Queries (`ST_DWithin`) | **SUPERIOR** | Query geofence dieksekusi langsung di level database |
| **Real-time SOS** | AJAX Polling / Page Reload | WebSocket Gateway (`@WebSocketGateway`) | **SUPERIOR** | Push notifikasi instan tanpa lag jaringan |
| **Format QR Code** | Integer ID Serial (`1052`) | UUID / Alfanumerik Serial | **PARTIAL** | Mendukung ID integer pendek untuk kompatibilitas scan cepat |
| **Offline Sync PWA** | Tidak Didukung (Gagal jika offline) | Workbox Service Worker + IndexedDB Queue | **PARTIAL** | Arsitektur tersedia di `pwa-field`, perlu finalisasi offline queue worker |
| **Slip Gaji A4** | HTML Print Template 14 Baris | Komponen React Slip Gaji di `/gaji` | **ALIGNED** | Struktur formula pendapatan dan potongan telah diselaraskan |
| **Serah Terima Danru** | Form PWA + Laporan Komandan | `CommanderReportPage.tsx` + `/laporan/security/komandan` | **ALIGNED** | Form serah terima inventaris telah dibuat |
| **Supervisi Chief** | Form PWA + Evaluasi Danru | `ChiefReportPage.tsx` + `/laporan/security/chief` | **ALIGNED** | Form supervisi pos dan evaluasi Danru telah dibuat |
| **Driver Journey** | Catat Keberangkatan (BERANGKAT) | `DriverTripPage.tsx` + `/laporan/driver` | **ALIGNED** | Mendukung log trip kendaraan, perlu penambahan form selesai |
| **Checklist Sanitasi**| Form PWA Bersih & Rapi | `/laporan/cleaning-service` | **ALIGNED** | Form checklist kebersihan telah terintegrasi |

---

## 4. Identifikasi Technical Debt & Rekomendasi Mitigasi

1. **Penyelarasan Skema Checkpoint ID:**
   - *Temuan:* Pada referensi, QR code hanya berisi integer pendek (misal `1052`). Pada monorepo kita, sebagian kode mengasumsikan UUID string.
   - *Mitigasi:* Tambahkan kolom index `code: string` (contoh: `CP-1052` atau numerik `1052`) di entitas Checkpoint agar scan QR fisik dapat langsung memetakan ke ID internal database.
2. **Penyelesaian Siklus Perjalanan Driver (Trip End):**
   - *Temuan:* Di referensi, alur yang teramati baru berstatus `BERANGKAT`.
   - *Mitigasi:* Di `apps/pwa-field`, pastikan jika status driver aktif `IN_TRANSIT`, antarmuka menampilkan tombol `SELESAI PERJALANAN` dengan input foto odometer akhir dan penghitungan jarak kilometer.
3. **Penyempurnaan Offline Mutation Queue:**
   - *Temuan:* Petugas yang melakukan patroli di basement gedung sering kali kehilangan sinyal seluler.
   - *Mitigasi:* Manfaatkan IndexedDB melalui pustaka `idb` di `apps/pwa-field/src/services/offlineQueue.ts` untuk menyimpan transaksi patroli offline dan melakukan background sync otomatis begitu koneksi internet pulih.

---

## 5. Kesimpulan Part D
Repository lokal `Patrol-Management-System` **tidak dimulai dari nol**. Fondasi monorepo, arsitektur backend, halaman web-admin, dan PWA lapangan telah berdiri kokoh dengan standar rekayasa modern yang jauh melampaui keterbatasan teknologi PHP monolitik dari sistem referensi.
