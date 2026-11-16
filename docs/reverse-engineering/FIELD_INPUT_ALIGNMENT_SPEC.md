# Spesifikasi Penyelarasan Field Input & Alur Operasional (Field Input Alignment Spec)
> **Referensi Reverse Engineering**: `https://patroli.site`  
> **Target Sistem**: `Patrol-Management-System` (Enterprise In-House Single-Tenant)  
> **Status Verifikasi**: 100% Empiris (Live Interactive Reverse Engineering via Playwright)  
> **Tanggal**: 16 November 2026  

---

## 1. Latar Belakang & Prinsip Arsitektur

Berdasarkan audit dan interaksi live di `patroli.site` menggunakan MCP Playwright, dokumen ini merinci seluruh input field, skema validasi, modal interaktif, dan logika operasional dari referensi, serta menyusun rencana penyelarasan (*alignment plan*) untuk `Patrol-Management-System`.

### 1.1 Batasan & Filosofi Utama (Wajib Dipatuhi)
1. **Single-Tenant Corporate In-House Enterprise**:
   - Sistem lokal adalah sistem **Beli Putus** untuk satu korporasi besar.
   - **TIDAK ADA MULTI-TENANCY SAAS**: Tidak ada kolom `tenant_id`, tabel organisasi multi-perusahaan, atau paket langganan SaaS.
   - Hierarki internal korporat: **Pusat ➔ Fasilitas / Site (Kantor Pusat, Pabrik, Gudang, Logistik) ➔ Divisi ➔ Pos/Checkpoint**.
2. **Konsistensi Visual Lokal**:
   - Antarmuka visual lokal tetap mempertahankan gaya modern minimalist / skeuomorphic bento grid sistem kita (`apps/web-admin` dan `apps/pwa-field`), bukan meniru template Bootstrap 4 lama dari referensi.
   - Penyelarasan difokuskan pada **kelengkapan data input (fields), validasi form, modal detail, dan otomasi alur bisnis**.
3. **3 Divisi Operasional Terpadu**:
   - **Satpam (Security)**: Patroli checkpoint QR code, verifikasi GPS geofence, laporan serah terima Danru, inspeksi Chief, dan tombol Panic SOS.
   - **Cleaning Service**: Checklist sanitasi berkala per zona lantai/toilet, pembersihan, dan verifikasi foto bukti.
   - **Driver Logistik**: Log perjalanan armada, pelat nomor kendaraan, odometer awal/akhir, dan status pengiriman barang.
4. **Media Retention Policy (180 Hari)**:
   - Bukti foto absensi dan patroli disimpan 180 hari sebelum di-purge otomatis oleh background worker.

---

## 2. Matriks Komparasi & Penyelarasan Field Input

