# 02 — MATRIKS PERAN & HAK AKSES SISTEM (ROLE & PERMISSION MATRIX)
> **File:** `docs/reverse-engineering/phase-1/02-role-permission-matrix.md`  
> **Tahap:** Phase 1 — Deep Reverse Engineering  
> **Sistem Acuan:** `https://patroli.site`  
> **Sistem Sasaran:** `Patrol-Management-System`  

---

## 1. Taksonomi Peran Pengguna (User Roles Taxonomy)

Berdasarkan inspeksi mendalam terhadap tabel `xxxx_xxxxxxxx`, dropdown form `insert-personil.php`, dan perilaku pengalihan login `login.php`, sistem mengenal 8 klasifikasi peran yang terbagi dalam dua kelompok besar:

### Kelompok Manajerial & Supervisi (Web Admin Access)
1. **Super Administrator (`ADMIN_SUPER`):** Pengelola sistem tertinggi korporat, memiliki kendali penuh terhadap seluruh fasilitas/site, konfigurasi master data, tarif payroll, dan otorisasi alarm.
2. **Admin Area / Site Supervisor (`ADMIN_AREA`):** Pengawas operasional pada fasilitas/site tertentu dengan hak baca dan pengawasan terbatas pada site yang ditugaskan.

### Kelompok Petugas Lapangan (Mobile Worker PWA Access)
3. **Anggota Satpam (`SECURITY_OFFICER` / `anggota`):** Pelaksana patroli keliling fisik, pemindai QR checkpoint, dan pelapor temuan anomali/insiden.
4. **Komandan Regu / Danru (`SECURITY_LEADER` / `komandan`):** Pemimpin shift regu pengamanan, bertanggung jawab atas serah terima inventaris pos jaga dan pelaporan kesimpulan shift.
5. **Chief Security (`SECURITY_CHIEF` / `chief`):** Kepala keamanan fasilitas, bertugas melakukan inspeksi supervisi berkala terhadap kinerja Danru dan kesiapan pos.
6. **Petugas Kebersihan (`CLEANER` / `Cleaning Service`):** Pelaksana checklist sanitasi berkala per zona lantai dan toilet fasilitas.
7. **Pengemudi Logistik (`DRIVER` / `Driver`):** Pencatat perjalanan armada dinas, nomor polisi, tujuan pengiriman, dan pemeliharaan kendaraan.
8. **Staf Operasional (`STAFF` / `Staff Operasional`):** Pelaksana pekerjaan administratif harian kantor non-checkpoint.

---

## 2. Matriks Hak Akses Komprehensif (RBAC Matrix)

```
Simbol Izin:
[C] = Create    [R] = Read / View    [U] = Update / Edit    [D] = Delete
[X] = Execute Transaksi PWA          [-] = Ditolak / Tidak Ada Akses
```

| Modul / Domain Fungsional | SuperAdmin | AdminArea | Chief | Danru | Anggota | Cleaning | Driver | Staff |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard Command Center** | CRUD | R (Site) | - | - | - | - | - | - |
| **Master Data: Fasilitas / Area**| CRUD | R (Site) | - | - | - | - | - | - |
| **Master Data: Checkpoint Pos** | CRUD | CRUD (Site) | - | - | - | - | - | - |
| **Master Data: Personel & Akun**| CRUD | R (Site) | - | - | - | - | - | - |
| **ID Card & QR Sticker Print** | CRUD | R | - | - | - | - | - | - |
| **Presensi Masuk / Pulang PWA** | - | - | X | X | X | X | X | X |
| **Pengajuan Cuti / Izin PWA** | - | - | X | X | X | X | X | X |
| **Scan QR Checkpoint Keamanan** | - | - | X | X | X | - | - | - |
| **Laporan Temuan Insiden (`tl=1`)**| - | - | X | X | X | - | - | - |
| **Tindak Lanjut Insiden (Mitigasi)**| CRUD | U (Site) | U | U | - | - | - | - |
| **Form Laporan Danru (PWA)** | - | - | R | X | - | - | - | - |
| **Form Supervisi Chief (PWA)** | - | - | X | - | - | - | - | - |
| **Checklist Sanitasi Kebersihan**| - | - | - | - | - | X | - | - |
| **Log Perjalanan Armada Driver** | - | - | - | - | - | - | X | - |
| **Logbook Kegiatan Harian Staff**| - | - | - | - | - | - | - | X |
| **Panic Button SOS Trigger** | - | - | X | X | X | X | X | X |
| **Pemantauan & Pemadaman Alarm**| CRUD | U (Site) | - | - | - | - | - | - |
| **Laporan Operasional (7 Menu)** | CRUD | R (Site) | - | - | - | - | - | - |
| **Penggajian (Payroll Engine)** | CRUD | R (Site) | - | - | - | - | - | - |
| **Slip Gaji A4 Generator** | CRUD | R (Site) | - | - | - | - | - | - |
| **Pesan Siaran Ticker (Broadcast)**| CRUD | U (Site) | - | - | - | - | - | - |
| **Wizard Ekspor Laporan (PDF/XLS)**| CRUD | R (Site) | - | - | - | - | - | - |

