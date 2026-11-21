# FEATURE COMPATIBILITY MATRIX & OFFLINE CONSIDERATIONS
## Patrol Management System — Client Presentation Environment
> **Audit Kompatibilitas Fitur & Analisis Mekanisme Offline Lapangan**  
> **Status:** Final Feature & Offline Specification  
> **Tanggal:** 21 November 2026  
> **Auditor Teknis:** Senior DevOps Engineer & Software Deployment Specialist  

---

## 1. Matriks Kompatibilitas Fitur (Local vs Free Deployment)

Seluruh fitur aktual yang ada pada repository diaudit terhadap lingkungan hosting gratis (Vercel + Cloudflare Pages + Render + Supabase):

| Fitur Aplikasi | Status Lokal | Status Free Deployment | Potensi Risiko & Keterbatasan | Solusi & Mitigasi Teknis |
|---|:---:|:---:|---|---|
| **1. Autentikasi Login & Multi-Role** | ✅ Berjalan (JWT) | ✅ **100% Kompatibel** | Token kedaluwarsa saat sesi demo panjang. | Set `JWT_ACCESS_EXPIRES_IN=8h` agar evaluator tidak sering ter-logout saat presentasi. |
| **2. Pendaftaran Personil & Approval Queue** | ✅ Berjalan | ✅ **100% Kompatibel** | Admin belum menyetujui akun baru. | Sediakan akun demo siap pakai untuk setiap role tanpa perlu registrasi ulang. |
| **3. Account Lockout Protection** | ✅ Berjalan | ✅ **100% Kompatibel** | Evaluator salah memasukkan password berkali-kali hingga akun terkunci. | Berikan instruksi kredensial demo yang jelas pada lembar presentasi. |
| **4. RBAC Engine & Portal Navigation** | ✅ Berjalan (7 Roles, 15 Perms) | ✅ **100% Kompatibel** | Navigasi sidebar tersembunyi jika role salah. | Pastikan akun Superadmin (`admin`) dan Chief Security digunakan saat demo fitur manajerial. |
| **5. CRUD Data Induk (Area, Pos, Personil)** | ✅ Berjalan | ✅ **100% Kompatibel** | Evaluator menghapus data master penting. | Gunakan script seed otomatis untuk merestore data jika terjadi modifikasi saat demo. |
| **6. Dashboard Command Center** | ✅ Berjalan | ✅ **100% Kompatibel** | Cold start backend membuat kartu statistik loading awal lambat. | Jaga backend tetap hangat (*warm*) menggunakan ping UptimeRobot tiap 10 menit. |
| **7. Monitoring Patroli & Peta Leaflet** | ✅ Berjalan (OSM Tile) | ✅ **100% Kompatibel** | Tile peta gagal dimuat jika koneksi internet klien lambat. | Peta menggunakan OpenStreetMap CDN publik tanpa batasan kuota API. |
| **8. Presensi Swafoto (Clock-In / Out)** | ✅ Berjalan | ✅ **100% Kompatibel** | Izin kamera ponsel ditolak oleh browser. | **Wajib HTTPS** di Cloudflare Pages agar browser mengizinkan akses MediaDevices kamera. |
| **9. Validasi Geofence PostGIS** | ✅ Berjalan (Docker PostGIS) | ✅ **100% Kompatibel** | Provider database tidak mendukung fungsi `ST_DWithin`. | Gunakan Supabase PostgreSQL yang telah menyertakan ekstensi PostGIS native. |
| **10. Patroli Satpam & QR Code Scanner** | ✅ Berjalan | ✅ **100% Kompatibel** | Evaluator tidak berada di lokasi koordinat GPS pos asli. | Sistem mendukung toleransi geofence atau koordinat simulasi untuk keperluan uji coba ruangan klien. |
| **11. Checklist Sanitasi Cleaning Service** | ✅ Berjalan | ✅ **100% Kompatibel** | Unggah foto sebelum/sesudah ukuran besar membebani bandwidth. | Kompresi foto Base64 otomatis di sisi klien PWA sebelum dikirim ke backend. |
| **12. Logistik Driver (Rute & Odometer)** | ✅ Berjalan | ✅ **100% Kompatibel** | Validasi input kilometer akhir harus >= awal. | Telah ditangani oleh validasi bisnis di sisi frontend dan backend. |
| **13. Tombol Darurat Panic SOS (3 Detik)** | ✅ Berjalan | ✅ **100% Kompatibel** | Klien hanya mengklik sekali (tidak menahan 3 detik) sehingga alarm tidak terpicu. | Berikan edukasi saat demo bahwa tombol SOS memiliki fitur proteksi *false alarm* (harus ditahan 3 detik). |
| **14. Real-time WebSocket (SOS & GPS)** | ✅ Berjalan (Socket.io) | ✅ **100% Kompatibel** | Serverless function tidak mendukung persistent connection. | Backend dideploy di Render Web Service (container berbasis TCP) yang mendukung Socket.io. |
| **15. Notifikasi WhatsApp Gateway** | ✅ Berjalan (Fonnte) | ⚠️ **Kondisional (Opsional)** | Membutuhkan nomor WhatsApp aktif dan token API gateway Fonnte. | Backend telah dirancang *fault-tolerant*: jika token kosong, sistem otomatis beralih ke simulasi log tanpa error. |
| **16. Modul Penggajian & Rekapitulasi HRIS** | ✅ Berjalan | ✅ **100% Kompatibel** | Perhitungan keterlambatan dan lembur lintas shift malam. | Seluruh kalkulasi dieksekusi di backend Node.js dan teruji pada test suite vitest/jest. |
| **17. Ekspor Laporan Resmi (Excel & PDF)** | ✅ Berjalan (ExcelJS & jsPDF) | ✅ **100% Kompatibel** | Ekspor file memakan memori browser jika data sangat besar. | Pustaka berjalan di browser klien (client-side rendering), tidak membebani server gratis. |
| **18. Penyimpanan Berkas Foto (Media Storage)** | ✅ Berjalan (Disk lokal `./uploads`) | ⚠️ **Risiko Ephemeral Disk** | File pada disk container Render akan hilang saat instance restart/sleep. | **Solusi Staging:** Gunakan Supabase Storage S3 (1GB) untuk persistensi jangka panjang, atau gunakan disk container untuk demo sesi harian. |
| **19. Media Retention Auto-Purge (180 Hari)** | ❌ Belum ada Cron di kode | ⚠️ **GAP Teknis** | File lama tidak terhapus otomatis di backend. | Tidak berdampak pada demo klien (jangka waktu evaluasi hanya beberapa hari/minggu). |
| **20. Mode Offline-First (PWA & IndexedDB)** | ✅ Berjalan | ✅ **100% Kompatibel** | Aplikasi tidak bisa dibuka saat tidak ada koneksi. | Service worker Workbox menyajikan shell aplikasi secara instan dari cache lokal browser. |

