# Matriks Pengujian End-to-End (E2E Test Matrix)

> **Proyek:** Patrol & Facility Management System  
> **Tahap:** Data Population & Operational Environment Validation  
> **Standar Pengujian:** Playwright Browser Automation (Mode Visible, slowMo 250ms)  
> **Tanggal Audit:** 22 November 2026  

---

## 1. Matriks Pengujian End-to-End Menyeluruh

| Test ID | Divisi / Aktor | Skenario Alur Pengujian | Pre-kondisi | Input & Aksi | Hasil Aktual yang Divalidasi | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **E2E-01** | Security (`sec_agus`) | Presensi Masuk (Check-in) | Sesi aktif, belum absen | Pilih alasan, ambil GPS & swafoto | Record masuk tercatat, status dashboard Hadir bertambah | **PASS** |
| **E2E-02** | Security (`sec_agus`) | Patroli Pos 1 (Kondisi Aman) | Sudah check-in | Scan QR 1052, pilih status 0 (Aman) | Laporan Security terisi badge hijau, tidak ada temuan | **PASS** |
| **E2E-03** | Security (`sec_agus`) | Patroli Pos 2 (Temuan Insiden) | Sudah check-in | Scan QR 1062, status 1, input teks insiden | Laporan terisi badge merah, Dashboard Temuan Aktif = 1 | **PASS** |
| **E2E-04** | Cleaning (`clean_siti`) | Presensi Masuk (Check-in) | Sesi aktif, belum absen | Pilih alasan, ambil GPS & swafoto | Record masuk tercatat, menu kegiatan aktif | **PASS** |
| **E2E-05** | Cleaning (`clean_siti`) | Checklist Sanitasi Toilet Lt 1 | Sudah check-in | Scan QR 1053, pilih status 0 (Bersih & Rapi) | Laporan Cleaning terisi (sebelumnya No Data Available) | **PASS** |
| **E2E-06** | Driver (`driver_joko`) | Presensi Masuk (Check-in) | Sesi aktif, belum absen | Pilih alasan, ambil GPS & swafoto | Menu Mulai Perjalanan terbuka | **PASS** |
| **E2E-07** | Driver (`driver_joko`) | Mulai Perjalanan Armada | Sudah check-in | Input tipe kendaraan, nopol, tujuan Cakung | Laporan Driver terisi status Berangkat (sebelumnya No Data) | **PASS** |
| **E2E-08** | Danru (`danru_budi`) | Presensi Masuk Komandan | Akun terdaftar | Check-in piket rutin | Record masuk tercatat, hadir bertambah | **PASS** |
| **E2E-09** | Chief (`chief_hendra`) | Presensi Masuk Chief | Akun terdaftar | Check-in piket rutin | Record masuk tercatat, total hadir 5 (100%) | **PASS** |
| **E2E-10** | Admin (`nun`) | Rekonsiliasi Command Center | Seluruh flow tereksekusi | Buka Dashboard `/index.php` | 5 Hadir, 4 Kegiatan, 1 Temuan, 7 Checkpoint | **PASS** |
| **E2E-11** | Admin (`nun`) | Verifikasi Laporan & Filter | Data telah masuk | Buka seluruh menu laporan | Seluruh laporan menampilkan data valid sesuai filter | **PASS** |

---

## 2. Parameter Keandalan & Toleransi Pengujian

- **Eksekusi Terlihat (*Visible Browser*):** Seluruh rangkaian pengujian di atas telah dijalankan dengan browser terlihat (`headless: false`, `slowMo: 250ms`) sehingga pergerakan kursor, pengisian form, dan transisi halaman dapat disaksikan langsung di layar monitor.
- **Ketahanan Jaringan:** Delay jaringan dan rendering dinamis diakomodasi dengan `waitForLoadState('networkidle')` dan toleransi respons 3000ms.
- **Integritas Database:** Transaksi divalidasi dua arah: pertama melalui halaman konfirmasi karyawan lapangan, kedua melalui tabel data di sisi Web Admin.
