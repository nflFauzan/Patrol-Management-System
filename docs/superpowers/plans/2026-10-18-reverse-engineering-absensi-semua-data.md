# Reverse Engineering & Implementation Plan: Modul Absensi > Semua Data (100% Parity dengan patroli.site)

> **Spec Evidence Source:** Live DOM, AJAX, Leaflet & CSS Extraction dari `https://patroli.site/xxxx_xxxxxxxxx` via Playwright MCP (User `testi`).  
> **Visual Screenshots:**  
> - Main Table & Filter: `docs/superpowers/screenshots/patroli_site_absensi_semua_data.png`  
> - Modal Detail Absensi: `docs/superpowers/screenshots/patroli_site_absensi_modal_detail.png`

---

## 1. Analisis Perbandingan UI/UX (Live vs Existing Project)

Berdasarkan inspeksi langsung live website `https://patroli.site/xxxx_xxxxxxxxx`:

| Elemen / Fitur | Target 100% Parity (`patroli.site/xxxx_xxxxxxxxx`) | Status di Project Saat Ini |
|---|---|---|
| **Header Card Halaman** | `.card-header.alert.bg-primary.text-light` dengan ikon `<i class="fa fa-clock-o"></i> Data Absensi` | Belum ada, halaman `/absensi` hanya menampilkan Matrix Tab 31-Hari |
| **Batas / Border Container** | `.card-body.border.border-primary.rounded` | Belum ada |
| **Struktur 2-Baris `<thead>` DataTables** | **Baris 1:**<br>1. Dropdown Lokasi (`rowspan="2"`)<br>2. Dropdown Posisi (`rowspan="2"`)<br>3. Dropdown Personil (`rowspan="2"`)<br>4. Header `ABSENSI` (`colspan="2"`)<br>5. Header `AKSI` (`rowspan="2"`)<br>**Baris 2:**<br>1. Header `MASUK`<br>2. Header `PULANG` | Belum ada tabel 2-tier header di web-admin |
| **Filter Header Interaktif** | Dropdown terpasang langsung di baris header tabel:<br>- `#category` (`SEMUA LOKASI`)<br>- `#posisi` (`SEMUA POSISI`, SECURITY, CLEANING SERVICE, DRIVER, STAF)<br>- `#personil` (`SEMUA PERSONIL`, di-load dinamis dari server saat lokasi/posisi dipilih) | Filter terpisah dari tabel |
| **Format Kolom Masuk** | Hari, Tanggal, Jam (Bold), Badge Status (`Tepat Waktu` / `Terlambat`), Durasi Telat (`3 jam 1 menit 17 detik`), Badge Radius (`Dalam Radius Area` / `Luar Radius Area`) | Format generik |
| **Format Kolom Pulang** | Jika belum: Badge abu-abu `Belum Absen Pulang`<br>Jika lupa: Badge info cyan `Lupa absen pulang`<br>Jika sudah: Hari, Tanggal, Jam (Bold), Badge Status, Badge Radius | Format generik |
| **Tombol Aksi** | Tombol Cyan `.detail-absen.btn.btn-info` dengan ikon `fa-search-plus` dan teks `Detail` | Tombol belum sesuai |
| **Modal Detail Absensi (`#myModalab`)** | Modal size `modal-lg` berlatar gelap:<br>1. Header biru `#0d6efd` (`DETAIL ABSENSI`)<br>2. Avatar bulat `150x150` + Nama Personel + Nama Site<br>3. Ringkasan Timestamp Masuk & Pulang<br>4. Banner merah + **Leaflet Map Masuk** (Polyline + Jarak meter + Layer Control OSM/Satelit)<br>5. Banner merah + **Foto Absen Masuk**<br>6. Banner kuning + **Leaflet Map Pulang** (Polyline + Jarak meter)<br>7. Banner kuning + **Foto Absen Pulang** | Modal belum ada peta interaktif Leaflet polyline |

---

## 2. Struktur Visual & DOM Ekstraksi Asli

### A. Kontainer & Tabel DataTables (`#presensi`)
```html
<div class="content">
  <div class="container-fluid">
    <div class="row">
      <div class="col-12" style="margin-top: 100px">
        <div class="card-header alert bg-primary text-light">
          <i class="fa fa-clock-o"></i> <small>Data Absensi</small>
        </div>
        <div class="card-body border border-primary rounded">
          <table id="presensi" class="table-primary display responsive wrap bg-primary rounded dataTable no-footer">
            <thead>
              <tr class="text text-center text-light">
                <th rowspan="2">
                  <select name="category" id="category" class="custom-select border border-danger text-uppercase">
                    <option value="">SEMUA LOKASI</option>
                    <!-- Dinamis per Site -->
                  </select>
                </th>
                <th rowspan="2">
                  <select name="posisi" id="posisi" class="custom-select border border-danger text-uppercase">
                    <option value="">SEMUA POSISI</option>
                    <option value="Security">SECURITY</option>
                    <option value="Cleaning Service">CLEANING SERVICE</option>
                    <option value="Driver">DRIVER</option>
                  </select>
                </th>
                <th rowspan="2">
                  <select name="personil" id="personil" class="custom-select border border-danger text-uppercase">
                    <option value="">SEMUA PERSONIL</option>
                  </select>
                </th>
                <th colspan="2" class="text-center">ABSENSI</th>
                <th rowspan="2">AKSI</th>
              </tr>
              <tr class="text text-center text-light">
                <th>MASUK</th>
                <th>PULANG</th>
              </tr>
            </thead>
            <tbody>
              <!-- Baris Absensi -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
```