Berikut adalah perbandingan mendalam antara field empiris `patroli.site` dengan sistem lokal kita di `packages/types`, `apps/backend`, `apps/pwa-field`, dan `apps/web-admin`.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             HIERARKI & INTEGRASI DATA                            │
├───────────────────┬──────────────────────────────────┬───────────────────────────┤
│ Modul             │ patroli.site (Empiris)           │ Patrol-Management-System  │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ Site / Facility   │ Lat, Lng, Radius, PIC, 10 Shifts │ PostGIS Point, Radius, PIC│
│ Checkpoint        │ Integer ID, Kategori, QR A4 Grid │ UUID/Slug, QR Code, Tag   │
│ Personil          │ Profil, Jam Kerja, Komponen Gaji │ User, Auth, PayrollConfig │
│ Payroll Engine    │ Hitung Gapok, Lupa, Izin, Lembur │ Rekapitulasi Gaji Otomatis│
│ PWA Presensi      │ State Machine (Masuk ➔ Pulang)   │ Check-in/Out Geofence GPS │
│ Panic Button      │ Hold 3 detik, Ticker, Map Leaflet│ WebSocket Broadcast & WA  │
│ Export Engine     │ 4 Wizard, Cascading AJAX, PDF/XLS│ NestJS Report Generator   │
└───────────────────┴──────────────────────────────────┴───────────────────────────┘
```

---

### Modul 1: Master Data Area / Fasilitas (Site)

Pada `patroli.site`, form tambah/edit area (`insert-area.php` dan `area_edit.php`) mengintegrasikan penentuan titik koordinat peta Leaflet dengan konfigurasi jam kerja shift langsung di satu tempat.

#### Field Comparison Table
| Field Name | Tipe Data | patroli.site (Empiris) | Patrol-Management-System (Eksisting) | Rekomendasi Penyelarasan |
| :--- | :--- | :--- | :--- | :--- |
| `nama_area` / `name` | String | Wajib, text input | `name` (Wajib) | Pertahankan `name`. Tambahkan alias `facilityName`. |
| `alamat_area` / `address` | Text | Wajib, textarea | `address` (Opsional) | Jadikan `address` wajib untuk standardisasi operasional. |
| `latitude` | Float | Diisi via klik peta Leaflet / autocomplete OSM | `latitude` (Float) | Gunakan PostGIS `ST_SetSRID(ST_MakePoint(lon, lat), 4326)`. |
| `longitude` | Float | Diisi via klik peta Leaflet / autocomplete OSM | `longitude` (Float) | Simpan koordinat presisi hingga 6 desimal. |
| `radius` | Integer | Wajib, meter (default: 50–100 m) | `radiusMeters` (Float/Int) | Samakan nama: `radiusMeters` (default 50m, geofence PostGIS). |
| `pic_area` / `picName` | String | Wajib, nama PIC penanggung jawab | Belum tersedia | **Wajib Ditambahkan**: `picName` (Nama Manajer Site/Security). |
| `no_hp_pic` / `picPhone` | String | Wajib, nomor kontak darurat | Belum tersedia | **Wajib Ditambahkan**: `picPhone` (Target notifikasi WA darurat). |
| `shift_1` s/d `shift_10` | String | 10 dropdown jam kerja (`07:00 - 15:00`, dll) | Tabel relasi `shifts` terpisah | Pertahankan tabel relasi `shifts` 1:N, namun sediakan form input shift terpadu di modal Site. |

#### Modal & UI Behavior
- **Modal Tambah**: Map Leaflet interaktif dengan draggable marker untuk pinpoint koordinat dan visualisasi lingkaran radius geofence.
- **Modal Hapus Area (`#modalHapusArea`)**: Wajib meminta konfirmasi password admin (`hapus-area.php`) guna mencegah penghapusan situs operasional secara tidak sengaja.

---

### Modul 2: Master Data Checkpoint / Titik Aset

Form tambah checkpoint di `patroli.site` bersifat dinamis berdasarkan kategori divisi operasional (`Security` vs `Cleaning Service`).

#### Field Comparison Table
| Field Name | Tipe Data | patroli.site (Empiris) | Patrol-Management-System (Eksisting) | Rekomendasi Penyelarasan |
| :--- | :--- | :--- | :--- | :--- |
| `kode_aset` / `code` | String/Int | Integer serial (misal: `1052`) | UUID / String slug | Dukung format numerik/alfanumerik pendek untuk scan QR cepat. |
| `nama_aset` / `name` | String | Wajib (misal: "Pos 1 Gerbang Utama") | `name` (Wajib) | Samakan. |
| `lokasi_area` / `siteId` | ID / String | Dropdown dari Master Area | `siteId` (Foreign Key UUID) | Samakan relasi ke Site. |
| `kategori` / `division` | Enum | `Security`, `Cleaning Service` | `division` (`SECURITY`, `CLEANING`, `DRIVER`) | Gunakan enum 3 divisi operasional korporat kita. |
| `pos_jaga` / `zona` | String | Sub-lokasi (Pos Jaga, Toilet Lantai 1) | `zone` / `floor` | Tambahkan field spesifik: `zoneName` (misal: "Lantai 1 Sayap Timur"). |
| `urutan_rute` / `order` | Integer | Opsional urutan patroli | `sequenceOrder` | Tambahkan `sequenceOrder` untuk rute patroli berurutan. |
| `nfc_uid` | String | Belum ada di referensi web | `nfcUid` (Opsional) | Pertahankan dukungan dual-tag (QR + NFC) sistem lokal kita. |

#### Generator Stiker QR Code
- Di `patroli.site`, generator stiker QR code (`index?page=xxxxx_...`):
  - Format payload QR: Integer ID checkpoint (`kode = 1052`).
  - Ukuran QR: 160 x 160 piksel.
  - Layout Cetak: CSS Grid 4 kolom per baris format A4 siap cetak untuk ditempel di pos/pintu/toilet.
