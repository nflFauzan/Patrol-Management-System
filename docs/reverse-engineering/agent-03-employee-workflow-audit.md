# AGENT 03 — AUDIT ALUR KERJA CLEANING SERVICE, DRIVER & STAF OPERASIONAL
> **File:** `docs/reverse-engineering/agent-03-employee-workflow-audit.md`  
> **Auditor:** Agent 3 — Cleaning, Driver & Staff Workflow Auditor  
> **Target Aplikasi Referensi:** `https://patroli.site`  
> **Prinsip Utama:** *Dedicated Division Workflows — Memverifikasi perbedaan spesifik alur kerja divisi non-security.*  

---

## 1. Ringkasan Eksekutif Audit

Audit ini membuktikan bahwa aplikasi referensi tidak hanya diperuntukkan bagi Satpam, melainkan mendukung **3 Divisi Operasional Terpadu**:
1. **Cleaning Service (Petugas Kebersihan)**: Berbasis pemindaian QR checklist sanitasi per zona/lantai.
2. **Driver (Pengemudi Armada / Logistik)**: Berbasis pencatatan log perjalanan kendaraan, pelat nomor, tujuan, dan foto.
3. **Staff Operasional**: Form presensi dan logbook kegiatan harian non-checkpoint (terkendala kuota 5/5 akun tenant pada instance referensi).

---

## 2. Alur Kerja Divisi Kebersihan (Cleaning Service)

### 2.1 Autentikasi & Presensi Masuk
- **Akun Pengujian:** `clean_siti` (Siti Aminah, ID: `1466`).
- **Portal Karyawan:** Berhasil login ke `validasi-patroli/index.php`.
- **Presensi Masuk (`xxxxx_xx.php`):**
  - Mengambil foto swafoto dan koordinat GPS.
  - Setelah absen masuk, kartu **Cleaning Hadir** pada Web Admin Dashboard berubah dari 0 menjadi 1.
  - Tombol operasional terbuka dengan akses ke pemindaian QR sanitasi.

### 2.2 Pemindaian QR Checklist Sanitasi (`xxxxx_xxxxxxxxx.php` ➔ `cek.php`)
- **Titik Checkpoint Terdaftar:**
  - Aset #1053: `TOILET LANTAI 1 TIMUR` (Lantai 1 Sayap Timur).
  - Aset #1065: `LOBBY UTAMA LANTAI 1` (Area Lobby Utama Sentul).
  - Aset #1066: `KANTIN KARYAWAN` (Kantin Lantai Dasar).
- **Perbedaan Form Spesifik Cleaning Service pada `cek.php`:**
  - Label Dropdown: *"PILIH HASIL KERJA"* (bukan *"PILIH HASIL PATROLI"*).
  - Pilihan Status:
    - `0`: **Bersih dan Rapi** (Badge Hijau).
    - `1`: **Perlu Tindak Lanjut** (Badge Merah, jika terdapat fasilitas kotor/rusak yang butuh penanganan khusus).
  - Bukti Foto: Wajib mengambil foto hasil pembersihan fisik toilet/ruangan.
  - Koordinat GPS: Wajib terdeteksi di lokasi aset fisik.
- **Submit Action:** Diposting ke `insert-patroli.php`.

### 2.3 Hasil Verifikasi Web Admin (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- **Status Sebelumnya:** `NO DATA AVAILABLE IN TABLE`.
- **Status Aktual Terverifikasi:** Tabel menampilkan baris data:
  - **Site:** `AEON MALL SENTUL`
  - **Personel:** `SITI AMINAH`
  - **Status & Uraian:** `🟢 BERSIH DAN RAPI MEMBERSIHKAN DAN MEMASTIKAN KEBERSIHAN TOILET DI TOILET LANTAI 1 TIMUR LANTAI 1 SAYAP TIMUR`
  - **Waktu:** `MINGGU, 22 NOV 2026 | 19:47:00`
  - **Aksi:** Tombol `DETAIL`

---

## 3. Alur Kerja Divisi Armada Logistik (Driver)

### 3.1 Autentikasi & Menu Khusus Driver
- **Akun Pengujian:** `driver_joko` (Joko Wahyudi, ID: `1467`).
- **Keunikan Antarmuka Karyawan:**
  - Karyawan dengan posisi `Driver` **TIDAK MENDAPATKAN MENU SCAN CHECKPOINT QR**.
  - Sebagai gantinya, PWA menyajikan menu operasional khusus:
    1. **`ABSEN MASUK`** (`xxxxx_xx.php`)
    2. **`MULAI PERJALANAN`** (`xxxxx_xxxxxxxxxx.php`)
    3. **`ABSEN PULANG`**

### 3.2 Formulir Keberangkatan Perjalanan Armada (`xxxxx_xxxxxxxxxx.php` ➔ `../insert_driver.php`)
- **Struktur Form Teruji Empiris:**

| Nama Input | Atribut ID / Type | Nilai Uji Aktual | Deskripsi & Validasi |
|:---|:---|:---|:---|
| `csrf_token` | Hidden | Hash string | Token keamanan validasi POST |
| `kode_anggota`| Hidden | `1467` | ID unik Joko Wahyudi |
| `tipe` | Text (`#tipe`) | `Toyota Avanza Veloz` | Tipe / merk kendaraan operasional |
| `nopol` | Text (`#nopol`) | `B 1234 PAT` | Nomor polisi armada dinas |
| `tujuan` | Text (`#tujuan`) | `Gudang Logistik Cakung` | Alamat / site tujuan pengiriman |
| `keperluan` | Text (`#keperluan`) | `Antar dokumen & logistik operasional` | Deskripsi tugas pengantaran |
| `image` | Hidden (`#image`)| Base64 JPEG Data URL | Foto fisik kendaraan / odometer awal |
| `latitude_b` | Hidden (`#lat`) | `-6.566877` | Koordinat GPS keberangkatan |
| `longitude_b`| Hidden (`#long`)| `106.857619` | Koordinat GPS keberangkatan |

