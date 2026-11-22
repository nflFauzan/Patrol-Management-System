# Hambatan & Keterbatasan yang Tersisa (Remaining Blockers & Limitations)

> **Modul:** Analisis Risiko & Keterbatasan Sistem  
> **Target:** `https://patroli.site` (External Reference Site)  
> **Tanggal Audit:** 22 November 2026  

---

## 1. Daftar Hambatan & Keterbatasan Teridentifikasi

Berdasarkan investigasi dinamis menyeluruh, berikut adalah kendala dan batasan teknis yang ditemukan pada aplikasi referensi Patroli Site:

### 1.1 Batas Kuota Personel Tenant (Hard Limit: 5 Personel)
- **Deskripsi:** Backend membatasi jumlah akun per perusahaan (ID `ai`) maksimal 5 personel. Upaya menambah personel ke-6 dicegah oleh sistem dengan menonaktifkan tombol tambah (`BATAS MAKSIMAL TELAH TERCAPAI`).
- **Dampak pada Testing:** Kategori "Staff Operasional" tidak dapat ditambahkan sebagai record tersendiri karena kuota 5/5 dialokasikan penuh untuk memvalidasi peran Security Anggota, Danru, Chief, Cleaning Service, dan Driver.
- **Solusi pada Monorepo In-House:** Sistem yang kita bangun adalah **Single-Tenant In-House Enterprise Beli Putus**, sehingga pembatasan kuota SaaS komersial ditiadakan. Arsitektur tabel dan service kita mendukung jumlah personil tanpa batas (*unlimited*).

### 1.2 Rate Limiting / Cloudflare Error 1015
- **Deskripsi:** Eksekusi otomatisasi API atau perpindahan halaman yang terlalu cepat memicu respons proteksi Cloudflare `Error 1015: You are being rate limited`.
- **Mitigasi:** Telah diatur jeda adaptif (`slowMo: 200-300ms` dan `waitForTimeout(1500-2500ms)`) dalam setiap alur browser Playwright. Seluruh transaksi berhasil dieksekusi tanpa memicu blokir Cloudflare.

### 1.3 Ketergantungan Alur Geolocation & Mock Kamera
- **Deskripsi:** Form `xxxxx_xx.php` (Absen Masuk), `cek.php` (Patroli & Sanitasi), dan `xxxxx_xxxxxxxxxx.php` (Driver) mewajibkan stream MediaDevices dan Geolocation API aktif sebelum tombol simpan dapat ditekan.
- **Mitigasi:** Browser context Playwright telah dikonfigurasi dengan mock geolocation (`latitude: -6.566877, longitude: 106.857619`) dan injeksi base64 JPEG valid ke hidden input `.image-tag` / `#image`.

### 1.4 Hashing Password MD5 pada Modul Legacy
- **Deskripsi:** Backend referensi memperbarui kredensial personil dengan MD5 hex 32-karakter, sedangkan admin menggunakan Bcrypt.
- **Mitigasi:** Seluruh 5 akun telah dipastikan memiliki hash MD5 yang valid dan tervalidasi dapat login ke portal mobile. Pada monorepo baru, kita wajib menerapkan Bcrypt dengan cost factor minimal 10 sesuai aturan `AGENTS.md`.

---

## 2. Kesimpulan Kesiapan

Tidak ada kendala kritis (*blocking issues*) yang menghalangi fase berikutnya. Seluruh workflow inti (Master Data, Hubungan Relasional, Presensi GPS, Patroli Keamanan, Sanitasi Kebersihan, dan Logistik Driver) telah terbukti berjalan dan terdokumentasi lengkap.
