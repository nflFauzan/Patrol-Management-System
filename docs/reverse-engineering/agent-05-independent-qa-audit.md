# AGENT 05 — AUDIT QA INDEPENDEN & PENCEGAHAN HALUSINASI
> **File:** `docs/reverse-engineering/agent-05-independent-qa-audit.md`  
> **Auditor:** Agent 5 — Independent QA & Hallucination Auditor  
> **Peran:** Auditor Kritis & Penguji Independen (*Adversarial Reviewer*)  
> **Target Aplikasi Referensi:** `https://patroli.site`  
> **Prinsip Utama:** *Skeptisisme Konstruktif — Menentang klaim tanpa bukti nyata dan mengungkap blind spots investigasi.*  

---

## 1. Ringkasan Eksekutif QA Independen

Sebagai auditor independen, Agent 5 bertugas menguji silang seluruh kesimpulan yang diajukan oleh Agent 1 hingga Agent 4. Kami menolak menerima klaim kesuksesan hanya berdasarkan pengamatan visual sepintas. 

Secara keseluruhan, dataset operasional pada `patroli.site` memang telah berhasil diaktifkan dari kondisi nol menjadi berstatus aktif (5 hadir, 4 kegiatan hari ini, 1 temuan insiden aktif, 7 checkpoint, dan 2 site). Namun demikian, **terdapat sejumlah keterbatasan kritis, alur yang baru diuji sebagian (*partial tests*), dan potensi bias dataset kecil (*small dataset bias*)** yang wajib diungkap secara transparan sebelum Reverse Engineering penuh atau implementasi dimulai.

---

## 2. Audit Kritis terhadap Klaim Agent 1 s/d Agent 4

### 2.1 Evaluasi Klaim Agent 1 (Data & Master Structure)
- **Klaim yang Divalidasi:** Relasi antara Area, Checkpoint, dan Personel memang terbukti mengikat pada saat transaksi submit.
- **Kritik & Blind Spot Teridentifikasi:**
  1. *Small Dataset Bias:* Seluruh pengujian dilakukan pada 1 perusahaan (`ai`), 2 Area (`Sentul` dan `Cakung`), dan 5 akun. Perilaku sistem pada saat menangani ratusan personil, puluhan site, atau duplikasi nama pos antar site belum pernah diuji pada beban riil.
  2. *Dropdown Jadwal Shift Belum Dinamis:* Pada modal tambah Area, terdapat 10 dropdown shift (`shift_1` s/d `shift_10`). Tidak jelas apakah sistem mendukung penambahan shift ke-11 jika sebuah site operasional korporat memerlukan jadwal shift rotasi yang lebih kompleks.
  3. *Import File Excel Checkpoint & Personil Belum Diuji End-to-End:* Halaman `import-aset.php` dan `import-personil.php` hanya diamati form upload-nya (`L2`), namun belum pernah diuji mengunggah berkas XLSX sungguhan dengan 50 baris untuk memverifikasi validasi parsing backend jika ada baris data korup.

### 2.2 Evaluasi Klaim Agent 2 (Security Workflow)
- **Klaim yang Divalidasi:** Scan QR untuk Pos 1 (Aman) dan Pos 2 (Temuan Insiden) terbukti sukses dan memicu pembaruan di Web Admin.
- **Kritik & Blind Spot Teridentifikasi:**
  1. *Alur Tindak Lanjut Temuan Baru Berhenti di Pelaporan:* Agus Pratama berhasil melaporkan insiden lampu padam di Pos 2 (`tl = 1`), dan tombol `TINDAK LANJUTI TEMUAN` (`tl.php`) muncul di admin. Namun, siklus penyelesaiannya (resolusi insiden, input tindakan perbaikan oleh teknisi, dan pemadaman status insiden) belum dieksekusi hingga counter kembali ke 0.
  2. *Tidak Adanya Enforced Sequence (Rute Wajib):* Petugas dapat memindai Pos 2 sebelum Pos 1 tanpa ada peringatan urutan rute. Ini membuktikan bahwa sistem referensi tidak memiliki validasi state rute berurutan (sequential route constraint).
  3. *Klaim Offline Belum Terbukti:* Portal referensi gagal memproses form jika koneksi internet terputus pada saat submit, membuktikan bahwa aplikasi referensi adalah PWA *wrapper online*, bukan offline-first architecture.

### 2.3 Evaluasi Klaim Agent 3 (Cleaning, Driver, Staff)
- **Klaim yang Divalidasi:** Transaksi Cleaning Service dan Driver berhasil masuk ke tabel laporan masing-masing.
- **Kritik & Blind Spot Teridentifikasi:**
  1. *Perjalanan Driver Baru Separuh Jalan (Half-Lifecycle):* Joko Wahyudi baru berstatus `BERANGKAT`. Transaksi belum pernah ditutup dengan alur `SELESAI PERJALANAN`, penginputan odometer kepulangan, atau kalkulasi jam perjalanan efektif.
  2. *Staf Operasional Terblokir Total (BLOCKED):* Karena limit kuota 5/5 lisensi SaaS, alur staf operasional tidak pernah diuji secara interaktif dari sudut pandang user karyawan staf.
  3. *Checklist Cleaning Masih Bersifat Monolitik:* Petugas Cleaning memilih "Bersih dan Rapi" secara umum, namun tidak ada sub-checklist per item sanitasi (misal: sabun cuci tangan terisi [v], tisu toilet ada [v], lantai kering [v]).