- Template Impor: Tersedia template XLSX `import-aset.php` (`kode_aset`, `nama_aset`, `lokasi`).

---

### Modul 3: Master Data Personil & Konfigurasi Penggajian

**Temuan Kunci Reverse Engineering**: Pada `patroli.site`, konfigurasi komponen gaji karyawan operasional langsung melekat pada master data personil (`insert-personil.php`).

#### Field Comparison Table
| Field Name | Tipe Data | patroli.site (Empiris) | Patrol-Management-System (Eksisting) | Rekomendasi Penyelarasan |
| :--- | :--- | :--- | :--- | :--- |
| `nama_anggota` / `fullName` | String | Wajib | `fullName` (Wajib) | Samakan. |
| `nik` / `employeeId` | String | Nomor Induk Karyawan | `employeeId` (Wajib) | Samakan. |
| `no_hp` / `phoneNumber` | String | Nomor WhatsApp petugas | `phoneNumber` (Wajib) | Samakan. Digunakan untuk gateway WhatsApp SOS. |
| `username` | String | Kredensial login PWA | `username` (Wajib) | Samakan. |
| `password` | String | Di-hash MD5 di referensi | Bcrypt hash (Cost 10) | Tetap gunakan Bcrypt sesuai `AGENTS.md`. |
| `posisi` / `division` | Enum | `Security`, `Cleaning`, `Driver`, `Chief`, `Staff` | `role` & `division` | Petakan: Role (`STAFF`, `DANRU`, `CHIEF`, `ADMIN`) & Divisi (`SECURITY`, `CLEANING`, `DRIVER`). |
| `sub_jabatan` | String | `Anggota`, `Komandan Regu`, `Chief` | Terintegrasi di Role | Pisahkan `subPositionTitle` untuk label ID Card & Slip Gaji. |
| `lokasi_site` / `siteId` | ID / String | Penempatan area kerja | `siteId` | Samakan relasi ke Site utama penugasan. |
| `jam_kerja` | Integer | 8, 12, 24 Jam kerja reguler | Shift assignment | Tambahkan `workHoursPerShift` (default 8 atau 12 jam). |
| `foto` / `avatarUrl` | Base64 / File | Webcam selfie saat input / Upload file | `avatarUrl` (S3/MinIO) | Sediakan opsi webcam capture dan file upload. |
| **Gaji Pokok (`gapok`)** | Decimal | Wajib (misal: Rp 4.500.000) | Di skema payroll terpisah | **Wajib Disinkronkan**: Simpan di tabel `payroll_configs`. |
| **Tunjangan (`tunjangan`)** | Decimal | Tunjangan kehadiran/jabatan | Di skema payroll terpisah | **Wajib Disinkronkan**: `allowancePosition` & `allowancePresence`. |
| **Tarif Lembur (`lembur`)** | Decimal | Tarif tambahan lembur per hari/jam | Di skema payroll terpisah | **Wajib Disinkronkan**: `overtimeRatePerHour`. |
| **Potongan BPJS (`pot_bpjs`)**| Decimal | Potongan BPJS Kesehatan/TK | Di skema payroll terpisah | **Wajib Disinkronkan**: `deductionBpjs`. |
| **Potongan Izin (`pot_izin`)** | Decimal | Potongan alfa/tidak hadir | Di skema payroll terpisah | **Wajib Disinkronkan**: `deductionAbsencePerDay`. |
| **Potongan Lupa (`pot_lupa`)** | Decimal | Potongan lupa absen pulang | Di skema payroll terpisah | **Wajib Disinkronkan**: `deductionMissedCheckout`. |

#### ID Card Generator
- Ukuran Standar: **CR80 (54 mm x 86 mm)** portrait.
- Pilihan Tema: 5 Varian warna (`B1 Navy Blue`, `B2 Cobalt Blue`, `B3 Crimson Red`, `B4 Dark Tech`, `B5 Clean White`).
- Komponen Kartu: Logo Korporat, Foto Personil, Nama Lengkap, NIK, Posisi/Jabatan, Site Penugasan, dan QR Code verifikasi identitas di bagian belakang.

---

### Modul 4: Pesan Siaran (Broadcast Announcement)

Fitur siaran informasi dari Web Admin ke seluruh petugas operasional di site terkait.

