# 16 — DIAGRAM TRANSISI STATE TRANSAKSI OPERASIONAL (STATE TRANSITION DIAGRAMS)
> **File:** `docs/reverse-engineering/phase-1/16-state-transition-diagrams.md`  
> **Tahap:** Phase 1 — Deep Reverse Engineering  
> **Sistem Acuan:** `https://patroli.site`  
> **Prinsip Utama:** *Formal State Machines — Mendefinisikan status transisi siklus hidup data.*  

---

## 1. State Machine Autentikasi & Sesi Karyawan

```mermaid
stateDiagram-v2
    [*] --> UNAUTHENTICATED: Buka Aplikasi
    UNAUTHENTICATED --> AUTHENTICATING: Submit Kredensial di /login.php
    
    AUTHENTICATING --> UNAUTHENTICATED: Kredensial Salah (Alert: Username/Password Salah)
    AUTHENTICATING --> ADMIN_SESSION: Role SuperAdmin / Admin Area
    AUTHENTICATING --> WORKER_SESSION: Role Security / Cleaning / Driver / Staff
    
    ADMIN_SESSION --> [*]: Logout / Sesi Expired
    WORKER_SESSION --> [*]: Logout / Sesi Expired
```

---

## 2. State Machine Siklus Presensi Harian (Attendance Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> UNATTENDED: Awal Hari Kalender (00:00)
    
    UNATTENDED --> CHECKED_IN: Submit Absen Masuk (GPS Valid + Swafoto)
    UNATTENDED --> ON_LEAVE: Submit Izin / Sakit (status_absen = 3)
    UNATTENDED --> ALPA: Melewati Pergantian Hari Tanpa Presensi
    
    CHECKED_IN --> ACTIVE_DUTY: Tombol Kegiatan Operasional Terbuka
    ACTIVE_DUTY --> CHECKED_OUT: Submit Absen Pulang (Checkout Berhasil)
    ACTIVE_DUTY --> FORGOTTEN_CHECKOUT: Pergantian Hari Sebelum Checkout (Notasi X)
    
    CHECKED_OUT --> [*]: Siklus Harian Selesai (Jam Normal)
    FORGOTTEN_CHECKOUT --> [*]: Dikenakan Denda Lupa Absen di Payroll
    ON_LEAVE --> [*]: Cuti Sah (Tanpa Potongan Alpa)
    ALPA --> [*]: Dikenakan Potongan Alpa di Payroll
```

---

## 3. State Machine Patroli & Eskalasi Insiden (Patrol & Incident Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> IDLE: Petugas Menuju Titik Pos
    IDLE --> SCANNING: Buka Menu Input Kegiatan (Kamera Aktif)
    
    SCANNING --> INVALID_ASSET: Scan QR Tidak Dikenal (Error: Kode Tidak Ditemukan)
    INVALID_ASSET --> SCANNING: Reset Kamera
    
    SCANNING --> FORM_READY: Scan QR Sah (ID = 1052 / 1062)
    
    FORM_READY --> LOGGED_NORMAL: Pilih "Aman Terkendali" (tl = 0) + Foto ➔ Submit
    FORM_READY --> REPORTED_INCIDENT: Pilih "Perlu Tindak Lanjut" (tl = 1) + Deskripsi + Foto ➔ Submit
    
    LOGGED_NORMAL --> [*]: Log Patroli Hijau Selesai
    
    REPORTED_INCIDENT --> COMMAND_ALERT: Counter "TEMUAN AKTIF" Naik di Web Admin
    COMMAND_ALERT --> MITIGATION_IN_PROGRESS: Supervisor Buka Modal Tindak Lanjut (#myModaltl)
    MITIGATION_IN_PROGRESS --> RESOLVED: Teknisi Submit Form Solusi & Foto Perbaikan
    RESOLVED --> [*]: Temuan Aktif Berkurang, Status Normal
```

---

## 4. State Machine Perjalanan Armada Driver (Driver Trip Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> STANDBY: Driver Sudah Absen Masuk
    STANDBY --> BERANGKAT: Submit Mulai Perjalanan (Tipe, Nopol, Tujuan, Odometer Awal)
    
    BERANGKAT --> IN_TRANSIT: Armada Bergerak Menuju Tujuan
    IN_TRANSIT --> SELESAI: Tiba Kembali ➔ Submit Selesai (Foto Odometer Akhir, GPS Tiba)
    IN_TRANSIT --> DIBATALKAN: Pembatalan Perjalanan oleh Manajemen
    
    SELESAI --> [*]: Counter "PERJALANAN SELESAI" Naik di Dashboard
    DIBATALKAN --> [*]: Log Dicatat Tanpa Menghitung Selesai
```

---

## 5. State Machine Kedaruratan Panic Button SOS (SOS Event Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> ARMED: Petugas Membuka Menu SOS (Tombol Merah Siap)
    ARMED --> ARMED: Klik Singkat < 3 Detik (Dibatalkan / Anti-False Alarm)
    
    ARMED --> TRIGGERED: Tahan Tombol Penuh 3000ms
    TRIGGERED --> BROADCASTING: Kirim Koordinat GPS ke /insert-panic.php
    
    BROADCASTING --> ACTIVE_ALARM: Web Admin Modal Berkedip (#myModalpan) + Sirene
    ACTIVE_ALARM --> DISPATCHED: Tim Keamanan / Danru Menuju Koordinat Petugas
    
    DISPATCHED --> SILENCED: Admin Tekan "Padamkan Alarm" (update_status_alarm.php)
    SILENCED --> [*]: Log Kedaruratan Diarsipkan di Tabel Emergency
```

---

## 6. State Machine Siklus Penggajian Bulanan (Payroll Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> DRAFT_PERIOD: Awal Bulan Baru (Konfigurasi Tarif Melekat di Personel)
    DRAFT_PERIOD --> AGGREGATING: Worker Menghitung Presensi, Lembur, Alpa, & Lupa Absen
    
    AGGREGATING --> PREVIEW_READY: Tabel Gaji Terisi Otomatis di Web Admin (/gaji)
    PREVIEW_READY --> HR_REVIEW: HR / Manajemen Memeriksa Rincian Slip Gaji Karyawan
    
    HR_REVIEW --> ADJUSTED: Ada Koreksi Manual Jam Lembur / Surat Dokter
    ADJUSTED --> PREVIEW_READY
    
    HR_REVIEW --> APPROVED: Gaji Disahkan oleh Manajemen
    APPROVED --> PAID: Cetak Slip Gaji A4 & Transfer Rekening Karyawan
    PAID --> [*]: Periode Penggajian Ditutup Permanen
```
