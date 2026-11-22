# 13 — KATALOG ATURAN BISNIS & FORMULA MATEMATIS (BUSINESS RULES CATALOG)
> **File:** `docs/reverse-engineering/phase-1/13-business-rules-catalog.md`  
> **Tahap:** Phase 1 — Deep Reverse Engineering  
> **Sistem Acuan:** `https://patroli.site`  
> **Sistem Sasaran:** `Patrol-Management-System`  

---

## 1. Aturan Bisnis Presensi & Jam Kerja (Attendance Engine Rules)

### BR-ATT-01: Toleransi Keterlambatan (*Grace Period*)
- **Deskripsi:** Jam masuk dinas dievaluasi terhadap jam mulai shift yang terdaftar pada Master Area.
- **Formula Evaluasi:**
  $$\text{Menit Keterlambatan} = \max\left(0, \text{Waktu Check-In} - \text{Jadwal Shift Masuk}\right)$$
- **Toleransi Standar:** Jika $\text{Menit Keterlambatan} \le 15\text{ menit}$, presensi diklasifikasikan sebagai **Tepat Waktu** (*On-Time*). Jika $> 15\text{ menit}$, presensi diklasifikasikan sebagai **Terlambat** (*Late*) dengan status kode `M {jam:menit}`.

### BR-ATT-02: Penanganan Shift Lintas Hari / Malam (*Overnight Shifts*)
- **Deskripsi:** Shift malam yang melintasi tengah malam (contoh: `23:00 - 07:00` hari berikutnya).
- **Logika Sistem:**
  - Check-in dilakukan pada tanggal kalender $D$ jam `23:00`.
  - Check-out dilakukan pada tanggal kalender $D+1$ jam `07:00`.
  - Sistem mengaitkan record check-out $D+1$ ke record presensi tanggal $D$ (bukan membuat hari baru) selama jam checkout tidak melebihi batas akhir shift ditambah 4 jam buffer.

### BR-ATT-03: Denda Lupa Absen Pulang (*Missing Checkout Penalty*)
- **Deskripsi:** Petugas yang melakukan `ABSEN MASUK` namun tidak melakukan `ABSEN PULANG` hingga pergantian hari kalender.
- **Logika Matriks:** Matriks menandai hari kerja terkait dengan kode notasi **`X`**.
- **Dampak Finansial:** Memicu pemotongan denda otomatis `potongan_lupa_absen` (default: Rp 50.000 per kejadian) pada slip gaji bulanan.

---

## 2. Aturan Bisnis Geofence & Pemindaian Checkpoint (Geofence & Patrol Rules)

### BR-GEO-01: Verifikasi Batas Geofence Geospasial
- **Deskripsi:** Memastikan presensi dan pemindaian QR dilakukan di lokasi fisik fasilitas.
- **Formula Jarak Euclidean / Haversine:**
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- **Aturan Keputusan:**
  - Jika $d \le \text{Radius Geofence}$ (default 50 meter) ➔ **VALID (`🟢 DALAM RADIUS AREA`)**.
  - Jika $d > \text{Radius Geofence}$ ➔ **ANOMALI (`🔴 LUAR RADIUS AREA`)**. Pada monorepo target, presensi luar radius ditolak atau diberi tanda peringatan khusus audit.

### BR-PAT-01: Validasi Stiker QR Checkpoint
- **Deskripsi:** String payload QR code wajib mencerminkan integer ID aset yang terdaftar pada database site terkait.
- **Kasus Validasi:**
  - Jika `kode_aset` terdaftar di site yang sama dengan site penugasan petugas ➔ Buka form patroli.
  - Jika `kode_aset` terdaftar di site yang berbeda ➔ Tolak dengan pesan error *"Aset bukan milik lokasi tugas Anda"*.
  - Jika `kode_aset` tidak terdaftar di database ➔ Tolak dengan pesan error *"Kode aset tidak ditemukan"*.

### BR-PAT-02: Eskalasi Temuan Insiden (`tl = 1`)
- **Deskripsi:** Jika status patroli dipilih `tl = 1` (Perlu Tindak Lanjut):
  - Field `#keterangan` wajib diisi minimal 5 karakter deskripsi anomali.
  - Foto fisik bukti anomali wajib diunggah.
  - Counter `TEMUAN AKTIF` pada Command Center secara otomatis bertambah 1 dan memicu notifikasi peringatan supervisor.

### BR-SOS-01: Pencegahan False Alarm Tombol Darurat
- **Deskripsi:** Tombol Panic SOS wajib ditahan selama **3 detik penuh (*3000ms*)** untuk mengirim sinyal darurat ke server. Pelepasan tombol sebelum 3 detik membatalkan proses transmisi sinyal.

---

## 3. Aturan Bisnis Mesin Penggajian (Payroll Engine Rules)

### BR-PAY-01: Formula Rekapitulasi Gaji Bersih (Net Take-Home Pay)
Berdasarkan pembacaan empiris tabel gaji:
$$\text{Take Home Pay} = \text{Gapok} + \text{Tunjangan} + \text{Lembur} - \text{BPJS} - \text{Potongan Alpa} - \text{Potongan Lupa Absen}$$

Di mana:
1. $\text{Lembur} = \text{Total Jam Lembur Disetujui} \times \text{Tarif Lembur per Jam}$
2. $\text{Potongan Alpa} = \text{Jumlah Hari Mangkir (A)} \times \text{Tarif Potongan Kehadiran}$ (default Rp 150.000/hari).
3. $\text{Potongan Lupa Absen} = \text{Jumlah Hari Lupa Checkout (X)} \times \text{Tarif Denda Lupa Absen}$ (default Rp 50.000/kejadian).
4. $\text{BPJS} = \text{Tarif Premi Jaminan Kesehatan}$ (tetap bulanan).

### BR-PAY-02: Hak Cuti Resmi & Surat Sakit
- Petugas dengan status absensi `I` (Izin Resmi Disetujui) atau `S` (Sakit dengan Surat Keterangan Dokter) **TIDAK DIKENAKAN POTONGAN ALPA**. Gaji pokok dan tunjangan tetap dihitung penuh.

---

## 4. Kebijakan Retensi Media & Penyimpanan (Media Retention Policy)

### BR-MED-01: Masa Simpan Foto Bukti 180 Hari (6 Bulan)
- **Deskripsi:** Seluruh file foto swafoto absensi, foto bukti pembersihan toilet, foto odometer kendaraan driver, dan foto temuan patroli disimpan di penyimpanan file selama **180 hari**.
- **Automated Purging Worker:** Background cronjob dijalankan setiap akhir bulan untuk mem-purge berkas foto yang berumur $> 180\text{ hari}$ dari disk storage guna mencegah kehabisan kapasitas media server korporat, namun metadata teks transaksi tetap diarsipkan permanen di basis data.

---

## 5. Service Level Agreement (SLA) & Respons Darurat SOS

### BR-SLA-01: Latensi Broadcast Alarm Darurat
- **Ambang Batas Maksimal:** Pemicuan tombol SOS oleh petugas lapangan wajib diterima oleh Web Admin Command Center dalam waktu **$< 2.0\text{ detik}$** melalui koneksi WebSocket real-time.
- **Payload Notifikasi WhatsApp Gateway:** Format tautan Google Maps wajib mencantumkan koordinat presisi hingga 6 desimal (`https://maps.google.com/?q={lat},{long}`) tanpa encoding kompresi yang merusak resolusi titik.
