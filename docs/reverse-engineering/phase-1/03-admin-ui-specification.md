# 03 — SPESIFIKASI TATA LETAK & ANTARMUKA WEB ADMIN (ADMIN UI SPECIFICATION)
> **File:** `docs/reverse-engineering/phase-1/03-admin-ui-specification.md`  
> **Tahap:** Phase 1 — Deep Reverse Engineering  
> **Sistem Acuan:** `https://patroli.site`  
> **Sistem Sasaran:** `apps/web-admin` (Next.js 14 App Router)  

---

## 1. Arsitektur Layout Global (Layout Architecture)

Web Admin `patroli.site` menggunakan arsitektur antarmuka monolitik berbasis Bootstrap 4 dengan komponen visual utama:
- **Top Navigation Bar:** Logo sistem (`logo-ps.png`), indikator waktu server live, identitas perusahaan aktif (`ai`), avatar akun login (`nun`), dan dropdown profil/logout.
- **Sidebar Navigasi Kiri (Accordion Menu):**
  - Group 1: *Dashboard* (Ringkasan monitoring utama).
  - Group 2: *Data Induk* (Dropdown Area, Checkpoint, Personil).
  - Group 3: *Absensi* (Dropdown Semua Data, Matriks Monitoring 31 Hari).
  - Group 4: *Laporan Operasional* (Security Anggota, Danru, Chief, Staff, Cleaning Service, Driver, Tracking Patroli, Rekap Kegiatan, Monitoring Kegiatan).
  - Group 5: *Finansial & Payroll* (Data Gaji & Slip Gaji).
  - Group 6: *Kedaruratan & Pesan* (Emergency SOS, Pesan Siaran).
  - Group 7: *Ekspor & Utilitas* (Wizard Ekspor Laporan, Ubah Password, Logout).
- **Kontainer Konten Utama (`main-content`):** Breadcrumb rute, judul halaman dinamis, bilah filter tanggal/site, tabel data jQuery DataTables, dan modal interaktif.

---

## 2. Standar Komponen Tabel & Data Grid

Seluruh halaman data mengimplementasikan jQuery DataTables dengan spesifikasi perilaku standar:

| Komponen Fitur | Implementasi pada Referensi | Standar Modern pada Monorepo Sasaran (`apps/web-admin`) |
|:---|:---|:---|
| **Pencarian (Search)** | Input teks client-side instan (`filter-search`) | Server-side debounced search (300ms) dengan kueri SQL indeks |
| **Pengurutan (Sorting)** | Sort multi-kolom asc/desc via klik header tabel | Dynamic multi-column sorting via URL Query Params |
| **Paginasi (Pagination)**| 10, 25, 50, 100 baris per halaman | Dynamic server-side pagination dengan penanda total record |
| **Filter Tanggal** | Datepicker rentang tanggal (`startDate` s/d `endDate`) | DateRangePicker kalender ganda dengan preset (Hari Ini, 7 Hari, Bulan Ini) |
| **Filter Lokasi / Site** | Dropdown dinamis daftar seluruh Area terdaftar | Dropdown searchable Combobox terhubung ke endpoint `/api/sites` |
| **Empty State** | Tulisan default: `"NO DATA AVAILABLE IN TABLE"` | Ilustrasi modern dengan teks penjelasan dan tombol ajakan aksi (*CTA*) |
| **Loading State** | Spinner CSS Bootstrap sederhana | Skeleton loader animasi shimmer yang menjaga struktur layout tabel |
| **Ekspor Cepat** | Tombol ekspor client-side (`Copy`, `CSV`, `Excel`, `PDF`) | Worker export streaming backend untuk menangani ribuan baris data |

---

## 3. Spesifikasi Halaman & Modal Interaktif Kunci

### 3.1 Halaman Data Induk Fasilitas / Area (`xxxx_xxxxxxx`)
- **Tabel Kolom:**
  1. `No`: Nomor urut serial.
  2. `Nama Area`: Teks tebal nama fasilitas (contoh: `AEON MALL SENTUL`).
  3. `Alamat Area`: Deskripsi alamat fisik lokasi.
  4. `Koordinat GPS`: Pasangan Latitude & Longitude (contoh: `-6.566877, 106.857619`).
  5. `Radius Geofence`: Angka meter batasan toleransi presensi (default: `50 m`).
  6. `PIC & No. HP`: Nama supervisor penanggung jawab dan nomor telepon darurat.
  7. `Aksi`: Tombol `Edit` (membuka `#modalEditArea`) dan `Hapus` (membuka `#modalHapusArea`).
- **Modal Tambah Area (`#modalTambahArea` ➔ `insert-area.php`):**
  - Dilengkapi peta Leaflet interaktif OSM dengan marker yang dapat digeser (*draggable*) untuk pinpoint koordinat secara visual.
  - Kotak pencarian lokasi geocoding OSM.
  - Tab jadwal shift: Menyediakan 10 baris input jam masuk dan jam pulang shift (`shift_1` s/d `shift_10`).
- **Modal Hapus Area (`#modalHapusArea` ➔ `hapus-area.php`):**
  - **Pencegahan Kehilangan Data:** Memunculkan peringatan bahwa seluruh checkpoint dan absensi di area terkait akan terhapus, serta mewajibkan admin mengetikkan password akunnya sebelum tombol hapus aktif.

