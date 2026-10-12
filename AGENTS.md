# AGENTS.md — AI Agent Guidelines & Engineering Standards
> **Patrol & Facility Management System (Enterprise In-House / Beli Putus)**  
> Standard Operating Procedures (SOP) untuk Antigravity, Pair-Programming AI, dan Kontributor Rekayasa Perangkat Lunak.

---

## 1. Core Business Scope & Philosophy (Wajib Dipatuhi)

Sistem ini dirancang khusus untuk **satu perusahaan korporat (Single-Tenant In-House Enterprise)** yang membeli sistem secara **Putus**.
1. **DILARANG MENGGUNAKAN MULTI-TENANCY SAAS**:
   - Jangan menambahkan kolom `tenant_id`, tabel organisasi multi-perusahaan, atau skema SaaS dinamis.
   - Fokus hanya pada hierarki internal korporat: **Pusat ➔ Fasilitas / Site (Kantor Pusat, Pabrik, Gudang, Logistik) ➔ Divisi ➔ Pos/Checkpoint**.
2. **3 Divisi Operasional Terpadu**:
   - **Satpam (Security)**: Patroli rute checkpoint QR Code, validasi geofence, laporan insiden, dan Panic SOS.
   - **Cleaning Service**: Checklist sanitasi berkala per zona lantai/toilet, pembersihan, dan verifikasi foto.
   - **Driver Logistik**: Log perjalanan armada, pelat nomor kendaraan, odometer awal/akhir, dan status pengiriman.
3. **HRIS-Ready Engine (Bukan Penggajian Internal)**:
   - Tidak ada slip gaji internal. Sistem bertindak sebagai *Attendance & Working Hours Recap Engine* yang menghitung jam kerja efektif, menit terlambat, jam lembur (overtime), dan status validitas geofence untuk diekspor ke format Excel/CSV HRIS korporat.
4. **Media Retention Policy (180 Hari / 6 Bulan)**:
   - Foto bukti swafoto dan temuan patroli disimpan selama 180 hari sebelum di-purge otomatis oleh worker background.
5. **Panic Button SOS Terintegrasi**:
   - Menekan tombol SOS (tahan 3 detik) di PWA memicu WebSocket broadcast ke Web Admin Command Center dan mengirim pesan darurat otomatis via WhatsApp Gateway (Fonnte/Wablas) ke grup supervisor dengan link Google Maps presisi.

---

## 2. Definition of Done (DoD) & Testing Workflow

Setiap tugas, fitur baru, atau refactor yang dikerjakan oleh Agent **TIDAK BOLEH** dianggap selesai sebelum memenuhi 4 kriteria pengujian berikut:

```
[Write Code] ➔ [TypeScript Typecheck] ➔ [Unit & Logic Spec Test] ➔ [Live PostGIS DB Verify] ➔ [E2E Flow Verify] ➔ [DONE]
```

### Kriteria 1: Zero Compilation Error (Build Pass 100%)
- Semua workspace harus lulus kompilasi tanpa error:
  - `packages/types`: `npm run build --workspace=@patrol/types`
  - `apps/backend`: `npm run build --workspace=@patrol/backend`
  - `apps/pwa-field`: `npm run build --workspace=@patrol/pwa-field`
  - `apps/web-admin`: `npm run build --workspace=@patrol/web-admin`

### Kriteria 2: Unit & Business Logic Testing (Vitest / Jest)
Setiap penambahan atau modifikasi logika bisnis **wajib** disertai file pengujian unit (`*.spec.ts`):
1. **Attendance & Shift Engine**:
   - Menghitung menit keterlambatan melebihi *grace period* (toleransi).
   - Menghitung jam kerja efektif normal (8 jam) dan jam lembur (overtime).
   - Penanganan shift lintas hari/malam (misal: masuk 23:00, pulang 07:00).
2. **PostGIS Geofence Boundary Check**:
   - Pengujian titik persis di dalam radius ($d < R \rightarrow \text{valid}$).
   - Pengujian batas toleransi ($d = R \rightarrow \text{valid}$).
   - Pengujian di luar batas ($d > R \rightarrow \text{invalid / outside geofence}$).
3. **Panic Button SOS & WhatsApp Payload**:
   - Verifikasi pembentukan link Google Maps koordinat presisi.
   - Verifikasi pencegahan *false alarm* (harus ditahan 3 detik).

### Kriteria 3: Live Database & Integration Testing
- Dilarang membuat kesimpulan sukses palsu (*fake green check*).
- Pengujian query harus dieksekusi terhadap container live PostgreSQL 17 + PostGIS 3.5 yang berjalan di Docker lokal.
- Manfaatkan script verifikasi seperti `node scripts/check-db.js` atau test suite integrasi backend.

### Kriteria 4: End-to-End Scenario Testing (Playwright)
- Pengujian robotik browser terhadap skenario riil:
  - **PWA Field App**: Mock geolocation GPS, mock kamera MediaDevices untuk swafoto check-in, dan simulasi pemindaian QR code via `html5-qrcode`.
  - **Web Admin**: Verifikasi real-time update saat petugas melakukan check-in atau menekan tombol SOS.
  - **Offline Capability**: Memverifikasi Service Worker Workbox tetap menyajikan halaman saat jaringan terputus (status *Offline*).

---

## 3. Struktur Direktori & Konvensi Monorepo

```tree
Patrol-Management-System/
├── AGENTS.md               <-- SOP & acuan AI Agent (File ini)
├── docker-compose.yml      <-- PostgreSQL 17 PostGIS & Redis 7
├── docs/                   <-- Dokumentasi teknis & spesifikasi produk
│   ├── 01_AUDIT_REPORT.md
│   ├── 02_PRD_PRODUCT_REQUIREMENTS.md
│   ├── 03_SYSTEM_ARCHITECTURE.md
│   ├── 04_DATABASE_SCHEMA_POSTGIS.md
│   ├── 05_API_AND_WEBSOCKET_SPEC.md
│   └── 06_TESTING_AND_QA_WORKFLOW.md
├── packages/
│   └── types/              <-- Sumber kebenaran tipe (SSOT)
├── apps/
│   ├── backend/            <-- NestJS + Fastify + PostGIS + Socket.io
│   ├── pwa-field/          <-- Vite + React PWA (Workbox offline SPA)
│   └── web-admin/          <-- Next.js 14 App Router Command Center
└── scripts/                <-- Helper script otomatisasi & verifikasi
```

---

## 4. Peraturan Eksekusi untuk AI Agent

1. **Jalankan Verifikasi Nyata**:
   Setelah menulis atau mengedit file, jalankan perintah pengujian atau build terminal secara langsung. Jangan menebak hasilnya.
2. **Dilarang Polling / Looping Perintah**:
   Gunakan background task dan tunggu notifikasi sistem selesai secara reaktif. Jangan menjalankan perintah `status` dalam perulangan cepat.
3. **Jaga Integritas Komentar & Dokumentasi**:
   Pertahankan komentar teknis dan pemetaan kode yang sudah ada. Jika ada perubahan skema atau alur bisnis, sinkronkan juga dokumentasi terkait di direktori `docs/`.
4. **Keamanan Data & Sanitasi**:
   - Password wajib di-hash menggunakan Bcrypt (minimal cost factor 10).
   - Semua input koordinat GPS harus divalidasi format numeriknya sebelum diproses ke PostGIS `ST_SetSRID(ST_MakePoint(lon, lat), 4326)`.
   - Hindari mengekspos token JWT atau secret di log konsol publik.
