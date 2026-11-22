# Uji Alur Kerja Operasional Satpam / Security (Security Workflow Test)

> **Divisi:** Satuan Pengamanan (Security)  
> **Personel Penguji:** `sec_agus` (Agus Pratama), `danru_budi` (Danru Budi Santoso), `chief_hendra` (Chief Hendra Wijaya)  
> **Tanggal Audit:** 22 November 2026  
> **Target Aplikasi:** `https://patroli.site/validasi-patroli/`  

---

## 1. Lingkup Pengujian Alur Kerja Satpam

Alur kerja Satpam mencakup 4 tahapan operasional utama:
1. **Absensi Masuk (Check-in GPS & Swafoto)**
2. **Pemindaian Checkpoint QR Code & Validasi Aset**
3. **Pelaporan Kondisi Normal (Situasi Aman Terkendali)**
4. **Pelaporan Temuan Insiden (Perlu Tindak Lanjut & Deskripsi Masalah)**

---

## 2. Rincian Pelaksanaan Uji Skenario

### 2.1 Skenario 1: Presensi Masuk (Check-in)
- **Eksekutor:** `sec_agus`, `danru_budi`, `chief_hendra`
- **Halaman:** `xxxxx_xx.php` ➔ `insert-presensi.php`
- **Data Input:**
  - Alasan Hadir: `Piket Rutin`
  - Koordinat GPS: `-6.566877, 106.857619` (Aeon Mall Sentul)
  - Swafoto: Base64 JPEG Data URL
- **Hasil Verifikasi:**
  - Status tersimpan ke tabel absensi.
  - Landing page karyawan terbuka penuh dengan akses tombol `INPUT KEGIATAN`.
  - Indikator "Security Hadir" pada dashboard admin meningkat menjadi 3.

### 2.2 Skenario 2: Patroli Situasi Aman (Pos 1 Gerbang Utama)
- **Eksekutor:** `sec_agus` (Agus Pratama)
- **Halaman Pindai:** `xxxxx_xxxxxxxxx.php`
- **QR Code Disimulasikan:** Payload teks `1052` (Kode Aset Pos 1 Gerbang Utama)
- **Halaman Input:** `cek.php` ➔ `insert-patroli.php`
- **Field & Nilai:**
  - Status Patroli (`tl`): `0` (Situasi Aman Terkendali)
  - Lokasi GPS: `-6.566877, 106.857619`
  - Bukti Foto: Base64 JPEG
- **Hasil Verifikasi:**
  - Laporan tersimpan di database.
  - Tercatat di Laporan Security Anggota sebagai:  
    `🟢 SITUASI AMAN TERKENDALI PATROLI & PEMERIKSAAN PINTU MASUK UTAMA DI POS 1 GERBANG UTAMA`

### 2.3 Skenario 3: Patroli Temuan Insiden (Pos 2 Pintu Barat)
- **Eksekutor:** `sec_agus` (Agus Pratama)
- **Halaman Pindai:** `xxxxx_xxxxxxxxx.php`
- **QR Code Disimulasikan:** Payload teks `1062` (Kode Aset Pos 2 Pintu Barat)
- **Halaman Input:** `cek.php` ➔ `insert-patroli.php`
- **Field & Nilai:**
  - Status Patroli (`tl`): `1` (Perlu Tindak Lanjut)
  - Keterangan Insiden (`#keterangan`): `Lampu sorot pos padam dan pintu gerbang barat macet`
  - Lokasi GPS: `-6.566877, 106.857619`
  - Bukti Foto: Base64 JPEG
- **Hasil Verifikasi:**
  - Record tersimpan di database.
  - Kartu **Temuan Aktif** pada Web Admin Command Center bertambah menjadi **1**.
  - Tercatat di Laporan Security Anggota sebagai:  
    `🔴 PERLU TINDAK LANJUT ... TEMUAN YANG DILAPORKAN: LAMPU SOROT POS PADAM DAN PINTU GERBANG BARAT MACET` dengan tombol interaktif `TINDAK LANJUTI TEMUAN`.

---

## 3. Matriks Hasil Pengujian Satpam

| Komponen Uji | Ekspektasi | Hasil Aktual | Status |
|:---|:---|:---|:---|
| Form Presensi | Input foto & GPS membuka dashboard | Dashboard berhasil terbuka | **PASS** |
| Scan QR Pos 1 (1052) | Menampilkan form patroli keamanan | Form tampil dengan detail Pos 1 | **PASS** |
| Submit Patroli Aman | Status 0 tercatat tanpa keterangan mandatory | Tersimpan dengan status hijau (Aman) | **PASS** |
| Scan QR Pos 2 (1062) | Menampilkan form patroli keamanan | Form tampil dengan detail Pos 2 | **PASS** |
| Submit Temuan Insiden | Status 1 memunculkan textarea keterangan | Tersimpan dengan status merah (Perlu Tindak Lanjut) | **PASS** |
| Update Dashboard | Indikator Hadir & Temuan Aktif bertambah | Hadir: 3 Security, Temuan Aktif: 1 | **PASS** |

---

## 4. Bukti File & Tangkapan Layar

- [Formulir Patroli Pos 1 Aman](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshots/01-sec-agus-patrol1-form.png)
- [Formulir Temuan Insiden Pos 2](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshots/02-pos2-temuan-insiden-form.png)
- [Laporan Security Terverifikasi di Web Admin](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshots/10-laporan-security.png)
