# AGENT 02 — AUDIT ALUR KERJA OPERASIONAL SATUAN PENGAMANAN (SECURITY)
> **File:** `docs/reverse-engineering/agent-02-security-patrol-audit.md`  
> **Auditor:** Agent 2 — Security & Patrol Workflow Auditor  
> **Target Aplikasi Referensi:** `https://patroli.site`  
> **Prinsip Utama:** *Empirical Testing Across Ranks — Tidak mengasumsikan Anggota, Danru, dan Chief memiliki alur yang seragam.*  

---

## 1. Ringkasan Eksekutif Audit

Audit ini membuktikan secara empiris seluruh tahapan alur kerja divisi Satuan Pengamanan (Security) di `patroli.site`, mulai dari autentikasi login, validasi presensi GPS, penanganan Panic SOS, pemindaian checkpoint QR code, pelaporan insiden, hingga pengesahan laporan serah terima Komandan (Danru) dan supervisi Chief.

### Matriks Peringkat & Hak Akses Divisi Security

| Peringkat / Jabatan | Akun Pengujian | Posisi / Jabatan | Menu Unik PWA Terobservasi | Laporan Khusus di Web Admin | Status Verifikasi |
|:---|:---|:---|:---|:---|:---|
| **Anggota Security** | `sec_agus` | `Security` / `anggota` | Scan Checkpoint QR, SOS, Absen, Riwayat | `xxxx_xxxxxxxxxxx` (Laporan Security Anggota) | **L5 (TESTED & VERIFIED)** |
| **Komandan Regu (Danru)** | `danru_budi` | `Security` / `komandan` | Laporan Serah Terima Piket, Scan QR, SOS, Absen | `xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (Laporan Komandan) | **L5 (TESTED & VERIFIED)** |
| **Chief Security** | `chief_hendra` | `Security` / `chief` | Laporan Supervisi Area, Evaluasi Danru, SOS, Absen | `xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (Laporan Chief) | **L5 (TESTED & VERIFIED)** |

---

## 2. Alur Presensi Masuk & Geofence Boundary Check

### 2.1 State Machine Presensi Karyawan
Berdasarkan investigasi DOM portal `/validasi-patroli/`:
1. **Kondisi Sebelum Presensi Masuk (Unattended):**
   - Tombol utama berwarna oranye menyala bertuliskan **`ABSEN MASUK`** (`xxxxx_xx.php`).
   - Tombol operasional seperti **`INPUT KEGIATAN`** dan **`ABSEN PULANG`** dalam kondisi **terkunci / tersembunyi**.
   - Terdapat tombol alternatif `IZIN ALPHA` untuk pengajuan cuti/sakit (`xxxxx_xxxxxxxxxx.php`).
2. **Kondisi Setelah Presensi Masuk (Checked-in):**
   - Tombol utama berubah menjadi **`ABSEN PULANG`**.
   - Tombol sekunder berubah menjadi **`INPUT KEGIATAN`** (`xxxxx_xxxxxxxxx.php` untuk Anggota, atau Laporan Serah Terima untuk Danru).

### 2.2 Mekanisme Form Presensi Masuk (`xxxxx_xx.php` ➔ `insert-presensi.php`)
- **Field yang Diobservasi & Diuji:**
  - `alasan`: Dropdown alasan kehadiran (`Piket Rutin`, `Lembur BKO`, `Tugas Khusus`).
  - `latin` & `longin`: Hidden input koordinat GPS (`-6.566877, 106.857619`).
  - `.image-tag`: Hidden input data URL base64 webcam portrait.
  - `#simpan`: Container pembungkus tombol simpan, secara default tersembunyi (`display: none`) hingga swafoto berhasil diambil oleh skrip kamera.
- **Logika Geofence Validation:**
  - Jarak petugas dihitung terhadap titik tengah area (`AEON MALL SENTUL`: `-6.566877, 106.857619`, radius `50m`).
  - Pada pengujian aktual, jarak $0.00$ meter menghasilkan status **`DALAM RADIUS AREA`** pada modal admin `#myModalab`.

---

## 3. Alur Panic Button SOS & Penanganan Darurat

### 3.1 Pemicuan Tombol SOS di PWA (`xxxxx_xxxxxxxx.php` ➔ `insert-panic.php`)
- **Pencegahan False Alarm:** Tombol lingkaran merah besar SOS dirancang dengan interaksi **tahan selama 3 detik (*long press 3000ms*)**. Klik singkat tidak akan memicu request ke backend.
- **Payload Request:**
  - `kode_anggota`: ID personil (`1452` / `1453`).
  - `lat` & `long`: Koordinat presisi GPS saat tombol ditekan.
  - `image`: Tangkapan instan kamera depan saat tombol ditekan.
  - `timestamp`: Waktu pemicuan insiden darurat.

### 3.2 Respons Web Admin Command Center
- **WebSocket / Polling Alert:** Web Admin memunculkan modal peringatan darurat merah berkedip `#myModalpan`.
- **Integrasi Peta Leaflet:** Menampilkan pin merah darurat persis pada koordinat petugas, radius lingkaran 30 meter, dan tombol direct link ke Google Maps (`https://maps.google.com/?q={lat},{long}`).
- **Penyelesaian Alarm:** Administrator harus menekan tombol `Nonaktifkan Alarm` (`update_status_alarm.php`) dengan mengisi catatan penyelesaian agar alarm di Command Center padam.

---

## 4. Alur Pemindaian QR Checkpoint & Pelaporan Patroli

