# PRODUCTION READINESS GAP ANALYSIS & RISK REGISTER
## Patrol Management System — Free Staging & Production Deployment

> **Dokumen Audit Kesenjangan Kesiapan Produksi (Pre-Deployment Gap Analysis)**  
> **Status:** Final Pre-Deployment Gap Assessment  
> **Tanggal:** 21 November 2026  
> **Auditor Teknis:** Senior DevOps Engineer, Production Readiness Specialist & Software Architect  

---

## 1. Executive Summary & Ringkasan Hasil Audit

Berdasarkan audit komprehensif yang dilakukan terhadap dokumentasi deployment (`docs/deployment/*.md`) dan repositori kode aktual (`apps/backend`, `apps/web-admin`, `apps/pwa-field`, `packages/types`, dan `docker/init-db`), ditemukan sejumlah **kesenjangan kritis (show-stoppers)** antara apa yang direncanakan dalam dokumen dengan implementasi nyata pada kode sumber.

Jika deployment dipaksakan berjalan sesuai dokumen yang ada tanpa perbaikan teknis terlebih dahulu:
1. **Web Admin akan gagal total berkomunikasi dengan Backend API di Render** karena 21+ komponen frontend masih memiliki URL hardcoded ke `http://localhost:3000`.
2. **Web Admin tidak akan pernah menerima notifikasi real-time alarm Panic SOS** karena URL Socket.io di-hardcode ke `http://localhost:3000` dan mengabaikan `NEXT_PUBLIC_WS_URL`.
3. **Backend NestJS akan ditolak oleh Database Supabase / Neon** karena koneksi database `node-postgres` tidak mengaktifkan enkripsi SSL (`ssl: { rejectUnauthorized: false }`) dan mengabaikan variabel `DATABASE_URL`.
4. **Backend akan gagal listen pada port Render** jika hanya menyetel variabel `PORT=10000`, karena kode backend hanya membaca `BACKEND_PORT`.
5. **Seluruh foto swafoto dan bukti patroli akan hilang saat container restart**, karena backend belum mengimplementasikan SDK Supabase Storage / S3 dan masih menulis ke ephemeral filesystem lokal `./uploads`.
6. **Build Cloudflare Pages akan gagal** karena menjalankan perintah `--workspace` dari subdirektori non-root.

---

## 2. Register Kesenjangan & Risiko (Risk Register Table)

Klasifikasi Severity:
- **CRITICAL**: Mengakibatkan kegagalan total sistem utama, kegagalan koneksi jaringan, atau hilangnya data.
- **HIGH**: Mengakibatkan fitur utama tidak berfungsi, build pipeline gagal, atau kegagalan keamanan.
- **MEDIUM**: Masalah kestabilan performa, ketidaksesuaian log/monitoring, atau penurunan pengalaman pengguna.
- **LOW**: Perbaikan minor, inkonsistensi penamaan dokumen, atau data kosmetik.

