# Panduan Migrasi & Handover Pengerjaan Laptop Baru
> **Patrol & Facility Management System (Enterprise In-House)**  
> Dokumen ini adalah acuan cepat saat berpindah perangkat/laptop agar pengembang maupun AI Agent (Antigravity/Cursor/Claude Code) langsung memahami konteks proyek dan dapat melanjutkan pekerjaan tanpa hambatan.

---

## 📌 Ringkasan Status Proyek Saat Ini (Current Progress)

Sistem telah dibangun dengan arsitektur **Monorepo Enterprise Single-Tenant**:

### 1. Backend (`apps/backend`)
- **Framework**: NestJS 10 + Fastify adapter + Socket.io Gateway + PostgreSQL 17 PostGIS 3.5 + Redis 7.
- **Fitur Selesai**:
  - Autentikasi JWT (Access & Refresh Token) dengan RBAC 7 Role (`SUPERADMIN`, `HR_GA_MANAGER`, `CHIEF_SECURITY`, `DANRU`, `PETUGAS` lintas 3 divisi).
  - Spatial Geofence Verification (`ST_DWithin` PostGIS EPSG:4326) untuk presensi akurat.
  - WebSocket Server untuk pemantauan posisi GPS realtime dan Panic SOS broadcast.
  - Modul integrasi legacy reporting (`apps/backend/src/modules/legacy/`).

### 2. PWA Field Mobile (`apps/pwa-field`)
- **Framework**: Vite + React 18 + Tailwind CSS + Workbox Service Worker (Offline-ready).
- **Fitur Selesai**:
  - Halaman Dashboard responsif (mendukung layar smartphone kecil, iPhone, Android, dan tablet).
  - Kamera Selfie Presensi (`SelfieCameraModal.tsx`) dengan mock fallback & kompresi foto.
  - QR Code Scanner (`html5-qrcode`) untuk validasi patroli pos checkpoint.
  - Panic SOS Button (`PanicAlertModal.tsx`) dengan mekanisme tahan 3 detik dan koordinat GPS darurat.
  - Modul Pelaporan Berjenjang Lapangan:
    - `CommanderReportModal.tsx` (Laporan Danru / Komandan Regu)
    - `ChiefReportModal.tsx` (Laporan Chief Security)
    - `StaffActivityModal.tsx` (Laporan Aktivitas Staff / Cleaning / Driver)
  - Riwayat Absensi & Aktivitas (`AttendanceHistoryModal.tsx`, `ActivityHistoryModal.tsx`).
  - Pengajuan Cuti / Izin Sakit (`LeaveModal.tsx`).

### 3. Web Admin Command Center (`apps/web-admin`)
- **Framework**: Next.js 14 (App Router) + Tailwind CSS + Lucide Icons + Leaflet GIS Map.
- **Fitur Selesai**:
  - Dashboard Monitoring Operasional Terpadu & Status Layanan Realtime.
  - Command Center Peta Patroli & Titik Checkpoint.
  - Monitoring Rekap Kegiatan 3 Divisi (Security, Cleaning Service, Driver).
  - Modul Data Induk: Area/Site, Checkpoint PostGIS, dan Personil.
  - Modul Export Laporan (Excel/CSV ready untuk HRIS Korporat).

### 4. Shared Types (`packages/types`)
- Single Source of Truth (SSOT) untuk seluruh antarmuka DTO, User Model, Status Shift, Event WebSocket, dan Payload API.

---

## 🛠 Panduan Setup di Laptop Baru (Step-by-Step)

Ikuti langkah-langkah berikut ketika membuka proyek ini di laptop baru:

### Langkah 1: Prasyarat Software
Pastikan software berikut sudah terpasang di laptop baru:
1. **Git**: [git-scm.com](https://git-scm.com/)
2. **Node.js**: Versi LTS v20.x atau v22.x ([nodejs.org](https://nodejs.org/))
3. **Docker Desktop**: Pastikan engine WSL 2 aktif (khusus Windows) dan Docker daemon sedang berjalan.

### Langkah 2: Clone & Navigasi
```bash
git clone <URL_REPOSITORY_ANDA>
cd Patrol-Management-System
```

### Langkah 3: Konfigurasi File Environment (.env)
File `.env` tidak di-commit ke Git demi keamanan. Salin template yang sudah disediakan:
- **Windows (PowerShell / CMD)**:
  ```powershell
  copy .env.example .env
  ```
- **macOS / Linux**:
  ```bash
  cp .env.example .env
  ```
*(Konfigurasi bawaan di `.env.example` sudah disesuaikan untuk langsung terhubung ke Docker container lokal)*.

### Langkah 4: Instalasi Dependensi Monorepo
Jalankan perintah ini di **root direktori** (jangan di dalam subfolder):
```bash
npm install
```
*npm workspace otomatis mengunduh dan menghubungkan seluruh modul di `apps/backend`, `apps/web-admin`, `apps/pwa-field`, dan `packages/types`.*

### Langkah 5: Nyalakan Container Database & Cache
Jalankan PostgreSQL 17 PostGIS dan Redis via Docker Compose:
```bash
npm run docker:up
```
*(Saat pertama kali berjalan, Docker otomatis mengeksekusi script SQL di `docker/init-db/01_init_schema.sql` dan `02_seed_data.sql` untuk membuat tabel dan data demo)*.

### Langkah 6: Kompilasi Shared Types & Verifikasi Build
Kompilasi package types agar dikenali oleh backend dan frontend:
```bash
npm run build:types
```
Atau uji seluruh kompilasi proyek:
```bash
npm run build
```

### Langkah 7: Menjalankan Sistem
- **Windows (Paling Praktis)**: Cukup klik ganda file **`start-dev.bat`** di root folder.
- **Manual Terminal**:
  ```bash
  npm run gateway
  ```
Akses Portal Terpadu Satu Pintu di browser:
👉 **`http://localhost:8080`**

Login default: username `superadmin` / password `admin123`.

---

## 🤖 Catatan untuk AI Agent di Laptop Baru
Jika Anda menggunakan Antigravity, Cursor, atau Claude Code di laptop baru:
1. **Pedomani Dokumen Utama**:
   - Selalu baca [AGENTS.md](../../AGENTS.md) sebagai pedoman utama aturan bisnis (In-House Enterprise, Non-SaaS, 3 Divisi, 4 Kriteria Definition of Done).
   - Skema database spatial: [04_DATABASE_SCHEMA_POSTGIS.md](04_DATABASE_SCHEMA_POSTGIS.md).
   - Spesifikasi API: [05_API_AND_WEBSOCKET_SPEC.md](05_API_AND_WEBSOCKET_SPEC.md).
2. **Kondisi Database**:
   - Database lokal berjalan di Docker port `5432` dengan ekstensi PostGIS aktif (`CREATE EXTENSION IF NOT EXISTS postgis;`).

