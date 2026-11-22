# Inventarisasi Data Existing — Patroli Site (https://patroli.site)

> **Status Audit:** Selesai Terverifikasi melalui Otomasi Playwright  
> **Tanggal Audit:** 22 November 2026  
> **Kredensial Audit:** Akun Administrator Terotorisasi (`nun`)  
> **Perusahaan Terdaftar:** `ai`  

---

## 1. Ringkasan Eksekutif Dataset Awal

Hasil inspeksi aktual terhadap live instance `https://patroli.site` menunjukkan bahwa sistem saat ini berada dalam kondisi **minimal dataset** dengan representasi workflow yang sangat terbatas:

- **Total Area / Site:** 1 Lokasi (`AEON MALL SENTUL`)
- **Total Checkpoint:** 2 Titik (1 Security, 1 Cleaning Service)
- **Total Personel:** 2 Orang (Keduanya Divisi Security: 1 Anggota, 1 Komandan)
- **Divisi Cleaning Service:** 0 Personel
- **Divisi Driver:** 0 Personel
- **Divisi Staff Operasional:** 0 Personel
- **Admin Area (Klien):** 0 Personel
- **Riwayat Absensi:** 2 Record (1 Tepat Waktu Masuk-Pulang, 1 Masuk Tanpa Absen Pulang)
- **Riwayat Laporan Security:** 2 Record Anggota, 1 Record Komandan, 1 Record Chief
- **Riwayat Laporan Cleaning:** 0 Record
- **Riwayat Laporan Driver:** 0 Record
- **Riwayat Laporan Staff:** 0 Record
- **Riwayat Emergency (SOS):** 1 Record
- **Pesan Siaran:** 1 Record
- **Data Penggajian:** 2 Record Personel

---

## 2. Inventarisasi Detail per Modul

### 2.1 Modul Data Induk: Area / Site (`xxxx_xxxxxxx`)
- **Total Record:** 1 Record
- **Detail Record Existing:**
  - **ID Area:** `483`
  - **Nama Area:** `AEON MALL SENTUL`
  - **Koordinat GPS:** Latitude `-6.566877`, Longitude `106.857619`
  - **Jadwal Shift Default:**
    - Shift Pagi: `00:00` s/d `00:00`
    - Shift Siang: `00:00` s/d `00:00`
    - Shift Malam: `00:00` s/d `00:00`
    - Shift Staf: `00:00` s/d `00:00`
    - Shift Chief: `00:00` s/d `00:00`
- **Keterangan:** Belum ada konfigurasi jam kerja shift nyata (semua bernilai 00:00). Tidak ada variasi site untuk pengujian rotasi penempatan atau multi-site monitoring.

---

### 2.2 Modul Data Induk: Checkpoint (`xxxx_xxxxxxxxxx`)
- **Total Record:** 2 Record
- **Detail Record Existing:**
  1. **Aset #1052:**
     - **Nama Aset:** `POS 1 GERBANG UTAMA`
     - **Kategori:** `Security`
     - **Jenis Aset:** `Keamanan`
     - **Lokasi Aset:** `Gerbang Utama Sentul`
     - **Deskripsi Tugas:** `Patroli & pemeriksaan pintu masuk utama`
     - **Penempatan Site:** `aeon mall sentul`
  2. **Aset #1053:**
     - **Nama Aset:** `TOILET LANTAI 1 TIMUR`
     - **Kategori:** `Cleaning Service`
     - **Jenis Aset:** `Kebersihan`
     - **Lokasi Aset:** `Lantai 1 Sayap Timur`
     - **Deskripsi Tugas:** `Membersihkan dan memastikan kebersihan toilet`
     - **Penempatan Site:** `aeon mall sentul`
- **Keterangan:** Tidak memiliki variasi rute checkpoint patroli berurutan (minimal butuh 3-5 checkpoint per site untuk menguji kelengkapan patroli dan persentase rute). Checkpoint Cleaning belum pernah memiliki laporan kegiatan.

---

### 2.3 Modul Data Induk: Personil (`xxxx_xxxxxxxx`)
- **Total Record:** 2 Record
- **Detail Record Existing:**
  1. **Personil #1453:**
     - **Nama:** `AGUS PRATAMA`
     - **Username:** `sec_agus`
     - **Posisi:** `Security`
     - **Jabatan:** `anggota`
     - **Penempatan Site:** `aeon mall sentul`
     - **Jam Kerja:** 10 Jam
     - **Gaji Pokok:** Rp 3.800.000
     - **Tunjangan:** Rp 400.000
     - **Biaya per Lembur:** Rp 25.000
     - **Potongan BPJS:** Rp 75.000
     - **Potongan Ketidakhadiran:** Rp 150.000
     - **Potongan Lupa Absen:** Rp 25.000
     - **Foto:** `6afb3b8a8f7d6.jpg` (tersimpan di server)
  2. **Personil #1452:**
     - **Nama:** `DANRU BUDI SANTOSO`
     - **Username:** `danru_budi`
     - **Posisi:** `Security`
     - **Jabatan:** `komandan`
     - **Penempatan Site:** `aeon mall sentul`
     - **Jam Kerja:** 10 Jam
     - **Gaji Pokok:** Rp 4.500.000
     - **Tunjangan:** Rp 500.000
     - **Biaya per Lembur:** Rp 25.000
     - **Potongan BPJS:** Rp 100.000
     - **Potongan Ketidakhadiran:** Rp 150.000
     - **Potongan Lupa Absen:** Rp 50.000
     - **Foto:** `6afb1fdad30ef.jpg` (tersimpan di server)
