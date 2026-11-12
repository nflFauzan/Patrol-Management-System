# 🔬 LAPORAN REVERSE ENGINEERING: patroli.site (PWA Field App)
> **Target**: `https://patroli.site`  
> **Status**: 100% De-obfuscated & Extracted  
> **Aset Tersimpan**: `docs/reverse-engineering/patroli-site/raw-pages/`

---

## 1. Peta File & Modul Sistem (De-obfuscated)

| File Asli di Server | Nama Modul / Fitur | Target Form / Handler | Keterangan Teknis |
|---------------------|--------------------|------------------------|-------------------|
| `login.php` | Login & Registrasi PWA | `login.php`, `insert-daftar.php` | Ada honeypot `hp_input`, cek kekuatan kata sandi, WhatsApp floating widget |
| `manifest.php` | Web App Manifest | Dynamic JSON | `display: standalone`, `theme_color: #0b3d91` |
| `service-worker.js` | Service Worker | Online First | Minimalist SW, `self.skipWaiting()`, `clients.claim()` |
| `register.js` | Registrasi SW | Native PWA | Otomatis me-load `/service-worker.js` |
| `validasi-patroli/index.php` | Dashboard 8-Menu | State Machine Absensi | Dynamic grid, glassmorphism shine 25 deg, CSS marquee |
| `xxxxx_xx.php` | **Absen Masuk** | `../insert-presensi.php` | WebcamJS 320x320 20% JPEG, GPS geofence, 60s idle timeout |
| `xxxxx_xxx.php` | **Absen Pulang** | `../update-presensi.php` | WebcamJS 320x320, GPS update, 60s idle timeout |
| `xxxxx_xxxx.php` | **Izin Tidak Masuk** | `../insert-presensi.php` | Dropdown alasan (Sakit, Keperluan Keluarga/Pribadi) + keterangan |
| `xxxxx_xxxxx.php` | **Riwayat Absen** | `serverside-presensi.php` | DataTables + modal Leaflet map + 100m geofence circle + Google Maps |
| `xxxxx_xxxxxx.php` | **Riwayat Kegiatan** | `serverside-chief.php` | DataTables kegiatan per role + modal detail |
| `xxxxx_xxxxxxx.php` | **Panic Button (SOS)** | `../insert-panic.php` | Tombol 3D circular 200px merah, GPS grab otomatis |
| `xxxxx_xxxxxxxx.php` | **Update Profile** | `password_update.php` | Ganti foto webcam base64 + ganti password |
| `xxxxx_xxxxxxxxx.php` | **QR Scanner Patroli** | `../cek.php` | `html5-qrcode@2.3.8`, auto-detect back camera, 10 FPS, box 250x250 |
| `xxxxx_xxxxxxxxxx.php` | **Perjalanan Driver** | `../insert_driver.php` | Camera snapshot, GPS, tipe kendaraan, nopol, tujuan, keperluan |
| `xxxxx_xxxxxxxxxxx.php` | **QR Redirection** | HTTP 302 Handler | Redirect validator pos checkpoint |
| `xxxxx_xxxxxxxxxxxx.php` | **Laporan Komandan** | `../insert_komandan.php` | Shift pagi/siang/malam, kehadiran, kesimpulan (A/L), catatan 100 char |
| `xxxxx_xxxxxxxxxxxxx.php` | **Laporan Chief** | `../insert_chief.php` | Evaluasi Komandan Regu, disiplin, koordinasi, insiden, catatan |
| `xxxxx_xxxxxxxxxxxxxx.php` | **Kegiatan Staff** | `../insert_staf.php` | 8 jenis kegiatan harian staff/cleaning, status, sisa 150 char |

---

## 2. Parameter Payload Lengkap Form Backend

### 1. Form Absen Masuk (`insert-presensi.php`)
- `csrf_token` (String, hex token)
- `kode_anggota` (String/Int, misal `1447`)
- `lokasi_site` (String, misal `kantor pusat`)
- `image` (String, `data:image/jpeg;base64,...` kualitas 20%, 320x320)
- `status_absen` (Int, `1`)
- `latitude_in` (Float, misal `-6.562713`)
- `longitude_in` (Float, misal `106.856165`)
- `alasan` (Int: `1` = Piket Rutin, `2` = Lembur, `3` = Penugasan lain)

### 2. Form Absen Pulang (`update-presensi.php`)
- `kode_absen` (Int ID absen dari sesi masuk)
- `csrf_token` (String)
- `lokasi_site` (String)
- `image` (String base64)
- `latitude_out` (Float)
- `longitude_out` (Float)

### 3. Form Izin Alpha (`insert-presensi.php`)
- `kode_anggota` (String)
- `absen_site` (String)
- `status_absen` (String, misal `2`)
- `alasan` (String: `Sakit` / `Keperluan Keluarga` / `Keperluan Pribadi`)
- `keterangan` (String)

