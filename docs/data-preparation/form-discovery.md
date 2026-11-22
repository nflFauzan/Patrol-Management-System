# Form Discovery — Patroli Site (https://patroli.site)

> **Status:** Selesai Terverifikasi melalui Inspeksi DOM Langsung  
> **Tanggal:** 22 November 2026  
> **Metode:** Playwright DOM & Event Analysis  

---

## 1. Form Tambah Data Area / Site (`#exampleModalCenter` pada `xxxx_xxxxxxx`)

- **Target Action:** `insert-area.php` (POST)
- **Modal ID:** `#exampleModalCenter`
- **Field & Spesifikasi:**
  1. `lokasi_area` (Input Text, `required`):
     - Label: "Nama Lokasi Area / Site"
     - Placeholder: "Contoh: PT. Mall Jakarta atau PT. Kimia C4"
     - Maxlength: 100
  2. `latitude` (Input Text, `required`):
     - Label: "Latitude"
     - Placeholder: "Latitude akan terisi dari peta"
     - Diisi otomatis dari klik peta Leaflet atau diketik manual angka desimal.
  3. `longitude` (Input Text, `required`):
     - Label: "Longitude"
     - Placeholder: "Longitude akan terisi dari peta"
     - Diisi otomatis dari klik peta Leaflet atau diketik manual angka desimal.
  4. `nama_perusahaan` (Input Hidden, Value: `ai`).
  5. `csrf_token` (Input Hidden, 64 hex characters).
  6. **Konfigurasi Shift Kerja per Area (Dropdown Jam & Menit):**
     - Shift Pagi Masuk: `pagi_masuk_jam` (00–23), `pagi_masuk_menit` (00–55 kelipatan 5)
     - Shift Pagi Pulang: `pagi_pulang_jam` (00–23), `pagi_pulang_menit` (00–55 kelipatan 5)
     - Shift Siang Masuk: `siang_masuk_jam` (00–23), `siang_masuk_menit` (00–55 kelipatan 5)
     - Shift Siang Pulang: `siang_pulang_jam` (00–23), `siang_pulang_menit` (00–55 kelipatan 5)
     - Shift Malam Masuk: `malam_masuk_jam` (00–23), `malam_masuk_menit` (00–55 kelipatan 5)
     - Shift Malam Pulang: `malam_pulang_jam` (00–23), `malam_pulang_menit` (00–55 kelipatan 5)
     - Shift Staf Masuk: `staf_masuk_jam` (00–23), `staf_masuk_menit` (00–55 kelipatan 5)
     - Shift Staf Pulang: `staf_pulang_jam` (00–23), `staf_pulang_menit` (00–55 kelipatan 5)
     - Shift Chief Masuk: `chief_masuk_jam` (00–23), `chief_masuk_menit` (00–55 kelipatan 5)
     - Shift Chief Pulang: `chief_pulang_jam` (00–23), `chief_pulang_menit` (00–55 kelipatan 5)

---

## 2. Form Tambah Checkpoint (`#exampleModalCenter` pada `xxxx_xxxxxxxxxx`)

- **Target Action:** `insert-aset.php` (POST)
- **Modal ID:** `#exampleModalCenter`
- **Field & Spesifikasi:**
  1. `kategori` (Select-One, `required`):
     - Pilihan: `Security`, `Cleaning Service`
  2. `nama_aset` (Input Text, `required`):
     - Placeholder: "Nama Aset / Pos"
  3. `deskripsi_aset` (Input Text, `required`):
     - Placeholder: "Deskripsi Tugas Patroli"
  4. `lokasi` (Input Text, `required`):
     - Placeholder: "Detail Posisi / Lantai / Zona"
  5. `jenis_aset` (Input Text, `required`):
     - Placeholder: "Jenis Aset (misal: Keamanan, Kebersihan, Fasilitas)"
  6. `lokasi_area` (Select-One, `required`):
     - Pilihan terisi dinamis dari daftar master Area yang aktif (misal: `aeon mall sentul`).
  7. `csrf_token` (Input Hidden).
  8. `kode_anggota` (Input Hidden, opsional).

---

## 3. Form Tambah Personel (`#exampleModalCenter` pada `xxxx_xxxxxxxx`)

