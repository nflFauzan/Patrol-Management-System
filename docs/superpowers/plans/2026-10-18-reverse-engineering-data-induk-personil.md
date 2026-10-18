# Reverse Engineering & Implementation Plan: Data Induk Personil (100% Parity dengan patroli.site)

> **Spec Evidence Source:** Live DOM & Script Extraction dari `https://patroli.site/xxxx_xxxxxxxx` via Playwright MCP (User `testi`).

**Goal:** Mengimplementasikan fitur, antarmuka, formulir, modal, kamera live webcam, validasi keamanan, dan sistem cetak ID Card pada modul **Data Induk Personil** di Web Admin dan Backend dengan kepatuhan 100% terhadap arsitektur dan UI/UX `https://patroli.site/xxxx_xxxxxxxx`.

---

## 1. Analisis Perbandingan UI/UX (Live vs Current)

Berdasarkan perbandingan tangkapan layar dan ekstraksi DOM langsung dari server `patroli.site`:

| Komponen | Implementasi Lama (Current) | Target 100% Parity (`patroli.site`) |
|---|---|---|
| **Header Modal Tambah** | Biru generik | `#0d6efd` dengan ikon `fa-user-plus` dan teks `FORM TAMBAH PERSONEL` |
| **Tata Letak Panel Tambah** | Panel Kiri (Identitas), Panel Kanan (Gaji) | **Panel Kiri (col-md-8)**: Berisi 2 sub-card:<br>1. `DATA PERSONEL`<br>2. `GAJI, TUNJANGAN & POTONGAN`<br>**Panel Kanan (col-md-4)**: Berisi `FOTO PERSONEL` dengan live webcam |
| **Input Jam Kerja** | Dropdown pilihan statis (8/12/16/24) | Input number (`#jam_kerja`, min 8, max 24, step 1) dengan placeholder `Masukkan jam kerja (8–24 jam)` |
| **Input Password Login** | Tipe password tersembunyi | Tipe text (`#password`, maxlength 15) dengan placeholder `Buat password` |
| **Kamera / Foto Personel** | Tidak ada | Live `<video>` camera stream (`320x240`), tombol `Ambil Foto` (kuning `#ffc107`), tombol `Ambil Ulang Foto` (cyan `#17a2b8`), box info login, dan pesan peringatan merah |
| **Format Mata Uang** | Number biasa | Input-group dengan addon `Rp` dan masking real-time `formatRupiah(this)` (`Intl.NumberFormat('id-ID')`) pada seluruh 6 field finansial |
| **Kondisional Posisi & Lokasi** | Dropdown site selalu muncul | Posisi `Admin Area` memunculkan `#wrap-lokasi-multiple`. Posisi `Security` memunculkan `#wrap-jabatan`, lalu setelah jabatan dipilih baru memunculkan `#wrap-lokasi-single`. Posisi operasional lain langsung memunculkan `#wrap-lokasi-single` |
| **Modal Edit Personel** | Modal sederhana | Sesuai `personil_edit.php`: 3 Kolom Informasi (Identitas, Area & Jam Kerja, Foto Profil lama/ganti) + 1 Baris Pengaturan Gaji (6 field `col-lg-2`) |
| **Modal Hapus** | Sederhana | Sesuai `#modalHapus`: Box merah `PERINGATAN PENGHAPUSAN DATA`, nama target tebal, daftar data terhapus (absensi, patroli, aktivitas), input password admin |

---

## 2. Struktur DOM & Elemen Kunci (100% Parity)

