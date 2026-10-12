# Product Requirement Document (PRD) & Functional Specification
## Project: Enterprise Patrol & Facility Management System (Beli Putus)
**Versi:** 2.0.0 (Final Enterprise In-House)  
**Status:** Approved for Development  
**Model Bisnis:** Single-Tenant Enterprise / Beli Putus (Dedicated In-House Software)  
**Target Pengguna:** Satu Korporasi Pemilik Fasilitas Mandiri (Internal Security, Cleaning, Driver)  
**Tech Stack:** TypeScript (NestJS Fastify), PostgreSQL 18 + PostGIS, Next.js 14, Vite React PWA

---

## 1. Visi Produk & Sasaran Bisnis

Sistem ini adalah **platform digital terpadu manajemen operasional fasilitas dan pengamanan internal** yang dirancang khusus untuk satu korporasi pemilik fasilitas mandiri (memiliki kantor pusat, pabrik, gudang, mess, dan aset operasional lainnya). 

Platform ini menggantikan seluruh pencatatan patroli fisik buku tamu dan absensi manual dengan sistem otomatis berbasis **GPS Geofencing, pemindaian QR Code terenkripsi, pelaporan foto bukti, tombol darurat Panic Button terintegrasi WhatsApp Gateway, serta integrasi rekapitulasi data kehadiran siap olah ke sistem HRIS perusahaan**.

### Sasaran Utama:
1. **Zero Fake Attendance**: Menjamin kehadiran fisik petugas 100% berada di area site tugas menggunakan PostGIS Geofencing + Live Selfie Kamera.
2. **Real-time Patrol Verification**: Satpam wajib menyusuri titik-titik pos rawan dan memindai QR Code untuk membuktikan pengawasan berkala.
3. **Cakupan 3 Divisi Lengkap**: Mengelola operasional **Security (Satpam)**, **Cleaning Service (Kebersihan)**, dan **Driver (Armada Kendaraan)** dalam satu pintu terpusat.
4. **Respon Darurat Instan via WhatsApp**: Sinyal bahaya dari Panic Button satpam tidak hanya membunyikan sirine di command center web admin, tetapi juga otomatis mengirim pesan darurat dan pin Google Maps ke grup WhatsApp pengawas.
5. **Ekspor Data Siap HRIS**: Menghasilkan rekap jam kerja, keterlambatan, lembur, dan absensi tervalidasi yang siap diimpor ke software HR/Payroll perusahaan tanpa kalkulasi manual yang rawan salah.

---

## 2. Hirarki Organisasi & Matriks Peran (RBAC)

### A. Hirarki Fasilitas Perusahaan:
```
[ KORPORASI / PERUSAHAAN PEMBELI ]
       │
       ├── Cabang / Site 1: Kantor Pusat (Head Office)
       │       └── Titik Checkpoint: Lobby, Pos Pintu Masuk, Ruang Server, Area Parkir
       ├── Cabang / Site 2: Pabrik Manufaktur (Plant Cikarang)
       │       └── Titik Checkpoint: Pos Gerbang Truk, Loading Dock, Area Genset, Gudang Kimia
       └── Cabang / Site 3: Gudang Distribusi Logistik
               └── Titik Checkpoint: Pintu Gudang A, Area Limbah, Pos Pantau Belakang
```