- **Keterangan:** Tidak ada representasi Chief Security, Cleaning Service, Driver, Staf Operasional, maupun Admin Area.

---

### 2.4 Modul Absensi: Semua Data & Monitoring (`xxxx_xxxxxxxxx` & `xxxxx_...`)
- **Total Record:** 2 Record
- **Detail Record Existing:**
  1. **Agus Pratama:**
     - Tanggal: Selasa, 17 Nov 2026
     - Masuk: `00:26:00` (Jarak GPS: 0.00 Meter dari Site)
     - Pulang: `00:26:55` (Jarak GPS: 0.00 Meter dari Site)
     - Status: Masuk & Pulang tercatat lengkap.
  2. **Danru Budi Santoso:**
     - Tanggal: Senin, 16 Nov 2026
     - Masuk: `22:31:32` (Jarak GPS: 0.00 Meter dari Site)
     - Pulang: `BELUM ABSEN PULANG` (Simbol `X` / Lupa Absen pada matriks monitoring bulanan).
- **Keterangan:** Tidak ada variasi status kehadiran penting seperti: Keterlambatan, Izin Tidak Masuk, Sakit, atau Cuti.

---

### 2.5 Modul Laporan Operasional
1. **Laporan Security Anggota (`xxxx_xxxxxxxxxxx`):** 2 Record
   - Agus Pratama (17 Nov 2026 00:26:00): Pos 1 Gerbang Utama, Status: `🟢 SITUASI AMAN TERKENDALI`.
   - Danru Budi Santoso (16 Nov 2026 23:33:00): Pos 1 Gerbang Utama, Status: `🟢 SITUASI AMAN TERKENDALI`.
2. **Laporan Security Komandan (`xxxxx_...`):** 1 Record
   - Danru Budi Santoso (16 Nov 2026, Shift Pagi, Kehadiran: Lengkap, Catatan serah terima pos).
3. **Laporan Security Chief (`xxxxx_...`):** 1 Record
   - Danru Budi Santoso (16 Nov 2026 22:33, Disiplin: Baik, Koordinasi: Baik, Kehadiran: Lengkap).
4. **Laporan Staff Operasional (`xxxxx_...`):** 0 Record (`No data available in table`).
5. **Laporan Cleaning Service (`xxxxx_...`):** 0 Record (`No data available in table`).
6. **Laporan Driver (`xxxxx_...`):** 0 Record (`No data available in table`).
7. **Tracking Patroli (`xxxxx_...`):** Peta pelacakan titik patroli GPS.
8. **Rekap Kegiatan (`xxxxx_...`):** 2 Record (Danru Budi Santoso: 1 kegiatan, Agus Pratama: 1 kegiatan).

---

### 2.6 Modul Gaji (`xxxxx_...`)
- **Total Record:** 2 Record
  1. **Agus Pratama:** Total Kegiatan: 1, Hadir (H): 1, Lupa (L): 0, Izin (I): 0, Gaji Bulanan: Rp 3.800.000, Gaji Diterima: Rp 4.200.000.
  2. **Danru Budi Santoso:** Total Kegiatan: 1, Hadir (H): 0, Lupa (L): 1, Izin (I): 0, Gaji Bulanan: Rp 4.500.000, Gaji Diterima: Rp 4.850.000.
- **Keterangan:** Formula slip gaji berbasis data attribute:
  $$\text{Gaji Diterima} = \text{Gapok} + \text{Tunjangan} + \text{Lembur} - \text{Potongan BPJS} - \text{Potongan Izin} - \text{Potongan Lupa Absen}$$

---

### 2.7 Modul Pesan Siaran (`xxxxx_...`)
- **Total Record:** 1 Record
- **Isi:** "PERHATIAN: SELURUH PERSONIL WAJIB MELAKUKAN PATROLI PRESISI DAN PELAPORAN TEPAT WAKTU."
- **Lokasi Target:** `AEON MALL SENTUL`

---

### 2.8 Modul Emergency SOS (`xxxxx_...`)
- **Total Record:** 1 Record
- **Personil:** `DANRU BUDI SANTOSO` (Security)
- **Waktu:** Senin, 16 Nov 2026 | 22:32:00
- **Lokasi:** `AEON MALL SENTUL`
- **Aksi:** Tombol "CEK LOKASI" (menampilkan koordinat peta Leaflet & Google Maps).