- **Target Action:** `insert-personil.php` (POST)
- **Modal ID:** `#exampleModalCenter`
- **Field & Spesifikasi:**
  1. `nama_anggota` (Input Text, `required`):
     - Placeholder: "Nama lengkap personel"
     - Maxlength: 100
  2. `jam_kerja` (Input Number, `required`):
     - Range: `8` s/d `24` jam
     - Placeholder: "Masukkan jam kerja (8–24 jam)"
  3. `username` (Input Text, `required`):
     - Placeholder: "Buat username"
  4. `password` (Input Text, `required`):
     - Placeholder: "Buat password"
  5. `posisi` (Select-One, `required`):
     - Pilihan:
       - `Admin Area` ("Admin Area / Pengelola Area (Klien)")
       - `Security` ("Security")
       - `Cleaning Service` ("Cleaning Service")
       - `Driver` ("Driver")
       - `Staf` ("Staf")
  6. `jabatan_select` (Select-One, kondisional):
     - Ditampilkan hanya jika `posisi == 'Security'`.
     - Pilihan: `anggota`, `komandan`, `chief`.
     - Ditransformasikan ke input hidden `jabatan`. Jika posisi non-security, nilai `jabatan` otomatis diisi `'anggota'`.
  7. **Penempatan Lokasi Area:**
     - Untuk `Admin Area`: menggunakan `lokasi_site_member[]` (Select-Multiple, mendukung multiple site).
     - Untuk Personel Operasional (Security, Cleaning, Driver, Staf): menggunakan `lokasi_site_anggota` (Select-One single site).
  8. **Komponen Penggajian & Potongan (Input Format Rupiah):**
     - `gaji_pokok`: Gaji bulanan pokok
     - `tunjangan`: Tunjangan bulanan
     - `lembur`: Biaya per lembur
     - `potongan_bpjs`: Potongan iuran BPJS bulanan
     - `potongan_tidak_masuk`: Potongan per ketidakhadiran
     - `potongan_lupa_absensi`: Potongan jika lupa absen pulang
  9. `image` (Input Hidden, class `image-tag`):
     - Diisi data URI base64 dari snapshot webcam. Jika form disubmit tanpa foto webcam, backend tetap menerima input foto opsional atau menggunakan placeholder foto default.

---

## 4. Form Edit Personel (`#myModal` pada `xxxx_xxxxxxxx`)

- **Target Action:** `personil_update.php` (POST, multipart/form-data)
- **Field & Spesifikasi:**
  - `kode_anggota` (Hidden)
  - `nama_anggota` (Text, Required, Uppercase)
  - `posisi` (Select: Security, Cleaning Service, Driver, Staf)
  - `jabatan` (Select kondisional untuk Security: anggota, komandan, chief)
  - `username` (Text, Readonly)
  - `password_baru` (Password, Optional)
  - `password_lama` (Hidden hash Bcrypt)
  - `lokasi_site_baru[]` (Select single/multi)
  - `jam_kerja` (Number, 8–24)
  - `foto` (File upload input `type="file"`, accepts images)
  - `gapok`, `tunjangan`, `lembur`, `pot_bpjs`, `pot_izin`, `pot_lupa` (Format uang).

---

## 5. Form Pesan Siaran (`xxxxx_xxxxxxxxxxxxxxx`)

- **Target Action:** `insert-info.php` (POST)
- **Field:**
  1. `isi_pesan` (Textarea, `required`): Teks pengumuman siaran.
  2. `lokasi_area` (Select-One, `required`): Target lokasi site atau seluruh area.

---

## 6. Form Export Laporan (`xxxxx_xxxxxxxxxxxx`)

- **Target Action:** `cetak-absensi-excel.php` & `cetak-kegiatan-excel.php` (POST)
- **Mode Ekspor:**
  1. Absensi Personil (Filter: Rentang Tanggal, Lokasi Area, Kategori Posisi, Nama Personil).
  2. Absensi Area (Filter: Rentang Tanggal, Lokasi Area, Kategori Posisi).
  3. Kegiatan Personil (Filter: Rentang Tanggal, Lokasi Area, Kategori Posisi, Nama Personil).
  4. Kegiatan Area (Filter: Rentang Tanggal, Lokasi Area, Kategori Posisi).