### B. Matriks Hak Akses (Role-Based Access Control):
| Peran (Role) | Antarmuka | Deskripsi Hak Akses & Tanggung Jawab |
| :--- | :--- | :--- |
| **Super Admin / IT Head** | Web Admin | Hak akses penuh: konfigurasi sistem, kelola akun staf & pengawas, setup API WhatsApp Gateway, backup database. |
| **HR / GA Manager (General Affairs)** | Web Admin | Memantau kehadiran seluruh divisi, audit perizinan, dan mengekspor rekapitulasi jam kerja & absensi ke Excel/CSV untuk payroll. |
| **Chief Security** | Web Admin | Mengawasi operasional satpam, memantau rute patroli dan temuan kerusakan pos, audit kinerja para komandan regu (Danru). |
| **Supervisor Cleaning** | Web Admin | Memantau kepatuhan checklist sanitasi area (toilet, lobby, ruang meeting) dan menerima laporan fasilitas kotor/rusak. |
| **Koordinator Driver / Pool** | Web Admin | Memantau ketersediaan armada, status perjalanan kendaraan (sedang jalan / tiba), dan log jarak tempuh driver. |
| **Komandan Regu (Danru)** | Web Admin / Mobile | Pengawas shift lapangan: absensi fisik apel regu satpam, tindak lanjut awal temuan insiden pos. |
| **Petugas Security (Satpam)** | Mobile PWA | Absensi masuk/pulang geofence, scan checkpoint patroli, submit foto temuan pos, tombol Panic Button SOS. |
| **Petugas Cleaning Service** | Mobile PWA | Absensi masuk/pulang geofence, checklist berkala sanitasi ruangan/toilet, upload foto kondisi kebersihan. |
| **Petugas Driver** | Mobile PWA | Absensi masuk/pulang geofence, input keberangkatan armada (nopol, tujuan), update status tiba di lokasi. |

---

## 3. Spesifikasi Kebutuhan Fungsional (Module Requirements)

### Modul 1: Konfigurasi Master Perusahaan & Fasilitas (FR-01)
- **FR-01.1 (Profil Korporasi)**:
  - Input: Nama Perusahaan, Alamat Kantor Pusat, Nomor Telepon, Logo Resmi (white-label), Konfigurasi API WhatsApp Gateway (API Token & ID Grup WA Pengawas).
- **FR-01.2 (Manajemen Site / Cabang)**:
  - Input: Nama Site (Kantor Pusat, Pabrik, Gudang, dll), Titik Pusat Koordinat GPS (`Point` Longitude & Latitude), Radius Toleransi Geofence (default 100 meter).
  - Konfigurasi Jam Kerja Shift per Site: Shift Pagi, Shift Siang, Shift Malam, Shift Staff, Shift Chief.
  - UI Interaktif: Peta Leaflet untuk menentukan titik pin lokasi dan lingkaran batas geofence secara visual.
- **FR-01.3 (Master Checkpoint & Barcode Terenkripsi)**:
  - Input: Divisi (`Security` / `Cleaning Service`), Nama Checkpoint, Detail Lokasi, Deskripsi Tugas, Pilihan Site.
  - Generasi QR Code: Menghasilkan token aman berbasis hash kriptografi `HMAC-SHA256(checkpoint_id, secret_salt)` untuk mencegah pemalsuan barcode.
  - Cetak QR Code: Lembar cetak PDF A4 siap laminasi dan tempel di dinding/tiang fasilitas.
  - Import Spreadsheet: Upload massal titik checkpoint via berkas Excel (`.xlsx`) / CSV hingga 500 baris.
- **FR-01.4 (Master Data Karyawan & Akun)**:
  - Input: Foto Wajah (kamera langsung/file), NIK / No. Induk Karyawan, Nama Lengkap, Divisi, Role Jabatan, Penempatan Site, Kredensial Login (Username & Password).
  - Cetak ID Card: Fitur cetak kartu identitas resmi personil lengkap dengan barcode identifikasi dan foto diri.

---

### Modul 2: Mobile PWA - Presensi Geofencing Petugas (FR-02)
- **FR-02.1 (State Machine Dinamis Dashboard PWA)**:
  - Status *Belum Absen Masuk*: Dashboard menampilkan tombol hijau **ABSEN MASUK** dan tombol biru **IZIN / SAKIT**.
  - Status *Sudah Absen Masuk*: Dashboard otomatis berganti menampilkan tombol biru **INPUT KEGIATAN** dan tombol oranye **ABSEN PULANG**.
- **FR-02.2 (Absen Masuk)**:
  - Input: Foto live selfie (kamera depan), Koordinat Geolocation GPS, Pilihan Shift/Alasan Piket.
  - Validasi Geofencing Server-Side: Posisi GPS petugas dihitung terhadap titik koordinat site via PostGIS:
    ```sql
    ST_DWithin(user_location, site_coordinates, geofence_radius_meters)
    ```
    Jika petugas berada di luar radius site, presensi ditolak dengan pesan: *"Anda berada di luar radius area tugas ({Jarak} meter)"*.
  - Anti-Fake GPS: PWA memvalidasi `coords.accuracy` (< 50m) dan bendera `mocked` pada Geolocation API.