#### Field Comparison Table
| Field Name | Tipe Data | patroli.site (Empiris) | Patrol-Management-System (Eksisting) | Rekomendasi Penyelarasan |
| :--- | :--- | :--- | :--- | :--- |
| `kd_pesan` | ID | Serial integer (misal: `29`) | UUID | Samakan sebagai Primary Key. |
| `lokasi_area` / `siteId` | String / ID | Nama area atau `ALL` | `siteId` (Nullable untuk global) | Dukung siaran per-site dan siaran ke seluruh site korporasi. |
| `pesan` / `content` | Text | Wajib, isi pengumuman/arahan | `content` (Wajib) | Samakan. |
| `tanggal` / `createdAt` | Datetime | Timestamp pembuatan | `createdAt` | Samakan. |
| `status` / `isActive` | Boolean | Aktif / Non-aktif | `isActive` | Samakan. |

#### Integrasi PWA
- Pesan yang diaktifkan admin langsung muncul sebagai **running-text ticker** di dashboard PWA personil yang bertugas di site tersebut.

---

### Modul 5: PWA Field Operations (Presensi, Laporan & SOS)

Alur operasional di aplikasi lapangan PWA (`apps/pwa-field`) memiliki siklus kerja (*state machine*) yang sangat terstruktur:

```
                  ┌───────────────────────────────┐
                  │          PWA LOGIN            │
                  └──────────────┬────────────────┘
                                 │
                     [Status: Belum Presensi]
                                 │
                  ┌──────────────▼────────────────┐
                  │       TOMBOL ABSEN MASUK      │
                  │ (Swafoto + Validasi Geofence) │
                  └──────────────┬────────────────┘
                                 │
                                 ▼
         ┌─────────────────────────────────────────────────┐
         │              STATE AKTIF DALAM SHIFT            │
         ├───────────────────────┬─────────────────────────┤
         │ Menu Utama Berubah:   │ Menu Sekunder Berubah:  │
         │ [ABSEN MASUK]         │ [IZIN ALPHA]            │
         │          ▼            │          ▼              │
         │ [ABSEN PULANG]        │ [INPUT KEGIATAN]        │
         └───────────────────────┴─────────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
    [PATROLI SCAN]      [LAPORAN KOMANDAN]      [PANIC BUTTON SOS]
    (Scan QR / NFC)      (Serah Terima Regu)      (Tahan 3 Detik)
           │                     │                     │
           │                     │             [Broadcast WS + WA]
           └─────────────────────┼─────────────────────┘
                                 │
                                 ▼
                  ┌───────────────────────────────┐
                  │       TOMBOL ABSEN PULANG     │
                  │ (Swafoto + Validasi Geofence) │
                  └───────────────────────────────┘
```

#### Detail Form Hasil Patroli Checkpoint (`insert-patroli.php`)
Ketika personil lapangan (Anggota Security atau Danru) memindai QR Code checkpoint (mengirim POST ke `cek.php` dengan `nama = {kode_aset}`), sistem menampilkan form hasil inspeksi patroli:
1. `tl` (Select, required): `PILIH HASIL PATROLI` (`0 = Situasi Aman Terkendali`, `1 = Perlu Tindak Lanjut`).
2. `keterangan` (Text, optional): Catatan kondisi temuan (maksimal 50 karakter).
3. `cameraSelect` (Select): Pilihan kamera (`Kamera Belakang` / `Kamera Depan`).
4. `image` (Hidden, required): Data foto bukti berbasis webcam base64 data URI.
5. `kode_aset` (Hidden, required): Integer ID checkpoint yang dipindai (misal `1052`).
6. `kode_anggota` (Hidden, required): Integer ID petugas yang sedang bertugas (misal `1452`).
7. `csrf_token` (Hidden, required): Token CSRF form.
8. `latitude` & `longitude` (Textarea/Float, required): Koordinat GPS perangkat saat submit form.