---

## 2. Analisis Mendalam Mekanisme Offline & Scanning (Phase 5 Deep-Dive)

Audit terhadap implementasi offline pada `apps/pwa-field` menunjukkan arsitektur **Offline-First** yang sangat matang:

### 2.1. Apakah scanning QR Code bisa dilakukan tanpa koneksi internet?
**YA, 100% BISA.**  
- Komponen scanner `html5-qrcode` memproses decoding video stream dari kamera langsung menggunakan WebAssembly / JavaScript murni di browser ponsel pengguna tanpa memanggil API eksternal.
- Data checkpoint yang diperlukan untuk validasi nama pos disimpan di IndexedDB (`cached_checkpoints`) saat aplikasi pertama kali sinkronisasi.

### 2.2. Apakah hasil scanning tersimpan secara lokal?
**YA.**  
- Saat transaksi presensi, scanning patroli, atau laporan checklist dikirim ketika browser dalam status `navigator.onLine === false` (atau saat request API mengalami timeout/kegagalan jaringan), transaksi otomatis dialihkan ke fungsi `enqueueOfflineTransaction()` (`apps/pwa-field/src/services/offlineQueue.ts`).
- Transaksi disimpan dalam IndexedDB `patrol_field_db` pada object store `offline_queue`.

### 2.3. Struktur Data Antrean Offline (Offline Queue Schema)
Setiap transaksi yang tertunda dibungkus dalam objek transaksi yang memiliki struktur:
```typescript
interface OfflineTransaction {
  id: string;                    // UUID v4 unik yang di-generate di browser
  type: OfflineTransactionType;  // 'ATTENDANCE_CLOCK_IN' | 'PATROL_SCAN' | dll
  payload: any;                  // Payload asli (koordinat, foto Base64, QR token)
  deviceTimestamp: string;       // Timestamp ISO saat petugas menekan tombol di lapangan
  createdAt: string;             // Waktu pencatatan di antrean lokal
  status: 'PENDING_OFFLINE' | 'SYNCING' | 'SYNCED' | 'NEEDS_REVIEW';
  retryCount: number;
  lastError: string | null;
  serverSyncedAt: string | null;
}
```

