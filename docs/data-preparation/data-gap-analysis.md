# Analisis Kesenjangan Data (Data Gap Analysis) — Patroli Site

> **Status:** Dianalisis berdasarkan Perbandingan Struktur Aktual Sistem vs Dataset yang Ada  
> **Tanggal:** 22 November 2026  

---

## 1. Matriks Kesenjangan Data Antarentitas

| Entitas / Modul | Jumlah Existing | Kebutuhan Workflow | Gap Aktual | Tindakan Rekomendasi |
| :--- | :---: | :---: | :---: | :--- |
| **Area / Site** | 1 | 2 | -1 Site | **CREATE 1 SITE BARU** (`Gudang Logistik Cakung`) untuk menguji filter multi-lokasi dan penempatan area majemuk. |
| **Shift Konfigurasi** | 00:00 (Semua) | Jam Nyata | Belum diset | **UPDATE** shift pada site baru dengan jam kerja riil (Pagi 07:00–15:00, Siang 15:00–23:00, Malam 23:00–07:00, Staf 08:00–17:00). |
| **Checkpoint Security** | 1 | 4 | -3 Checkpoint | **CREATE 3 CHECKPOINT** (`Pos 2 Pintu Barat`, `Gudang Logistik Barat`, `Ruang Server Lantai 2`) agar patroli rute checkpoint memiliki variasi. |
| **Checkpoint Cleaning** | 1 | 3 | -2 Checkpoint | **CREATE 2 CHECKPOINT** (`Lobby Utama Lantai 1`, `Kantin Karyawan`) untuk mencakup area publik dan sanitasi. |
| **Personel - Security Anggota** | 1 | 2 | -1 Personel | **KEEP EXISTING** (`Agus Pratama`) & **CREATE 1** di site baru untuk menguji isolasi data penempatan. |
| **Personel - Security Komandan**| 1 | 1 | 0 (Cukup) | **KEEP EXISTING** (`Danru Budi Santoso`). |
| **Personel - Security Chief** | 0 | 1 | -1 Personel | **CREATE 1 CHIEF** (`Chief Hendra Wijaya`) untuk menguji laporan supervisi chief. |
| **Personel - Cleaning Service** | 0 | 1 | -1 Personel | **CREATE 1 CLEANING** (`Siti Aminah`) untuk melengkapi divisi cleaning. |
| **Personel - Driver** | 0 | 1 | -1 Personel | **CREATE 1 DRIVER** (`Joko Wahyudi`) untuk melengkapi divisi armada driver. |
| **Personel - Staff Operasional** | 0 | 1 | -1 Personel | **CREATE 1 STAF** (`Rina Oktaviani`) untuk melengkapi divisi administrasi. |
| **Personel - Admin Area (Klien)**| 0 | 1 | -1 Personel | **CREATE 1 ADMIN AREA** (`Bambang Pengelola Area`) untuk menguji akun pengelola area. |
| **Pesan Siaran** | 1 | 2 | -1 Record | **CREATE 1 PESAN SIARAN** untuk site baru. |
| **Penggajian (Gaji)** | 2 | 5+ | Mengikuti personil | Data penggajian dikalkulasi secara reaktif dari master gaji personel dan absensi bulanan. |

---

## 2. Justifikasi Teknis Penambahan Data

1. **Mengapa Perlu Site Kedua?**
   - Saat ini filter `Lokasi / Site` pada seluruh halaman laporan hanya memiliki opsi `aeon mall sentul`.
   - Adanya site kedua memungkinkan verifikasi apakah filter laporan, monitoring absensi, dan monitoring checkpoint benar-benar bekerja memisahkan data antarlokasi secara terisolasi.
   - Form pembuatan personil memiliki tipe role `Admin Area` dengan multiple site (`lokasi_site_member[]`). Role ini tidak bisa diuji jika hanya ada 1 site.
2. **Mengapa Perlu 3 Divisi Operasional Lengkap?**
   - Di dashboard terdapat kartu ringkasan untuk `SECURITY`, `CLEANING SERVICE`, `DRIVER`, dan `STAF`.
   - Modul Laporan memiliki menu terpisah untuk `Cleaning Service`, `Driver`, dan `Staff Operasional`.
   - Karena saat ini jumlah personil Cleaning, Driver, dan Staf adalah `0`, dashboard dan laporan untuk ketiga divisi ini kosong (`No data available in table`).
3. **Mengapa Perlu Representasi 3 Kategori Security?**
   - Menu Laporan Security terbagi menjadi 3 submenu:
     - `Anggota` (`xxxx_xxxxxxxxxxx`)
     - `Komandan` (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
     - `Chief` (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - Saat ini baru ada Anggota (`Agus Pratama`) dan Komandan (`Danru Budi Santoso`). Belum ada akun berkategori `Chief`, sehingga hierarki Security belum lengkap.