#### Detail Form Laporan Komandan (Danru Handover)
1. `shift`: Pilihan shift kerja (Pagi, Siang, Malam).
2. `jumlah_anggota_hadir`: Integer hitungan personil yang bertugas.
3. `jumlah_anggota_izin`: Integer izin/sakit.
4. `jumlah_anggota_alpha`: Integer tidak hadir tanpa kabar.
5. `kondisi_inventaris`: Checklist kelengkapan aset (HT, Rompi, Senter, Borgol, Kunci Cadangan).
6. `uraian_kegiatan`: Catatan insiden, serah terima buku mutasi, dan tamu VIP.
7. `kesimpulan_situasi`: Pilihan kategori situasi:
   - `A`: Aman & Kondusif.
   - `B`: Terdapat Catatan / Perlu Pengawasan.
   - `C`: Situasi Rawan / Terjadi Insiden.

#### Mekanisme Panic Button SOS
- **Anti-False Alarm**: Tombol wajib ditekan dan ditahan (*press & hold*) selama minimal **3 detik**.
- **Payload GPS**: Mengambil koordinat perangkat saat itu juga.
- **Distribusi Peringatan**:
  1. WebSocket event `sos:triggered` ke Command Center Web Admin (menampilkan banner darurat merah dan suara sirene).
  2. Gateway WhatsApp mengirim pesan otomatis ke nomor HP PIC Site dan Supervisor dengan tautan Google Maps: `https://maps.google.com/?q={lat},{lng}`.

---

### Modul 6: Web Admin Monitoring, Matriks & Detail Modals

Pada Web Admin, terdapat beberapa modal dan tabel cerdas yang harus diimplementasikan:

#### 1. Modal Detail Absensi (`#myModalab`)
- **Peta Verifikasi Leaflet**: Menampilkan dua marker:
  - Marker Biru: Titik koordinat presisi perangkat petugas saat melakukan swafoto.
  - Marker Merah: Titik pusat geofence Fasilitas / Site.
  - Garis Poligon / Radius Circle: Menampilkan batas radius geofence.
- **Komputasi Jarak Presisi**: Menghitung jarak Euclidean / Haversine ($d$) secara realtime:
  - Jika $d \le R$: Label hijau badge `DALAM RADIUS AREA (Jarak: 0.00 M)`.
  - Jika $d > R$: Label merah badge `DI LUAR RADIUS AREA (Jarak: X.XX M)`.
- **Foto Bukti**: Menampilkan swafoto jernih petugas dengan watermark waktu dan koordinat.

#### 2. Matriks Kehadiran Bulanan
- Tabel grid 1 s/d 31 hari per personil:
  - Format Cell: `M {Jam Masuk} | P {Jam Pulang}` (misal: `M 22:31 | X` di mana `X` menandakan belum absen pulang).
  - Indikator Warna: Hijau (Tepat Waktu), Kuning (Terlambat), Merah (Alfa / Tidak Hadir), Biru (Izin / Sakit).

#### 3. Otomasi Penggajian & Cetak Slip Gaji (Payroll)
- Tabel Gaji Admin menghitung otomatis seluruh elemen kehadiran:
  $$\text{Total Gaji} = \text{Gapok} + \text{Tunjangan} + (\text{Jam Lembur} \times \text{Tarif}) - \text{Pot. BPJS} - \text{Pot. Izin} - (\text{Lupa Absen} \times \text{Tarif Lupa})$$
- **Template Slip Gaji**:
  - Format standar A4 portrait dengan border resmi.
  - Header: Logo Perusahaan, Judul Slip Gaji, Bulan & Tahun.
  - Tabel Rincian Kehadiran & Finansial (14 baris terstruktur).
  - Footer: Kolom tanda tangan resmi `Mengetahui, HRD Perusahaan`.

#### 4. Modal Detail Patroli (`#myModalpat` / `detail-patroli.php`)
Ketika admin mengklik tombol **`DETAIL`** pada tabel Laporan Security Anggota (`xxxx_xxxxxxxxxxx`), sistem menampilkan modal komprehensif:
- **Profil Petugas**: Foto profil, nama petugas, posisi, site penugasan, dan badge status `HASIL KEGIATAN SELESAI`.
- **Informasi Aset**: Nama objek aset (`POS 1 GERBANG UTAMA`), jenis (`KEAMANAN`), lokasi detail (`GERBANG UTAMA SENTUL - AEON MALL SENTUL`).
- **Informasi Kegiatan**: Hari/tanggal, waktu pelaksanaan presisi (`23:33:00`), nomor kode patroli unik (`#7555`), deskripsi tugas (`PATROLI & PEMERIKSAAN PINTU MASUK UTAMA`), dan status temuan (`SITUASI AMAN TERKENDALI`).
- **Peta Lokasi Petugas (Leaflet Map)**: Menampilkan posisi real-time saat scan dilakukan dengan marker pin dan radius 30 meter merah, koordinat teks, serta tombol tautan eksternal `BUKA GOOGLE MAPS`.
- **Foto Dokumentasi**: Bukti visual lapangan yang diunggah saat melakukan scan checkpoint.
- **Modal Tindak Lanjut (`#myModaltl` / `tl.php`)**: Untuk patroli dengan temuan bermasalah (`tl = 1`), tersedia modal khusus pencatatan instruksi perbaikan dan eskalasi.

