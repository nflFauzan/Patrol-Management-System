# 06. TESTING AND QUALITY ASSURANCE WORKFLOW
> **Patrol & Facility Management System (Enterprise In-House / Beli Putus)**  
> Panduan Standar Pengujian Perangkat Lunak, Skenario Uji (Test Cases), dan Otomatisasi QA.

---

## 1. Filosofi QA: Standar Sistem Beli Putus

Karena sistem ini dibeli putus oleh klien korporat dan dideploy di infrastruktur private VPS mereka:
1. **Zero Regressions**: Setiap rilis atau perubahan fitur tidak boleh merusak alur presensi, patroli, atau darurat yang sudah berjalan stabil.
2. **Deterministic Calculations**: Perhitungan jam kerja efektif, menit terlambat, dan jam lembur harus 100% konsisten secara matematis untuk menjamin keakuratan rekap data HRIS.
3. **Resilient Geofencing**: Perhitungan batas radius geofence PostGIS harus akurat hingga tingkat meter terhadap kelengkungan bumi (WGS84).
4. **Offline-First Resilience**: Petugas lapangan sering beroperasi di area basement pabrik atau gedung dengan sinyal lemah. PWA wajib dapat dibuka dan mencatat data ke penyimpanan lokal sebelum tersinkronisasi kembali.

---

## 2. Piramida Pengujian (Test Pyramid Architecture)

```
        / \
       /   \       Level 4: End-to-End Testing (Playwright)
      / E2E \      - PWA Flow: Selfie Camera, QR Scanner, 3s Hold SOS
     /-------\     - Admin Flow: Real-time Socket.io Map & Siren
    /         \
   / Integrasi \   Level 3: Database & PostGIS Integration Tests
  /-------------\  - Live PostGIS ST_Distance & ST_DWithin Verification
 /               \ 
/   Unit & Logic  \ Level 2: Business Logic & Math Tests (Jest/Vitest)
------------------- - HRIS Overtime/Late Math, Geofence Boundaries, JWT RBAC
```

---

## 3. Matriks Skenario Pengujian (Test Matrix & Edge Cases)

### A. Modul Presensi & Rekapitulasi HRIS
| Test ID | Skenario Pengujian | Input Kondisi | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-ATT-01** | Check-in dalam radius geofence | Titik GPS berjarak 35m dari pusat site (Radius = 100m) | Status: `Valid`, `isWithinGeofence = true`, check-in berhasil dicatat. |
| **TC-ATT-02** | Check-in di luar radius geofence | Titik GPS berjarak 102m dari pusat site (Radius = 100m) | Status: Ditandai `OUTSIDE_GEOFENCE` (`isWithinGeofence = false`) dengan peringatan. |
| **TC-ATT-03** | Perhitungan keterlambatan dalam batas toleransi | Jam shift: 07:00, Toleransi: 15 menit. Check-in: 07:12 | `lateMinutes = 0`, status tepat waktu. |
| **TC-ATT-04** | Perhitungan keterlambatan melebihi toleransi | Jam shift: 07:00, Toleransi: 15 menit. Check-in: 07:35 | `lateMinutes = 20` menit (35 - 15). |
| **TC-ATT-05** | Perhitungan jam kerja normal (8 jam) | Check-in: 07:00, Check-out: 15:00 (Durasi = 480 menit) | `effectiveWorkingHours = 8.00`, `overtimeHours = 0.00`. |
| **TC-ATT-06** | Perhitungan lembur (Overtime) | Check-in: 07:00, Check-out: 17:30 (Durasi = 630 menit) | `effectiveWorkingHours = 10.50`, `overtimeHours = 2.50`. |
| **TC-ATT-07** | Shift lintas hari (Shift Malam) | Check-in: 23:00 (Hari 1), Check-out: 07:00 (Hari 2) | Durasi terhitung 8 jam, tidak menghasilkan nilai negatif. |

---

### B. Modul Patroli Rute Checkpoint & Sanitasi
| Test ID | Skenario Pengujian | Input Kondisi | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-PAT-01** | Scan QR Checkpoint valid | QR Token sesuai database, GPS berada dalam radius 25m | Scan sukses, log patroli tersimpan, status aman/normal. |
| **TC-PAT-02** | Scan QR Palsu / Tidak Terdaftar | QR Token acak / rekayasa | Ditolak dengan HTTP 400 Bad Request (`Invalid QR`). |
| **TC-PAT-03** | Scan QR Valid tapi Lokasi Jauh (Spoofing) | QR Token valid, namun GPS petugas berjarak 500m | Sistem mencatat flag *anomali lokasi* atau menolak presensi titik. |
| **TC-PAT-04** | Checklist Kebersihan Sanitasi | Petugas Cleaning memilih 4 kriteria sanitasi & swafoto | Record `cleaning_checklists` tersimpan lengkap dengan checklist boolean. |

---

