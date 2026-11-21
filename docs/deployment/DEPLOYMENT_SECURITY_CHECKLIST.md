# DEPLOYMENT SECURITY CHECKLIST & DEMO ENVIRONMENT
## Patrol Management System — Client Presentation Environment
> **Standar Keamanan, Sanitasi Data, dan Proteksi Lingkungan Demonstrasi**  
> **Status:** Final Security Guidelines  
> **Tanggal:** 21 November 2026  
> **Petugas Keamanan Sistem:** Senior DevOps Engineer & Security Specialist  

---

## 1. Prinsip Utama Keamanan Demonstrasi

Meskipun lingkungan deployment ini bersifat sementara dan menggunakan layanan hosting gratis, **standar keamanan tingkat enterprise tetap wajib dipertahankan 100%**:
1. **Zero Bypass Rule**: Dilarang membuat *backdoor*, bypass login, atau menonaktifkan JWT Guard demi mempermudah presentasi.
2. **Synthetic Data Only**: Seluruh data yang ditampilkan wajib berupa data sintetis/korporat fiktif (*dummy data*). Dilarang keras menggunakan data KTP, NIK, foto wajah asli personil, atau informasi rahasia klien.
3. **Strict Credential Segregation**: Tidak ada API Key, JWT Secret, atau password database yang disimpan di repositori Git publik maupun privat.

---

## 2. Checklist Keamanan Pra-Deployment (Pre-Deployment Checklist)

| No | Parameter Keamanan | Status Audit | Tindakan & Rekomendasi Wajib |
|:--:|---|:---:|---|
| **1** | **Git Repository Secrets** | ✅ Bersih | File `.env` sudah masuk dalam `.gitignore`. Variabel konfigurasi hanya dimasukkan melalui Environment Settings di dashboard Render, Vercel, dan Cloudflare. |
| **2** | **Proteksi Database Eksternal** | ✅ Terproteksi | Database Supabase mewajibkan enkripsi koneksi SSL (`sslmode=require`). Port koneksi dilindungi password kompleks (min. 16 karakter acak). |
| **3** | **CORS (Cross-Origin Protection)** | ✅ Dibatasi | Backend NestJS membatasi CORS hanya untuk domain resmi presentasi (`patrol-admin.vercel.app` dan `patrol-pwa.pages.dev`). Menolak origin liar. |
| **4** | **Enkripsi Sandi Pengguna** | ✅ Bcrypt (Cost 10) | Seluruh sandi pengguna demo di-hash menggunakan Bcrypt sebelum disimpan ke PostgreSQL. Tidak ada plain-text password. |
| **5** | **JWT Token Hardening** | ✅ Aman | Menggunakan key acak dengan entropi tinggi (`min. 32 karakter`). Token kadaluwarsa diset 8 jam untuk mencegah sesi tergantung selamanya. |
| **6** | **Brute-Force & Lockout Mitigation** | ✅ Terpasang | Fitur `failed_login_attempts` mengunci akun secara otomatis selama 15 menit jika evaluator salah memasukkan password 5 kali berturut-turut. |
| **7** | **Validasi Payload & SQL Injection** | ✅ Parameterized SQL | Seluruh input divalidasi oleh `ValidationPipe({ whitelist: true })` NestJS. Query database menggunakan parameter `$1, $2, ...` (bebas SQL Injection). |
| **8** | **Pembatasan Ukuran File Upload** | ✅ Dibatasi 10 MB | Fastify `bodyLimit` dikunci pada 10.485.760 bytes (10 MB). Backend menolak payload foto base64 melebihi batas ini. |
| **9** | **Penyembunyian Mode Debug** | ✅ `NODE_ENV=production` | Log konsol Fastify diset ringkas pada mode produksi. Detail internal stack trace tidak diekspos ke respon HTTP klien. |
| **10** | **Protokol HTTPS Wajib** | ✅ Enkripsi TLS 1.3 | Seluruh komunikasi frontend dan API wajib melalui HTTPS. Memenuhi syarat browser untuk izin Kamera & GPS. |

