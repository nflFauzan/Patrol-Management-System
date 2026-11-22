# 00 — EXECUTIVE SUMMARY: PHASE 1 DEEP REVERSE ENGINEERING
> **File:** `docs/reverse-engineering/phase-1/00-executive-summary.md`  
> **Tahap:** Phase 1 — Deep Reverse Engineering (Technical Blueprint & Architecture Specification)  
> **Sistem Acuan (Benchmark):** `https://patroli.site`  
> **Sistem Sasaran (Our Product):** `Patrol-Management-System` (Enterprise In-House Single-Tenant Monorepo)  
> **Prinsip Utama:** *Evidence-First Discovery — Zero Code Modification pada Monorepo Sasaran.*  

---

## 1. Latar Belakang & Tujuan Rekayasa Balik Mendalam

Sistem operasional `Patrol-Management-System` dirancang untuk memodernisasi pengelolaan fasilitas korporat (Pusat, Pabrik, Gudang, Logistik) dengan mengintegrasikan 3 pilar operasional lapangan: **Satuan Pengamanan (Security)**, **Petugas Kebersihan (Cleaning Service)**, dan **Pengemudi Armada (Driver Logistik)**, dilengkapi dengan pemantauan terpusat (*Command Center*), kalkulasi penggajian terpadu (*Payroll Engine*), dan proteksi kedaruratan (*Panic SOS*).

Tujuan Phase 1 adalah membongkar seluruh mekanisme internal `patroli.site` hingga ke level kontrak API, validasi DOM form, struktur entitas relasional, diagram transisi state operasional, formula penggajian, dan perilaku jaringan saat online maupun offline.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DEEP REVERSE ENGINEERING PIPELINE (PHASE 1)                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Aplikasi Referensi] ➔ [Network Tracing] ➔ [DOM Form Decoding] ➔ [State Transitions]  │
│          │                    │                     │                     │            │
│          ▼                    ▼                     ▼                     ▼            │
│ [22 Modul Aplikasi]  [API Contracts & AJAX] [Field Catalog & Rules] [Diagram Mesin State]│
│          │                    │                     │                     │            │
│          └────────────────────┼─────────────────────┼─────────────────────┘            │
│                               ▼                                                        │
│             [20 Dokumen Spesifikasi Teknis di phase-1/]                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Temuan Kunci Phase 1 (Key Empirical Discoveries)

1. **Arsitektur Dual-Gate Autentikasi & Routing Berbasis Jabatan:**
   - Halaman root login (`login.php`) bertindak sebagai dispatcher:
     - Kredensial role manajerial (`superadmin`, `admin_area`) diarahkan ke Web Admin Command Center (`/index.php`).
     - Kredensial role operasional (`Security`, `Cleaning Service`, `Driver`, `Staff`) diarahkan ke PWA mobile `/validasi-patroli/index.php`.
   - Di sisi PWA mobile, terdapat **State Machine Presensi**: jika belum melakukan `ABSEN MASUK` (`xxxxx_xx.php`), seluruh tombol aktivitas operasional (`INPUT KEGIATAN`, `MULAI PERJALANAN`, dan `ABSEN PULANG`) dalam kondisi terkunci.

2. **Diferensiasi Form Berdasarkan Divisi Karyawan:**
   - **Satpam (Security):** Memindai stiker QR integer ID (misal `1052`). Form `cek.php` menampilkan opsi *"PILIH HASIL PATROLI"* (`0` = Situasi Aman Terkendali, `1` = Perlu Tindak Lanjut). Status `1` secara kondisional membuka field `#keterangan` dan menaikkan indikator `TEMUAN AKTIF` di admin.
   - **Cleaning Service:** Memindai stiker QR zona sanitasi (misal `1053`). Form `cek.php` secara dinamis mengubah label menjadi *"PILIH HASIL KERJA"* (`0` = Bersih dan Rapi, `1` = Perlu Tindak Lanjut).
   - **Driver Logistik:** Terkunci dari menu scan QR. Sebagai gantinya, diberikan menu khusus `MULAI PERJALANAN` (`xxxxx_xxxxxxxxxx.php`) untuk mendata tipe armada, nomor polisi, tujuan, keperluan, dan swafoto kendaraan.
   - **Komandan (Danru) & Chief:** Memiliki form pelaporan berjenjang (`insert_komandan.php` dan `insert_chief.php`) untuk serah terima inventaris pos dan evaluasi kinerja regu.
   - **Staff Operasional:** Memiliki form kegiatan harian (`insert_staf.php`) dengan 8 kategori pekerjaan administratif.

3. **Dekonstruksi Mesin Penggajian (Payroll Engine):**
   - Formula bersih terbukti secara empiris:
     $$\text{Take Home Pay} = \text{Gapok} + \text{Tunjangan} + (\text{Jam Lembur} \times \text{Tarif}) - \text{BPJS} - \text{Alpa} - (\text{Lupa Absen} \times \text{Denda})$$
   - Karyawan yang melakukan absen masuk namun tidak melakukan absen pulang dipotong denda *Lupa Absen* secara otomatis oleh sistem saat rekapitulasi bulanan dijalankan.