#### 5. Matriks Pemantauan 24 Jam (Monitoring Kegiatan)
- **Tampilan Grid 24 Jam**:
  - Kolom jam membagi hari menjadi 24 slot (`00:00 S/D 01:00` hingga `23:00 S/D 00:00`).
  - Baris memuat setiap titik checkpoint yang terdaftar pada site yang dipilih.
  - Setiap kali petugas memindai checkpoint, slot jam terkait otomatis terisi tanda centang hijau dan waktu presisi (contoh: `✓ 23:33` pada slot `23:00 S/D 00:00`).
  - Dilengkapi tombol **`📊 Cetak Excel`** berbasis client-side Blob (`.xls`) tanpa beban pemrosesan server backend.

#### 6. Tracking Patroli Timeline
- Menampilkan jejak pergerakan patroli dalam bentuk **Vertical Alternate Timeline** (`.timeline`):
  - Garis tengah gradient biru-hijau.
  - Titik dot sirkular penanda waktu dan nomor checkpoint.
  - Kartu kiri (`.left`) dan kartu kanan (`.right`) bergantian.
  - Data kartu memuat: Waktu, Nama Personil & Posisi, Nama Checkpoint & Lokasi, Status Badge (`Normal`), dan Catatan Petugas.
  - Filter interaktif: Lokasi Area ➔ AJAX Petugas ➔ AJAX Checkpoint ➔ Rentang Tanggal.

#### 7. Rekapitulasi Kegiatan Bulanan (Rekap Kegiatan)
- Menghitung agregat total kegiatan patroli yang diselesaikan oleh setiap personil:
  - Kolom: `NAMA PERSONIL`, `POSISI`, `LOKASI SITE`, `BULAN`, `TAHUN`, `TOTAL KEGIATAN`.
  - Filter interaktif: Lokasi, Posisi, Bulan, dan Tahun.
  - Tombol **`Cetak Rekap Kegiatan`** format cetak dokumen resmi.

---

### Modul 7: Wizard Ekspor Laporan (Export Laporan)

