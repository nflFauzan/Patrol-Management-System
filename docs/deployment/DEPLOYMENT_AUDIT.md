# DEPLOYMENT AUDIT REPORT
## Patrol Management System (Enterprise In-House / Beli Putus)
> **Dokumen Audit Teknis Kesiapan Deployment & Infrastruktur**  
> **Status:** Final Pre-Deployment Audit  
> **Tanggal:** 21 November 2026  
> **Auditor:** Senior DevOps Engineer, Cloud Architect & Software Deployment Specialist  

---

## 1. Executive Summary & Profil Proyek

Sistem Manajemen Patroli & Fasilitas (**Patrol Management System**) adalah aplikasi korporat terpadu berstatus **Single-Tenant In-House Enterprise (Beli Putus)**. Sistem ini menggabungkan operasional 3 divisi lapangan utama perusahaan:
1. **Satpam (Security)**: Patroli rute checkpoint QR Code, validasi geofence GPS, pelaporan temuan/insiden, dan alarm Panic SOS.
2. **Cleaning Service**: Checklist sanitasi berkala zona toilet/lantai dengan bukti foto sebelum & sesudah.
3. **Driver Logistik**: Pencatatan log perjalanan armada, nomor polisi kendaraan, kilometer (odometer) awal/akhir, dan status pengantaran.
4. **Pusat Komando & HRIS Penggajian (Gaji)**: Pemantauan radar petugas, peta Leaflet live, matriks absensi, perhitungan jam kerja lembur/efektif, dan ekspor laporan resmi (PDF & Excel).

### Sasaran Deployment Sementara (Free Temporary Deployment)
Menyediakan staging demo environment yang dapat diakses melalui internet secara publik untuk demonstrasi dan evaluasi calon klien dengan **biaya Rp0 (100% Gratis)** tanpa mengorbankan fungsionalitas utama aplikasi dan tanpa merusak arsitektur dasar agar mudah dipindahkan ke dedicated server/VPS berbayar setelah kontrak disetujui.

---

## 2. Hasil Audit Komprehensif Komponen Sistem

### 2.1. Bahasa Pemrograman & Package Manager
| Komponen | Spesifikasi Aktual di Repository | Keterangan & Dampak Deployment |
|---|---|---|
| **Bahasa Utama** | TypeScript v5.4.5 (Strict Mode) | Type-safety terpusat, wajib kompilasi bebas error sebelum rilis. |
| **Node.js Runtime** | Node.js v20.x / v22.x LTS | Runtime standar didukung oleh semua platform hosting modern. |
| **Package Manager** | npm v10.x dengan Monorepo Workspaces | Monorepo terbagi atas `apps/*` dan `packages/*`. |
| **Root Workspaces** | `@patrol/backend`, `@patrol/web-admin`, `@patrol/pwa-field`, `@patrol/types` | Dependensi internal menggunakan symlink workspace (`@patrol/types: "*"`). |

---

### 2.2. Audit Arsitektur Frontend

Aplikasi frontend terbagi menjadi dua sub-aplikasi yang melayani dua persona pengguna berbeda:

#### A. Web Admin Command Center (`apps/web-admin`)
- **Framework:** Next.js v14.2.3 (App Router).
- **Rendering Model:** Hybrid SSR/CSR (Client-side interactivity dengan React Server Components layout).
- **Styling:** Tailwind CSS v3.4.3 + Skeuomorphic design tokens.
- **Pustaka Pendukung:**
  - `leaflet` v1.9.4 & `@types/leaflet`: Visualisasi peta satelit & koordinat pos/personil.
  - `socket.io-client` v4.7.5: Menerima notifikasi darurat SOS, koordinat radar GPS, dan siaran pesan secara real-time.
  - `exceljs` v4.4.0 & `xlsx-js-style`: Ekspor dan parsing rekapitulasi data induk, absensi, dan penggajian.
  - `jspdf` v4.2.1 & `jspdf-autotable`: Pembuatan dokumen slip gaji & laporan operasional berformat PDF.
  - `html5-qrcode` v2.3.8: Generator & scanner QR Code checkpoint/ID card.
- **Konfigurasi Produksi Saat Ini:**
  - `next.config.mjs` memiliki rewrites lokal: `/api/:path*` ➔ `http://127.0.0.1:3000/api/:path*` dan `/socket.io/:path*` ➔ `http://127.0.0.1:3000/socket.io/:path*`.
  - **Temuan Audit:** Untuk deployment terpisah di cloud, URL API harus diarahkan melalui environment variable `NEXT_PUBLIC_API_URL` dan `NEXT_PUBLIC_WS_URL`.

