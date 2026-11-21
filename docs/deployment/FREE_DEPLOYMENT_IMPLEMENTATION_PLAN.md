# FREE DEPLOYMENT IMPLEMENTATION PLAN
## Patrol Management System — Client Presentation Environment
> **Panduan Langkah-Demi-Langkah Implementasi Deployment 100% Gratis (Rp0)**  
> **Status:** Final Deployment Blueprint & Runbook  
> **Tanggal:** 21 November 2026  
> **Lead Engineer:** Senior DevOps Engineer & Software Deployment Specialist  

---

## 1. Analisis Biaya Operasional (Cost Breakdown)

Semua layanan yang dipilih merupakan tingkatan gratis permanen (*Free-Tier Forever*) tanpa memerlukan kartu kredit:

| Komponen Sistem | Provider Terpilih | Biaya Bulanan | Batas Kuota Gratis (Free Allowance) | Limitasi & Mitigasi |
|---|---|:---:|---|---|
| **Frontend Web Admin** | **Vercel** | **Rp0** | 100 GB Bandwidth / bln, Unlimited deploys | Menggunakan subdomain `*.vercel.app` bawaan. |
| **Frontend PWA Field** | **Cloudflare Pages** | **Rp0** | **Unlimited Bandwidth**, Unlimited requests | Menggunakan subdomain `*.pages.dev` bawaan. |
| **Backend API & WS** | **Render.com** | **Rp0** | 512 MB RAM, 0.1 CPU, Persistent WebSocket | Inactivity sleep setelah 15 mnt idle (Diatasi dengan UptimeRobot ping). |
| **Database Spasial** | **Supabase** | **Rp0** | 500 MB Storage, PostgreSQL 16 + PostGIS 3.5 | Pause jika 7 hari tanpa aktivitas (Bisa di-unpause dengan 1 klik). |
| **Penyimpanan Media** | **Supabase Storage** | **Rp0** | 1 GB Storage Bucket, 2 GB Bandwidth | Cukup untuk ~2.000 foto bukti resolusi kompresi mobile. |
| **Sertifikat SSL / HTTPS**| Cloudflare / Vercel | **Rp0** | Otomatis terpasang untuk seluruh domain | Let's Encrypt / Cloudflare SSL terenkripsi otomatis. |
| **Keep-Alive Ping** | **UptimeRobot** | **Rp0** | 50 Monitor, interval 5-10 menit | Menjaga backend Render selalu aktif selama jam kerja demo. |
| **TOTAL BIAYA** | | **Rp0** | **Target 100% Bebas Biaya Tercapai** | **Tidak memerlukan input nomor kartu kredit.** |

---

## 2. Akun & Layanan yang Perlu Didaftarkan

Sebelum memulai konfigurasi, daftarkan akun gratis pada 4 platform berikut (disarankan menggunakan opsi login via GitHub agar tersinkronisasi instan):
1. **GitHub** (`https://github.com`): Repositori kode monorepo.
2. **Supabase** (`https://supabase.com`): Database PostgreSQL + PostGIS dan Storage Media.
3. **Render** (`https://render.com`): Backend Web Service NestJS + Socket.io.
4. **Vercel** (`https://vercel.com`): Hosting Web Admin Next.js 14.
5. **Cloudflare** (`https://dash.cloudflare.com`): Hosting PWA Field Vite.
6. **UptimeRobot** (`https://uptimerobot.com`): Monitor keep-alive ping.

---

## 3. Langkah-Demi-Langkah Implementasi Deployment

### Langkah 1: Setup Database PostgreSQL & PostGIS di Supabase
1. Masuk ke dashboard Supabase dan klik **New Project**.
   - **Name:** `patrol-demo-db`
   - **Database Password:** Buat sandi aman yang kuat (simpan di catatan aman).
   - **Region:** `Southeast Asia (Singapore)` — untuk latensi terendah ke Indonesia (<25ms).
