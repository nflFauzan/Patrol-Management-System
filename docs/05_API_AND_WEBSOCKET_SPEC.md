# Spesifikasi Kontrak REST API & WebSocket Real-Time (Enterprise Single-Tenant)
## Project: Enterprise Patrol & Facility Management System (Beli Putus)
**Versi:** 2.0.0 (Final Enterprise In-House)  
**Protokol:** HTTP/RESTful (Fastify Engine) & WebSocket (Socket.io)  
**Base URL:** `/api/v1` | **WS Path:** `/socket.io/`

---

## 1. Standar Konvensi Respon API

### Respon Sukses (Standard Success Format):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operasi berhasil diselesaikan",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 85
  }
}
```

### Respon Kesalahan (Standard Error Format):
```json
{
  "statusCode": 400,
  "success": false,
  "error": "Bad Request",
  "message": "Presensi ditolak: Posisi GPS berada di luar radius geofence site resmi",
  "details": {
    "distanceMeters": 215.8,
    "maxRadiusMeters": 100
  },
  "timestamp": "2026-10-12T02:40:00Z"
}
```

---

## 2. Katalog Endpoint RESTful API

### A. Modul Konfigurasi Perusahaan & WhatsApp (`/company`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/company/profile` | Autentikasi | Mengambil profil perusahaan, logo, dan status WhatsApp Gateway. |
| `PUT` | `/company/profile` | SuperAdmin | Memperbarui nama PT, alamat, logo, dan konfigurasi API WhatsApp (Token, Group ID). |
| `POST` | `/company/test-whatsapp` | SuperAdmin | Mengirim pesan tes ke grup WhatsApp untuk memverifikasi koneksi gateway. |

---

### B. Modul Autentikasi & Akun (`/auth`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Publik | Login pengguna (username/password), mengembalikan `accessToken` & `refreshToken`. |
| `POST` | `/auth/refresh` | Publik | Perpanjangan access token menggunakan refresh token valid. |
| `GET` | `/auth/me` | Autentikasi | Mendapatkan data profil pengguna dan status presensi hari ini. |
| `PUT` | `/auth/update-password` | Autentikasi | Pembaruan kata sandi mandiri secara aman. |

#### Respon Login (`POST /api/v1/auth/login`):
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "d8e3b1c2-...",
    "user": {
      "id": "7b8e1f2a-...",
      "nik": "SEC-2026-001",
      "username": "satpamtest",
      "fullName": "Budi Satpam Test",
      "role": "PETUGAS",
      "division": "Security",
      "assignedSites": [
        { "id": "f4a2...", "name": "Pabrik Cikarang" }
      ],
      "currentState": "CLOCKED_OUT" // Nilai: CLOCKED_IN, CLOCKED_OUT, ON_LEAVE
    }
  }
}
```

---

### C. Modul Master Data Fasilitas (`/sites`, `/checkpoints`, `/personnel`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/sites` | Pengawas | Menampilkan seluruh cabang/fasilitas (Kantor, Pabrik, Gudang). |
| `POST` | `/sites` | SuperAdmin/HR | Menambah site baru lengkap dengan pin peta koordinat spasial & jam shift. |
| `GET` | `/checkpoints` | Pengawas | Menampilkan titik pantau per site. |
| `POST` | `/checkpoints` | SuperAdmin/HR | Menambah checkpoint baru & menghasilkan token QR terenkripsi `HMAC-SHA256`. |
| `GET` | `/checkpoints/:id/qr-code` | Pengawas | Mengunduh lembar gambar QR Code resolusi tinggi siap cetak A4. |
| `POST` | `/checkpoints/import-excel` | SuperAdmin/HR | Import massal checkpoint dari file XLSX/CSV (maks 500 baris). |
| `GET` | `/personnel` | Pengawas | Menampilkan daftar seluruh karyawan per divisi. |
| `POST` | `/personnel` | SuperAdmin/HR | Mendaftarkan karyawan baru (Satpam, Cleaning, Driver). |

---

### D. Modul Presensi Geofencing (`/attendance`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/clock-in` | Petugas | Absen masuk: divalidasi geofencing PostGIS + foto selfie live. |
| `POST` | `/attendance/clock-out` | Petugas | Absen pulang: kalkulasi otomatis total jam kerja & lembur. |
| `POST` | `/attendance/leave-request` | Petugas | Pengajuan izin/sakit dengan lampiran surat keterangan. |
| `GET` | `/attendance/matrix` | Pengawas | Matriks rekap presensi bulanan kalender tanggal 1–31. |

