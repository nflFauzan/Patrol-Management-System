# 18 — DAFTAR KEPUTUSAN ARSITEKTURAL & PERTANYAAN TERBUKA (OPEN QUESTIONS)
> **File:** `docs/reverse-engineering/phase-1/18-open-questions.md`  
> **Tahap:** Phase 1 — Deep Reverse Engineering  
> **Status:** Menunggu Konfirmasi & Keputusan Project Owner  

---

## 1. Pertanyaan Strategis Desain & Rekomendasi Arsitektur

Berikut adalah 8 poin keputusan strategis yang dirumuskan dari temuan investigasi Phase 1 untuk disahkan oleh Project Owner sebelum memasuki tahap implementasi:

---

### [OQ-01] Kebijakan Perondaan: Rute Berurutan Ketat vs Bebas (*Patrol Route Enforcement*)
- **Temuan Referensi:** Petugas Satpam dapat memindai Pos 2 sebelum Pos 1 tanpa peringatan urutan rute (*free-roaming patrol*).
- **Pilihan Desain:**
  - *Opsi A (Mengikuti Referensi):* Petugas bebas memindai checkpoint mana pun dalam site tugas mereka tanpa urutan tetap.
  - *Opsi B (Enterprise Enhanced - Rekomendasi):* Menyediakan switch per site di Web Admin: mode `Rute Berurutan (Enforced Sequence)` dengan batas jeda waktu toleransi antar pos, atau mode `Rute Bebas (Free-Roaming)`.
- **Rekomendasi Arsitektur:** **Opsi B**. Memberikan fleksibilitas bagi manajemen fasilitas pabrik/gudang yang membutuhkan jadwal inspeksi berurutan ketat.

---

### [OQ-02] Kedalaman Checklist Sanitasi Cleaning Service
- **Temuan Referensi:** Petugas kebersihan hanya memilih status global *"Bersih dan Rapi"* atau *"Perlu Tindak Lanjut"*.
- **Pilihan Desain:**
  - *Opsi A (Mengikuti Referensi):* Satu dropdown global + 1 foto bukti kebersihan.
  - *Opsi B (Enterprise Enhanced - Rekomendasi):* Menyediakan 6 sub-checklist standar per zona (lantai kering, tempat sampah bersih, sabun terisi, cermin bersih, tisu tersedia, pengharum aktif) sebelum tombol simpan aktif.
- **Rekomendasi Arsitektur:** **Opsi B**. Menjamin kontrol kualitas sanitasi tingkat tinggi pada fasilitas korporat komersial.

---

### [OQ-03] Kelengkapan Alur Perjalanan Driver (Trip End Lifecycle)
- **Temuan Referensi:** Pengujian driver Joko mencatat status `BERANGKAT`, namun form penyelesaian perjalanan belum diobservasi penutupannya.
- **Pilihan Desain:**
  - *Opsi A (Minimalis):* Driver hanya mengklik tombol *"Selesai"* tanpa validasi tambahan.
  - *Opsi B (Enterprise Enhanced - Rekomendasi):* Driver wajib mengambil foto odometer kepulangan, menginput angka kilometer akhir (sistem menghitung selisih jarak tempuh otomatis), dan opsional melampirkan foto struk BBM.
- **Rekomendasi Arsitektur:** **Opsi B**. Mencegah penyalahgunaan armada dinas korporat untuk keperluan non-operasional.

---

### [OQ-04] Kebijakan Pelanggaran Geofence Presensi (Radius Boundary Check)
- **Temuan Referensi:** Referensi tetap menyimpan presensi meskipun jarak berada di luar radius site, namun menandai modal admin dengan tulisan `LUAR RADIUS AREA`.
- **Pilihan Desain:**
  - *Opsi A (Permissive):* Tetap menerima presensi luar radius dengan badge peringatan merah di admin.
  - *Opsi B (Strict Rejection):* Menolak keras presensi (*hard block*) jika $d > \text{Radius Geofence}$ (petugas harus berada di titik fisik site).
  - *Opsi C (Approval Workflow - Rekomendasi):* Menolak secara default, kecuali petugas memilih alasan khusus *"Dinas Luar / BKO"* yang mewajibkan approval manual dari Supervisor Site.
- **Rekomendasi Arsitektur:** **Opsi C**. Menegakkan disiplin kehadiran tanpa membatasi fleksibilitas penugasan dinas luar.

---

### [OQ-05] Resolusi Timestamp Transaksi Offline pada Area Basement
- **Temuan Referensi:** Referensi gagal total saat offline. Monorepo baru kita mengimplementasikan antrean IndexedDB.
- **Pilihan Desain:**
  - *Opsi A:* Mengakui waktu lokal perangkat saat tombol scan ditekan (`clientTimestamp`).
  - *Opsi B:* Mengakui waktu server menerima paket data sinkronisasi (`serverTimestamp`).
  - *Opsi C (Hybrid Dual-Timestamp - Rekomendasi):* Menyimpan kedua timestamp di database. Waktu patroli resmi menggunakan `clientTimestamp`, namun jika selisih waktu sinkronisasi $> 2\text{ jam}$, baris data diberi flag audit *"Late Sync / High Delay"*.
- **Rekomendasi Arsitektur:** **Opsi C**. Mencegah petugas dirugikan akibat ketiadaan sinyal namun tetap memberikan jejak audit bagi manajer keamanan.

---

### [OQ-06] Saluran Notifikasi Kedaruratan Panic Button SOS
- **Temuan Referensi:** Memunculkan modal merah berkedip di Web Admin dan sirene browser audio.
- **Pilihan Desain:**
  - *Opsi A:* Hanya mengandalkan modal Web Admin.
  - *Opsi B (Omnichannel SOS - Rekomendasi):* Menggabungkan push WebSocket instan ke Command Center dengan pengiriman pesan darurat otomatis via WhatsApp Gateway korporat (Fonnte / Wablas) ke nomor PIC Site dan grup pimpinan keamanan.
- **Rekomendasi Arsitektur:** **Opsi B**. Sangat krusial karena administrator tidak selalu berada di depan layar monitor 24/7.

---

### [OQ-07] Infrastruktur Penyimpanan Media Foto (Media Retention 180 Hari)
- **Temuan Referensi:** Foto disimpan langsung pada direktori lokal PHP server (`uploads/`).
- **Pilihan Desain:**
  - *Opsi A (Local Volume Storage):* Disimpan di folder volume disk server lokal dengan background cronjob pembersihan file $> 180\text{ hari}$.
  - *Opsi B (S3-Compatible Object Storage - Rekomendasi):* Menggunakan MinIO atau AWS S3 dengan *Lifecycle Rule Expiration 180 days* otomatis tanpa beban komputasi CPU server.
- **Rekomendasi Arsitektur:** **Opsi B**. Skalabel untuk ribuan foto harian tanpa risiko server kehabisan inode atau disk space.

---

### [OQ-08] Batas Toleransi Keterlambatan (*Grace Period*) & Kompensasi Lembur
- **Pilihan Desain:**
  - Menetapkan batas toleransi keterlambatan standar korporat: **15 menit** dari jam mulai shift.
  - Menetapkan batas minimal lembur yang diakui: **minimal 60 menit** setelah jam shift berakhir dan wajib divalidasi oleh Danru pada laporan serah terima piket.
- **Rekomendasi Arsitektur:** Disahkan sebagai aturan standar di `apps/backend/src/modules/attendance`.