### B. Aturan CSS Asli
```css
/* Samakan lebar 6 kolom */
#presensi thead th {
    width: 16.66% !important;
    vertical-align: middle;
    padding: 5px;
    height: 30px;
    text-align: center;
}

#presensi thead select {
    width: 100% !important;
    min-width: 100%;
    height: 38px;
    font-size: 12px;
    text-align: center;
}
```

### C. Struktur Modal Detail Absensi (`#myModalab`)
```html
<div class="modal" id="myModalab">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header alert bg-primary text-light">
        <h4 class="modal-title" id="myModalLabel">DETAIL ABSENSI</h4>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body-absen">
        <div class="container">
          <div class="main-body">
            <!-- 1. Identitas Personel -->
            <div class="card mb-3">
              <div class="card-body text-center">
                <img src="..." class="rounded-circle" width="150px" height="150px">
                <h4>{nama_personil}</h4>
                <p class="text-muted font-size-sm">{nama_site}</p>
              </div>
            </div>

            <!-- 2. Ringkasan Timestamp -->
            <div class="card mb-3">
              <div class="card-body">
                <div class="row">
                  <div class="col-sm-3"><h6>Detail Absen Masuk</h6></div>
                  <div class="col-sm-9 text-secondary">{Hari, DD Mon YYYY | HH:mm:ss}</div>
                </div>
                <hr>
                <div class="row">
                  <div class="col-sm-3"><h6>Detail Absen Pulang</h6></div>
                  <div class="col-sm-9 text-secondary">{Hari, DD Mon YYYY | HH:mm:ss}</div>
                </div>
              </div>
            </div>

            <!-- 3. Peta Absen Masuk -->
            <div class="alert bg-danger text-light mb-3">
              <strong><i class="fa fa-map-marker"></i></strong> Lokasi absen masuk di {nama_site}
            </div>
            <div class="card mb-3">
              <div class="card-body">
                <div id="map_in" style="height: 60vh; width: 100%;"></div>
              </div>
            </div>

            <!-- 4. Foto Absen Masuk -->
            <div class="alert bg-danger text-light mb-3">
              <strong><i class="fa fa-map-marker"></i></strong> FOTO ABSEN MASUK
            </div>
            <div class="card mb-3">
              <div class="card-body">
                <img src="{foto_masuk}" width="100%" class="rounded">
              </div>
            </div>

            <!-- 5. Peta Absen Pulang -->
            <div class="alert bg-warning mb-3">
              <strong><i class="fa fa-map-marker"></i></strong> Lokasi absen pulang di {nama_site}
            </div>
            <div class="card mb-3">
              <div class="card-body">
                <div id="map_out" style="height: 60vh; width: 100%;"></div>
              </div>
            </div>

            <!-- 6. Foto Absen Pulang -->
            <div class="alert bg-warning mb-3">
              <strong><i class="fa fa-map-marker"></i></strong> FOTO ABSEN PULANG
            </div>
            <div class="card mb-3">
              <div class="card-body">
                <img src="{foto_pulang}" width="100%" class="rounded">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 3. Logika Peta Interaktif Leaflet & Polyline (100% Parity)

Setiap peta (`map_in` dan `map_out`) mengimplementasikan:
1. **Marker 1 (Petugas)**: Koordinat GPS absensi petugas dengan label oranye permanen (`Lokasi absen masuk/pulang {nama}`).
2. **Marker 2 (Area/Site)**: Koordinat sentral site dengan label oranye permanen (`Lokasi Area / Site`).
3. **Polyline Garis Biru**: Garis tebal 4px menghubungkan kedua titik.
4. **Tooltip Jarak Tengah**: Label biru di tengah garis menampilkan kalkulasi jarak presisi `Jarak: {distance} meter`.
5. **Multi-layer Map**: Kontrol lapisan OpenStreetMap, Mapbox Streets, dan Satelit.
6. **Auto Zoom / FitBounds**: Memperbesar secara otomatis agar seluruh garis dan kedua marker masuk ke dalam viewport.

---

## 4. Rencana Implementasi

1. **Backend (`apps/backend`)**:
   - Endpoint `GET /api/v1/attendance/records`: Pagination, search, dan filter berdasarkan site, divisi/posisi, dan personil.
   - Endpoint `GET /api/v1/attendance/personil-options`: Mendapatkan daftar opsi personil terfilter berdasarkan site dan divisi.
   - Endpoint `GET /api/v1/attendance/:id/detail`: Mengembalikan data lengkap absensi, koordinat petugas, koordinat site, jarak PostGIS, foto swafoto, dan status keterlambatan.
2. **Web Admin (`apps/web-admin`)**:
   - Komponen `AttendanceSemuaDataView.tsx`: Mengimplementasikan tabel 2-tier header, filter dropdown terintegrasi di header, pagination, dan styling 100% persis `patroli.site`.
   - Komponen `AttendancePatroliDetailModal.tsx`: Mengimplementasikan modal detail lengkap dengan avatar 150x150, timestamp card, 2 peta Leaflet interaktif (`map_in` & `map_out`), dan preview foto absen masuk & pulang.
   - Routing: Hubungkan nav link "Semua Data" di navbar ke tampilan ini.
3. **Pengujian & Verifikasi**:
   - Unit test logika filter dan perhitungan jarak.
   - Typecheck 100% pass di semua workspace.
   - Verifikasi antarmuka langsung.