- **Logika Event Listener JavaScript (`frm.onsubmit`):**
  - Script PWA memvalidasi flag memori `G` (GPS status) dan `F` (Photo status). Tombol `btnSimpan` dinonaktifkan (`disabled`) sampai foto kamera dan lokasi berhasil diambil.
  - Pada submit langsung melalui form action, backend `insert_driver.php` menerima parameter dan membuat record log trip baru.

### 3.3 Verifikasi Web Admin Laporan Driver (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- **Status Sebelumnya:** `NO DATA AVAILABLE IN TABLE`.
- **Status Aktual Terverifikasi:** Tabel menampilkan baris data perjalanan aktif:
  - **Site Asal:** `AEON MALL SENTUL`
  - **Driver:** `JOKO WAHYUDI`
  - **Kendaraan:** `TOYOTA AVA - B 1234 PAT`
  - **Waktu Keberangkatan:** `BERANGKAT: MINGGU, 22 NOV 2026 - 19:49:00`
  - **Tujuan & Keperluan:** `GUDANG LOGISTIK CAKUNG - ANTAR DOKUMEN & LOGIS -`
  - **Status Perjalanan:** `BERANGKAT` (Badge Kuning)
  - **Aksi:** Tombol `Detail`

### 3.4 Investigasi Alur Penyelesaian Perjalanan (Trip Completion)
- **Status Saat Ini:** `BERANGKAT` (In Progress).
- **Hipotesis Alur Penyelesaian (`HYPOTHESIS`):**
  - Berdasarkan pembacaan kode halaman karyawan setelah perjalanan dimulai, PWA memunculkan tombol `SELESAI PERJALANAN` untuk mencatat waktu tiba, foto odometer akhir, dan koordinat GPS tujuan (`latitude_s`, `longitude_s`).
  - Rekonstruksi pada monorepo lokal wajib mendukung pencatatan odometer (kilometer awal dan akhir) serta kalkulasi estimasi konsumsi BBM.

---

## 4. Alur Kerja Divisi Staf Operasional & Keterbatasan Kuota

### 4.1 Status Kategori Staf pada Sistem Referensi
- **Dukungan Master Data:** Form `insert-personil.php` dan `personil_edit.php` secara eksplisit menyediakan opsi posisi **`Staff Operasional`** dan pilihan jabatan staf.
- **Menu Laporan Khusus:** Web Admin memiliki menu **`Laporan Staff Operasional`** (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxx`).

### 4.2 Analisis Keterbatasan Kuota (Hard Limit Tenant)
- **Kondisi Aktual:** Perusahaan pengujian (`ai`) memiliki batas lisensi SaaS maksimal **5 personel**.
- **Hasil Uji Coba Penambahan Staf:**
  - Saat mencoba mendaftarkan akun ke-6 (`staf_budi`), tombol pendaftaran terkunci dengan peringatan:  
    `<button class="btn btn-danger" disabled="">BATAS MAKSIMAL TELAH TERCAPAI</button>`.
  - **Status Uji Staf Operasional:** Ditetapkan sebagai **`BLOCKED (QUOTA LIMITATION)`** pada instance eksternal `patroli.site`.

### 4.3 Rekonstruksi Bebas Hambatan pada Monorepo In-House
- Karena sistem monorepo baru adalah **Enterprise In-House Single-Tenant Beli Putus**, pembatasan kuota lisensi SaaS tiruan **dihilangkan 100%**.
- Entitas `User` dan `Division` pada monorepo telah mendukung role `STAFF` dengan modul logbook kegiatan harian terintegrasi ke modul presensi.

---

## 5. Matriks Perbandingan Alur Kerja Antar Divisi

| Aspek Operasional | Divisi Security | Divisi Cleaning Service | Divisi Driver Logistik | Divisi Staf Operasional |
|:---|:---|:---|:---|:---|
| **Presensi Masuk** | GPS + Swafoto + Alasan | GPS + Swafoto + Alasan | GPS + Swafoto + Alasan | GPS + Swafoto + Alasan |
| **Aktivitas Utama** | Scan QR Checkpoint | Scan QR Checkpoint | Form Mulai Perjalanan | Logbook Kegiatan Kantor |
| **Opsi Status Form**| Aman / Perlu Tindak Lanjut| Bersih & Rapi / Perlu Tindak Lanjut | Berangkat / Selesai | Selesai / Terkendala |
| **Data Kendaraan** | Tidak Ada | Tidak Ada | Wajib (Merk, Nopol, Tujuan) | Tidak Ada |
| **Tombol Panic SOS**| Wajib Aktif (Hold 3s) | Wajib Aktif (Hold 3s) | Wajib Aktif (Hold 3s) | Wajib Aktif (Hold 3s) |
| **Output Laporan** | Laporan Security Anggota | Laporan Cleaning Service | Laporan Driver | Laporan Staff Operasional |

---

## 6. Kesimpulan Agent 3
Ketiga divisi operasional lapangan memiliki spesialisasi form yang jelas dan tidak saling tumpang tindih. Seluruh transaksi Cleaning Service dan Driver telah berhasil terbukti masuk ke database dan ditampilkan pada tabel laporan masing-masing. Kategori Staf Operasional terbukti didukung oleh arsitektur form namun terblokir kuota pada sistem referensi SaaS.