| ID | Finding | Severity | Evidence (Bukti Kode / Konfigurasi) | Impact | Recommended Fix | Priority |
|:---:|---|:---:|---|---|---|:---:|
| **GAP-01** | **Hardcoded `localhost:3000` pada 21+ Komponen Web Admin** | **CRITICAL** | `apps/web-admin/src/components/AttendancePatroliDetailModal.tsx` (L47), `AttendanceSemuaDataView.tsx` (L65, L117), `AttendanceMatrixTab.tsx` (L27), `AttendanceMonitoringView.tsx` (L72), `BulkImportModal.tsx` (L196), `ChiefDetailModal.tsx` (L40), `CleaningDetailModal.tsx` (L46), `DriverDetailModal.tsx` (L62), `HourlyPatrolMatrixTab.tsx` (L24), `Laporan*.tsx` (5 file), `PatroliDetailModal.tsx` (L45), `PayrollTab.tsx` (L55), `DataContext.tsx` (L230, L287, L322, L363), `app/emergency/page.tsx` (L142). | Pada domain Vercel publik (`*.vercel.app`), browser akan memanggil `http://localhost:3000` (laptop pengguna), menghasilkan `ERR_CONNECTION_REFUSED` dan Mixed Content. Komponen gagal fetch dan diam-diam jatuh ke mock data. | Refactor seluruh pemanggilan `fetch('http://localhost:3000/...')` agar menggunakan `apiClient` terpusat dari `src/lib/api.ts` yang membaca `NEXT_PUBLIC_API_URL`. | **P0 (Wajib)** |
| **GAP-02** | **Socket.io WebSocket URL Hardcoded & Mengabaikan `NEXT_PUBLIC_WS_URL`** | **CRITICAL** | `apps/web-admin/src/lib/DataContext.tsx` L227-230: `const socketUrl = typeof window !== 'undefined' && window.location.port === '8080' ? window.location.origin : 'http://localhost:3000';` | Web Admin di Vercel tidak akan pernah terkoneksi ke WebSocket Render. Alarm darurat Panic SOS dan pembaruan radar GPS tidak akan pernah diterima secara live di Command Center. | Ubah pembentukan `socketUrl` di `DataContext.tsx` agar memprioritaskan `process.env.NEXT_PUBLIC_WS_URL`. | **P0 (Wajib)** |
| **GAP-03** | **Koneksi Database Backend Tidak Memiliki Opsi SSL & Mengabaikan `DATABASE_URL`** | **CRITICAL** | `apps/backend/src/database/database.service.ts` L11-20: `new Pool({ host: ..., port: ..., user: ..., password: ..., database: ... })`. Tidak ada parameter `ssl` atau pembacaan `DATABASE_URL`. | Managed DB seperti Supabase dan Neon mewajibkan SSL. Tanpa SSL, Postgres melempar error fatal: `no pg_hba.conf entry ... no encryption`. Backend gagal start di Render. | Perbarui `DatabaseService` constructor untuk membaca `connectionString: process.env.DATABASE_URL` dan menambahkan `ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false`. | **P0 (Wajib)** |
| **GAP-04** | **Mismatch Variabel Port Server pada Render (`PORT` vs `BACKEND_PORT`)** | **CRITICAL** | `apps/backend/src/main.ts` L73: `const port = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 3000;`. Pada `FREE_DEPLOYMENT_IMPLEMENTATION_PLAN.md` L98 hanya menyetel `PORT=10000`. | Backend bind ke port default 3000 alih-alih port yang diharapkan Render (10000). Render router menganggap service gagal start / port unassigned, deployment gagal (*Deploy Failed*). | Ubah `main.ts` menjadi: `const port = process.env.PORT \|\| process.env.BACKEND_PORT \|\| 3000;` dan sinkronkan dokumentasi env. | **P0 (Wajib)** |
| **GAP-05** | **Penyimpanan Foto Masih Menulis ke Ephemeral Disk Lokal (Belum Ada Driver S3/Supabase Storage)** | **CRITICAL** | `apps/backend/src/common/utils/file-upload.util.ts` L29-42: `fs.writeFileSync(path.join(process.cwd(), 'uploads', filename))`. Tidak ada pustaka client AWS SDK S3 / `@supabase/storage-js` yang dipanggil. | Ketika instance free Render tidur atau restart, folder `./uploads` terhapus total. Foto swafoto absen dan bukti patroli rusak/hilang (404 Not Found). | Tambahkan adapter upload Supabase Storage / S3 pada `file-upload.util.ts` yang mengunggah file ke bucket `patrol-media` dan mengembalikan URL publik CDN. | **P0 (Wajib)** |
| **GAP-06** | **Cloudflare Pages Monorepo Build Command Error** | **HIGH** | `FREE_DEPLOYMENT_IMPLEMENTATION_PLAN.md` L138: Root Directory diset `apps/pwa-field`, lalu build command menjalankan `npm run build --workspace=@patrol/types ...`. | Gagal kompilasi dengan pesan `npm ERR! code ENOWORKSPACES` karena `package.json` di dalam subfolder `apps/pwa-field` tidak memiliki konfigurasi `workspaces`. | Atur Root Directory di Cloudflare Pages menjadi root repositori (`/`), Build command: `npm run build --workspace=@patrol/types && npm run build --workspace=@patrol/pwa-field`, Output directory: `apps/pwa-field/dist`. | **P1 (Tinggi)** |
| **GAP-07** | **Vercel Monorepo Boundary Issue pada `@patrol/types`** | **HIGH** | `apps/web-admin/tsconfig.json` L29 mereferensikan `../../packages/types/src/index.ts`. Dokumen Vercel hanya menyetel Root Directory `apps/web-admin`. | Jika toggle Vercel "Include files outside of the Root Directory" tidak diaktifkan, build Next.js gagal menyelesaikan tipe `@patrol/types`. | Dokumentasikan konfigurasi spesifik Vercel Monorepo: centang opsi "Include source files outside Root Directory" atau jalankan build dari root. | **P1 (Tinggi)** |
| **GAP-08** | **Endpoint Keep-Alive UptimeRobot Menggunakan Rute Terproteksi 401** | **MEDIUM** | `FREE_DEPLOYMENT_IMPLEMENTATION_PLAN.md` L154 mengarahkan UptimeRobot ke `/api/v1/auth/me`. Rute ini diproteksi `JwtAuthGuard` dan selalu merespons `401 Unauthorized` tanpa token. | UptimeRobot mencatat status down / error berkala jika tidak dikonfigurasi menerima kode 401, atau memicu false alert. | Buat endpoint kesehatan publik tanpa autentikasi: `GET /api/v1/health` yang mengembalikan `{ status: 'ok', timestamp: ... }`. | **P1 (Tinggi)** |
| **GAP-09** | **Penyajian URL Statis `/uploads` Tidak Dapat Diakses Lintas Domain** | **HIGH** | `file-upload.util.ts` L42 mengembalikan `/uploads/${filename}`. Komponen frontend (`AttendanceDetailModal.tsx` L87, L171) me-render `<img src={data.clockInPhotoUrl} />`. | Pada Vercel (`patrol-admin.vercel.app`), browser mencari file di `https://patrol-admin.vercel.app/uploads/...` yang tidak ada (404), karena file fisik berada di server Render (`patrol-api.onrender.com`). | Format URL foto wajib berupa URL absolut (`https://patrol-api.onrender.com/uploads/...` atau URL publik Supabase Storage CDN). | **P1 (Tinggi)** |
| **GAP-10** | **Ketiadaan Auto-Migration Runner pada Backend Startup** | **HIGH** | `apps/backend/src/database/database.service.ts` hanya menjalankan query test `SELECT version()` pada `onModuleInit()`. Tidak ada migrasi otomatis. | Jika database Supabase baru dibuat dan belum dieksekusi SQL secara manual, backend akan melempar 500 error pada setiap request karena tabel belum ada. | Sediakan script runner migrasi database terpadu (`npm run db:migrate`) atau jalankan runner migrasi otomatis di `database.service.ts` saat startup. | **P1 (Tinggi)** |
| **GAP-11** | **Penyebaran Identitas Dummy Perusahaan Sebelumnya** | **MEDIUM** | Ditemukan residu identitas dummy di berbagai file: `'tes-pt'` (`AttendanceMonitoringView.tsx` L196), `'PT ENTERPRISE CORPORATE'` (`PrintIdCardModal.tsx` L99), `'PT Korporat In-House'` (`AdminLoginPage.tsx` L234, `page.tsx` L68), `'@mahakarya-ops.co.id'` (`auth.service.ts` L194, `jwt.strategy.ts` L65), `'Head Office Sudirman'` (`sos.service.ts` L78), `'081215293593'` (`LoginPage.tsx` L135). | Klien PT Berdikari Maju Selaras akan melihat nama perusahaan lain dan nomor kontak asing yang tidak relevan saat demonstrasi sistem. | Lakukan pemetaan dan standarisasi variabel profil perusahaan terpusat dari database `company_profile`. | **P1 (Tinggi)** |
| **GAP-12** | **PWA Manifest & Metadata Masih Bertuliskan "Patroli Site"** | **LOW** | `apps/pwa-field/vite.config.ts` L18-20: `name: 'Patroli Site'`, `short_name: 'Patroli'`. | Saat diinstal di layar utama ponsel petugas, nama icon yang muncul adalah "Patroli" bukan identitas resmi sistem operasional perusahaan. | Perbarui metadata PWA manifest menjadi `Patrol System - PT Berdikari Maju Selaras` atau konfigurasi dinamis. | **P2 (Sedang)** |
| **GAP-13** | **CORS Origin Header Reflection & WebSocket Permissive Origin** | **MEDIUM** | `main.ts` L44-55 merefleksikan origin secara bebas, namun tidak membaca env `CORS_ORIGIN`. `events.gateway.ts` menggunakan `cors: { origin: '*' }`. | Potensi celah keamanan CSRF jika backend menerima permintaan credentialed dari domain publik yang tidak sah. | Konfigurasi origin CORS di `main.ts` dan `events.gateway.ts` agar memvalidasi array domain resmi dari `process.env.CORS_ORIGIN`. | **P2 (Sedang)** |
| **GAP-14** | **Inkonsistensi Nilai Koordinat Demo antara `DataContext.tsx` dan `02_seed_data.sql`** | **MEDIUM** | `02_seed_data.sql` menyetel koordinat SCBD Jakarta (`-6.2215, 106.8055`). Sebaliknya `DataContext.tsx` menyetel koordinat Bogor (`-6.566873, 106.857802`) tetapi alamatnya tertulis "SCBD Jakarta". | Terjadi disonansi data: peta Leaflet menampilkan titik di Bogor, tetapi teks label alamat tertulis Jakarta Selatan. | Seragamkan koordinat dan alamat site utama demo ke lokasi terverifikasi PT Berdikari Maju Selaras di Jl. Raya Sholeh Iskandar Bogor. | **P1 (Tinggi)** |