4. **Keterbatasan Kritis Sistem Acuan (Reference Constraints):**
   - **Zero Offline Capability:** File `service-worker.js` pada sistem acuan hanyalah *dummy worker* minimalis tanpa caching runtime atau indexedDB sync queue. Pemutusan koneksi saat submit menyebabkan kegagalan HTTP.
   - **Tenant Quota Limit:** Instance perusahaan `ai` pada referensi memiliki kuota maksimal 5 karyawan (`BATAS MAKSIMAL TELAH TERCAPAI`).
   - **Enkripsi Legacy:** Endpoint pembaruan personil menyimpan hash MD5 (32 hex characters), sedangkan admin menggunakan Bcrypt.

---

## 3. Garis Panduan Implementasi Monorepo In-House

Sesuai `AGENTS.md`, seluruh kelemahan referensi **DILARANG DITIRU** pada monorepo `Patrol-Management-System`:
- **Single-Tenant Corporate (Beli Putus):** Tidak ada kolom `tenant_id` dan tidak ada batasan kuota lisensi berbayar.
- **Offline-First PWA:** Mengimplementasikan Workbox Service Worker dan antrean IndexedDB (`idb`) agar petugas di basement tanpa sinyal tetap dapat memindai QR code dan melakukan absensi.
- **Geospasial Native PostGIS:** Menghitung radius geofence presisi menggunakan fungsi spasial `ST_DWithin` dan koordinat EPSG:4326.
- **Keamanan Sandi Mutlak:** Seluruh sandi di-hash menggunakan Bcrypt (cost factor minimal 10).

---

## 4. Struktur Indeks Berkas Dokumentasi Phase 1

Seluruh spesifikasi teknis mendalam Phase 1 diorganisasikan ke dalam 21 berkas terstruktur pada direktori `docs/reverse-engineering/phase-1/`:

| Berkas Dokumentasi | Fokus Analisis & Konten Utama | Status Bukti |
|:---|:---|:---:|
| `00-executive-summary.md` | Ringkasan eksekutif arsitektur dan sintesis temuan Phase 1 | **COMPLETED** |
| `01-application-map.md` | Peta rute lengkap Web Admin (30 rute) dan PWA Karyawan (14 rute) | **COMPLETED** |
| `02-role-permission-matrix.md` | Matriks otorisasi RBAC 7 peran pengguna dan batasan aksi | **COMPLETED** |
| `03-admin-ui-specification.md` | Spesifikasi tata letak, tabel, modal Leaflet, filter, dan state UI | **COMPLETED** |
| `04-admin-form-field-catalog.md` | Katalog mendalam seluruh form input, validasi, dan dependensi | **COMPLETED** |
| `05-security-workflow.md` | Alur kerja lengkap Satpam: Anggota, Danru, Chief, dan Panic SOS | **COMPLETED** |
| `06-cleaning-workflow.md` | Alur kerja Cleaning Service: QR toilet/lobby dan checklist sanitasi | **COMPLETED** |
| `07-driver-workflow.md` | Alur kerja Driver: Log trip armada, pelat nomor, status Berangkat/Selesai | **COMPLETED** |
| `08-staff-workflow.md` | Alur kerja Staff Operasional: Form logbook harian dan mitigasi kuota | **COMPLETED** |
| `09-attendance-workflow.md` | Alur kerja presensi: Geofence GPS, swafoto webcam, dan matriks 31 hari | **COMPLETED** |
| `10-patrol-and-qr-specification.md`| Spesifikasi QR code generator, format payload integer, dan verifikasi aset | **COMPLETED** |
| `11-data-model-and-erd.md` | Model data konseptual, entitas relasional, dan diagram ERD komprehensif | **COMPLETED** |
| `12-api-contract-catalog.md` | Katalog kontrak HTTP/AJAX endpoint, parameter payload, dan respon JSON | **COMPLETED** |
| `13-business-rules-catalog.md` | Katalog aturan bisnis matematis, denda absen, shift, dan SLA insiden | **COMPLETED** |
| `14-dashboard-and-reporting.md` | Formula 10 widget command center, 7 kategori laporan, dan export wizard | **COMPLETED** |
| `15-offline-and-sync-analysis.md` | Analisis komparatif ketiadaan offline referensi vs arsitektur PWA lokal | **COMPLETED** |
| `16-state-transition-diagrams.md` | Diagram transisi state untuk presensi, patroli, insiden, dan perjalanan armada | **COMPLETED** |
| `17-evidence-register.md` | Register penomoran bukti empiris (EVD-001 s/d EVD-050) | **COMPLETED** |
| `18-open-questions.md` | Daftar keputusan arsitektural yang membutuhkan konfirmasi pemilik proyek | **COMPLETED** |
| `19-coverage-matrix.md` | Matriks cakupan level inspeksi L0 hingga L5 per modul sistem | **COMPLETED** |
| `20-phase-1-final-report.md` | Laporan kelayakan akhir Phase 1 sebelum memasuki rekonstruksi kode | **COMPLETED** |