---

## 3. Spesifikasi Perilaku Antarmuka Karyawan per Peran (PWA Adaptive UI)

Saat karyawan membuka `/validasi-patroli/index.php`, tampilan antarmuka beradaptasi secara dinamis berdasarkan nilai kolom `posisi` dan `jabatan` di sesi login:

### 3.1 Anggota Satpam (`posisi = 'Security'`, `jabatan = 'anggota'`)
- Tombol Utama: `ABSEN MASUK` (jika belum presensi) ➔ `ABSEN PULANG` (setelah presensi).
- Tombol Operasional: **`SCAN CHECKPOINT`** (`xxxxx_xxxxxxxxx.php`).
- Form Scan: Membuka kamera pemindai `html5-qrcode`. Form hasil patroli di `cek.php` berlabel *"PILIH HASIL PATROLI"*.
- Menu Darurat: Tombol bulat merah **`SOS`** selalu tampil di bagian bawah dashboard.

### 3.2 Komandan Regu / Danru (`posisi = 'Security'`, `jabatan = 'komandan'`)
- Tombol Utama: `ABSEN MASUK` ➔ `ABSEN PULANG`.
- Tombol Operasional Tambahan: **`LAPORAN KOMANDAN`** (`12_laporan_komandan.html` ➔ `insert_komandan.php`).
- Akses Scan: Tetap dapat memindai QR checkpoint untuk inspeksi pos jaga.

### 3.3 Chief Security (`posisi = 'Security'`, `jabatan = 'chief'`)
- Tombol Utama: `ABSEN MASUK` ➔ `ABSEN PULANG`.
- Tombol Operasional Tambahan: **`LAPORAN CHIEF`** (`13_laporan_chief.html` ➔ `insert_chief.php`).
- Form Khusus: Menampilkan dropdown seluruh Komandan Regu di site untuk dievaluasi kedisiplinan dan koordinasinya.

### 3.4 Petugas Kebersihan (`posisi = 'Cleaning Service'`)
- Tombol Utama: `ABSEN MASUK` ➔ `ABSEN PULANG`.
- Tombol Operasional: **`CHECKLIST SANITASI`** (`xxxxx_xxxxxxxxx.php`).
- Form Scan: Form `cek.php` otomatis menyesuaikan label menjadi *"PILIH HASIL KERJA"* (`0` = Bersih dan Rapi, `1` = Perlu Tindak Lanjut).

### 3.5 Driver Logistik (`posisi = 'Driver'`)
- **TIDAK MENAMPILKAN TOMBOL SCAN QR CHECKPOINT.**
- Tombol Operasional: **`MULAI PERJALANAN`** (`10_driver_trip.html` ➔ `insert_driver.php`).
- Form Khusus: Input kendaraan, pelat nomor, tujuan, keperluan pengantaran logistik, dan swafoto kendaraan.

### 3.6 Staf Operasional (`posisi = 'Staff Operasional'`)
- Tombol Utama: `ABSEN MASUK` ➔ `ABSEN PULANG`.
- Tombol Operasional: **`KEGIATAN STAFF`** (`14_laporan_staff.html` ➔ `insert_staf.php`).
- Form Khusus: Pilihan 8 kategori tugas administratif dan deskripsi capaian kerja.

---

## 4. Analisis Keamanan & Batasan Otorisasi

1. **Session Hijacking Prevention:** Pada sistem referensi, validasi sesi hanya mengandalkan variabel `$_SESSION['username']`. Pada monorepo target kita, wajib diterapkan **JWT Token berumur pendek (15 menit) + Refresh Token di HttpOnly Cookie** dengan verifikasi fingerprint perangkat.
2. **Geofence Enforcement:** Karyawan lapangan dilarang keras memanipulasi koordinat GPS. Backend NestJS memvalidasi jarak presisi titik pengiriman terhadap koordinat pusat area site via PostGIS `ST_DWithin(site_geom, worker_geom, radius)`.
3. **Pemisahan Hak Hapus Data Induk:** Hak hapus master data Area dan Personil dibatasi hanya untuk `ADMIN_SUPER` dengan mewajibkan verifikasi ulang kata sandi admin (*re-authentication prompt*).
