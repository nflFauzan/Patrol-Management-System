# Uji Alur Kerja Staf Operasional & Keterbatasan Kuota (Staff Workflow Test)

> **Divisi:** Staf Operasional & Supervisi  
> **Tenant:** Perusahaan `ai`  
> **Tanggal Audit:** 22 November 2026  
> **Target Aplikasi:** `https://patroli.site/`  

---

## 1. Analisis Kategori Staf Operasional & Batasan Sistem

Pada modul Master Personel dan menu Laporan, sistem referensi menyediakan kategori:
- `Security`
- `Cleaning Service`
- `Driver`
- `Staff Operasional`

### Temuan Pembatas Tenant (Quota Constraint)
1. **Batas Maksimal Kuota Personel:**
   - Perusahaan pengujian (`ai`) memiliki kuota maksimum tepat **5 personel**.
   - Pada saat mencoba mendaftarkan personel ke-6 (`staf_budi`), tombol pendaftaran terkunci dengan peringatan:  
     `<button class="btn btn-danger" disabled="">BATAS MAKSIMAL TELAH TERCAPAI</button>`.
2. **Alokasi Kuota Optimal:**
   - Untuk memvalidasi seluruh variasi peran operasional kritis, kuota 5 personel dialokasikan secara proporsional:
     - 3 Personel Security: Anggota (`sec_agus`), Komandan (`danru_budi`), Chief (`chief_hendra`).
     - 1 Personel Cleaning Service: (`clean_siti`).
     - 1 Personel Driver Logistik: (`driver_joko`).
3. **Mekanisme Kerja Staf Operasional:**
   - Berdasarkan observasi kode sumber form `xxxxx_xx.php` dan modul `Laporan Staff Operasional`, workflow Staf Operasional mengikuti skema absensi masuk berbasis geofence dan pelaporan kegiatan harian non-checkpoint (mirip logbook harian kantor).
   - Pengujian fungsi supervisi dan approval staf operasional dapat diwakili oleh akun **Danru** dan **Chief** yang memiliki hak akses monitoring operasional.

---

## 2. Hasil Audit Menu Laporan Staf Operasional

Pada Web Admin Command Center:
- **URL Laporan:** `https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxx` (Laporan Staff Operasional)
- **Struktur Kolom:**
  - Area Penempatan
  - Nama Personel
  - Waktu Absensi / Kegiatan
  - Status & Uraian Kerja
  - Tombol Detail & Cetak
- **Kondisi Tabel:** Saat ini kosong (`No data available in table`) karena kuota 5/5 telah diprioritaskan untuk 3 pilar operasional lapangan utama (Security, Cleaning, Driver).
- **Rekomendasi Arsitektur untuk Monorepo In-House:**
  - Karena sistem monorepo baru adalah **In-House Enterprise Beli Putus**, tidak akan ada batasan kuota lisensi SaaS tiruan. Semua divisi (Satpam, Cleaning, Driver, dan Staff) dapat dibuat tanpa batas (*unlimited personnel*) sesuai struktur korporat.

---

## 3. Matriks Kesimpulan Staf Operasional

| Item Audit | Status | Catatan Teknis |
|:---|:---|:---|
| Form Pendaftaran Staf | **IDENTIFIED** | Didukung oleh form `insert-personil.php` dengan opsi jabatan staf |
| Kuota Tenant | **HARD LIMIT 5** | Kuota penuh (5/5), diblokir oleh tombol merah backend |
| Kompatibilitas Monorepo | **READY** | Monorepo baru tidak memiliki batasan kuota lisensi |
