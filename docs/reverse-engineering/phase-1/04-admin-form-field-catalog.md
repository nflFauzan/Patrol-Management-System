# 04 — KATALOG FIELD FORM & SPESIFIKASI VALIDASI (FORM FIELD CATALOG)
> **File:** `docs/reverse-engineering/phase-1/04-admin-form-field-catalog.md`  
> **Tahap:** Phase 1 — Deep Reverse Engineering  
> **Sistem Acuan:** `https://patroli.site`  
> **Prinsip Utama:** *Exact DOM & Script Mapping — Tidak menebak tipe data atau batasan validasi.*  

---

## 1. Katalog Form Data Induk (Master Data Forms)

### 1.1 Form Tambah & Edit Fasilitas / Area (`insert-area.php` & `area_edit.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `nama_area` | text | Yes | none | String | Max 100 karakter, non-empty | Filter utama seluruh laporan |
| `alamat_area` | textarea | Yes | none | Text | Max 250 karakter | Informasi penjemputan & navigasi |
| `latitude` | text/number | Yes | none | Float `-90.0` s/d `90.0` | 6 desimal, valid numeric | Terisi otomatis saat klik peta Leaflet |
| `longitude` | text/number | Yes | none | Float `-180.0` s/d `180.0` | 6 desimal, valid numeric | Terisi otomatis saat klik peta Leaflet |
| `radius` | number | Yes | `50` | Integer (meter) | Min 10, Max 500 meter | Menentukan geofence toleransi presensi |
| `pic_area` | text | Yes | none | String | Nama supervisor | PIC koordinasi site |
| `no_hp_pic` | tel/text | Yes | none | Numeric string | Min 10, Max 15 digit angka | Target pesan darurat |
| `shift_1` s/d `shift_10` | time/select | No | `00:00 - 00:00` | Format `HH:MM - HH:MM` | Valid format waktu 24 jam | Jam shift operasional di area terkait |

---

### 1.2 Form Tambah Checkpoint Titik Aset (`insert-aset.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `nama_aset` | text | Yes | none | String | Max 100 karakter | Label titik pos inspeksi |
| `lokasi_area` | select | Yes | none | Daftar Area terdaftar | Wajib memilih salah satu Area | Dependent dropdown dari Master Area |
| `kategori` | select | Yes | none | `Security`, `Cleaning Service` | Wajib memilih | Menentukan jenis form inspeksi lapangan |
| `jenis_aset` | text | Yes | none | String | Max 50 karakter | Klasifikasi aset (Keamanan, Toilet, dll) |
| `pos_jaga` | text | No | none | String | Max 100 karakter | Keterangan detail posisi/lantai |
| `deskripsi_tugas` | textarea | Yes | none | String | Max 200 karakter | Instruksi kerja yang tampil saat QR discan |

---

### 1.3 Form Pendaftaran & Edit Personel (`insert-personil.php` & `personil_edit.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `nama_lengkap` | text | Yes | none | String | Max 100 karakter alfabetis | Nama resmi di badge dan laporan |
| `username` | text | Yes | none | Alfanumerik | Min 4 karakter, unique di database | Kredensial login portal |
| `password` | password | Yes | none | String | Min 6 karakter, unique antar user | Di-hash MD5 hex 32 karakter |
| `posisi` | select | Yes | none | `Security`, `Cleaning Service`, `Driver`, `Staff Operasional` | Wajib memilih salah satu | Mengontrol antarmuka PWA mobile |
| `jabatan` | select | Yes | none | `anggota`, `komandan`, `chief`, `staff` | Wajib memilih | Mengontrol menu laporan khusus di PWA |
| `lokasi_area` | select | Yes | none | Daftar Area aktif | Wajib memilih salah satu | Penempatan fasilitas kerja |
| `jam_kerja` | number | Yes | `8` | Integer (8 s/d 12) | Min 8, Max 24 jam | Standar jam kerja harian |
| `gaji_pokok` | number | Yes | `0` | Currency Integer | Min 0, non-negatif | Basis komputasi payroll engine |
| `tunjangan` | number | Yes | `0` | Currency Integer | Min 0, non-negatif | Tunjangan tetap bulanan |
| `lembur_perjam` | number | Yes | `0` | Currency Integer | Min 0, non-negatif | Pengali jam lembur efektif |
| `potongan_bpjs` | number | Yes | `0` | Currency Integer | Min 0, non-negatif | Potongan jaminan kesehatan |
| `potongan_kehadiran` | number | Yes | `0` | Currency Integer | Min 0, non-negatif | Potongan per hari tidak masuk (Alpa) |
| `potongan_lupa_absen` | number | Yes | `0` | Currency Integer | Min 0, non-negatif | Denda jika masuk tanpa checkout pulang |
| `image` (webcam/file) | hidden/file | Yes | none | Data URL Base64 JPEG | Valid image MIME, non-empty | Foto avatar dan stempel ID Card |