#### B. PWA Mobile Field App (`apps/pwa-field`)
- **Framework:** Vite v5.2.11 + React v18.3.1 (SPA).
- **PWA & Offline Engine:** `vite-plugin-pwa` v0.20.0 (Workbox Service Worker).
- **Local Storage Engine:** `idb` v8.0.0 (IndexedDB browser).
- **Scanning & Perangkat Keras:** `html5-qrcode` v2.3.8 (Kamera belakang untuk scanning QR Code token), `navigator.geolocation` (GPS Presisi tinggi), `navigator.mediaDevices` (Swafoto check-in & bukti visual).
- **Kompatibilitas:** Membutuhkan protokol **HTTPS wajib** agar API Kamera (`MediaDevices.getUserMedia`) dan Geolocation diizinkan oleh browser mobile modern (Chrome Android, Safari iOS).
- **Hasil Kompilasi:** Menghasilkan static SPA murni di `apps/pwa-field/dist/` (`index.html`, bundle JS, CSS, `sw.js`, manifest).

---

### 2.3. Audit Arsitektur Backend API & Real-Time Gateway (`apps/backend`)

- **Framework:** NestJS v10.3.8.
- **HTTP Adapter:** Fastify (`@nestjs/platform-fastify` v10.3.8) — performa tinggi dan alokasi memori rendah.
- **Static Assets Serving:** `@fastify/static` v7.0.4 melayani folder `./uploads` melalui rute HTTP `/uploads/*`.
- **Validation & Transformation:** `class-validator` v0.14.1 + `class-transformer` v0.5.1 dengan global `ValidationPipe({ whitelist: true, transform: true })`.
- **Real-Time Communication:**
  - Menggunakan `@nestjs/websockets` dan `@nestjs/platform-socket.io` v10.3.8 (`EventsGateway`).
  - Rooms & Events: `site_${siteId}`, `sos:new`, `gps:broadcast`, `gps:update`, `patrol:checkpoint_scanned`, `broadcast:new`.
  - **Temuan Audit Kritis:** Real-time WebSockets membutuhkan runtime server yang aktif terus menerus (*long-running process*). Layanan serverless murni (seperti Vercel Functions atau Cloudflare Workers) **tidak kompatibel** untuk koneksi WebSocket Socket.io jangka panjang tanpa service pihak ketiga (Pusher/Ably).

---

### 2.4. Audit Database Engine & Geospasial PostGIS

- **Database Engine:** PostgreSQL 17 / 18.
- **Ekstensi Wajib:** `PostGIS 3.5` + `uuid-ossp`.
- **Database Client / Driver:** `pg` (node-postgres `Pool`) direct raw SQL parameterized queries.
- **Fitur Spasial Terpasang:**
  - Kolom `coordinates GEOMETRY(Point, 4326)` pada tabel `sites`, `emergency_alerts`, dan kolom geografi absensi.
  - Indeks spasial: `CREATE INDEX idx_sites_coords ON sites USING GIST (coordinates);`.
  - Query Spasial Aktif:
    - `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)`
    - `ST_DWithin(coordinates, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, geofence_radius_meters)`
    - `ST_Distance(coordinates, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography)`
- **Daftar Tabel di Database:**
  1. `company_profile`
  2. `sites`
  3. `checkpoints`
  4. `users`
  5. `roles`
  6. `permissions`
  7. `role_permissions`
  8. `user_roles`
  9. `user_site_assignments`
  10. `attendances`
  11. `patrol_logs`
  12. `incident_tickets`
  13. `cleaning_checklists`
  14. `driver_trip_logs`
  15. `emergency_alerts`
  16. `broadcast_messages`
  17. `chief_evaluations`
  18. `shift_handovers`
  19. `staff_activity_logs`
  20. `schema_migrations`
- **Temuan Audit Database:** Penyedia database hosting gratis **WAJIB** mendukung ekstensi PostGIS (`CREATE EXTENSION postgis;`). Database Postgres biasa tanpa PostGIS akan gagal saat inisialisasi query geofence.

---

### 2.5. Audit Mekanisme File Upload & Media Storage

- **Implementasi Saat Ini:**
  - Client (PWA & Web Admin) mengunggah foto swafoto dan bukti temuan dalam format Base64 (`data:image/jpeg;base64,...`).
  - Backend memproses file via `saveBase64Image` (`apps/backend/src/common/utils/file-upload.util.ts`).
  - File disimpan secara sinkron ke disk lokal: `path.join(process.cwd(), 'uploads')`.
  - File diakses publik melalui URL `/uploads/<filename>.jpg`.
- **Konfigurasi Environment Eksisting:**
  - `.env.example` mencantumkan variabel S3 (`S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_BUCKET_NAME`), namun implementasi kode saat ini masih menulis ke filesystem lokal.
