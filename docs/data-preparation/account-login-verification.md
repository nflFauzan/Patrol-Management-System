# Verifikasi Akun & Login Karyawan (Account Login Verification)

> **Modul:** Autentikasi & Otorisasi Pengguna  
> **Portal Karyawan:** `https://patroli.site/validasi-patroli/`  
> **Portal Web Admin:** `https://patroli.site/login.php`  
> **Tanggal Audit:** 22 November 2026  

---

## 1. Matriks Akun & Hasil Uji Autentikasi

Pengujian autentikasi dilakukan menggunakan browser Playwright terlihat (*visible browser*) dengan mode mobile touch context (412x915).

| No | Username | Nama Personel | Posisi / Divisi | Jabatan | Status Login | Destination Page | Verifikasi Sesi |
|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | `nun` | Administrator | Management | Super Admin | **PASS** | `/index.php` (Command Center) | Sesi PHP Admin Aktif |
| 2 | `sec_agus` | Agus Pratama | Security | Anggota | **PASS** | `/validasi-patroli/index.php` | Token/Sesi Mobile Aktif |
| 3 | `danru_budi` | Danru Budi Santoso | Security | Komandan | **PASS** | `/validasi-patroli/index.php` | Token/Sesi Mobile Aktif |
| 4 | `chief_hendra`| Chief Hendra Wijaya | Security | Chief | **PASS** | `/validasi-patroli/index.php` | Token/Sesi Mobile Aktif |
| 5 | `clean_siti` | Siti Aminah | Cleaning Service | Staff Kebersihan | **PASS** | `/validasi-patroli/index.php` | Token/Sesi Mobile Aktif |
| 6 | `driver_joko` | Joko Wahyudi | Driver | Driver Logistik | **PASS** | `/validasi-patroli/index.php` | Token/Sesi Mobile Aktif |

---

## 2. Analisis Mekanisme Autentikasi

### 2.1 Arsitektur Dual-Login
Sistem memiliki 2 gerbang autentikasi yang menggunakan tabel dan kolom yang sama namun dengan perilaku redirect yang berbeda:
1. **Web Admin (`login.php`):**
   - Mengarahkan role admin/manajemen ke command center desktop `/index.php`.
   - Mengarahkan akun operasional (Security, Cleaning, Driver) ke portal mobile `/validasi-patroli/index.php`.
2. **Mobile Worker Portal (`validasi-patroli/`):**
   - Khusus menangani presensi dan pelaporan harian karyawan lapangan.
   - Pengecekan status kehadiran hari ini dilakukan pada saat landing di portal:
     - Jika **belum absen masuk**, tombol `INPUT KEGIATAN` dan `MULAI PERJALANAN` terkunci, dan karyawan diarahkan ke `xxxxx_xx.php` (`ABSEN MASUK`).
     - Jika **sudah absen masuk**, tombol aktivitas terbuka secara dinamis sesuai divisi masing-masing.

### 2.2 Temuan Keamanan & Rekomendasi
- **Format Hash Password:** Sistem menggunakan hashing MD5 32-karakter pada skrip pembaruan `personil_update.php`. Untuk keamanan enterprise standar industri, sistem monorepo baru kami telah menerapkan **Bcrypt (cost factor 10+)** sesuai panduan `AGENTS.md`.
- **Enforcement Keunikan Password:** Backend menolak pendaftaran akun baru jika password yang diinput sama persis dengan password personil lain yang telah terdaftar (`PENDAFTARAN GAGAL, PASSWORD TELAH TERDAFTAR`).

---

## 3. Bukti Tangkapan Layar (Screenshots)

1. [Tangkapan Layar Login Chief Hendra](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshot-login-chief_hendra.png)
2. [Tangkapan Layar Login Siti Aminah (Cleaning)](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshot-login-clean_siti.png)
3. [Tangkapan Layar Login Joko Wahyudi (Driver)](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshot-login-driver_joko.png)
4. [Tangkapan Layar Dashboard Mobile Karyawan](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshot-mobile-sec_agus.png)