---

## 2. Katalog Form Transaksi Karyawan (Mobile PWA Forms)

### 2.1 Form Absen Masuk & Pulang (`xxxxx_xx.php` & `xxxxx_xxx.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `alasan` | select | Yes | `Piket Rutin` | `Piket Rutin`, `Lembur BKO`, `Tugas Khusus` | Wajib memilih | Alasan penugasan harian |
| `latin` / `latout` | hidden | Yes | none | Float koordinat GPS | Valid numeric latitude | Terisi otomatis via Geolocation API |
| `longin` / `longout` | hidden | Yes | none | Float koordinat GPS | Valid numeric longitude | Terisi otomatis via Geolocation API |
| `image` | hidden | Yes | none | Base64 JPEG data URL | Wajib swafoto kamera live | Tombol simpan terkunci sebelum foto diambil |

---

### 2.2 Form Hasil Patroli & Sanitasi di Lapangan (`cek.php` ➔ `insert-patroli.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `kode_aset` | hidden | Yes | none | Integer serial aset | Must exist in master_aset | Mengunci titik inspeksi |
| `kode_anggota` | hidden | Yes | none | Integer serial user | Must match session | Identitas petugas pelapor |
| `tl` | select | Yes | `0` | `0` (Aman/Bersih), `1` (Perlu Tindak Lanjut) | Wajib memilih salah satu | Mengontrol kemunculan field `#keterangan` |
| `keterangan` | text | Conditional | none | String | Max 50 karakter | **Wajib diisi jika `tl = 1`**, tersembunyi jika `tl = 0` |
| `latitude` & `longitude` | hidden | Yes | none | Float koordinat GPS | Valid numeric coordinates | Verifikasi kehadiran petugas di lokasi fisik |
| `image` | hidden | Yes | none | Base64 JPEG data URL | Wajib foto fisik | Bukti visual kondisi pos / toilet |

---

### 2.3 Form Mulai Perjalanan Driver (`xxxxx_xxxxxxxxxx.php` ➔ `insert_driver.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `kode_anggota` | hidden | Yes | none | Integer ID user | Must match session | ID pengemudi |
| `tipe` | text | Yes | none | String | Max 50 karakter | Merk/tipe kendaraan dinas |
| `nopol` | text | Yes | none | String | Format pelat nomor (misal: `B 1234 PAT`) | Identitas armada dinas |
| `tujuan` | text | Yes | none | String | Max 100 karakter | Site/alamat tujuan perjalanan |
| `keperluan` | text | Yes | none | String | Max 150 karakter | Uraian penugasan logistik |
| `latitude_b` & `longitude_b` | hidden | Yes | none | Float GPS | Valid numeric coordinates | Titik keberangkatan armada |
| `image` | hidden | Yes | none | Base64 JPEG data URL | Foto kendaraan / odometer awal | Tombol `btnSimpan` aktif setelah foto diambil |

---

### 2.4 Form Laporan Komandan Regu (`12_laporan_komandan.html` ➔ `insert_komandan.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `shift` | select | Yes | none | `Pagi`, `Siang`, `Malam` | Wajib memilih | Shift dinas yang dipimpin |
| `kehadiran` | select | Yes | none | `Lengkap`, `Tidak Lengkap` | Wajib memilih | Mengontrol field `jumlah_hadir` & `jumlah_izin` |
| `jumlah_hadir` | number | Conditional | none | Integer $\ge 0$ | Min 0 | Muncul hanya jika kehadiran `Tidak Lengkap` |
| `jumlah_izin` | number | Conditional | none | Integer $\ge 0$ | Min 0 | Muncul hanya jika kehadiran `Tidak Lengkap` |
| `kesimpulan` | select | Yes | none | `A` (Situasi aman), `L` (Ada catatan) | Wajib memilih | Mengontrol kemunculan field `#catatan` |
| `catatan` | textarea | Conditional | none | String | Max 100 karakter | Muncul hanya jika kesimpulan bernilai `L` |