### 2.4. Mekanisme Sinkronisasi Ketika Koneksi Kembali (Auto-Sync)
- Hook `useOfflineSync` memantau event browser `window.addEventListener('online', ...)`.
- Begitu koneksi internet pulih:
  1. Status sistem berubah menjadi `SYNCING`.
  2. Fungsi `processOfflineQueue()` membaca seluruh item dengan status `PENDING_OFFLINE` yang diurutkan secara kronologis berdasarkan waktu pembuatan (`createdAt ASC`).
  3. Mengirimkan request HTTP satu per satu ke backend.
  4. Jika backend merespons sukses (HTTP 200/201), status item diperbarui menjadi `SYNCED`.
  5. Jika terjadi penolakan bisnis (misal: 400 Bad Request karena checkpoint tidak sah), status berubah menjadi `NEEDS_REVIEW` agar tidak memblokir antrean lainnya.
  6. Data `SYNCED` yang berumur lebih dari 7 hari otomatis dibersihkan via `clearOldSyncedTransactions(7)`.

### 2.5. Pencegahan Duplikasi Data (Idempotency & Duplicate Prevention)
- **Client-Side:** ID transaksi berupa UUID v4 (`generateUUID()`) dibangkitkan seketika saat petugas menekan tombol. Jika request gagal di tengah jalan dan diulang (*retry*), UUID yang dikirim ke backend tetap sama.
- **Server-Side:** Backend menerima `id` dari client dan mengeksekusi operasi database menggunakan klausul `ON CONFLICT (id) DO NOTHING` atau validasi keberadaan record sebelumnya berdasarkan kombinasi `(user_id, checkpoint_id, device_timestamp)`.

### 2.6. Penanganan Konflik Data (Conflict Handling)
- Waktu absensi dan patroli menggunakan **`deviceTimestamp`** (waktu asli saat petugas berada di pos basement tanpa sinyal), bukan waktu saat paket HTTP tiba di server.
- Hal ini mencegah petugas dianggap terlambat (*late*) hanya karena koneksi internet baru didapatkan 30 menit kemudian di area lobby.

### 2.7. Ketahanan Data Browser (Persistent Storage)
- IndexedDB (`idb`) disimpan pada storage terisolasi per domain origin (`https://patrol-pwa.pages.dev`).
- Data di IndexedDB **TIDAK HILANG** meskipun browser ditutup, smartphone di-restart, atau aplikasi dibersihkan dari RAM (*multitasking swipe*).
- Data hanya akan hilang jika pengguna secara sengaja menekan menu "Clear Site Data" di pengaturan aplikasi browser.

### 2.8. Kebutuhan Service Worker & PWA Manifest
- `vite-plugin-pwa` menghasilkan Service Worker (`dist/sw.js`) dengan strategi **NetworkFirst** untuk endpoint API dan **CacheFirst/Precache** untuk file HTML, CSS, JavaScript, dan icon.
- Hal ini memungkinkan aplikasi PWA dapat diinstal ke layar beranda (*Add to Home Screen*) layaknya aplikasi Android/iOS native dan dapat dibuka langsung dalam kondisi mode pesawat (*Airplane Mode*).