Halaman Export Laporan terbagi menjadi 4 wizard kartu terpisah dengan cascading dropdown dinamis:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             4 WIZARD EKSPOR LAPORAN                              │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│ 1. Absensi Personil                    │ 2. Rekap Absensi Area                   │
│    - Rentang Tanggal (Dari - Sampai)   │    - Rentang Tanggal (Dari - Sampai)    │
│    - Lokasi Area (AEON MALL SENTUL)    │    - Lokasi Area (AEON MALL SENTUL)     │
│    - Kategori (Komandan/Security/Chief)│    - Kategori Divisi                    │
│    - Nama Personil (Danru Budi Santoso)│    - Tombol: [PDF] [EXCEL]              │
│    - Tombol: [PDF] [EXCEL]             │                                         │
├────────────────────────────────────────┼─────────────────────────────────────────┤
│ 3. Kegiatan Personil                   │ 4. Rekap Kegiatan Area                  │
│    - Rentang Tanggal (Dari - Sampai)   │    - Rentang Tanggal (Dari - Sampai)    │
│    - Lokasi Area                       │    - Lokasi Area                        │
│    - Kategori (Security/Cleaning/...)  │    - Kategori Divisi                    │
│    - Nama Personil                     │    - Tombol: [PDF] [EXCEL]              │
│    - Tombol: [PDF] [EXCEL]             │                                         │
└────────────────────────────────────────┴─────────────────────────────────────────┘
```

#### Smart PDF Routing Architecture
Berdasarkan nilai `kategori` yang dipilih, sistem mengarahkan ke generator PDF spesifik divisi:
- `Security` ➔ `cetak-anggota-pdf` (Form checklist patroli & temuan insiden).
- `Komandan` ➔ `cetak-komandan-pdf` (Laporan serah terima regu, inventaris, dan kesimpulan situasi).
- `Chief` ➔ `cetak-chief-pdf` (Laporan inspeksi & evaluasi manajerial site).
- `Driver` ➔ `cetak-driver-pdf` (Log odometer, pelat nomor, dan rute armada logistik).
- `Cleaning` ➔ `cetak-cleaning-pdf` (Checklist sanitasi zona toilet & lantai).
- `Staff` ➔ `cetak-staf-pdf` (Laporan tugas umum harian).

---

## 3. Rencana Tindak Lanjut Teknis (Action Plan)

Untuk menerapkan seluruh temuan empiris di atas ke dalam codebase `Patrol-Management-System`, berikut langkah terstruktur yang akan dieksekusi:

### Tahap 1: Ekstensi Tipe & Kontrak Data (`packages/types`)
1. Perbarui `ISite` / `CreateSiteDto`:
   - Tambahkan `picName: string`, `picPhone: string`, `radiusMeters: number`.
2. Perbarui `ICheckpoint` / `CreateCheckpointDto`:
   - Tambahkan `division: DivisionEnum`, `zoneName: string`, `sequenceOrder: number`.
3. Perbarui `IPersonnel` & `IPayrollConfig`:
   - Tambahkan komponen gaji: `basicSalary`, `allowance`, `overtimeRate`, `bpjsDeduction`, `absenceDeduction`, `missedCheckoutDeduction`.
   - Tambahkan `workHoursPerShift: number`, `idCardTheme: string`.
4. Buat tipe baru:
   - `IBroadcastAnnouncement`: `siteId`, `content`, `isActive`, `createdAt`.
   - `IDanruReport`: `shiftId`, `presentCount`, `permitCount`, `sickCount`, `alphaCount`, `inventoryStatus`, `incidentNotes`, `securityLevel`.
   - `IPayrollSummary`: Rangkuman bulanan per personil (hadir, lupa, izin, lembur, total gaji).

### Tahap 2: Skema Database & Backend Engine (`apps/backend`)
1. Tambahkan migration Prisma/TypeORM untuk tabel `payroll_configs`, `broadcast_announcements`, dan `danru_handover_reports`.
2. Implementasikan modul kalkulator penggajian otomatis di backend (`PayrollService`).
3. Tambahkan endpoint PDF router & Excel streaming untuk 4 wizard laporan.
4. Buat WebSocket gateway event untuk siaran pesan real-time ke PWA.

### Tahap 3: PWA Field Operations UI (`apps/pwa-field`)
1. Implementasikan State Machine tombol Presensi (`ABSEN MASUK` ➔ `ABSEN PULANG`).
2. Implementasikan transisi menu dinamis (`IZIN ALPHA` ➔ `INPUT KEGIATAN`).
3. Tambahkan komponen form Laporan Komandan (Danru Handover) dan Laporan Chief.
4. Pasang komponen running-text ticker pesan siaran di dashboard.
5. Perkuat Panic Button SOS dengan proteksi penekanan 3 detik dan fallback offline queue.

### Tahap 4: Web Admin Command Center (`apps/web-admin`)
1. Buat modal detail absensi dengan perbandingan koordinat Leaflet dan perhitungan jarak presisi.
2. Implementasikan tabel kalkulasi Gaji dan preview cetak Slip Gaji A4 standar HR.
3. Buat komponen Vertical Timeline pada halaman Tracking Patroli.
4. Terapkan 4 wizard kartu pada halaman Export Laporan dengan cascading dropdown dinamis.
5. Sediakan generator stiker QR Checkpoint format A4 grid 4 kolom.

---

## 4. Kesimpulan

Dengan menyelesaikan reverse engineering interaktif secara 100% menggunakan MCP Playwright, seluruh alur, field, modal, dan otomasi dari `patroli.site` telah terpetakan secara lengkap dan presisi tanpa asumsi. Spesifikasi ini menjadi panduan tunggal (*single source of truth*) dalam menyelaraskan form input dan alur operasional `Patrol-Management-System`, dengan tetap menjaga arsitektur *Single-Tenant In-House Enterprise* dan standar visual modern korporat.
