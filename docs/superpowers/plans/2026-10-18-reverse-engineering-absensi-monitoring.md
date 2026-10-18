# Reverse Engineering & Implementation Plan: Modul Absensi > Monitoring (100% Parity dengan patroli.site)

> **Spec Evidence Source:** Live DOM, AJAX, CSS & Export Script Extraction dari `https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` via Playwright MCP (User `testi`).  
> **Visual Screenshot:** `docs/superpowers/screenshots/patroli_site_absensi_monitoring.png`

---

## 1. Analisis Perbandingan UI/UX (Live vs Existing Project)

Berdasarkan inspeksi langsung live website `https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`:

| Elemen / Fitur | Target 100% Parity (`patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`) | Status di Project Saat Ini |
|---|---|---|
| **Judul Halaman** | `<h5 class="font-weight-bold">Monitoring Absensi Personil</h5>` berpusat di atas | Belum rapi / berbeda styling |
| **Filter Form Bar (`#filterForm`)** | Flex layout (`gap: 12px`, `height: 42px` input/select/button):<br>1. **Bulan**: `<input type="month" id="bulan">`<br>2. **Lokasi**: `<select id="lokasi_site">` (`-- Semua Area --`)<br>3. **Posisi**: `<select id="posisi">` (`-- Semua Posisi --`)<br>4. **Action Buttons**: `↻ Reset` (Warning), `📊 Cetak Excel` (Success), `📄 Cetak PDF` (Danger) | Berbeda layout & tombol |
| **Auto-Submit & Reset** | - Mengubah Lokasi / Posisi / Bulan langsung trigger reload/filter data<br>- Tombol Reset mengembalikan ke bulan saat ini, semua area, semua posisi | Menggunakan tombol manual |
| **Summary / Info Bar Modern (`.info-bar-modern`)** | Bar putih rounded `14px` border `1px solid #e5e9f2` box-shadow:<br>- `📅 Bulan`: `{MonthName Year}` (misal: October 2026)<br>- `📍 Lokasi`: `{Selected Area}` (misal: Semua Area)<br>- `👤 Posisi`: `{Selected Posisi}` (misal: Semua Posisi)<br>- `.legend` badges:<br>  - `M` (Light Blue `#03a9f4`): Masuk<br>  - `P` (Green `#4caf50`): Pulang<br>  - `P+` (Orange `#ff9800`): Pulang (hari berikutnya)<br>  - `X` (Red `#f44336`): Lupa Absen | Belum ada legend dan info bar modern ini |
| **Tabel 31-Hari Laporan (`.laporan-table`)** | 2-Tier Header:<br>- Baris 1: `No` (rowspan 2, w: 30px), `Nama Petugas` (rowspan 2, w: 150px), `Lokasi` (rowspan 2, w: 150px), `Tanggal` (colspan = jumlah hari, misal 31)<br>- Baris 2: Tanggal 1..31. **Hari Sabtu dan Minggu memiliki background merah `#dc3545` dan teks putih!**<br>- Header sticky saat scroll vertical | Header belum menandai akhir pekan warna merah |
| **Format Sel Tanggal Petugas** | Tiap shift / kehadiran ditampilkan dalam blok div berlatar warna shift:<br>- Check-in: `<div style="background-color:{shiftColor}; ..."><strong>M<br>{HH:mm}</strong></div>`<br>- Check-out: `<strong>P<br>{HH:mm}</strong>` atau `<strong>P+<br>{HH:mm}</strong>`<br>- Lupa Absen: `<strong>X</strong>` | Tampilan badge belum identik vertikal |
| **Cetak Excel Engine (`#btnExcel`)** | Client-side export via `xlsx-js-style` / spreadsheet workbook:<br>- Judul: `MONITORING ABSENSI PERSONIL` (size 18, bold, centered)<br>- Baris Perusahaan: `{namaPerusahaan}` (size 12, bold)<br>- Info Blok: `BULAN`, `LOKASI`, `POSISI`, `DICETAK`<br>- Legend Absensi: `M : Masuk`, `P : Pulang`, `P+ : Pulang hari berikutnya`, `X : Lupa absen pulang`<br>- Merge cells: Title, Perusahaan, Info, Legend<br>- Header tabel: No, Nama Petugas, Lokasi, 1..31<br>- Border hitam tipis seluruh sel (`borderAll`)<br>- Tinggi baris data: 80pt dengan `wrapText: true`<br>- Freeze Panes: `{ xSplit: 3, ySplit: 12 }`<br>- File name: `Absensi_YYYY-MM_Posisi.xlsx` | Belum ada cetak excel dengan format spesifik ini |
| **Cetak PDF Engine (`#btnPDF`)** | Client-side export via `jsPDF` + `jspdf-autotable`:<br>- Format: `A3` landscape, `unit: 'mm'`, compress: `true`<br>- Header judul size 18 bold centered di `y: 13`<br>- Info baris Bulan, Lokasi, Posisi size 10<br>- Keterangan singkat: `M = Masuk    P = Pulang    P+ = Pulang hari berikutnya    X = Lupa Absen` (size 9)<br>- AutoTable: head styles navy blue `[30, 58, 138]`, text white bold, cell padding 3<br>- Col widths: Col 0 (12mm), Col 1 (45mm), Col 2 (38mm), Col 3..33 (9mm each)<br>- DidParseCell: tanggal fontSize 7.5, padding 2.5/1<br>- Footer: `Halaman X dari Y` di kanan bawah<br>- File name: `Monitoring_Absensi_YYYY-MM_Posisi.pdf` | Belum ada cetak PDF A3 landscape dengan format spesifik ini |