### 2.4 Evaluasi Klaim Agent 4 (Admin & Reporting)
- **Klaim yang Divalidasi:** Formula payroll Danru Budi ($4.500.000 + 500.000 - 100.000 - 50.000 = 4.850.000$) terbukti konsisten dengan tabel rincian gaji.
- **Kritik & Blind Spot Teridentifikasi:**
  1. *Potongan Lembur dan Keterlambatan Belum Teruji Kasus Nyata:* Nilai lembur pada data uji bernilai 0 jam dan menit keterlambatan melebihi batas toleransi belum pernah diuji dampaknya terhadap pemotongan gaji secara matematis.
  2. *Belum Ada Pengujian Siklus Absen Pulang (Checkout):* Kelima karyawan masih berstatus masuk tanpa checkout. Meskipun matriks menandai dengan `X` (lupa absen), perilaku perhitungan jam kerja efektif jika karyawan checkout tepat waktu (misal setelah 8 jam) belum pernah diobservasi langsung pada payroll slip.

---

## 3. Matriks Cakupan Eksplorasi (Coverage Level Matrix)

Berikut adalah status cakupan pengujian aktual per modul pada sistem referensi:

| Modul / Komponen | Level Cakupan | Status Bukti | Catatan QA Independen |
|:---|:---:|:---|:---|
| **Login Dual Gate** | `L5` | **TESTED & VERIFIED** | Diuji dengan akun Admin dan seluruh 5 akun karyawan |
| **Master Area (CRUD)** | `L5` | **TESTED & VERIFIED** | Tambah area, koordinat GPS, edit, hapus area modal |
| **Master Checkpoint (CRUD)**| `L5` | **TESTED & VERIFIED** | Tambah checkpoint Security & Cleaning, cetak stiker QR |
| **Master Personil & Gaji** | `L5` | **TESTED & VERIFIED** | Tambah personil, update password MD5, cetak ID Card |
| **Presensi Masuk (Check-in)**| `L5` | **TESTED & VERIFIED** | GPS geofence, swafoto, alasan piket |
| **Presensi Pulang (Check-out)**| `L2` | **PARTIAL (UNTESTED)**| Form diamati, belum dieksekusi transaksi checkout riil |
| **Panic Button SOS** | `L5` | **TESTED & VERIFIED** | Long press 3s, Leaflet map, disable alarm resolution |
| **Patroli Satpam (Aman)** | `L5` | **TESTED & VERIFIED** | Scan QR 1052, status 0, laporan security terisi |
| **Patroli Satpam (Insiden)**| `L4` | **PARTIAL (IN PROGRESS)**| Scan QR 1062, status 1, temuan aktif 1, belum ditutup |
| **Checklist Sanitasi CS** | `L5` | **TESTED & VERIFIED** | Scan QR 1053, status 0, laporan cleaning terisi |
| **Perjalanan Driver (Start)**| `L4` | **PARTIAL (IN PROGRESS)**| Input kendaraan, berangkat aktif, belum selesai |
| **Perjalanan Driver (End)** | `L1` | **UNTESTED** | Belum diuji form penyelesaian trip |
| **Staf Operasional** | `L1` | **BLOCKED** | Terkendala kuota lisensi tenant 5/5 |
| **Rekapitulasi Gaji** | `L4` | **TESTED & VERIFIED** | Formula terbukti untuk kasus lupa absen, lembur belum |
| **Ekspor Laporan PDF/XLS** | `L3` | **TESTED** | 4 Wizard teruji alur submit dan cascading dropdown |
| **Offline Synchronization** | `L1` | **FAILED IN REFERENCE**| Tidak didukung di referensi, wajib di monorepo kita |

---

## 4. Daftar Pertanyaan Kunci Sebelum Implementasi (Open Questions)

Sebelum arsitektur monorepo lokal difinalisasi, 7 pertanyaan rekayasa berikut wajib diputuskan bersama project owner:

1. **Aturan Rute Patroli:** Apakah petugas Satpam diperbolehkan memindai checkpoint secara acak (*free-roaming patrol*), atau sistem harus memaksakan urutan rute berurutan (*strict sequential route*) dengan batas toleransi waktu per pos?
2. **Detail Checklist Sanitasi Cleaning:** Apakah Cleaning Service cukup memilih opsi global *"Bersih dan Rapi"*, atau diperlukan sub-checklist interaktif per ruangan (misal: cek kran, cek sabun, cek pengering)?
3. **Penyelesaian Perjalanan Driver:** Apakah penyelesaian perjalanan Driver wajib menyertakan foto odometer akhir dan penghitungan otomatis jarak tempuh (kilometer) vs konsumsi BBM?
4. **Logika Overtime Shift Malam:** Bagaimana formula pasti pemisahan jam kerja reguler dan jam lembur untuk shift lintas hari (misal masuk 23:00 pulang 07:00)?
5. **Media Retention Policy (180 Hari):** Bagaimana strategi penyimpanan foto swafoto dan bukti temuan—apakah disimpan di local object storage (MinIO/S3) dengan cronjob auto-purge setelah 180 hari?
6. **Integrasi WhatsApp Gateway SOS:** Gateway WhatsApp mana yang akan digunakan untuk mem-broadcast link Google Maps darurat saat tombol Panic SOS ditekan (Fonnte, Wablas, atau Twilio)?
7. **Offline Sync Conflict Resolution:** Jika petugas melakukan patroli offline di area basement tanpa sinyal dan baru tersinkronisasi 2 jam kemudian, timestamp mana yang diakui sebagai waktu resmi patroli (timestamp lokal perangkat atau server timestamp)?

---

## 5. Kesimpulan Agent 5
Aplikasi referensi telah berhasil diinvestigasi hingga ke akar teknisnya. Kami mengonfirmasi bahwa **dataset telah cukup untuk memulai penyusunan arsitektur dan spesifikasi rekayasa, namun implementasi tidak boleh meniru keterbatasan referensi (seperti ketiadaan offline sync dan batasan kuota SaaS).**