2. Setelah database siap, buka menu **SQL Editor** pada sidebar kiri.
3. Aktifkan ekstensi spasial PostGIS:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "postgis";
   SELECT version(), PostGIS_Full_Version();
   ```
4. Eksekusi skema tabel awal:
   - Salin isi dari file `docker/init-db/01_init_schema.sql` dan jalankan (*Run*).
5. Eksekusi data seed korporat awal:
   - Salin isi dari file `docker/init-db/02_seed_data.sql` dan jalankan (*Run*).
6. Eksekusi migrasi RBAC dan audit fields:
   - Salin isi dari `apps/backend/src/database/migrations/010_rbac_and_approval.sql` dan jalankan.
   - Salin isi dari `apps/backend/src/database/migrations/011_add_portal_permissions_and_requested_role.sql` dan jalankan.
7. Ambil Connection String database:
   - Buka menu **Project Settings -> Database -> Connection String**.
   - Pilih tab **URI (Transaction Pooler)** atau **Direct Connection** (Port 5432).
   - Format: `postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`.

---

### Langkah 2: Setup Storage Bucket di Supabase (Media Foto)
1. Buka menu **Storage** pada dashboard Supabase.
2. Klik **New Bucket**:
   - **Bucket Name:** `patrol-media`
   - **Public Bucket:** Centang **Public** (agar foto bukti dapat dimuat di browser admin dan PWA).
3. Buat Access Policy (Policies):
   - Izinkan operasi `SELECT` publik untuk membaca foto.
   - Izinkan operasi `INSERT` untuk backend dengan API Key.

---

### Langkah 3: Deployment Backend API di Render.com
1. Masuk ke dashboard Render dan klik **New + -> Web Service**.
2. Hubungkan repositori GitHub `Patrol-Management-System`.
3. Isi parameter konfigurasi:
   - **Name:** `patrol-api`
   - **Region:** `Singapore`
   - **Branch:** `main`
   - **Root Directory:** *(Biarkan kosong atau isi root monorepo)*
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npm run build --workspace=@patrol/types && npm run build --workspace=@patrol/backend
     ```
   - **Start Command:**
     ```bash
     node apps/backend/dist/main.js
     ```
   - **Instance Type:** `Free` (512 MB RAM / 0.1 CPU).
4. Tambahkan Environment Variables pada menu **Environment**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `BACKEND_PORT`: `10000`
   - `PUBLIC_BACKEND_URL`: `https://patrol-api.onrender.com`
   - `DATABASE_URL`: *(URI PostgreSQL Supabase dari Langkah 1 dengan ?sslmode=require)*
   - `DB_HOST`: `aws-0-ap-southeast-1.pooler.supabase.com`
   - `DB_PORT`: `5432`
   - `DB_USER`: `postgres.[REF]`
   - `DB_PASSWORD`: `[PASSWORD_SUPABASE]`
   - `DB_NAME`: `postgres`
   - `DB_SSL`: `true`
   - `JWT_ACCESS_SECRET`: `[GENERATE_RANDOM_32_CHARACTERS]`
   - `JWT_REFRESH_SECRET`: `[GENERATE_RANDOM_32_CHARACTERS]`
   - `JWT_ACCESS_EXPIRES_IN`: `8h`
   - `CORS_ORIGIN`: `https://patrol-admin.vercel.app,https://patrol-pwa.pages.dev`
   - `WA_NOTIFICATIONS_ENABLED`: `false` *(atau isi token Fonnte jika ingin WA aktif)*
5. Klik **Create Web Service**. Tunggu proses build hingga muncul status **Live**.
6. Simpan URL Backend publik yang diberikan Render (contoh: `https://patrol-api.onrender.com`).

---

### Langkah 4: Deployment Web Admin di Vercel
1. Masuk ke dashboard Vercel dan klik **Add New... -> Project**.
2. Pilih repositori `Patrol-Management-System`.
3. Pada pengaturan proyek:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Klik *Edit* dan pilih folder `apps/web-admin`.
   - **Build Command:** `next build` (Bawaan Vercel).
4. Tambahkan Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://patrol-api.onrender.com/api/v1`
   - `NEXT_PUBLIC_WS_URL`: `https://patrol-api.onrender.com`
   - `NODE_ENV`: `production`
5. Klik **Deploy**. Vercel akan mengompilasi aplikasi dan menghasilkan URL (contoh: `https://patrol-admin.vercel.app`).

---

### Langkah 5: Deployment PWA Mobile Field di Cloudflare Pages
1. Masuk ke dashboard Cloudflare dan buka menu **Workers & Pages -> Pages -> Connect to Git**.
2. Pilih repositori `Patrol-Management-System`.
3. Isi parameter build:
   - **Project Name:** `patrol-pwa`
   - **Framework Preset:** `None` atau `Vite`
   - **Root Directory:** `/` (Biarkan kosong / root repositori agar workspace npm terbaca)
   - **Build Command:**
     ```bash
     npm run build --workspace=@patrol/types && npm run build --workspace=@patrol/pwa-field
     ```
   - **Build Output Directory:** `apps/pwa-field/dist`
4. Tambahkan Environment Variables:
   - `VITE_API_URL`: `https://patrol-api.onrender.com/api/v1`
   - `VITE_WS_URL`: `https://patrol-api.onrender.com`
5. Klik **Save and Deploy**. Cloudflare akan mempublikasikan PWA dengan URL (contoh: `https://patrol-pwa.pages.dev`).

---