### 3.2 Halaman Data Induk Checkpoint (`xxxx_xxxxxxxxxx`)
- **Tabel Kolom:**
  1. `Kode Aset`: Integer serial unik (contoh: `1052`).
  2. `Nama Aset`: Nama pos / titik inspeksi (contoh: `POS 1 GERBANG UTAMA`).
  3. `Kategori`: Badge divisi (`Security` = Biru, `Cleaning Service` = Hijau).
  4. `Jenis Aset`: Kategori fungsi (Keamanan, Kebersihan, Fasilitas Listrik).
  5. `Lokasi Area`: Nama site penempatan aset.
  6. `Deskripsi Tugas`: Ringkasan SOP pemeriksaan yang tampil saat QR discan.
  7. `Aksi`: Tombol `Cetak QR` (`cetak-aset.php`), `Edit`, `Hapus`.
- **Halaman Cetak Stiker QR (`cetak-aset.php`):**
  - Mengenerate stiker persegi ukuran 160 x 160 piksel siap cetak pada kertas A4 (layout grid 4 stiker per baris).
  - Berisi: Logo perusahaan, nama pos, kode integer ID aset, dan QR code payload.

### 3.3 Halaman Data Induk Personil (`xxxx_xxxxxxxx`)
- **Tabel Kolom:**
  1. `Foto`: Avatar foto profil karyawan yang tersimpan di server.
  2. `Nama Lengkap`: Nama resmi petugas.
  3. `Username`: Identitas login unik.
  4. `Posisi / Divisi`: Badge penempatan divisi (`Security`, `Cleaning Service`, `Driver`, `Staff`).
  5. `Jabatan`: Peringkat spesifik (`anggota`, `komandan`, `chief`).
  6. `Lokasi Area`: Site tugas utama.
  7. `Gaji Pokok & Tunjangan`: Komponen finansial dasar untuk payroll engine.
  8. `Aksi`: Tombol `ID Card` (`cetak-idcard.php`), `Edit` (`personil_edit.php`), `Hapus`.
- **Halaman Cetak ID Card Karyawan (`cetak-idcard.php`):**
  - Format kartu standar CR80 (54 x 86 mm) vertikal / portrait.
  - Menyediakan 5 pilihan tema warna kartu: `B1 Navy`, `B2 Dark Blue`, `B3 Teal`, `B4 Charcoal`, `B5 White Minimalist`.
  - Dilengkapi foto petugas, barcode ID karyawan, QR code autentikasi, dan stempel digital pengesahan HRD.

### 3.4 Modal Detail Presensi Geospasial (`#myModalab`)
- **Struktur Visual:**
  1. **Dual Leaflet Map:** Peta interaktif menampilkan dua pin marker:
     - Pin Biru: Titik pusat koordinat resmi site.
     - Pin Hijau/Merah: Titik koordinat GPS aktual perangkat petugas saat melakukan check-in.
  2. **Indikator Geofence:** Menghitung jarak presisi dalam satuan meter dan menampilkan badge validasi:
     - `🟢 DALAM RADIUS AREA` (jika jarak $\le$ radius site).
     - `🔴 LUAR RADIUS AREA` (jika jarak $>$ radius site).
  3. **Direct Link Google Maps:** Tautan eksternal `https://maps.google.com/?q={lat},{lng}` untuk navigasi peninjauan rute.
  4. **Swafoto Bukti:** Foto portrait resolusi 320x320 piksel yang diambil secara live saat melakukan presensi masuk.

### 3.5 Modal Pemantauan Kedaruratan SOS (`#myModalpan`)
- **Struktur Visual:**
  1. Kotak peringatan merah menyala berkedip (*pulsing alert animation*).
  2. Informasi pelapor: Nama petugas, nomor telepon, divisi, dan nama site lokasi darurat.
  3. Waktu presisi: Jam, menit, dan detik pemicuan tombol.
  4. Peta Leaflet Darurat: Marker merah darurat dengan lingkaran radius perimeter 30 meter.
  5. Tombol Aksi: **`Padamkan Alarm & Catat Tindakan`** (`update_status_alarm.php`), yang meminta input log intervensi sebelum alarm dinonaktifkan dari Command Center.

### 3.6 Modal Tindak Lanjut Temuan Patroli (`#myModaltl` ➔ `tl.php`)
- **Pemicu:** Tombol `TINDAK LANJUTI TEMUAN` pada baris laporan patroli berstatus `🔴 PERLU TINDAK LANJUT` (`tl = 1`).
- **Komponen Form:**
  - Menampilkan ringkasan insiden yang dilaporkan (contoh: *"Lampu sorot pos padam dan pintu gerbang barat macet"*).
  - Dropdown `Status Perbaikan`: `Sedang Dikerjakan`, `Menunggu Sparepart`, `Selesai Diperbaiki`.
  - Input teks `Nama Teknisi / Petugas Perbaikan`.
  - Input file / kamera `Foto Bukti Perbaikan`.
  - Textarea `Catatan Mitigasi`.
  - Setelah disubmit ke `insert-tl.php`, status laporan berubah menjadi hijau terselesaikan dan counter `TEMUAN AKTIF` di dashboard berkurang.

---

## 4. Spesifikasi Responsif & Desain Lintas Perangkat

- **Resolusi Desktop Target:** Optimal pada resolusi 1366x768 hingga 1920x1080 (Command Center multi-monitor).
- **Tablet Compatibility:** Sidebar otomatis diciutkan (*collapsed*) menjadi ikon hamburger pada lebar layar $< 992\text{px}$.
- **Cetak Presisi (Print CSS):** Seluruh halaman laporan, slip gaji, ID card, dan stiker QR menyertakan aturan `@media print` khusus yang menyembunyikan navigasi, tombol aksi, dan pagination untuk menghasilkan dokumen siap cetak A4 tanpa artefak antarmuka web.