---

## 2. Rencana Implementasi Bertahap

### Tahap 1: Verifikasi Library & Backend API
1. Pastikan package `jspdf`, `jspdf-autotable`, `xlsx-js-style` (atau helper export client) terinstall dan siap di `apps/web-admin`.
2. Verifikasi endpoint backend `GET /attendance/matrix` atau `GET /attendance/monitoring` agar mengembalikan struktur array tanggal yang lengkap dengan jam masuk, jam pulang, indikator hari berikutnya (`isNextDay`), shift color, dan status lupa absen.

### Tahap 2: Komponen Frontend `AttendanceMonitoringTab.tsx`
1. Replikasi layout `#filterForm`:
   - Bulan input picker (`YYYY-MM`)
   - Lokasi dropdown (`-- Semua Area --`)
   - Posisi dropdown (`-- Semua Posisi --`)
   - Button group: `↻ Reset`, `📊 Cetak Excel`, `📄 Cetak PDF`
2. Replikasi Info Bar Modern (`.info-bar-modern`):
   - Bulan, Lokasi, Posisi
   - Badges Legend (`M`, `P`, `P+`, `X`) dengan warna resmi
3. Replikasi Tabel `.laporan-table`:
   - 2-Tier Header dengan sticky thead
   - Highlight tanggal akhir pekan (Sabtu & Minggu merah `#dc3545`)
   - Sel tanggal dengan badge vertikal per shift
4. Replikasi Fungsi Cetak Excel (`handleCetakExcel`):
   - Menerapkan seluruh spesifikasi worksheet layout, merges, fonts, widths, row heights, dan border.
5. Replikasi Fungsi Cetak PDF (`handleCetakPDF`):
   - Menerapkan AutoTable A3 landscape dengan navy header, font 7.5pt per tanggal, dan footer pagination.

### Tahap 3: Verifikasi Visual & Fungsional
1. Jalankan Typecheck & Build di seluruh workspace.
2. Buka tab Monitoring di browser Playwright lokal (`http://localhost:3001/absensi?tab=monitoring`).
3. Bandingkan screenshot lokal dengan `docs/superpowers/screenshots/patroli_site_absensi_monitoring.png`.
4. Uji klik Cetak Excel dan Cetak PDF untuk memastikan file terunduh dengan sempurna dan format 100% presisi.