### 4.1 Pemindaian QR Code (`xxxxx_xxxxxxxxx.php`)
- **Pustaka Pemindai:** Menggunakan implementasi kamera berbasis video stream HTML5 (`#camera-video`) atau input scan QR barcode gun.
- **Mekanisme Form Submit Scan:**
  - Input teks `#result` menerima string payload QR code.
  - Form `#formScan` mengirimkan request via HTTP POST dengan parameter `nama = {kode_aset}` ke `cek.php`.
- **Hasil Pengujian Kondisi QR Code:**
  1. **QR Valid Terdaftar (`1052` & `1062`):** Langsung mengarahkan (*redirect*) ke form pengisian hasil patroli di `cek.php`.
  2. **QR Tidak Dikenal (`1054`):** Mengembalikan halaman error bertuliskan:  
     `"Kode aset tidak ditemukan. Silakan Scan QR Code."` dengan kamera tetap aktif.
  3. **QR Beda Site:** Sistem mengecek kesesuaian `lokasi_area` checkpoint terhadap penempatan personil.

### 4.2 Formulir Hasil Patroli di `cek.php` (`insert-patroli.php`)
Formulir inspeksi dinamis menyesuaikan kategori checkpoint:
- **Field & Komponen Teruji:**
  1. `tl`: Dropdown pilihan hasil patroli:
     - `0`: **Situasi Aman Terkendali** (Badge Hijau).
     - `1`: **Perlu Tindak Lanjut / Temuan Insiden** (Badge Merah).
  2. `#keterangan`: Field teks deskripsi. **Secara dinamis tersembunyi (*display: none*) jika `tl = 0`**, dan **wajib diisi (*display: block*) jika `tl = 1`**.
  3. `image`: Bukti visual fisik titik pos atau kondisi anomali yang ditemukan.
  4. `lat` & `long`: Verifikasi bahwa petugas benar-benar berada di titik aset fisik saat melakukan submit.
- **Tindak Lanjut Temuan di Web Admin:**
  - Jika laporan berstatus `tl = 1`, tabel Laporan Security menampilkan badge merah `🔴 PERLU TINDAK LANJUT` dan menyediakan tombol aksi interaktif **`TINDAK LANJUTI TEMUAN`** (`#myModaltl` ➔ `tl.php`).
  - Dashboard Web Admin secara otomatis menaikkan counter **`TEMUAN AKTIF`** (terbukti naik dari 0 menjadi 1 pada pengujian Pos 2).

---

## 5. Alur Kerja Khusus Komandan Regu (Danru) & Chief

### 5.1 Laporan Serah Terima Danru (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- **Peran:** Bertanggung jawab atas serah terima inventaris pos, absensi anggota regu yang bertugas, dan kesimpulan situasi shift.
- **Komponen Form Terobservasi:**
  - Pemilihan shift jaga (`Pagi`, `Siang`, `Malam`).
  - Checklist inventaris operasional (Handy Talkie, Rompi, Senter, Borgol, Kunci Master).
  - Catatan kejadian khusus selama shift berjalan.
  - Tanda tangan digital / swafoto serah terima antar Komandan shift lama dan baru.

### 5.2 Laporan Supervisi Chief Security (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- **Peran:** Melakukan inspeksi berkala terhadap kinerja Danru dan kesiapan personel pos jaga.
- **Komponen Form Terobservasi:**
  - Dropdown Danru bertugas (terisi secara dinamis dari personil dengan jabatan `komandan` di site terkait).
  - Evaluasi kerapian seragam (*groming*), kelengkapan pos, dan kedisiplinan patroli anggota.
  - Catatan rekomendasi manajerial untuk diajukan ke manajemen korporat.

---

## 6. Pengujian Kondisi Khusus & Edge Cases

| Skenario Pengujian | Input / Kondisi | Respon Sistem Referensi | Status Bukti |
|:---|:---|:---|:---|
| **Izin Kamera Ditolak** | Browser memblokir MediaDevices | Tampil alert: *"Izin kamera ditolak. Silakan izinkan kamera pada browser."*, tombol submit dinonaktifkan. | **TESTED** |
| **GPS Mati / Timeout** | Browser memblokir Geolocation | Form memunculkan peringatan *"Lokasi GPS belum diperoleh"*, mencegah submit form. | **TESTED** |
| **Scan Sebelum Absen Masuk** | User langsung buka URL `xxxxx_xxxxxxxxx.php` | Sistem me-redirect paksa kembali ke halaman `xxxxx_xx.php` (Absen Masuk). | **TESTED** |
| **Koneksi Terputus (Offline)** | Jaringan internet diputus saat scan | Browser menampilkan error jaringan default Chrome (PWA belum mengimplementasikan IndexedDB offline sync queue pada versi referensi PHP-nya). | **TESTED (LIMITATION)** |

---

## 7. Rekomendasi Penyelarasan untuk Monorepo Lokal

1. **Offline Queue Sync (IndexedDB + Service Worker):**
   - Pada aplikasi referensi, putus jaringan menyebabkan kegagalan submit. Monorepo kita (`apps/pwa-field`) **WAJIB** memanfaatkan Service Worker Workbox dan IndexedDB untuk menyimpan antrian transaksi patroli dan menyinkronkannya secara otomatis saat jaringan online kembali.
2. **WebSocket Real-time Broadcast:**
   - Referensi menggunakan polling/reload. Monorepo kita telah memiliki gateway WebSocket NestJS (`apps/backend/src/modules/gateway/`) untuk pengiriman instan notifikasi SOS dan pembaruan marker peta secara live di Command Center.
