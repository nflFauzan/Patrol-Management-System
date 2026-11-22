# KERANGKA KERJA PENCEGAHAN HALUSINASI & REGISTER KEPUTUSAN
> **File:** `docs/reverse-engineering/HALLUCINATION-PREVENTION.md`  
> **Tujuan:** Menjamin integritas ilmiah dan empiris seluruh temuan rekayasa balik.  
> **Prinsip Utama:** *We do not reverse engineer what we assume the reference system does. We reverse engineer what we can observe, test, and prove.*  

---

## 1. 11 Aturan Emas Anti-Halusinasi (Immutable Rules)

Setiap kontributor, AI Agent, dan engineer dalam proyek ini **WAJIB MEMATUHI TANPA PENGECUALIAN** 11 aturan berikut:

1. **Dilarang Mengarang Field:** Jangan pernah menambahkan field pada skema hanya karena terdengar umum (*common practice*) tanpa pernah melihat field tersebut pada DOM form atau response API referensi.
2. **Dilarang Mengarang Aturan Bisnis:** Jangan membuat aturan validasi (misal: "jarak maksimal patroli 10 meter") jika sistem referensi terbukti menggunakan toleransi 50 meter.
3. **Dilarang Mengarang Role / Jabatan:** Role yang diakui dari referensi hanyalah role yang terbukti ada di dropdown posisi/jabatan (`Security`: Anggota, Komandan, Chief; `Cleaning Service`; `Driver`; `Staff Operasional`; `Admin`).
4. **Dilarang Mengarang Hak Akses (Permission):** Perbedaan hak akses harus diverifikasi melalui pengujian login aktual per role akun.
5. **Dilarang Mengarang Status Transaksi:** Status transaksi yang dicatat hanyalah status yang muncul di database / badge tabel (misal: `Situasi Aman Terkendali`, `Perlu Tindak Lanjut`, `Bersih dan Rapi`, `BERANGKAT`, `SELESAI`).
6. **Dilarang Mengarang Formula:** Formula matematis (seperti kalkulasi gaji, lembur, dan keterlambatan) harus diverifikasi perhitungannya terhadap angka riil yang dihasilkan oleh sistem referensi.
7. **Dilarang Mengarang Alur Kerja (Workflow):** Workflow operasional harus mencerminkan urutan halaman dan aksi yang benar-benar dialami oleh pengguna di aplikasi.
8. **Dilarang Menyimpulkan Relasi Tanpa Bukti:** Jangan menyimpulkan relasi Foreign Key hanya dari kesamaan nama string; buktikan bahwa perubahan pada data induk secara langsung memengaruhi data transaksi anak.
9. **Dilarang Menganggap UI yang Belum Ditemukan sebagai Fitur yang Tidak Ada:** Jika sebuah fitur tidak terlihat di menu, tandai sebagai `UNVERIFIED` atau `NOT OBSERVED`, bukan mengklaim sistem tidak memilikinya.
10. **Dilarang Menganggap Fitur di Menu Pasti Berfungsi:** Keberadaan tombol atau nama menu hanya memenuhi level `L0`. Fitur baru dianggap berfungsi jika telah melalui level `L3` (diuji) dan `L4` (diverifikasi).
11. **Dilarang Menyamakan Perilaku Referensi dengan Kebutuhan Proyek Tanpa Validasi:** Referensi adalah acuan fungsional, tetapi kebutuhan korporat kita adalah **Single-Tenant In-House Enterprise Beli Putus**. Keterbatasan SaaS (seperti batasan kuota 5 akun atau ketiadaan offline sync) harus disempurnakan, bukan ditiru kelemahannya.

---

## 2. Register Keputusan Rekayasa Balik (Decision Register)

Berikut adalah register resmi seluruh keputusan arsitektural dan fungsional yang diambil berdasarkan bukti empiris:

### [DEC-01] Penentuan Arsitektur Multi-Tenancy vs Single-Tenant
- **Deskripsi:** Menetapkan arsitektur database target untuk tidak menggunakan multi-tenancy SaaS.
- **Evidence:** Pada referensi `patroli.site`, terdapat pembatasan lisensi 5 user per perusahaan (`ai`) dan tombol merah limit kuota. Kebutuhan produk kita di `AGENTS.md` menyatakan sistem adalah Beli Putus untuk 1 korporasi.
- **Classification:** **TESTED & INFERRED**
- **Confidence:** **ABSOLUTE (100%)**
- **Impact:** Architectural & Database. Tidak ada kolom `tenant_id` dan tabel organisasi bertingkat; hierarki menggunakan **Pusat ➔ Fasilitas / Site ➔ Divisi ➔ Pos/Checkpoint**.
- **Open Question:** Tidak ada (Sesuai SOP wajib `AGENTS.md`).

