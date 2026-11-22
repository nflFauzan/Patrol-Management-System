# 17 — REGISTER BUKTI EMPIRIS REKAYASA BALIK (EVIDENCE REGISTER)
> **File:** `docs/reverse-engineering/phase-1/17-evidence-register.md`  
> **Tahap:** Phase 1 — Deep Reverse Engineering  
> **Sistem Acuan:** `https://patroli.site`  
> **Prinsip Utama:** *Full Traceability — Setiap temuan memiliki rujukan artefak nyata.*  

---

## 1. Tabel Master Register Bukti Empiris (EVD-001 s/d EVD-030)

| Evidence ID | Modul Sistem | Halaman / Fitur | URL Endpoint | Role Penguji | Langkah Observasi / Pengujian | Bukti Artefak / Tangkapan Layar | Hasil Aktual Terobservasi | Klasifikasi | Tingkat Keyakinan |
|:---:|:---|:---|:---|:---:|:---|:---|:---|:---:|:---:|
| **EVD-001** | Autentikasi | Login Super Admin | `/login.php` | `ADMIN_SUPER` | Input user `nun` & sandi, submit form | `02_admin_dashboard.png` | Berhasil redirect ke Command Center `/index.php` | **TESTED** | Absolute (100%) |
| **EVD-002** | Autentikasi | Login Dispatcher | `/login.php` | `SECURITY` | Input user `sec_agus` & sandi, submit | `screenshot-mobile-sec_agus.png` | Otomatis di-redirect ke `/validasi-patroli/index.php` | **TESTED** | Absolute (100%) |
| **EVD-003** | Master Data | Pendaftaran Area | `/xxxx_xxxxxxx` | `ADMIN_SUPER` | Buka modal tambah area, isi koordinat Cakung | `04_modal_tambah_area.png` | Area `GUDANG LOGISTIK CAKUNG` tersimpan di DB | **TESTED** | Absolute (100%) |
| **EVD-004** | Master Data | Konfigurasi Shift Area | `/area_edit.php` | `ADMIN_SUPER` | Inspeksi form edit area, periksa 10 slot shift | `05_edit_area.png` | Ditemukan 10 pasang input jam shift masuk-pulang | **OBSERVED** | Absolute (100%) |
| **EVD-005** | Master Data | Proteksi Hapus Area | `/hapus-area.php` | `ADMIN_SUPER` | Klik tombol hapus area, inspeksi modal konfirmasi | `03_data_induk_area.png` | Modal `#modalHapusArea` meminta verifikasi kata sandi admin | **TESTED** | Absolute (100%) |
| **EVD-006** | Checkpoint | Pendaftaran Checkpoint | `/insert-aset.php` | `ADMIN_SUPER` | Daftarkan Pos 1 Gerbang, Pos 2 Barat, Toilet Lt 1 | `07_modal_tambah_checkpoint.png` | 7 Checkpoint terdaftar di tabel master aset | **TESTED** | Absolute (100%) |
| **EVD-007** | Checkpoint | Generator Stiker QR | `/cetak-aset.php` | `ADMIN_SUPER` | Buka cetak aset ID `1052` | `admin-checkpoint-print.png` | Payload QR murni teks integer `1052`, layout A4 4 kolom | **TESTED** | Absolute (100%) |
| **EVD-008** | Master Data | Limit Kuota Karyawan | `/insert-personil.php`| `ADMIN_SUPER` | Coba tambah personil ke-6 (`staf_budi`) | `09_data_induk_personil.png` | Tombol disabled: `BATAS MAKSIMAL TELAH TERCAPAI` (Limit 5) | **TESTED** | Absolute (100%) |
| **EVD-009** | Master Data | Hashing Sandi Personel | `/personil_update.php`| `ADMIN_SUPER` | Update sandi personil via form admin | `check-all-hashes.js` | Sandi disimpan sebagai hash MD5 hex 32 karakter | **TESTED** | Absolute (100%) |
| **EVD-010** | ID Card | Generator ID Card CR80 | `/cetak-idcard.php` | `ADMIN_SUPER` | Pratinjau ID Card Danru Budi ID `1452` | `admin-personnel-idcard.png` | Format CR80 vertikal 5 pilihan tema warna (`B1` s/d `B5`) | **TESTED** | Absolute (100%) |
| **EVD-011** | Presensi | State Machine Masuk | `/validasi-patroli/` | `SECURITY` | Buka PWA sebelum melakukan check-in | `01_dashboard_index.html` | Tombol `INPUT KEGIATAN` terkunci, hanya `ABSEN MASUK` aktif | **TESTED** | Absolute (100%) |
| **EVD-012** | Presensi | Submit Absen Masuk | `/insert-presensi.php`| `SECURITY` | Swafoto webcam + GPS Sentul, pilih Piket Rutin | `05-danru-budi-checkin.png` | Presensi masuk sukses, tombol kegiatan terbuka | **TESTED** | Absolute (100%) |
| **EVD-013** | Presensi | Komputasi Jarak Geofence| Modal `#myModalab` | `ADMIN_SUPER` | Buka modal detail presensi di admin | `admin-absensi-detail-modal.png` | Peta Leaflet menampilkan `0.00 METER` (DALAM RADIUS AREA) | **TESTED** | Absolute (100%) |
| **EVD-014** | Presensi | Matriks 31 Hari | `/xxxxx_...` (Matrix) | `ADMIN_SUPER` | Buka matriks monitoring absensi | `admin-absensi-matrix.png` | Kolom tanggal menampilkan notasi `M {jam} \| X` (lupa checkout)| **TESTED** | Absolute (100%) |
| **EVD-015** | Patroli | Scan QR Pos 1 (Aman) | `/cek.php` | `SECURITY` | Scan QR `1052`, pilih `tl=0` (Aman), submit | `01-sec-agus-patrol1-form.png` | Laporan Security terisi badge hijau `SITUASI AMAN TERKENDALI` | **TESTED** | Absolute (100%) |
| **EVD-016** | Patroli | Scan QR Pos 2 (Insiden) | `/cek.php` | `SECURITY` | Scan QR `1062`, pilih `tl=1`, isi ket lampu padam | `02-pos2-temuan-insiden-form.png` | Laporan Security terisi badge merah `PERLU TINDAK LANJUT` | **TESTED** | Absolute (100%) |
| **EVD-017** | Patroli | Validasi QR Tak Dikenal | `/cek.php` | `SECURITY` | Scan QR angka dummy `1054` | `09_qr_scan.html` | Error: `Kode aset tidak ditemukan. Silakan Scan QR Code.` | **TESTED** | Absolute (100%) |
| **EVD-018** | Patroli | Counter Temuan Aktif | `/index.php` | `ADMIN_SUPER` | Cek dashboard setelah submit Pos 2 insiden | `07-admin-dashboard-active.png` | Metrik `TEMUAN AKTIF` bertambah dari 0 menjadi 1 | **TESTED** | Absolute (100%) |
| **EVD-019** | Cleaning | Presensi Masuk Cleaner | `/insert-presensi.php`| `CLEANER` | Check-in Siti Aminah via PWA | `07-admin-dashboard-active.png` | Metrik `CLEANING HADIR` bertambah dari 0 menjadi 1 | **TESTED** | Absolute (100%) |
| **EVD-020** | Cleaning | Checklist Sanitasi Toilet| `/insert-patroli.php` | `CLEANER` | Scan QR `1053`, pilih status Bersih & Rapi | `03-clean-siti-toilet-form.png` | Form label: `PILIH HASIL KERJA`, foto toilet tersimpan | **TESTED** | Absolute (100%) |
| **EVD-021** | Cleaning | Verifikasi Laporan CS | `/xxxxx_...` (Laporan) | `ADMIN_SUPER` | Buka Laporan Cleaning Service di admin | `08-laporan-cleaning-service.png` | Tabel terisi baris Siti Aminah (sebelumnya No Data) | **TESTED** | Absolute (100%) |
| **EVD-022** | Driver | Menu Khusus Armada | `/validasi-patroli/` | `DRIVER` | Buka PWA dengan akun Joko Wahyudi | `10_driver_trip.html` | Scan QR tersembunyi, tombol `MULAI PERJALANAN` muncul | **TESTED** | Absolute (100%) |
| **EVD-023** | Driver | Keberangkatan Armada | `/insert_driver.php` | `DRIVER` | Input Avanza `B 1234 PAT` ke Cakung | `04-driver-joko-journey-form.png` | Laporan Driver terisi baris perjalanan status `BERANGKAT` | **TESTED** | Absolute (100%) |
| **EVD-024** | Danru | Laporan Serah Terima | `/insert_komandan.php`| `SECURITY_LEADER`| Inspeksi kode form `12_laporan_komandan.html` | `12_laporan_komandan.html` | Field shift, kehadiran regu, dan kesimpulan aman/catatan | **OBSERVED** | Absolute (100%) |
| **EVD-025** | Chief | Laporan Supervisi | `/insert_chief.php` | `SECURITY_CHIEF` | Inspeksi kode form `13_laporan_chief.html` | `13_laporan_chief.html` | Dropdown Danru, evaluasi disiplin, koordinasi, dan insiden | **OBSERVED** | Absolute (100%) |
| **EVD-026** | Staff | Form Logbook Staff | `/insert_staf.php` | `STAFF` | Inspeksi kode form `14_laporan_staff.html` | `14_laporan_staff.html` | Pilihan 8 kategori kegiatan kantor (Meeting, Administrasi) | **OBSERVED** | Absolute (100%) |
| **EVD-027** | Kedaruratan | Panic Button SOS Hold 3s | `/insert-panic.php` | `SECURITY` | Tahan tombol bulat merah SOS selama 3 detik | `07_panic_button.html` | Request POST terkirim, modal `#myModalpan` aktif di admin | **TESTED** | Absolute (100%) |
| **EVD-028** | Payroll | Formula Gaji Danru | `/gaji` | `ADMIN_SUPER` | Cek slip gaji Danru Budi di web admin | `admin-payroll-detail.png` | $4.5jt + 500rb - 100rb (BPJS) - 50rb (Lupa) = Rp 4.850.000 | **TESTED** | Absolute (100%) |
| **EVD-029** | Offline | Zero Offline Worker | `service-worker.js` | ALL | Analisis script service worker acuan | `service-worker.js` (Raw) | File worker kosong (fetch passthrough, tanpa cache) | **TESTED** | Absolute (100%) |
| **EVD-030** | Ekspor | Dynamic AJAX Cascading | `/xxxxx_xxxxxxxxxxxx` | `ADMIN_SUPER` | Uji wizard form ekspor laporan | `admin-export-wizards.png` | Dropdown Area ➔ Kategori ➔ Personil terisi secara dinamis | **TESTED** | Absolute (100%) |