---

## 3. Matriks Risiko Arsitektural (Failure Probability vs Impact)

```
TINGKAT DAMPAK (IMPACT)
    ▲
  5 │ [GAP-01]  [GAP-02]  [GAP-03]  [GAP-05]
    │ (Hardcoded URL) (WS Failure) (DB SSL) (Data Loss)
  4 │ [GAP-04]  [GAP-06]  [GAP-09]  [GAP-10]
    │ (Port Mismatch) (Build Fail) (Photo 404) (No Migration)
  3 │ [GAP-08]  [GAP-11]  [GAP-14]
    │ (KeepAlive 401) (Dummy Residual) (Coord Mismatch)
  2 │ [GAP-12]  [GAP-13]
    │ (PWA Name) (CORS Validation)
  1 │
    └────────────────────────────────────────►
      1     2     3     4     5   PROBABILITAS TERJADI (LIKELIHOOD)
```

**Kesimpulan Penilaian Risiko:**
Terdapat **5 temuan CRITICAL** dengan probabilitas terjadi 100% jika rilis dijalankan saat ini. Seluruh temuan CRITICAL tersebut secara teknis memblokir fungsionalitas inti aplikasi. Sistem **TIDAK LAYAK** dideploy sebelum GAP-01 hingga GAP-05 diperbaiki.