---

## 3. Profil Akun Demonstrasi Terisolasi (Demo Access Matrix)

Untuk memfasilitasi pengujian oleh calon klien tanpa risiko gangguan hak akses, sistem telah dilengkapi akun demonstrasi yang mewakili setiap divisi dan tingkatan hierarki korporat:

| Role / Divisi | Username Demo | Password Default Demo | Hak Akses & Fitur yang Dapat Ditunjukkan |
|---|---|---|---|
| **Super Administrator** | `admin` | `patrol2026!` | **Akses Penuh**: Seluruh menu Web Admin, manajemen Data Induk, Approval Pengguna, RBAC, dan Konfigurasi Sistem. |
| **Chief Security** | `chief_security` | `patrol2026!` | **Pusat Komando & Monitoring**: Peta live radar satpam, validasi laporan temuan patroli, penerimaan alarm darurat SOS, dan rekap shift. |
| **HRD & Penggajian** | `hr_payroll` | `patrol2026!` | **Modul SDM & Gaji**: Rekapitulasi absensi personil, perhitungan jam kerja efektif, lembur, denda keterlambatan, dan ekspor slip gaji (PDF/Excel). |
| **Supervisor Lapangan** | `danru1` | `patrol2026!` | **Operasional Shift**: Checklist kehadiran anggota, verifikasi izin/sakit, dan kontrol pos jaga. |
| **Petugas Satpam** | `satpam1` | `patrol2026!` | **Mobile PWA (Security)**: Presensi swafoto GPS, pemindaian rute checkpoint QR Code, pelaporan insiden, dan penekanan tombol Panic SOS (3 detik). |
| **Petugas Kebersihan** | `cleaner1` | `patrol2026!` | **Mobile PWA (Cleaning)**: Checklist sanitasi berkala zona lantai/toilet, unggah bukti foto sebelum & sesudah pembersihan. |
| **Driver Logistik** | `driver1` | `patrol2026!` | **Mobile PWA (Driver)**: Pencatatan nomor armada kendaraan, input odometer kilometer awal/akhir, dan status logistik. |

---

## 4. Sanitasi Data Demonstrasi (Corporate Synthetic Data)

Seluruh entitas data dalam database demo disiapkan khusus dengan standar korporat netral:
- **Nama Perusahaan:** PT Berdikari Maju Selaras (Bogor, Jawa Barat).
- **Lokasi Fasilitas:**
  1. *Kantor Pusat & Operasional Bogor* (Jl. Raya Sholeh Iskandar No. 22–23, RT.01/RW.09, Kedung Jaya, Tanah Sareal, Kota Bogor — Titik Koordinat: `-6.564061, 106.810320`).
  2. *Pos Logistik & Distribusi Mitra* (Kawasan Industri Sentul, Jl. Babakan Madang, Kabupaten Bogor — Titik Koordinat: `-6.535000, 106.857800`).
- **Nomor Telepon & Kontak:** Menggunakan nomor korporat awalan resmi demonstrasi (`0812-9988-xxxx`), bukan nomor pribadi karyawan.
- **Titik Checkpoint QR Code:** Menggunakan token aman standar HMAC/UUID (`QR-BMS-GATE-01`, `QR-BMS-LOBBY-02`, dll.) yang dapat dicetak langsung melalui menu *Data Induk -> Checkpoint -> Cetak QR*.

---

## 5. Prosedur Pencadangan Data Sebelum Demonstrasi (Pre-Demo Backup)

Sebelum presentasi dimulai, DevOps wajib melakukan backup basis data untuk mengantisipasi jika evaluator mengubah atau menghapus data secara tidak sengaja:
```bash
# Perintah Dump Database dari Cloud Supabase
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" \
  --format=c \
  --file=demo_backup_baseline.dump

# Perintah Restore Instan jika Ingin Mengembalikan ke Kondisi Awal
pg_restore --clean --if-exists \
  --dbname="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" \
  demo_backup_baseline.dump
```
