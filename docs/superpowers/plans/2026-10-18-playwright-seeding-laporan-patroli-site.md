# Implementation Plan: Playwright MCP Adaptive Data Seeding untuk Modul Laporan (patroli.site)

> **Execution Method:** Playwright MCP Dynamic Exploration & Runtime Adaptive Data Seeding  
> **Target Portal:** `https://patroli.site/login.php`  
> **Kredensial:** Username: `testi` | Password: `testing123`  
> **Status:** **SELESAI (100% POPULATED & VERIFIED)**

---

## 1. Bukti & Hasil Eksekusi di Lapangan

Semua submenu pada modul **LAPORAN** kini telah berhasil diisi sampel data operasional riil dan terverifikasi di antarmuka Web Admin:

| Modul Laporan | Status Awal | Status Akhir | Bukti Screenshot / Bukti Data |
|---|---|---|---|
| **Kegiatan Komandan** | `NO DATA AVAILABLE` | **Terisi** | `docs/superpowers/screenshots/patroli_site_laporan_komandan_populated.png`<br>`DANDAN KOMANDAN`, Shift Pagi, Kehadiran: Lengkap |
| **Kegiatan Chief** | `NO DATA AVAILABLE` | **Terisi** | `docs/superpowers/screenshots/patroli_site_laporan_chief_populated.png`<br>Evaluasi `DANDAN KOMANDAN`, Disiplin: Baik, Koordinasi: Baik |
| **Kegiatan Driver** | `NO DATA AVAILABLE` | **Terisi** | `docs/superpowers/screenshots/patroli_site_laporan_driver_populated.png`<br>`SUPRI DRIVER`, `Toyota Hilux Pickup - B 9876 PQR`, Status: Sudah Sampai |
| **Security Anggota** | 1 baris | **Terisi** | `docs/superpowers/screenshots/patroli_site_laporan_security_anggota.png`<br>`budi satpam test`, Situasi Aman Terkendali |
| **Cleaning Service** | 2 baris | **Terisi** | `docs/superpowers/screenshots/patroli_site_laporan_cleaning_service.png`<br>`akmal`, Kondisi Bersih dan Rapi |
| **Rekap Kegiatan** | Terisi | **Terisi** | `docs/superpowers/screenshots/patroli_site_rekap_kegiatan.png`<br>Rekap bulanan personil CS & Security |
| **Monitoring Kegiatan** | Terisi | **Terisi** | `docs/superpowers/screenshots/patroli_site_monitoring_kegiatan.png`<br>Matrix 24-jam checkpoint pos gerbang |

---

## 2. Temuan Arsitektur Alur Data (Reverse Engineering Findings)

Sesuai instruksi user (**tidak mengarang data**), Playwright menelusuri DOM riil dan menemukan rantai dependensi sistem:

1. **Rantai Dependensi Personil:**
   - Halaman laporan Web Admin (`patroli.site/xxxxx_...`) adalah *read-only viewers*.
   - Data laporan di-input oleh petugas lapangan melalui antarmuka PWA mobile di `/validasi-patroli/`.
   - Di Data Induk akun `testi`, awalnya hanya ada `Akmal` (CS) dan `Budi` (Security Anggota). Tidak ada personil bertipe `Komandan`, `Chief`, maupun `Driver`.
   - Playwright menambahkan personil prasyarat terlebih dahulu:
     - `DANDAN KOMANDAN` (`komandantest` / `komandan123`)
     - `HENDRA CHIEF` (`chieftest` / `chief123`)
     - `SUPRI DRIVER` (`drivertest` / `driver123`)

2. **Gerbang Presensi (Absen Masuk Prerequisite):**
   - Petugas **tidak dapat menginput kegiatan** sebelum melakukan `ABSEN MASUK` di `/validasi-patroli/xxxxx_xx.php`.
   - Setelah absen masuk tervalidasi dengan koordinat GPS site, tombol aksi dinamis muncul di dashboard:
     - Untuk Komandan: Muncul tombol `INPUT KEGIATAN` (`xxxxx_xxxxxxxxxxxx.php`).
     - Untuk Chief: Muncul tombol `INPUT KEGIATAN` (`xxxxx_xxxxxxxxxxxxx.php`).
     - Untuk Driver: Muncul tombol `MULAI PERJALANAN` (`xxxxx_xxxxxxxxxx.php`), yang setelah submit berubah menjadi `PERJALANAN SELESAI` (`xxxxx_xxxxxxxxxxx.php`).

3. **Struktur Form Riil yang Di-Inspeksi & Diisi:**
   - **Komandan (`insert_komandan.php`):**
     - `shift`: `Pagi`
     - `kehadiran`: `Lengkap`
     - `jumlah_hadir`: `4`
     - `jumlah_izin`: `0`
     - `kesimpulan`: `A` (Situasi aman terkendali)
     - `catatan`: Catatan operasional apel serah terima shift
   - **Driver (`insert_driver.php` & `update_driver.php`):**
     - `tipe`: `Toyota Hilux Pickup`
     - `nopol`: `B 9876 PQR`
     - `tujuan`: `Gudang Logistik Pusat Cikarang`
     - `keperluan`: `Pengiriman material dan dokumen operasional site`
     - `keterangan`: Catatan kedatangan dan kondisi kendaraan aman
   - **Chief (`insert_chief.php`):**
     - `kode_anggota`: `1430` (DANDAN KOMANDAN)
     - `disiplin`: `Baik`
     - `koordinasi`: `Baik`
     - `kehadiran_regu`: `Lengkap`
     - `regu_hadir`: `4`
     - `regu_izin`: `0`
     - `insiden`: `Tidak Ada`
     - `catatan`: Evaluasi supervisi komandan dan regu bertugas

---

## 3. Checklist Task Selesai

- [x] **Task 1: Otentikasi & Navigasi Awal Playwright MCP** (Login `testi` / `testing123`)
- [x] **Task 2: Audit Prasyarat Relasi di Data Induk** (Ditemukan kekosongan role Komandan, Chief, Driver; telah ditambahkan personil riil)
- [x] **Task 3: Eksplorasi & Deteksi Titik Input Modul Laporan** (Ditemukan alur presensi mobile `/validasi-patroli/`)
- [x] **Task 4: Pengisian Data Adaptif Berbasis Form Nyata** (Form riil diinspeksi dan diisi secara dinamis)
- [x] **Task 5: Pengulangan Seeding untuk Kategori Laporan Lainnya** (Komandan, Driver, Chief terisi lengkap)
- [x] **Task 6: Verifikasi Hasil Akhir, Capture DOM & Screenshot** (Semua screenshot tersimpan di `docs/superpowers/screenshots/`)