### 4. Form Panic Button SOS (`insert-panic.php`)
- `kode_anggota` (String)
- `csrf_token` (String)
- `latitude` (Float)
- `longitude` (Float)

### 5. Form Laporan Komandan (`insert_komandan.php`)
- `shift` (`Pagi` / `Siang` / `Malam`)
- `kehadiran` (`Lengkap` / `Tidak Lengkap`)
- `jumlah_hadir` (Int, jika tidak lengkap)
- `jumlah_izin` (Int, jika tidak lengkap)
- `kesimpulan` (`A` = Situasi aman, `L` = Ada catatan)
- `catatan` (Text, max 100 karakter)

### 6. Form Laporan Chief (`insert_chief.php`)
- `kode_anggota` (Int ID Komandan Regu yang dinilai)
- `disiplin` (`Baik` / `Cukup` / `Kurang`)
- `koordinasi` (`Baik` / `Cukup` / `Kurang`)
- `kehadiran_regu` (`Lengkap` / `Tidak Lengkap`)
- `regu_hadir` (Int)
- `regu_izin` (Int)
- `insiden` (`Tidak Ada` / `Ada`)
- `detail_insiden` (Text, max 100 karakter)
- `catatan` (Text, max 100 karakter)

### 7. Form Driver Logistik (`insert_driver.php`)
- `image` (String base64)
- `latitude_b` (Float)
- `longitude_b` (Float)
- `tipe` (String, nama kendaraan)
- `nopol` (String, nomor polisi)
- `tujuan` (String, alamat tujuan)
- `keperluan` (String)

### 8. Form QR Scanner Patroli (`cek.php`)
- `nama` (String, nilai hash/teks yang terbaca dari QR Code checkpoint)



---

## 3. Analisis & Komparasi Responsivitas (Pixel-Parity across Viewports)

Pengujian inspeksi otomatis menggunakan Playwright dijalankan terhadap target live `https://patroli.site` dan PWA lokal (`apps/pwa-field`) pada 4 breakpoint viewport:
1. **Mobile Small (360x640)**
2. **Mobile iPhone (390x844)**
3. **Tablet (768x1024)**
4. **Desktop (1366x768)**

### Matriks Komparasi Computed Layout & Responsivitas

| Viewport | Parameter CSS | Target Asli (`patroli.site`) | PWA Field (`apps/pwa-field`) | Status Parity |
| :--- | :--- | :--- | :--- | :---: |
| **Mobile 360x640** | Grid Template Columns | `159px 159px` (2 Kolom) | `159px 159px` (2 Kolom) | ✅ 100% Identik |
| | Container Width | `360px` (Full Width) | `360px` (Full Width) | ✅ 100% Identik |
| | Card Dimension | `159px x 120px` | `159px x 120px` | ✅ 100% Identik |
| | Header Height | `77px - 82px` | `82px` | ✅ 100% Identik |
| | Marquee Height | `40px` (Fixed Bottom) | `40px` (Fixed Bottom) | ✅ 100% Identik |
| **iPhone 390x844** | Grid Template Columns | `174px 174px` (2 Kolom) | `174px 174px` (2 Kolom) | ✅ 100% Identik |
| | Container Width | `390px` (Full Width) | `390px` (Full Width) | ✅ 100% Identik |
| | Card Dimension | `174px x 120px` | `174px x 120px` | ✅ 100% Identik |
| **Tablet 768x1024** | Grid Template Columns | `175.5px x 4` (4 Kolom) | `175.5px x 4` (4 Kolom) | ✅ 100% Identik |
| | Container Width | `768px` (Full Width) | `768px` (Full Width) | ✅ 100% Identik |
| | Card Dimension | `176px x 120px` | `176px x 120px` | ✅ 100% Identik |
| | Container Height | `282px` (2 Baris x 4) | `282px` (2 Baris x 4) | ✅ 100% Identik |
| **Desktop 1366x768**| Grid Template Columns | `156.5px x 8` (8 Kolom) | `156.5px x 8` (8 Kolom) | ✅ 100% Identik |
| | Container Width | `1366px` (Full Width) | `1366px` (Full Width) | ✅ 100% Identik |
| | Card Dimension | `157px x 120px` | `157px x 120px` | ✅ 100% Identik |
| | Container Height | `150px` (1 Baris x 8) | `150px` (1 Baris x 8) | ✅ 100% Identik |

### Kunci Rahasia CSS Responsif `patroli.site`:
- `.container`: `display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 15px; margin-top: 15px; width: 100%; max-width: none;`
- `.card`: `height: 120px; padding: 40px 10px; border-radius: 18px;`
- Tidak ada pembatasan `max-width: 500px` atau flexbox `flex-1` yang merusak proporsi kartu saat diregangkan pada tablet atau desktop.