---

### [DEC-02] Format Payload Stiker QR Code Checkpoint
- **Deskripsi:** Menentukan payload data yang di-encode ke dalam QR Code fisik di lapangan.
- **Evidence:** Inspeksi halaman `cetak-aset.php?kode_aset=1052` membuktikan bahwa generator QR stiker hanya memuat string numerik integer (misal `"1052"`). Saat discan, input `#result` mengirim nilai integer ini ke `cek.php`.
- **Classification:** **TESTED & VERIFIED**
- **Confidence:** **ABSOLUTE (100%)**
- **Impact:** UI, PWA Scanner, Database.
- **Interpretasi Ganda & Resolusi:**
  - *Interpretasi A:* Menggunakan integer ID auto-increment seperti referensi (mudah discan, namun rentan ditebak).
  - *Interpretasi B:* Menggunakan string alfanumerik berkode area (misal `SENTUL-POS1-1052`) atau UUID.
  - *Resolusi:* Monorepo lokal mendukung pencarian ganda: kolom `code: string` (contoh `"1052"` atau `"CP-1052"`) untuk scan QR instan dan kolom `id: uuid` sebagai primary key internal.

---

### [DEC-03] Formula Perhitungan Payroll & Denda Lupa Absen
- **Deskripsi:** Menetapkan rumus rekapitulasi penggajian personil operasional.
- **Evidence:** Record Danru Budi Santoso di tabel gaji membuktikan: Gapok Rp 4.500.000 + Tunjangan Rp 500.000 - BPJS Rp 100.000 - Denda Lupa Absen Pulang Rp 50.000 = Gaji Diterima Rp 4.850.000.
- **Classification:** **TESTED & VERIFIED**
- **Confidence:** **HIGH (95%)**
- **Impact:** Backend Payroll Service & Slip Gaji A4.
- **Open Question:** Pemotongan lembur dan alpa telah memiliki kolom tarif di master personil, namun perlu validasi batas toleransi menit keterlambatan (*grace period*, misal toleransi 15 menit).

---

### [DEC-04] Alur Laporan Insiden Temuan Patroli (`tl = 1`)
- **Deskripsi:** Menangani pemisahan antara patroli normal dan temuan insiden.
- **Evidence:** Pada `cek.php`, memilih `tl = 1` mewajibkan pengisian `#keterangan` dan memunculkan badge merah `PERLU TINDAK LANJUT` di laporan serta menambah angka di widget `TEMUAN AKTIF`.
- **Classification:** **TESTED & VERIFIED**
- **Confidence:** **ABSOLUTE (100%)**
- **Impact:** Backend Patrol Module, Web Admin Dashboard, PWA Scanner.
- **Open Question:** Perlu diverifikasi alur penutupan insiden (resolusi temuan oleh Danru/Chief) hingga status kembali ke normal.

---

### [DEC-05] Mekanisme Panic Button SOS & False Alarm Prevention
- **Deskripsi:** Tombol darurat wajib ditahan selama 3 detik untuk mencegah pemicuan tidak disengaja.
- **Evidence:** DOM dan skrip `xxxxx_xxxxxxxx.php` pada PWA referensi menggunakan listener timer tahan 3000ms sebelum request dikirim ke backend.
- **Classification:** **TESTED & VERIFIED**
- **Confidence:** **ABSOLUTE (100%)**
- **Impact:** PWA UI & WebSocket Alerting Service.

---

### [DEC-06] Offline Capability & Data Synchronization
- **Deskripsi:** Menyediakan kemampuan patroli offline di area basement tanpa sinyal.
- **Evidence:** Pengujian pemutusan koneksi internet pada aplikasi referensi menunjukkan kegagalan transaksi (error browser default). Referensi tidak mendukung offline-first.
- **Classification:** **OBSERVED (LIMITATION OF REFERENCE)**
- **Confidence:** **ABSOLUTE (100%)**
- **Impact:** PWA Architecture. Monorepo lokal **TIDAK MENIRU KELEMAHAN INI**, melainkan wajib mengimplementasikan IndexedDB offline queue + Workbox Service Worker sesuai standar PWA modern.
- **Open Question:** Kebijakan resolusi konflik timestamp saat data disinkronkan ke backend (menggunakan waktu lokal perangkat petugas atau waktu terima server).

---

## 3. Protokol Verifikasi Keputusan

Sebelum sebuah keputusan rekayasa balik disahkan menjadi kode sumber:
1. Wajib memiliki rujukan berkas bukti tangkapan layar atau log network Playwright.
2. Wajib ditinjau oleh Main Orchestrator dan QA Auditor.
3. Jika terdapat asumsi tanpa bukti, keputusan wajib diberi tag `[REQUIRES_OWNER_CONFIRMATION]`.