- **FR-02.3 (Absen Pulang)**:
  - Input: Foto live selfie checkout, Koordinat Geolocation GPS.
  - Menutup sesi kerja hari tersebut dan otomatis menghitung durasi jam kerja riil serta jam lembur.
- **FR-02.4 (Pengajuan Izin / Sakit)**:
  - Input: Alasan Izin (Sakit, Izin Keperluan Pribadi, Cuti), Catatan keterangan, Upload foto bukti surat dokter/pendukung.

---

### Modul 3: Mobile PWA - Patroli Satpam & Checklist Fasilitas (FR-03)
- **FR-03.1 (Pemindai Kamera QR Code PWA)**:
  - Scanner kamera berbasis `Html5Qrcode` dengan auto-switch kamera belakang dan izin MediaDevices standar (kompatibel penuh dengan Android Chrome & iOS Safari).
- **FR-03.2 (Inspeksi Checkpoint Satpam)**:
  - Setelah QR valid, petugas mengisi formulir kondisi titik pantau:
    - Status Hasil: `Situasi Aman Terkendali` atau `Perlu Tindak Lanjut`.
    - Keterangan: Catatan temuan / kerusakan fasilitas / kejanggalan.
    - Foto Fisik: Kamera langsung mengambil foto kondisi pos/aset.
    - Koordinat GPS saat inspeksi direkam secara otomatis.
- **FR-03.3 (Checklist Divisi Cleaning Service)**:
  - Petugas kebersihan memindai QR Code di ruangan/toilet $\rightarrow$ mengisi checklist kebersihan (kebersihan lantai, ketersediaan sabun & tisu, kebersihan cermin, aroma ruangan) + foto bukti.
- **FR-03.4 (Log Perjalanan Divisi Driver)**:
  - Driver mencatat pergerakan armada: Nomor Plat Kendaraan, Lokasi Asal, Lokasi Tujuan, Jam Berangkat, Jam Tiba, dan Catatan Odometer/Kondisi Kendaraan.
- **FR-03.5 (Watermark Foto Otomatis)**:
  - PWA otomatis membubuhkan watermark permanen pada canvas foto sebelum dikirim ke server: `[Nama Petugas | Site | Checkpoint | Waktu | Koordinat]`.

---

### Modul 4: Panic Button (SOS Darurat) & Integrasi WhatsApp Gateway (FR-04)
- **FR-04.1 (Tombol Panik Satu Sentuhan)**:
  - Tombol darurat merah besar pada PWA petugas yang langsung menangkap koordinat GPS terkini dan memicu alarm tanpa proses form yang berbelit.
- **FR-04.2 (Alarm Realtime di Web Admin Command Center)**:
  - Backend memancarkan sinyal WebSocket `emergency:alert` ke browser pengawas yang sedang aktif: membunyikan audio sirine darurat dan membuka modal popup peta lokasi petugas.
- **FR-04.3 (Dispar Otomatis Pesan Darurat ke WhatsApp)**:
  - Backend secara asinkron memanggil API WhatsApp Gateway (Fonnte/Wablas) untuk mengirim pesan darurat ke Grup WhatsApp Pengawas/Komandan:
    ```
    🚨 *[ALARM DARURAT - PANIC BUTTON SOS]*
    Petugas : Budi (Satpam)
    Fasilitas : Gudang Logistik C4 - Pos Belakang
    Waktu : 12-10-2026 02:45 WIB
    Koordinat : -6.208800, 106.845600
    📍 Peta Lokasi : https://maps.google.com/?q=-6.208800,106.845600
    ```
- **FR-04.4 (Eskalasi Status)**:
  - Siklus penanganan darurat: `ACTIVE` $\rightarrow$ `ACKNOWLEDGED` (Komandan konfirmasi respon) $\rightarrow$ `RESOLVED` (Insiden selesai ditangani).

---

