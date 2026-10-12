# Laporan Audit Sistem Legacy: Patroli Site (https://patroli.site/)
**Versi:** 2.0.0 (Enterprise Re-Audit Final)  
**Tanggal:** Oktober 2026  
**Konteks Proyek:** Sistem Beli Putus (*Bespoke Single-Tenant Enterprise*) untuk Satu Perusahaan  
**Target Komparasi:** Monolit PHP `patroli.site`  
**Status:** Selesai & Disetujui

---

## 1. Ringkasan Eksekutif & Konteks Bisnis

Audit ini menganalisis sistem manajemen patroli legacy `https://patroli.site/` untuk dijadikan landasan pembuatan ulang (*rewrite*) aplikasi berstandar enterprise yang akan **dibeli putus oleh satu korporasi pemilik fasilitas mandiri**. 

Sistem baru **bukan platform SaaS multi-tenant**, melainkan **software mandiri (Single-Tenant)** yang dideploy khusus di Cloud VPS milik perusahaan pembeli untuk mengelola fasilitas mereka sendiri (Kantor Pusat, Pabrik, Gudang, Kawasan Operasional) beserta 3 divisi pekerja lapangan: **Security (Satpam), Cleaning Service, dan Driver**.

---

## 2. Temuan Kritis Sistem Lama & Perbaikan pada Sistem Baru

| No | Komponen / Isu | Kondisi pada Sistem Lama (`patroli.site`) | Dampak Risiko | Solusi Arsitektur Baru (Single-Tenant) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Kebocoran Data Antar-Entitas (IDOR)** | Dropdown lokasi pada *Tracking Patroli* membocorkan ratusan nama proyek, instansi, dan aset dari basis data global ke tenant lain. | Pelanggaran kerahasiaan data fasilitas. | **Dieliminasi Total**. Sistem baru adalah *Single-Tenant Dedicated Database*. Seluruh basis data 100% hanya berisi data fasilitas internal perusahaan pembeli. |
| **2** | **Kebocoran Hash Password** | Halaman profil mobile merender string hash Bcrypt kata sandi pengguna langsung di atribut HTML `<input type="hidden">`. | Rawan pencurian kredensial (*offline cracking*). | Backend NestJS menggunakan DTO serializer dengan `@Exclude()` pada `password_hash`, hash tidak pernah dikirim ke browser/client. |
| **3** | **DOM Cross-Site Scripting (XSS)** | Skrip cetak menggabungkan variabel teks mentah ke `document.write()` tanpa enkoding karakter HTML. | Eksekusi skrip berbahaya di sesi browser. | Next.js & React PWA secara bawaan melakukan sanitasi entitas HTML secara otomatis (*anti-XSS by design*). |
| **4** | **Format QR Code Checkpoint Lemah** | Generator QR hanya membuat barcode berisi ID integer polos (misal: `"1012"`). | Petugas dapat memalsukan scan jika mencetak kode sendiri tanpa ke lokasi. | QR Code Checkpoint di-hash menggunakan tanda tangan kriptografis `HMAC-SHA256(checkpoint_id, secret_salt)` + validasi koordinat GPS realtime. |
| **5** | **Pemblokiran Perangkat iOS** | Halaman presensi mobile memblokir pengguna iPhone/iPad (*"Gunakan perangkat Android!"*) karena script WebRTC kamera usang. | Petugas ber-iPhone tidak bisa bekerja. | PWA modern menggunakan MediaDevices API standar HTML5 dengan fallback universal yang berjalan lancar di Android Chrome & iOS Safari. |
| **6** | **Alarm Darurat Lambat (Tidak Realtime)** | Tombol darurat hanya menyimpan baris data ke database; admin baru melihat saat DataTables me-refresh halaman. | Respon darurat lambat saat terjadi bahaya/insiden. | Menggunakan **WebSocket (Socket.io) Realtime** (sirine bunyi seketika di Command Center) + otomatis kirim notifikasi darurat ke **Grup WhatsApp Pengawas**. |
| **7** | **Penyimpanan Gambar Tidak Efisien** | Foto dikirim sebagai Base64 string raksasa di dalam body form HTTP POST. | Payload berat, server lambat, database membengkak. | PWA mengompresi foto & mengunggah langsung ke S3 Object Storage via presigned URL dengan kebijakan retensi 6 bulan (180 hari). |

---

## 3. Evaluasi Fitur Domain: Apa yang Dipertahankan & Ditingkatkan?

1. **State Machine Presensi Dinamis (Dipertahankan & Disempurnakan)**:
   - Pola perpindahan tombol dashboard petugas lapangan (dari *Belum Absen* $\rightarrow$ tombol hijau **ABSEN MASUK**, kemudian setelah masuk $\rightarrow$ berubah menjadi **INPUT KEGIATAN** dan **ABSEN PULANG**) terbukti sangat ramah pengguna di lapangan dan akan diimplementasikan secara elegan di React PWA.
2. **Cakupan 3 Divisi Fasilitas (Dipertahankan Penuh)**:
   - Modul operasional tetap mencakup **Security**, **Cleaning Service**, dan **Driver**.
3. **Pemisahan dari Modul Penggajian Manual (Disederhanakan ke Rekap HRIS)**:
   - Sistem lama menghitung gaji manual dengan potongan statis. Karena perusahaan pembeli sudah memiliki sistem HR/Payroll tersendiri, sistem baru berfokus menyajikan **Rekapitulasi Jam Kerja, Lembur, dan Kehadiran Terverifikasi Geofence** yang siap diekspor ke Excel/CSV untuk tim HRD.