### C. Modul Panic Button SOS & WhatsApp Gateway
| Test ID | Skenario Pengujian | Input Kondisi | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-SOS-01** | Penekanan tombol tidak sengaja (< 3 detik) | Tombol disentuh/ditekan selama 1.5 detik lalu dilepas | Alarm **dibatalkan otomatis**, countdown reset, tidak ada event broadcast. |
| **TC-SOS-02** | Penekanan tombol darurat valid ($\ge$ 3 detik) | Tombol ditahan selama 3 detik penuh | Alarm aktif, database mencatat alert `ACTIVE`, WebSocket `sos:new` dikirim, webhook WA dipanggil. |
| **TC-SOS-03** | Resolusi insiden oleh Danru / Supervisor | Supervisor menekan tombol *Acknowledge* & *Resolve* | Status alert berubah menjadi `ACKNOWLEDGED` ➔ `RESOLVED` dengan catatan resolusi. |

---

### D. Modul Offline PWA & Service Worker
| Test ID | Skenario Pengujian | Input Kondisi | Ekspektasi Hasil |
| :--- | :--- | :--- | :--- |
| **TC-PWA-01** | Akses PWA tanpa koneksi internet | DevTools browser disetel ke mode *Offline* | Halaman PWA tetap muncul dari cache Workbox (`sw.js`), badge *Offline* aktif. |
| **TC-PWA-02** | Antrean transaksi offline | Petugas input kegiatan saat offline | Data tersimpan di IndexedDB lokal dan disinkronkan saat koneksi online pulih. |

---

## 4. Perintah Eksekusi Otomatisasi Uji Coba

```bash
# 1. Jalankan Typecheck & Kompilasi Lintas Monorepo
npm run build

# 2. Jalankan Pengujian Unit & Logika Bisnis (Backend)
npm run test --workspace=@patrol/backend

# 3. Jalankan Pengujian Unit Klien (PWA Field)
npm run test --workspace=@patrol/pwa-field

# 4. Jalankan Pengujian End-to-End Browser (Playwright)
npm run test:e2e
```

---

## 5. SOP Multi-Agent QA Orchestration & Independent Testing

Untuk menjamin kualitas perangkat lunak enterprise tanpa bias penilaian mandiri (*zero self-grading*), proses QA membagi peran ke dalam Main Agent dan 5 Sub-Agent spesialis:

### A. Pembagian Peran Sub-Agent
1. **Main Agent (QA Orchestrator & Integrator)**:
   - Membuat strategi & master test plan.
   - Mengalokasikan port, akun isolasi, dan koordinasi akses database.
   - Mengonsolidasi temuan, menyusun defect triage (P0 - P4), dan mengeksekusi perbaikan kode.
   - Mengarahkan re-test dan regresi independen kepada Sub-Agent.
2. **Sub-Agent 01: Functional QA Agent**:
   - Eksplorasi Playwright/browser tanpa asumsi kode.
   - Pengujian CRUD, tombol, validasi form, navigasi, dan pembatasan role & permission.
   - Output: Feature & Form Inventory, Step-by-Step Test Scenarios, Defect Bug Reports (PASS/FAIL/BLOCKED/NOT TESTED).
3. **Sub-Agent 02: Data Integrity QA Agent**:
   - Audit langsung pada container live PostgreSQL 17 + PostGIS 3.5.
   - Pengujian fungsi spasial PostGIS (`ST_DWithin`, `ST_Distance`) untuk batas geofence.
   - Verifikasi rumus jam lembur, potongan keterlambatan toleransi 15 menit, shift lintas malam, dan orphan records.
   - Output: PostGIS Accuracy Ledger, Schema & Constraint Audit, HRIS Calculation Sheet.
4. **Sub-Agent 03: UI/UX Auditor Agent**:
   - Evaluasi heuristik (Nielsen Norman) dan ergonomi lapangan.
   - Pengujian target sentuh minimal $44 \times 44\text{px}$ pada PWA mobile (viewport 360-412px).
   - Pengujian visual hierarchy, contrast ratio, dan keterbacaan di bawah sinar matahari.
   - Output: Heuristic Scorecard, Touch Target Audit, CSS & Spacing Design Recommendations (tanpa mengubah logika bisnis).
5. **Sub-Agent 04: Offline & Synchronization QA Agent**:
   - Uji pemutusan jaringan (Playwright network emulation / offline mode).
   - Verifikasi Service Worker (Workbox precache) dan penyimpanan lokal IndexedDB.
   - Uji pemulihan koneksi, pengiriman antrean FIFO, dan pencegahan duplikasi data (idempotency key / UUID deduplication).
   - Output: Offline Resilience Matrix, IndexedDB Schema Report, Sync & Idempotency Audit.
6. **Sub-Agent 05: Security & Performance QA Agent**:
   - Uji autentikasi (Bcrypt $\ge 10$, JWT expiration, role tampering).
   - Sanitasi input koordinat GPS dan payload formulir (mencegah SQLi dan XSS).
   - Verifikasi tidak adanya kebocoran data sensitif di console/response.
   - Benchmarking waktu respon API ($< 200\text{ms}$) dan beban koneksi WebSocket.
   - Output: OWASP Security Audit, RBAC Endpoint Matrix, Performance & Latency Report.

### B. Urutan Kerja Wajib (Mandatory Workflow)
```
[Sub-Agent Uji & Kumpulkan Bukti] ➔ [Main Agent Triaging & Perbaikan Kode] ➔ [Sub-Agent Re-Test Independen] ➔ [Operational Sign-Off]
```
Dilarang menyatakan fitur selesai tanpa bukti pengujian independen dari sub-agent terkait.