### Modul 5: Command Center, Tiket Temuan, & Laporan Operasional (FR-05)
- **FR-05.1 (Manajemen Tiket Temuan Insiden)**:
  - Temuan patroli dengan status `Perlu Tindak Lanjut` otomatis masuk ke antrean *Incident Tickets*.
  - Danru atau Chief dapat mengupdate status pengerjaan, mengunggah foto perbaikan, dan menandai tiket selesai (*Resolved*).
- **FR-05.2 (Serah Terima Shift Komandan / Apel)**:
  - Form handover shift Danru: presensi fisik apel anggota, pemeriksaan seragam & atribut, serah terima inventaris pos (kunci, senter, radio HT, borgol).
- **FR-05.3 (Audit Supervisi Chief)**:
  - Formulir evaluasi berkala oleh Chief terhadap kedisiplinan dan kualitas koordinasi para Komandan Regu.
- **FR-05.4 (Live Rute Patroli & Tracking)**:
  - Rekonstruksi visual rute pergerakan satpam di atas peta Leaflet: menghubungkan titik-titik checkpoint yang dipindai berdasarkan kronologi waktu.

---

### Modul 6: Rekapitulasi Kehadiran Siap Olah HRIS (FR-06)
- **FR-06.1 (Perhitungan Jam Kerja Otomatis)**:
  - Sistem mengalkulasi: Jam Masuk Aktual, Jam Pulang Aktual, Keterlambatan (menit), Jam Kerja Efektif, Jam Lembur (*Overtime*), dan Status Ketidakhadiran (Hadir / Sakit / Izin / Alpa / Lupa Absen Pulang).
- **FR-06.2 (Ekspor Format HRIS / Payroll)**:
  - Menyediakan ekspor dokumen spreadsheet Excel (`.xlsx`) dan CSV dengan format kolom standar HRD:
    `[NIK, Nama Karyawan, Divisi, Site, Tanggal, Jam Masuk, Jam Pulang, Total Jam Kerja, Lembur (Jam), Status, Keterangan]`.
- **FR-06.3 (Matriks Kalender Bulanan)**:
  - Tampilan visual kehadiran 1 bulan penuh (kolom tanggal 1 hingga 31) untuk memantau absensi personil seluruh cabang dalam satu layar.

---

### Modul 7: Retensi Media 6 Bulan & Pesan Siaran (FR-07)
- **FR-07.1 (Kebijakan Penyimpanan Foto 6 Bulan / 180 Hari)**:
  - Seluruh foto presensi dan patroli disimpan di Object Storage (Cloudflare R2 / AWS S3 / MinIO) selama **180 hari**.
  - Object Storage menerapkan aturan *Lifecycle Expiration* 180 hari untuk pembersihan otomatis agar kapasitas harddisk server tidak membengkak tanpa batas.
- **FR-07.2 (Pesan Siaran Internal / Broadcast)**:
  - Manajemen dapat mengirim pengumuman penting (instruksi siaga cuaca, peringatan keamanan, jadwal apel akbar) yang ditargetkan ke seluruh site atau site tertentu.
  - Muncul sebagai banner notifikasi prioritas pada PWA petugas.

---

## 4. Kebutuhan Non-Fungsional (NFR)

1. **Keamanan & Privasi Data**:
   - Seluruh koneksi menggunakan enkripsi TLS 1.3 (HTTPS & WSS).
   - Autentikasi berbasis JWT (Access Token 15 menit + Refresh Token 7 hari tersimpan di Cookie HttpOnly).
   - Password dienkripsi dengan Argon2id / Bcrypt (cost 12).
2. **Kinerja & Skalabilitas**:
   - P95 response time API $< 150\text{ ms}$.
   - Transmisi sinyal darurat Panic Button sampai ke Command Center dalam $< 500\text{ ms}$ via WebSocket.
3. **Kompatibilitas PWA**:
   - Berjalan mulus di Android (Chrome) dan iOS (Safari 16.4+) dengan dukungan Service Worker offline-caching untuk aset UI.
4. **Keandalan Server**:
   - Deployment berbasis Docker Compose di Cloud VPS (Ubuntu 24.04 LTS) dengan auto-restart policy dan backup harian terotomatisasi.