---

### 2.5 Form Laporan Supervisi Chief Security (`13_laporan_chief.html` ➔ `insert_chief.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `kode_anggota` | select | Yes | none | Daftar Danru aktif di site | Wajib memilih | Mengaitkan evaluasi ke Danru spesifik |
| `disiplin` | select | Yes | none | `Baik`, `Cukup`, `Kurang` | Wajib memilih | Penilaian kedisiplinan dan kerapian Danru |
| `koordinasi` | select | Yes | none | `Baik`, `Cukup`, `Kurang` | Wajib memilih | Penilaian komunikasi tim pengamanan |
| `kehadiran_regu`| select | Yes | none | `Lengkap`, `Tidak Lengkap` | Wajib memilih | Mengontrol field detail kehadiran anggota regu |
| `regu_hadir` | number | Conditional | none | Integer $\ge 0$ | Min 0 | Muncul jika kehadiran regu `Tidak Lengkap` |
| `regu_izin` | number | Conditional | none | Integer $\ge 0$ | Min 0 | Muncul jika kehadiran regu `Tidak Lengkap` |
| `insiden` | select | Yes | none | `Tidak Ada`, `Ada` | Wajib memilih | Mengontrol kemunculan field `detail_insiden` |
| `detail_insiden`| textarea | Conditional | none | String | Max 100 karakter | Muncul hanya jika ada insiden |
| `catatan` | textarea | No | none | String | Max 100 karakter | Catatan pengarahan dari Chief |

---

### 2.6 Form Kegiatan Staff Operasional (`14_laporan_staff.html` ➔ `insert_staf.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi session token | Disematkan otomatis |
| `jenis_kegiatan`| select | Yes | none | `Administrasi`, `Monitoring`, `Koordinasi`, `Meeting`, `Pengecekan`, `Follow Up`, `Laporan`, `Lainnya` | Wajib memilih | Mengontrol kemunculan field `detail_lainnya` |
| `detail_lainnya`| text | Conditional | none | String | Max 100 karakter | Muncul hanya jika memilih opsi `Lainnya` |
| `deskripsi` | textarea | Yes | none | String | Max 150 karakter | Uraian capaian tugas harian |
| `status` | select | Yes | `selesai` | `selesai`, `tertunda`, `dibatalkan` | Wajib memilih | Status penyelesaian tugas staf |

---

### 2.7 Form Pengajuan Izin / Alpha (`04_izin_alpha.html` ➔ `insert-presensi.php`)

| Field Name | Type | Required | Default | Options / Format | Validation Rule | Dependency / Behavior |
|:---|:---|:---:|:---|:---|:---|:---|
| `kode_anggota` | hidden | Yes | auto | Integer ID | Must match session | Identitas pemohon cuti/izin |
| `absen_site` | hidden | Yes | auto | String nama site | Penempatan fasilitas | Site asal |
| `status_absen` | hidden | Yes | `3` | Integer `3` | Nilai tetap `3` | Penanda tipe record izin di database |
| `csrf_token` | hidden | Yes | auto | Hash string | Validasi token | Keamanan POST |
| `alasan` | select | Yes | none | `Sakit`, `Keperluan Keluarga`, `Keperluan Pribadi` | Wajib memilih | Kategori ketidakhadiran |
| `keterangan` | textarea | No | none | String | Max 50 karakter | Keterangan tambahan dari karyawan |

---

## 3. Matriks Validasi Keamanan Form Tingkat Lanjut

1. **Client-Side Sanitasi Input:** Seluruh input textarea dilengkapi penghitung sisa karakter interaktif (*real-time character countdown*) via JavaScript untuk mencegah overflow kolom database.
2. **Double-Submit Prevention:** Tombol submit otomatis diubah statusnya menjadi `disabled` dan teksnya berubah menjadi `Menyimpan...` begitu form disubmit oleh pengguna.
3. **Payload Sanitasi GPS:** Seluruh input koordinat diverifikasi berupa angka desimal (`/^-?\d+(\.\d+)?$/`) sebelum diparsing ke fungsi geospasial PostGIS.