- **Temuan Audit Kritis:**
  - Layanan hosting gratis backend (seperti Render Free atau Koyeb) menggunakan **ephemeral container disk**. Setiap kali instance di-restart atau sleep, folder `./uploads` akan terhapus.
  - Untuk lingkungan demonstrasi yang stabil, file upload membutuhkan penyimpanan persisten (misal: Supabase Storage Free Tier 1GB atau Cloudinary Free Tier).

---

### 2.6. Audit Keamanan & Autentikasi

- **Mekanisme Login:** JWT (JSON Web Token) dengan signature `JWT_ACCESS_SECRET`.
- **Password Security:** Bcrypt hashing dengan salt rounds 10.
- **RBAC Enforcement:** `JwtAuthGuard` + `RolesGuard` + `PermissionsGuard` memeriksa permission pada level controller/endpoint.
- **Account Lockout:** Fitur mitigasi brute force (`failed_login_attempts` dan `locked_until`) telah terimplementasi di database dan backend.
- **User Approval:** Pendaftaran personil baru membutuhkan verifikasi manual oleh Superadmin/Manager (`is_approved = true`).

---

### 2.7. Audit Integrasi Eksternal

1. **WhatsApp Gateway (Fonnte / Wablas):**
   - Terintegrasi di `apps/backend/src/modules/sos/sos.service.ts`.
   - Mengirimkan pesan darurat otomatis berisi identitas petugas, lokasi fasilitas, dan tautan Google Maps koordinat presisi.
   - **Toleransi Kegagalan (Fault Tolerant):** Jika token WhatsApp tidak diisi (`WA_API_TOKEN`), backend tidak melempar crash (500), melainkan mencatat log simulasi dan tetap menyiarkan alarm SOS melalui WebSocket ke Web Admin.
2. **OpenStreetMap Tile Server:**
   - Dimanfaatkan oleh `leaflet` di Web Admin. Bebas biaya dan tidak memerlukan API Key.

---

## 3. Identifikasi GAP & Kesenjangan (Pre-Deployment Gap Analysis)

| No | Komponen / Fitur | Kondisi Aktual di Kode | Kebutuhan Free Cloud Deployment | Tingkat Urgensi | Solusi / Mitigasi |
|:--:|---|---|---|:--:|---|
| **1** | **Penyimpanan Media (Uploads)** | Disimpan ke disk lokal `./uploads/` | Ephemeral disk di cloud container akan menghapus file saat restart | **TINGGI** | Gunakan Supabase Storage (1GB free) atau pertahankan disk lokal untuk sesi presentasi singkat |
| **2** | **WebSocket Socket.io** | Membutuhkan koneksi TCP terus menerus | Tidak bisa dijalankan di Serverless murni (Vercel/Netlify Functions) | **TINGGI** | Backend dideploy di Render Web Service atau Koyeb yang mendukung persistent WebSocket |
| **3** | **PostGIS Extension** | Wajib untuk query geofence & radius GPS | Sebagian penyedia DB gratis tidak menyediakan PostGIS | **TINGGI** | Pilih Supabase PostgreSQL atau Neon PostgreSQL yang mendukung `CREATE EXTENSION postgis` |
| **4** | **CORS Configuration** | Default merefleksikan localhost:3000, 3001, 5173, 8080 | Harus mengizinkan domain publik Vercel dan Cloudflare Pages | **SEDANG** | Konfigurasi CORS pada backend agar menerima origin frontend publik |
| **5** | **Background Retention Purge** | Disebutkan di AGENTS.md (180 hari), belum ada Cron aktif di backend | Tidak memengaruhi fungsionalitas demo presentasi klien | **RENDAH** | Tandai sebagai backlog fitur untuk rilis production VPS |
| **6** | **Cold Start Inactivity** | Free tier Render/Koyeb tidur setelah 15 menit idle | Klien mungkin mengalami loading 50 detik saat membuka pertama kali | **SEDANG** | Gunakan UptimeRobot / cron-job.org untuk menjaga backend tetap hangat selama sesi presentasi |

---

## 4. Status Verifikasi Kompilasi (DoD Check)

Pengujian kompilasi menyeluruh telah dieksekusi pada lingkungan lokal:
- `@patrol/types`: `tsc` ➔ **PASSED (Exit Code: 0)**
- `@patrol/web-admin`: `next typecheck` (`tsc --noEmit`) ➔ **PASSED (Exit Code: 0)**
- `@patrol/backend`: `nest build` ➔ **PASSED (Exit Code: 0)**
- `@patrol/pwa-field`: `tsc && vite build` ➔ **PASSED (Exit Code: 0, 1608 modules transformed)**
- **Database Status:** PostgreSQL 17 + PostGIS 3.5 live verification: 7 Sites, 11 Checkpoints, 16 Users, 7 Roles, 15 Permissions terverifikasi.

**Kesimpulan Audit:** Seluruh artefak kode berada dalam status stabil, bebas error kompilasi, dan siap untuk dipetakan ke rencana deployment gratis.
