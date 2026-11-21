# OPERATIONAL CONTEXT ANALYSIS & IMPLEMENTATION MAPPING
## Patrol Management System — PT Berdikari Maju Selaras, Bogor

> **Dokumen Analisis Konteks Bisnis & Operasional Lapangan**  
> **Status:** Analisis Pra-Konfigurasi Sistem  
> **Tanggal:** 21 November 2026  
> **Penyusun:** Senior Business System Analyst & Production Readiness Engineer  

---

## 1. Pendahuluan

Dokumen ini menganalisis penerapan teknis dan operasional **Patrol & Facility Management System** dalam konteks operasional **PT Berdikari Maju Selaras**, berkedudukan di **Kota Bogor, Jawa Barat**. 

Prinsip utama yang diterapkan adalah memisahkan secara ketat antara **fakta yang telah terverifikasi**, **pertimbangan teknis yang rasional**, **asumsi bisnis sementara**, dan **daftar pertanyaan yang memerlukan konfirmasi langsung dari manajemen perusahaan**.

```
                ┌────────────────────────────────────────────────────────┐
                │          PT BERDIKARI MAJU SELARAS, BOGOR              │
                └──────────────────────────┬─────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐               ┌─────────────────┐
│ 1. SECURITY     │               │ 2. CLEANING     │               │ 3. DRIVER       │
│ - Perimeter Pos │               │ - Sanitasi Area │               │ - Surat Jalan   │
│ - Scan QR Code  │               │ - Foto Bukti    │               │ - Cek Odometer  │
│ - Geofence GPS  │               │ - Checklist     │               │ - Armada Kantor │
│ - Panic SOS     │               │ - Zona Bersih   │               │ - Riwayat Rute  │
└────────┬────────┘               └────────┬────────┘               └────────┬────────┘
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           ▼
                ┌────────────────────────────────────────────────────────┐
                │        COMMAND CENTER & HRIS PAYROLL BOGOR             │
                │ - Pemantauan Radar Leaflet Real-Time                   │
                │ - Validasi Geofence PostGIS Presisi                    │
                │ - Rekap Jam Kerja, Lembur, & Potongan Keterlambatan    │
                │ - Ekspor Dokumen Resmi PDF Slip Gaji & Excel           │
                └────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Analisis 4-Pilar (Fact vs Assumption Segregation)

### Pilar 1: VERIFIED FACTS (Fakta Terverifikasi)
1. **Entitas Hukum:** PT Berdikari Maju Selaras adalah badan usaha berbadan hukum Perseroan Terbatas swasta di Indonesia.
2. **Lokasi Kantor Pusat/Operasional:** Berada di Jl. Raya Sholeh Iskandar No. 22–23, RT.01/RW.09, Kelurahan Kedung Jaya, Kecamatan Tanah Sareal, Kota Bogor, Jawa Barat (Kode Pos 16164).
3. **Karakteristik Koridor Wilayah:** Jl. Raya KH Sholeh Iskandar (sering disebut Jalan Baru Bogor) merupakan koridor arteri primer kelas satu di Kota Bogor dengan lintasan jalan tol layang Bogor Ring Road (BORR), memiliki tingkat mobilitas kendaraan sangat tinggi, area perkantoran, pertokoan, pergudangan terpadu, dan fasilitas komersial.
4. **Pola Ketenagakerjaan Formal:** Perusahaan memiliki struktur formal dengan komponen penggajian terstruktur (gaji pokok, tunjangan jabatan, uang makan/konsumsi, transportasi, komunikasi, lembur, dan potongan jaminan sosial BPJS).
5. **Kebutuhan Sistem Single-Tenant:** Sistem dirancang untuk penggunaan in-house eksklusif perusahaan (tanpa multi-tenancy SaaS), mencakup 3 divisi lapangan (Satpam, Cleaning Service, Driver) serta modul HRIS Penggajian.

---

### Pilar 2: REASONABLE TECHNICAL CONSIDERATIONS (Pertimbangan Teknis Rasional)
1. **Toleransi Geofence GPS di Koridor Sholeh Iskandar:**
   - Karena area Jl. Raya Sholeh Iskandar diapit oleh flyover Tol BORR dan gedung-gedung bertingkat, pantulan sinyal GPS (*multipath effect*) dapat terjadi pada smartphone petugas di lantai dasar atau basement.
   - *Rekomendasi Teknis:* Radius geofence awal untuk Kantor Pusat Bogor disetel sebesar **75–100 meter** (bukan 10–25 meter) agar absensi swafoto petugas tidak tertolak secara salah (*false rejection*) saat akurasi GPS perangkat ponsel menurun akibat cuaca mendung/hujan khas Kota Bogor.
2. **Karakteristik Konektivitas Internet Seluler di Bogor:**
   - Wilayah Tanah Sareal tercover baik oleh operator seluler utama (Telkomsel, Indosat, XL), namun titik tertentu seperti basement parkir, bilik panel gardu listrik, atau toilet dalam berpotensi mengalami *dead-zone* (kehilangan sinyal sesaat).
   - *Rekomendasi Teknis:* Arsitektur **Offline-First PWA** (IndexedDB `offline_queue` + Service Worker) wajib dipertahankan aktif 100% sehingga satpam dan cleaning service dapat memindai QR Code pos tanpa kendala meski ponsel beralih ke mode offline.
3. **Konfigurasi Timezone Baku:**
   - Seluruh pencatatan absensi, timestamp scanning patroli, dan pencatatan insiden dikunci secara ketat pada zona waktu **WIB (Asia/Jakarta, UTC+7)**.
4. **Hierarki Geografis Tunggal vs Multi-Site:**
   - Aplikasi secara arsitektural mendukung banyak site (`sites` table), namun secara *default* perusahaan ini hanya diverifikasi memiliki **1 lokasi terbukti** (Kantor Pusat Tanah Sareal Bogor). Oleh karena itu, skema baseline sistem harus memprioritaskan 1 Site Utama terlebih dahulu, tanpa mengasumsikan keberadaan cabang-cabang lain yang belum dikonfirmasi.

---

### Pilar 3: BUSINESS ASSUMPTIONS (Asumsi Bisnis Sementara untuk Kebutuhan Demo)
*Catatan: Asumsi berikut digunakan semata-mata untuk tujuan kelengkapan data demonstrasi interaktif sistem dan diberi penanda khusus agar mudah digantikan dengan data riil setelah konfirmasi.*

1. **Titik Koordinat Referensi Kantor Utama Bogor:**
   - Asumsi koordinat kantor: `Latitude: -6.564061`, `Longitude: 106.810320` (titik referensi koridor komersial Kedung Jaya, Tanah Sareal, Kota Bogor).
2. **Pola Pembagian Jam Kerja (Shift Shift):**
   - Diasumsikan operasional keamanan 24 jam menggunakan pola 3 shift rotasi standar industri:
     - Shift Pagi: 07:00 – 15:00 WIB
     - Shift Siang: 15:00 – 23:00 WIB
     - Shift Malam: 23:00 – 07:00 WIB
     - Non-Shift (Staf & Manajemen): 08:00 – 17:00 WIB
3. **Titik Checkpoint Representatif Kantor Bogor:**
   - Untuk demonstrasi fungsionalitas, diasumsikan kantor memiliki minimal 5 pos pantau logis:
     - Pos Gerbang Masuk & Pos Jaga Depan (Jl. Sholeh Iskandar)
     - Lobby Utama & Resepsionis Lt 1
     - Ruang Arsip / Server IT
     - Tangga Darurat & Area APAR
     - Restroom & Area Sanitasi Bersama
4. **Armada & Rute Operasional Driver:**
   - Diasumsikan mobilitas driver melayani rute rutin operasional antara Kantor Bogor dengan area mitra/klien di wilayah Jabodetabek (Bogor – Jakarta Selatan / Depok / Cibinong).

---

### Pilar 4: QUESTIONS REQUIRING COMPANY CONFIRMATION (Pertanyaan Wajib Konfirmasi)
Daftar pertanyaan ini wajib diajukan kepada perwakilan manajemen PT Berdikari Maju Selaras sebelum sistem digunakan untuk operasional riil:

| No | Parameter Operasional | Pertanyaan Spesifik ke Manajemen Perusahaan | Dampak Konfigurasi Sistem |
|:--:|---|---|---|
| **1** | **Jumlah Fasilitas (Sites)** | Apakah PT Berdikari Maju Selaras saat ini mengelola fasilitas lain selain kantor di Jl. Sholeh Iskandar Bogor (misal: gudang, workshop, atau pos proyek tertentu)? | Penentuan jumlah record pada tabel `sites`. Jika hanya 1 kantor, site kedua di non-aktifkan (`is_active = false`). |
| **2** | **Koordinat Presisi Gedung** | Berapa titik koordinat presisi gerbang masuk / gedung kantor PT Berdikari Maju Selaras berdasarkan pengukuran GPS langsung di lokasi? | Nilai kolom `coordinates` PostGIS pada tabel `sites`. |
| **3** | **Radius Toleransi Geofence** | Berapa radius perimeter area kerja yang diizinkan untuk absensi karyawan (apakah 50m, 100m, atau 150m dari titik tengah gedung)? | Nilai `geofence_radius_meters` pada tabel `sites`. |
| **4** | **Struktur & Jumlah Personil** | Berapa jumlah aktual personil satpam, tenaga kebersihan, driver, dan staf pengawas yang akan didaftarkan ke sistem? | Pembuatan akun pengguna riil dan penugasan role pada tabel `users`. |
| **5** | **Nomor WhatsApp Darurat** | Nomor WhatsApp atau ID Group WhatsApp apa yang akan dijadikan tujuan otomatis alarm Panic SOS jika petugas menekan tombol darurat di lapangan? | Variabel `wa_emergency_group_id` dan konfigurasi WhatsApp Gateway Fonnte. |
| **6** | **Kebijakan & Komponen Gaji** | Apakah formula perhitungan lembur, denda keterlambatan, dan tunjangan kehadiran perusahaan mengikuti formula standar Depnaker atau memiliki ketentuan internal khusus? | Penyesuaian kalkulator penggajian pada modul `PayrollTab.tsx` dan `attendance.service.ts`. |
| **7** | **Aset Visual & Logo Resmi** | Di mana file logo resolusi tinggi PT Berdikari Maju Selaras dapat diperoleh untuk keperluan kop surat slip gaji, ID Card, dan navbar aplikasi? | Penggantian aset visual `logo.png` pada `apps/web-admin/public` dan `apps/pwa-field/public`. |

---

## 3. Pemetaan Operasional Per Divisi di Lokasi Bogor

### A. Divisi Satpam (Security Operations)
- **Tugas Utama:**
  - Presensi swafoto masuk & pulang dengan validasi radius geofence di Jl. Sholeh Iskandar.
  - Patroli rute checkpoint QR Code setiap 2 jam sekali pada pos perimeter gedung.
  - Pelaporan temuan insiden (lampu mati, pintu tidak terkunci, barang mencurigakan) disertai foto bukti.
  - Alarm Panic SOS (tahan 3 detik) yang seketika mengirim koordinat presisi ke pengawas dan membunyikan sirine di Web Admin Command Center.

### B. Divisi Kebersihan (Cleaning Service Operations)
- **Tugas Utama:**
  - Presensi kehadiran berbasis geofence.
  - Menjalankan checklist sanitasi toilet, lobi, dan koridor kerja minimal 2 kali sehari (pagi dan sore).
  - Wajib melampirkan foto kondisi sebelum (*before*) dan sesudah (*after*) pembersihan yang dikompresi otomatis di sisi browser mobile.

### C. Divisi Driver (Logistics & Fleet Operations)
- **Tugas Utama:**
  - Mengisi formulir perjalanan: pelat nomor armada, tipe kendaraan, titik asal (Kantor Sholeh Iskandar Bogor), titik tujuan, dan angka odometer awal.
  - Menyelesaikan perjalanan dengan memasukkan odometer akhir dan catatan pengantaran surat/barang.

---

## 4. Kesimpulan Kesiapan Konteks

Integrasi profil PT Berdikari Maju Selaras ke dalam sistem patroli memberikan dasar operasional yang sangat solid dan realistis. Dengan mendasarkan koordinat pada Jl. Raya Sholeh Iskandar Tanah Sareal Bogor serta menyiapkan skema offline-first untuk mengatasi dinamika sinyal seluler lokal, sistem telah siap dipetakan ke data master tanpa risiko fabrikasi identitas personil.