### Langkah 6: Konfigurasi Keep-Alive di UptimeRobot
Untuk memastikan backend Render tidak mengalami masa tidur (*cold start*) yang memakan waktu 50 detik saat calon klien membuka aplikasi:
1. Masuk ke UptimeRobot (`https://uptimerobot.com`).
2. Klik **Add New Monitor**:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Patrol Backend Warmup`
   - **URL:** `https://patrol-api.onrender.com/api/v1/health`
   - **Monitoring Interval:** `Every 5 minutes` atau `Every 10 minutes`.
3. Simpan monitor. Backend sekarang akan selalu terjaga aktif (*always warm*) sepanjang sesi evaluasi klien.

---

## 4. Rangkaian Pengujian Pasca Deployment (Smoke Testing Checklist)

Sebelum membagikan tautan kepada calon klien, lakukan verifikasi menyeluruh:

| Skenario Pengujian | Langkah Aksi | Hasil yang Diharapkan | Status |
|---|---|---|:---:|
| **1. Aksesibilitas Web Admin** | Buka `https://patrol-admin.vercel.app` di laptop. | Halaman login terbuka dengan gaya skeuomorphic bersih, aset CSS & icon termuat sempurna. | [ ] |
| **2. Login Multi-Role** | Login berturut-turut sebagai `admin`, `chief_security`, dan `hr_payroll`. | Berhasil masuk ke dashboard masing-masing sesuai hak akses role. | [ ] |
| **3. Akses PWA & Pemasangan** | Buka `https://patrol-pwa.pages.dev` di smartphone Android/iOS. | Notifikasi instalasi PWA muncul, halaman login mobile termuat cepat. | [ ] |
| **4. Izin Kamera & GPS** | Login sebagai `satpam1` dan klik Presensi Masuk. | Browser meminta izin Kamera & Lokasi, kamera swafoto aktif dengan overlay watermark. | [ ] |
| **5. Validasi Geofence PostGIS** | Kirim presensi di luar radius site demo. | Sistem secara akurat menolak dengan pesan peringatan jarak geofence. | [ ] |
| **6. Uji Coba Scanning QR** | Arahkan kamera ke QR Code pos yang dicetak dari menu admin. | QR Code langsung terdeteksi, nama pos dan checklist patroli muncul seketika. | [ ] |
| **7. Alarm Darurat Panic SOS** | Tekan dan tahan tombol SOS selama 3 detik di smartphone. | Web Admin di laptop berbunyi sirine alarm secara instan, radar peta menampilkan koordinat darurat. | [ ] |
| **8. Uji Coba Mode Offline** | Aktifkan Mode Pesawat (Airplane Mode) di smartphone, lakukan scan. | Data tersimpan di antrean lokal (*Pending Offline*). Saat internet aktif, data tersinkronisasi otomatis (*Synced*). | [ ] |
| **9. Ekspor Laporan Excel/PDF** | Buka menu Ekspor Laporan di Web Admin, unduh rekapitulasi. | File `.xlsx` dan `.pdf` terunduh dengan format tabel rapi. | [ ] |

---

## 5. Lembar Skenario Presentasi Klien (Client Presentation Playbook)

Gunakan alur demonstrasi berikut saat pertemuan dengan calon klien:

```
[Babak 1: Pendahuluan & Value Proposition]
  - Jelaskan konsep Single-Tenant In-House Enterprise (Beli Putus).
  - Tunjukkan bahwa data dan server adalah 100% milik klien, tanpa biaya langganan bulanan per user (No SaaS Fee).

[Babak 2: Command Center Web Admin (Di Layar Proyektor / Laptop)]
  - Login sebagai Super Administrator / Chief Security.
  - Tunjukkan Peta Live Radar Satpam, Pos Checkpoint di SCBD & Cikarang, dan status kehadiran real-time.

[Babak 3: Mobile PWA Satpam & Petugas (Di Smartphone Nyata / Simulator)]
  - Tunjukkan betapa ringannya aplikasi tanpa perlu download dari Google Play Store (PWA).
  - Demonstrasikan presensi wajah swafoto dengan watermark tanggal & koordinat anti-fake GPS.
  - Demonstrasikan scan QR Code pos patroli satpam.

[Babak 4: Simulasi Darurat Panic SOS (Show-Stopper Feature)]
  - Tekan tombol SOS selama 3 detik di smartphone.
  - Tunjukkan Web Admin di laptop seketika berbunyi sirine darurat dan mengunci lokasi satpam pada peta.

[Babak 5: Ketahanan Offline di Area Basement]
  - Nyalakan mode pesawat pada smartphone.
  - Lakukan input patroli; tunjukkan badge indikator offline.
  - Matikan mode pesawat; tunjukkan indikator sinkronisasi otomatis berubah hijau.

[Babak 6: Manajemen HRIS & Penggajian]
  - Tunjukkan matriks jam kerja efektif, lembur, dan ekspor slip gaji otomatis dalam format Excel dan PDF.
```
