# Uji Alur Kerja Driver Logistik (Driver Workflow Test)

> **Divisi:** Driver Armada / Logistik  
> **Personel Penguji:** `driver_joko` (Joko Wahyudi)  
> **Tanggal Audit:** 22 November 2026  
> **Target Aplikasi:** `https://patroli.site/validasi-patroli/`  

---

## 1. Identifikasi Alur Kerja Driver Lapangan

Berdasarkan analisis DOM dinamis pada portal mobile:
- **Menu Operasional Khusus:** Karyawan dengan posisi `Driver` mendapatkan menu khusus:
  1. `ABSEN MASUK` (`xxxxx_xx.php`)
  2. `MULAI PERJALANAN` (`xxxxx_xxxxxxxxxx.php`)
  3. `ABSEN PULANG` (hanya aktif setelah absen masuk)
- **Spesifikasi Formulir Mulai Perjalanan (`insert_driver.php`):**
  - `csrf_token`: Hidden token validasi
  - `kode_anggota`: ID unik personil (`1467`)
  - `tipe`: Tipe kendaraan (Contoh: `Toyota Avanza Veloz`)
  - `nopol`: Nomor polisi kendaraan (Contoh: `B 1234 PAT`)
  - `tujuan`: Lokasi tujuan pengiriman (Contoh: `Gudang Logistik Cakung`)
  - `keperluan`: Keperluan tugas (Contoh: `Antar dokumen & logistik operasional`)
  - `image`: Foto bukti fisik kendaraan / speedometer awal
  - `latitude_b`: Koordinat GPS keberangkatan
  - `longitude_b`: Koordinat GPS keberangkatan

---

## 2. Rincian Pelaksanaan Uji Skenario

### 2.1 Presensi Masuk Joko Wahyudi
- **Tindakan:** Check-in presensi masuk via `xxxxx_xx.php`.
- **Hasil:** Tombol `MULAI PERJALANAN` menjadi aktif.

### 2.2 Submit Keberangkatan Perjalanan Armada
- **Halaman:** `xxxxx_xxxxxxxxxx.php`
- **Tindakan:** Mengisi data kendaraan Toyota Avanza Veloz `B 1234 PAT` menuju Gudang Cakung.
- **Validasi Klien:** Memenuhi syarat parameter foto base64 JPEG dan koordinat GPS.
- **Submit Action:** Diposting ke `../insert_driver.php`.
- **Hasil Verifikasi Web Admin:**
  - Sebelumnya tabel **Laporan Driver** (`xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`) menampilkan pesan:  
    `NO DATA AVAILABLE IN TABLE`.
  - Setelah transaksi disubmit, tabel menampilkan data riil:
    - **Site Asal:** `AEON MALL SENTUL`
    - **Driver:** `JOKO WAHYUDI`
    - **Kendaraan & Nopol:** `TOYOTA AVA - B 1234 PAT`
    - **Waktu Keberangkatan:** `BERANGKAT: MINGGU, 22 NOV 2026 - 19:49:00`
    - **Tujuan & Keperluan:** `GUDANG LOGISTIK CAKUNG - ANTAR DOKUMEN & LOGIS -`
    - **Status Perjalanan:** `BERANGKAT` (Badge kuning aktif)
    - **Aksi:** Tombol `Detail`

---

## 3. Matriks Hasil Pengujian Driver

| Komponen Uji | Ekspektasi | Hasil Aktual | Status |
|:---|:---|:---|:---|
| Form Presensi | Aktivasi menu Mulai Perjalanan | Menu Mulai Perjalanan aktif | **PASS** |
| Form Mulai Perjalanan | Menampilkan input armada, nopol, tujuan | Form lengkap dengan capture kamera | **PASS** |
| Submit Keberangkatan | Disimpan ke tabel riwayat driver | Tersimpan dengan status BERANGKAT | **PASS** |
| Laporan Driver Admin | Menampilkan log perjalanan aktif | Tabel terisi record Joko Wahyudi | **PASS** |
| Dashboard Integrasi | Menghitung kegiatan operasional | Kegiatan Hari Ini bertambah 1 | **PASS** |

---

## 4. Bukti File & Tangkapan Layar

- [Formulir Mulai Perjalanan Joko Wahyudi](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshots/04-driver-joko-journey-form.png)
- [Tabel Laporan Driver Terverifikasi di Web Admin](file:///c:/project/Patrol-Management-System/docs/data-preparation/screenshots/09-laporan-driver.png)