#### Payload Clock-In (`POST /api/v1/attendance/clock-in`):
```json
{
  "siteId": "f4a2...",
  "latitude": -6.208800,
  "longitude": 106.845600,
  "reason": "Piket Rutin",
  "shiftName": "Pagi",
  "photoKey": "photos/attendances/uuid-selfie.jpg"
}
```

---

### E. Modul Patroli Satpam & Checklist Fasilitas (`/patrol`, `/cleaning`, `/driver`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/patrol/verify-qr` | Satpam | Memvalidasi integritas QR Code checkpoint hasil scan kamera PWA. |
| `POST` | `/patrol/submit-inspection` | Satpam | Submit laporan kondisi pos: `Situasi Aman Terkendali` / `Perlu Tindak Lanjut` + foto. |
| `GET` | `/patrol/logs` | Pengawas | Riwayat log patroli dan rute polyline peta Leaflet. |
| `POST` | `/patrol/tickets/:id/resolve` | Danru/Chief | Formulir tindak lanjut & penyelesaian temuan kerusakan. |
| `POST` | `/cleaning/submit-checklist` | Cleaning | Submit checklist sanitasi ruangan/toilet (lantai, aroma, tisu, sabun) + foto. |
| `POST` | `/driver/start-trip` | Driver | Mulai perjalanan armada: nopol, tipe kendaraan, asal, tujuan, odometer awal. |
| `POST` | `/driver/end-trip` | Driver | Selesai perjalanan: odometer akhir, catatan perjalanan, status tiba. |

---

### F. Modul Panic Button SOS (`/emergency`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/emergency/trigger` | Petugas | Memicu alarm darurat satu sentuhan (kirim GPS ke WS & WhatsApp). |
| `GET` | `/emergency/active` | Pengawas | Menampilkan daftar insiden darurat yang sedang aktif. |
| `POST` | `/emergency/:id/acknowledge` | Danru/Chief | Konfirmasi bahwa bantuan tim pengamanan sedang menuju lokasi. |
| `POST` | `/emergency/:id/resolve` | Danru/Chief | Menutup status darurat setelah penanganan tuntas di lapangan. |

---

### G. Modul Ekspor Kehadiran Siap HRIS (`/reports`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/hris/attendance-excel` | HR/Admin | Streaming download Excel rekap jam kerja, keterlambatan, lembur untuk HRIS. |
| `GET` | `/reports/hris/attendance-csv` | HR/Admin | Streaming download CSV rekap absensi untuk impor sistem payroll. |
| `GET` | `/reports/patrol/summary-pdf` | Chief/Admin | Streaming download PDF rekapitulasi patroli & insiden per site. |

---

## 3. Spesifikasi WebSocket Real-Time (Socket.io)

### Konfigurasi Koneksi:
- **Client URL**: `wss://patrol.domain.com`
- **Path**: `/socket.io/`
- **Handshake Auth**: `auth: { token: "Bearer eyJhbGciOi..." }`
- **Rooms**:
  - `command_center`: Room seluruh administrator, HR/GA, Chief, dan Danru yang sedang memantau dashboard.
  - `site_{site_id}`: Room operasional lokal petugas pada site tertentu.

### Matriks Event WebSocket:
| Nama Event | Arah | Payload | Deskripsi |
| :--- | :--- | :--- | :--- |
| `panic:trigger` | PWA $\rightarrow$ Server | `{ siteId, lat, lng }` | Dikirim oleh PWA saat petugas menekan Panic Button. |
| `panic:alert` | Server $\rightarrow$ Admin Room | `{ alertId, officerName, siteName, lat, lng, time, waSent }` | Server memancarkan alarm ke command center: memicu audio sirine browser & modal darurat. |
| `panic:ack` | Admin $\rightarrow$ Server | `{ alertId }` | Komandan mengonfirmasi respon penanganan. |
| `patrol:incident_reported` | Server $\rightarrow$ Admin Room | `{ siteName, checkpointName, notes, photoUrl }` | Notifikasi realtime temuan status `Perlu Tindak Lanjut`. |
| `officer:clockin` | Server $\rightarrow$ Admin Room | `{ officerName, siteName, shift, time }` | Live feed kehadiran petugas masuk/pulang di dashboard. |
