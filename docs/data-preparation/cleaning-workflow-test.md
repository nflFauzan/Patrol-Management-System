# Uji Alur Kerja Cleaning Service (Cleaning Workflow Test)

> **Divisi:** Petugas Kebersihan / Sanitasi (Cleaning Service)  
> **Personel Penguji:** `clean_siti` (Siti Aminah)  
> **Tanggal Audit:** 22 November 2026  
> **Target Aplikasi:** `https://patroli.site/validasi-patroli/`  

---

## 1. Identifikasi Alur Kerja Cleaning Service

Berdasarkan inspeksi langsung terhadap antarmuka karyawan dan penempatan checkpoint kategori Cleaning Service:
- **Kategori Checkpoint Khusus:** Checkpoint kategori Cleaning Service (Toilet, Lobby, Kantin) memiliki formulir inspeksi yang berbeda labelnya dibanding Security.
- **Label Formulir di `cek.php`:**
  - Security: *"PILIH HASIL PATROLI"*
  - Cleaning Service: *"PILIH HASIL KERJA"* (`0` = Bersih dan Rapi, `1` = Perlu Tindak Lanjut).
- **Prasyarat Eksekusi:** Wajib melakukan Absen Masuk (*Check-in*) sebelum pemindaian QR checklist sanitasi.

---

## 2. Rincian Pelaksanaan Uji Skenario

### 2.1 Presensi Masuk Siti Aminah
- **Halaman:** `xxxxx_xx.php`
- **Tindakan:** Memilih `Piket Rutin`, mengambil foto swafoto, dan koordinat GPS.
- **Hasil:** Berhasil masuk, status `Hadir: 1` pada kartu Cleaning Service di Dashboard Admin.

### 2.2 Checklist Sanitasi Toilet Lantai 1 Timur (Aset #1053)
- **Halaman Scan:** `xxxxx_xxxxxxxxx.php`
- **QR Code Disimulasikan:** Payload teks integer `1053`
- **Tampilan Form `cek.php`:**
  - Lokasi: `AEON MALL SENTUL - TOILET LANTAI 1 TIMUR`
  - Deskripsi Tugas: `Membersihkan dan memastikan kebersihan toilet`
  - Opsi Status: `0` (Bersih dan Rapi)
  - Lokasi GPS: `-6.566877, 106.857619`
  - Foto Hasil Kerja: Base64 JPEG
- **Submit Action:** Diposting ke `insert-patroli.php`.
- **Hasil Verifikasi Web Admin:**
  - Sebelumnya tabel **Laporan Cleaning Service** (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxx`) menampilkan pesan:  
    `NO DATA AVAILABLE IN TABLE`.
  - Setelah transaksi disubmit, tabel menampilkan data:
    - **Site:** `AEON MALL SENTUL`
    - **Personel:** `SITI AMINAH`
    - **Status & Uraian:** `🟢 BERSIH DAN RAPI MEMBERSIHKAN DAN MEMASTIKAN KEBERSIHAN TOILET DI TOILET LANTAI 1 TIMUR LANTAI 1 SAYAP TIMUR`
    - **Waktu:** `MINGGU, 22 NOV 2026 | 19:47:00`
    - **Aksi:** Tombol `DETAIL`

---

## 3. Matriks Hasil Pengujian Cleaning Service

| Komponen Uji | Ekspektasi | Hasil Aktual | Status |
|:---|:---|:---|:---|
| Form Presensi | Input foto & GPS mengaktifkan sesi | Sesi aktif & tombol scan terbuka | **PASS** |
| Scan QR Toilet (1053) | Mengarahkan ke form hasil kerja sanitasi | Tampil form dengan opsi "Bersih dan Rapi" | **PASS** |
| Submit Hasil Kerja | Data tersimpan di server | Berhasil disubmit ke backend | **PASS** |
| Laporan Admin | Tabel Laporan Cleaning Service terisi | Record Siti Aminah tampil lengkap | **PASS** |
| Rekap Kegiatan | Menghitung aktivitas kebersihan | Rekap Cleaning Service bertambah 1 | **PASS** |

---

## 4. Bukti File & Tangkapan Layar

- [Formulir Sanitasi Toilet Siti Aminah](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshots/03-clean-siti-toilet-form.png)
- [Tabel Laporan Cleaning Service Terverifikasi di Web Admin](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshots/08-laporan-cleaning-service.png)