### A. Modal Tambah Personel (`#exampleModalCenter`)
- **Header**: `#0d6efd`, title `<i class="fa fa-user-plus mr-2"></i> FORM TAMBAH PERSONEL`.
- **Kolom Kiri (`col-md-8`)**:
  - Card 1 `.panel-personil`:
    - Judul: `<div class="judul-panel"><i class="fa fa-id-card mr-1"></i> DATA PERSONEL</div>`
    - Baris 1: `Nama Personel` (`#nama_anggota`) | `Jam Kerja Per Hari` (`#jam_kerja`, number 8-24)
    - Baris 2: `Username Login` (`#username`) | `Password Login` (`#password`, text)
    - Baris 3: `Posisi` (`#posisi`, custom-select):
      - `Admin Area / Pengelola Area (Klien)`
      - `Security`
      - `Cleaning Service`
      - `Driver`
      - `Staf`
    - Kondisional:
      - `#wrap-jabatan`: Pilihan `Anggota / Personel`, `Komandan`, `Chief`.
      - `#wrap-lokasi-multiple`: Area / Site yang Dikelola (multi-site).
      - `#wrap-lokasi-single`: Area / Site Penempatan (single-site).
  - Card 2:
    - Judul: `<div class="judul-panel mt-4"><i class="fa fa-money mr-1"></i> GAJI, TUNJANGAN & POTONGAN</div>`
    - Grid 6 Field (col-md-6) masing-masing dengan addon `Rp`:
      1. `Gaji Bulanan` (`#gaji_pokok`)
      2. `Tunjangan Bulanan` (`#tunjangan`)
      3. `Biaya Per Lembur` (`#lembur`)
      4. `Potongan BPJS` (`#potongan_bpjs`)
      5. `Potongan Ketidakhadiran` (`#potongan_tidak_masuk`)
      6. `Potongan Lupa Absensi Pulang` (`#potongan_lupa_absensi`)
- **Kolom Kanan (`col-md-4`)**:
  - Card `.panel-kamera`:
    - Judul: `<div class="judul-panel text-left"><i class="fa fa-camera mr-1"></i> FOTO PERSONEL</div>`
    - Camera Box (`.camera-box`, `320x240`, aspect ratio 4:3):
      - Live video webcam feed (`<video>`) via `navigator.mediaDevices.getUserMedia`
      - Canvas capture preview (`<img id="preview-foto">`)
    - Tombol Kamera:
      - State awal: `<button class="btn btn-warning"><i class="fa fa-camera mr-1"></i> Ambil Foto</button>`
      - State foto terambil: `<button class="btn btn-info"><i class="fa fa-refresh mr-1"></i> Ambil Ulang Foto</button>`
    - Info Login: Box `#fff4e5` text `#8a4b08`:
      `Username dan password digunakan untuk login masing-masing personel.`
    - Warning Text Merah:
      `Ambil foto sebelum menyimpan data personel.`
- **Footer**:
  - Tombol Batal (`.btn.btn-secondary`, `<i class="fa fa-times mr-1"></i> Batal`)
  - Tombol Simpan (`.btn.btn-success`, `<i class="fa fa-save mr-1"></i> Simpan Personel`)

---

## 3. Rencana Eksekusi Revisi

- [x] **Sub-task 1:** Update `PersonilManagementView.tsx` dengan tata letak visual 100% parity (col-md-8 kiri untuk Data & Finansial, col-md-4 kanan untuk Live WebCam & Peringatan).
- [x] **Sub-task 2:** Implementasi modul WebCam dengan fallback MediaDevices API (video stream live, capture frame to base64 jpeg, toggle tombol Ambil Foto / Ambil Ulang).
- [x] **Sub-task 3:** Implementasi masking Rupiah real-time (`formatRupiah`) pada ke-6 input finansial dan unmasking saat submit form.
- [x] **Sub-task 4:** Hubungkan kondisional dinamis posisi (`#wrap-jabatan`, `#wrap-lokasi-multiple`, `#wrap-lokasi-single`) sesuai alur asli `patroli.site`.
- [x] **Sub-task 5:** Implementasi Modal Edit Personel 3-kolom (`myModal`) dan Modal Hapus Peringatan Merah (`modalHapus`).
- [x] **Sub-task 6:** Verifikasi kompilasi build dan pengujian antarmuka dengan Playwright.
