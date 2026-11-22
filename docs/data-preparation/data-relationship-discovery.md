# Penemuan Relasi Data — Patroli Site (https://patroli.site)

> **Status:** Terverifikasi berdasarkan DOM, JavaScript Router, Form Payload, dan Schema Analisis  
> **Tanggal:** 22 November 2026  

---

## 1. Diagram Relasi Entitas Aktual (ERD)

```mermaid
erDiagram
    PERUSAHAAN ||--o{ AREA : memiliki
    AREA ||--o{ CHECKPOINT : menaungi
    AREA ||--o{ PERSONEL : penempatan_operasional
    AREA ||--o{ PESAN_SIARAN : target_lokasi
    
    PERSONEL ||--o{ ABSENSI : mencatat
    PERSONEL ||--o{ LAPORAN_SECURITY : melaporkan
    PERSONEL ||--o{ LAPORAN_CLEANING : melaporkan
    PERSONEL ||--o{ LAPORAN_DRIVER : melakukan
    PERSONEL ||--o{ LAPORAN_STAFF : mendokumentasikan
    PERSONEL ||--o{ LOG_EMERGENCY : memicu_sos
    PERSONEL ||--o{ REKAP_GAJI : menerima
    
    CHECKPOINT ||--o{ LAPORAN_SECURITY : target_aset_patroli
    CHECKPOINT ||--o{ LAPORAN_CLEANING : target_aset_sanitasi

    PERUSAHAAN {
        string nama_perusahaan PK "ai"
    }

    AREA {
        int kode_area PK "auto_increment (contoh: 483)"
        string lokasi_area UK "Nama unik area/site"
        decimal latitude "Koordinat pusat geofence"
        decimal longitude "Koordinat pusat geofence"
        time pagi_masuk
        time pagi_pulang
        time siang_masuk
        time siang_pulang
        time malam_masuk
        time malam_pulang
        time staf_masuk
        time staf_pulang
        time chief_masuk
        time chief_pulang
    }

    CHECKPOINT {
        int kode_aset PK "auto_increment (contoh: 1052, 1053)"
        string nama_aset "Nama pos / ruangan / aset"
        string kategori "Security | Cleaning Service"
        string jenis_aset "Keamanan | Kebersihan | dsb"
        string lokasi "Detail posisi spesifik"
        string deskripsi_aset "Instruksi tugas / SOP"
        string lokasi_area FK "Relasi ke nama Area"
    }

    PERSONEL {
        int kode_anggota PK "auto_increment (contoh: 1452, 1453)"
        string nama_anggota "Nama lengkap personil"
        string username UK "Akun login field/admin"
        string password "Hash Bcrypt ($2y$10$...)"
        string posisi "Admin Area | Security | Cleaning Service | Driver | Staf"
        string jabatan "anggota | komandan | chief"
        string lokasi_site FK "Relasi ke nama Area"
        int jam_kerja "8 - 24 jam"
        decimal gapok "Gaji pokok bulanan"
        decimal tunjangan "Tunjangan kehadiran/jabatan"
        decimal lembur "Tarif per jam/sesi lembur"
        decimal pot_bpjs "Iuran BPJS"
        decimal pot_izin "Potongan per hari izin/mangkir"
        decimal pot_lupa "Potongan per kejadian lupa absen pulang"
        string foto "Nama file image di server"
    }

    ABSENSI {
        int id PK "auto_increment"
        int kode_anggota FK
        string lokasi_site FK
        datetime waktu_masuk
        datetime waktu_pulang
        decimal lat_masuk
        decimal lng_masuk
        decimal jarak_masuk "Jarak meter ke pusat site"
        decimal lat_pulang
        decimal lng_pulang
        decimal jarak_pulang "Jarak meter ke pusat site"
        string status_kehadiran "Tepat Waktu | Keterlambatan | Izin | Lupa Absen Pulang"
    }
```

---

## 2. Dependensi & Aturan Integritas Data

1. **Dependensi Pembuatan Data (Creation Order):**
   ```
   Area (Site & Shift) ➔ Checkpoint (Security / Cleaning) ➔ Personel & Akun Login ➔ Transaksi (Absensi / Patroli / Gaji)
   ```
2. **Karakteristik Unik Relasi String Key:**
   - Aplikasi menggunakan nama teks `lokasi_area` (seperti `"aeon mall sentul"`) sebagai foreign key di tabel `checkpoint`, `personil`, `absensi`, dan `laporan`, bukan sekadar `id` numerik. Oleh karena itu, konsistensi penulisan nama area (case-insensitive) sangat kritikal.
3. **Pemisahan Konseptual Posisi vs Jabatan:**
   - **Posisi:** Klasifikasi divisi peran fungsional (`Admin Area`, `Security`, `Cleaning Service`, `Driver`, `Staf`).
   - **Jabatan:** Khusus untuk `Security`, terdapat sub-level hierarki:
     - `anggota` (Petugas pelaksana patroli checkpoint)
     - `komandan` (Danru pembuat laporan rekap shift dan serah terima pos)
     - `chief` (Pimpinan pengawas supervisi kedisiplinan dan koordinasi)
   - Untuk posisi non-Security (`Cleaning Service`, `Driver`, `Staf`), dropdown jabatan disembunyikan dan otomatis bernilai default `'anggota'`.
4. **Relasi Geofence GPS pada Transaksi:**
   - Saat absensi atau patroli dilakukan, koordinat GPS perangkat dibandingkan dengan `latitude` dan `longitude` milik `Area`. Detail modal menampilkan `JARAK: X.XX METER`.
