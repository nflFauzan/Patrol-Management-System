# PHASE 4 — IMPLEMENTATION MASTER PLAN
> **Patrol & Facility Management System (Enterprise In-House Single-Tenant Beli Putus)**  
> **Status:** APPROVED FOR EXECUTION  
> **Target:** Zero Compilation Error, 100% Business Logic Integrity, Live PostGIS Verification

---

## 1. Implementation Overview & Objectives

Rencana implementasi ini dirancang untuk menyelesaikan seluruh kesenjangan (gaps) yang teridentifikasi pada Phase 2 dan Phase 3 secara terstruktur, deterministik, dan tanpa regresi terhadap 119 unit tests yang sudah ada.

```
[Phase 4 Plan] ➔ [Step 1: Packages/Types] ➔ [Step 2: Backend Modules] ➔ [Step 3: PWA Field App] ➔ [Step 4: Web Admin] ➔ [Step 5: Verifikasi Build & QA]
```

---

## 2. File-by-File Work Breakdown

### Step 1: Shared Types SSOT (`packages/types`)
- **File:** `packages/types/src/index.ts`
- **Tindakan:**
  - Perbarui interface `SubmitCleaningChecklistDto` untuk mencakup 6 sub-checklist:
    - `floorCleaned`: boolean (Lantai bersih dan dipel)
    - `trashEmptied`: boolean (Tempat sampah kosong & plastik baru)
    - `soapRestocked`: boolean (Sabun cuci tangan / sanitizer terisi)
    - `mirrorCleaned`: boolean (Cermin & wastafel bersih)
    - `tissueRestocked`: boolean (Tisu / pengering tangan tersedia)
    - `odorFreshened`: boolean (Pengharum ruangan / aroma segar)
  - Sempurnakan interface `DriverTripLog` dan DTO:
    - Tambahkan atribut `arrivedAt`, `odometerEnd`, `distanceKm`, `arrivalPhotoKey`, `arrivalLatitude`, `arrivalLongitude`.
  - Tambahkan DTO dan interface untuk `StaffActivityLog`:
    - `activityType` (8 kategori baku), `description`, `status`, `siteId`, `userId`.
- **Verifikasi:** `npm run build --workspace=@patrol/types`.

---

### Step 2: Backend Modules (`apps/backend`)
- **Files:**
  1. `apps/backend/src/modules/cleaning/cleaning.service.ts`:
     - Tambahkan dukungan untuk 6 sub-checklist sanitasi pada penyimpanan query `cleaning_checklists`.
  2. `apps/backend/src/modules/driver/driver.service.ts`:
     - Sempurnakan `completeTrip`: terima koordinat kedatangan, foto speedometer akhir, hitung jarak KM, simpan ke database dan broadcast WebSocket event.
     - Sempurnakan `getActiveTrip` untuk memvalidasi keberangkatan yang sedang berjalan.
  3. `apps/backend/src/modules/staff/` (Modul Baru):
     - `staff.module.ts`, `staff.controller.ts`, `staff.service.ts`, `staff.service.spec.ts`.
     - Endpoints: `POST /staff/activities`, `GET /staff/activities`, `GET /staff/categories`.
  4. `apps/backend/src/modules/patrol/patrol.service.ts`:
     - Dukung pilihan status hasil patroli ("Situasi Aman Terkendali" vs "Perlu Tindak Lanjut") dengan tiket insiden otomatis dan broadcast Command Center.
  5. `apps/backend/src/app.module.ts`:
     - Daftarkan `StaffModule` ke dalam daftar modul utama NestJS.
- **Verifikasi:** `npm run test --workspace=@patrol/backend` & `npm run build --workspace=@patrol/backend`.

---

### Step 3: PWA Field App Workflow Upgrades (`apps/pwa-field`)
- **Files:**
  1. `apps/pwa-field/src/services/api.ts`:
     - Tambahkan method `staffApi.createActivity` dan `staffApi.getActivities`.
     - Update method `driverApi.completeTrip` dan `driverApi.getActiveTrip`.
     - Update `cleaningApi.submitChecklist` dengan 6 sub-checklist.
  2. `apps/pwa-field/src/pages/PatrolScanPage.tsx`:
     - Hapus hardcoded `siteId` dummy; gunakan `user.siteId` dari konteks autentikasi.
     - Tambahkan selector kondisi pos: "Situasi Aman Terkendali" atau "Perlu Tindak Lanjut".
     - Jika "Perlu Tindak Lanjut", tampilkan form input deskripsi insiden temuan.
  3. `apps/pwa-field/src/pages/DriverTripPage.tsx`:
     - Periksa secara otomatis apakah driver memiliki perjalanan yang sedang aktif via `driverApi.getActiveTrip()`.
     - Jika ADA perjalanan aktif: Tampilkan form "Selesaikan Perjalanan" (input odometer akhir, foto speedometer, kalkulasi jarak KM langsung di layar).
     - Jika TIDAK ADA: Tampilkan form "Catat Keberangkatan" (tipe kendaraan, nopol, tujuan, odometer awal, foto).
  4. `apps/pwa-field/src/pages/CleaningChecklistPage.tsx` (Halaman Baru):
     - Dedicated workflow untuk petugas Cleaning Service:
       - Pilihan checkpoint zona / scan QR zona sanitasi.
       - 6 sub-checklist interaktif (checkbox).
       - Kamera pengambil foto hasil kerja.
       - Offline support via `enqueueOfflineTransaction`.
  5. `apps/pwa-field/src/pages/StaffActivityPage.tsx`:
     - Refactor dari mock axios `/insert_staf.php` ke `staffApi.createActivity`.
     - 8 Kategori kegiatan baku dengan input deskripsi terstruktur.
  6. `apps/pwa-field/src/App.tsx`:
     - Daftarkan rute `/cleaning-checklist` dan tautkan di Dashboard PWA sesuai peran `CLEANER`.
- **Verifikasi:** `npm run build --workspace=@patrol/pwa-field`.

---

### Step 4: Web Admin Command Center Integration (`apps/web-admin`)
- **Files:**
  1. `apps/web-admin/src/components/LaporanCleaningServiceView.tsx`:
     - Hubungkan detail modal dengan data 6 sub-checklist sanitasi.
  2. `apps/web-admin/src/components/LaporanDriverView.tsx`:
     - Pastikan odometer awal, odometer akhir, dan total jarak KM ditampilkan secara akurat dari data real database.
  3. `apps/web-admin/src/components/LaporanStaffView.tsx`:
     - Hubungkan langsung ke endpoint `staffApi` backend.
  4. `apps/web-admin/src/components/LaporanSecurityAnggotaView.tsx`:
     - Sempurnakan filter dan modal tindak lanjut insiden (`PatroliTindakLanjutModal`).
- **Verifikasi:** `npm run build --workspace=@patrol/web-admin`.

---

### Step 5: Comprehensive QA & Validation (Definition of Done)
1. **Zero Compilation Error:** Build bersih di semua 4 workspace.
2. **Unit & Logic Testing:** Seluruh test suite backend lulus 100%.
3. **Live Database Integration:** Verifikasi transaksi nyata di database PostgreSQL + PostGIS container.
4. **End-to-End Scenario Testing:** Skenario alur kerja lengkap diuji.

---
**Status:** SIAP DIEKSEKUSI SECARA BERURUTAN PADA PHASE 5.

