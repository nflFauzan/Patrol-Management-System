# Matriks Personel & Akun Pengguna — Patroli Site

> **Status:** Terstruktur Berdasarkan Form Tambah Personel & Edit Personel Aktual  
> **Tanggal:** 22 November 2026  

---

## 1. Taksonomi Struktur Posisi, Jabatan, dan Hak Akses

Berdasarkan analisis interaksi UI form `#exampleModalCenter` dan `#myModal` pada modul Personil:

```
Posisi (Level Divisi Operasional)
├── Admin Area (Pengelola Area / Klien)
│   └── Penempatan: Multiple Sites (lokasi_site_member[])
│   └── Jabatan internal: "Admin Area"
├── Security (Divisi Pengamanan)
│   └── Penempatan: Single Site (lokasi_site_anggota)
│   ├── Sub-Jabatan: Anggota (Petugas Patroli Checkpoint)
│   ├── Sub-Jabatan: Komandan (Danru / Rekap Shift & Pos)
│   └── Sub-Jabatan: Chief (Supervisi, Kedisiplinan, Koordinasi)
├── Cleaning Service (Divisi Sanitasi & Kebersihan)
│   └── Penempatan: Single Site (lokasi_site_anggota)
│   └── Jabatan internal: "anggota"
├── Driver (Divisi Logistik & Transportasi Armada)
│   └── Penempatan: Single Site (lokasi_site_anggota)
│   └── Jabatan internal: "anggota"
└── Staf (Divisi Administrasi & Operasional Kantor)
    └── Penempatan: Single Site (lokasi_site_anggota)
    └── Jabatan internal: "anggota"
```

---

## 2. Matriks Akun Personel Lengkap

| No | Nama Personel | Posisi | Jabatan | Penempatan Site | Username | Jam Kerja | Gapok | Tunjangan | Status Record |
| :-: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| 1 | **Agus Pratama** | Security | Anggota | AEON MALL SENTUL | `sec_agus` | 10 | 3.800.000 | 400.000 | **EXISTING (KEEP)** |
| 2 | **Danru Budi Santoso** | Security | Komandan | AEON MALL SENTUL | `danru_budi` | 10 | 4.500.000 | 500.000 | **EXISTING (KEEP)** |
| 3 | **Chief Hendra Wijaya** | Security | Chief | AEON MALL SENTUL | `chief_hendra` | 10 | 5.500.000 | 750.000 | **PLANNED (NEW)** |
| 4 | **Siti Aminah** | Cleaning Service | Anggota | AEON MALL SENTUL | `clean_siti` | 8 | 3.500.000 | 300.000 | **PLANNED (NEW)** |
| 5 | **Joko Wahyudi** | Driver | Anggota | AEON MALL SENTUL | `driver_joko` | 8 | 3.700.000 | 350.000 | **PLANNED (NEW)** |
| 6 | **Rina Oktaviani** | Staf | Anggota | AEON MALL SENTUL | `staff_rina` | 8 | 4.000.000 | 400.000 | **PLANNED (NEW)** |
| 7 | **Bambang Pengelola** | Admin Area | Admin Area | Multi-Site | `admin_bambang`| 8 | 5.000.000 | 600.000 | **PLANNED (NEW)** |
| 8 | **Surya Saputra** | Security | Anggota | GUDANG LOGISTIK CAKUNG | `sec_surya` | 10 | 3.800.000 | 400.000 | **PLANNED (NEW)** |

---

## 3. Komponen Penggajian & Potongan Standar Akun Uji

Untuk menjamin konsistensi formula gaji saat pengujian modul Gaji (`xxxxx_...`):

- **Lembur:** Rp 25.000 / jam
- **Potongan BPJS:** Rp 75.000 – Rp 100.000 / bulan
- **Potongan Ketidakhadiran:** Rp 150.000 / hari mangkir
- **Potongan Lupa Absen Pulang:** Rp 25.000 – Rp 50.000 / kejadian

> [!IMPORTANT]
> **Kebijakan Keamanan Kredensial:**  
> Seluruh password pengujian dibuat dengan standar keamanan kuat yang seragam (`TestingPass2026!`) dan didokumentasikan terpisah dari file repositori publik sesuai aturan SOP Section 8.D. Password tidak pernah ditulis dalam bentuk hash terbuka atau teks bebas di commit git.
