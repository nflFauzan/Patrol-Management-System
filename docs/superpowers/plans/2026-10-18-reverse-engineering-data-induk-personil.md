# Reverse Engineering & Implementation Plan: Data Induk Personil (100% Parity dengan patroli.site)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan fitur, antarmuka, formulir, modal, validasi keamanan, dan sistem cetak ID Card pada modul **Data Induk Personil** di Web Admin dan Backend dengan kepatuhan 100% terhadap arsitektur dan UX `https://patroli.site/xxxx_xxxxxxxx`.

**Architecture:** Menggabungkan backend API NestJS + Fastify + PostgreSQL (modul Users, Auth, dan Payroll Settings) dengan frontend Next.js 14 App Router pada komponen `PersonilManagementView`, `PrintIdCardModal`, dan `DataContext`. Seluruh logika cascading filter, verifikasi password admin saat hapus data, penggajian personil terpadu, dan rendering kartu identitas 5 tema ribbon (B1 Navy, B2 Blue, B3 Red, B4 Tech, B5 White) dihubungkan langsung ke live database single-tenant.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, NestJS 10, Fastify, PostgreSQL 17 + PostGIS 3.5, Bcrypt.

**Spec:** [`docs/01_AUDIT_REPORT.md`](file:///c:/project/Patrol-Management-System/docs/01_AUDIT_REPORT.md) & Live Evidence dari `https://patroli.site/xxxx_xxxxxxxx` (Playwright Session).

---

## Global Constraints

- **Single-Tenant Corporate (Beli Putus):** Tidak boleh ada kolom `tenant_id` atau konsep SaaS multi-tenant.
- **Role & Posisi Terpadu:** Mendukung divisi `Security` (Jabatan: Anggota, Komandan, Chief), `Cleaning Service`, `Driver`, `Staf`, dan `Admin Area / Site`.
- **Bcrypt Password Hash:** Password personil di-hash menggunakan cost factor 10, tidak pernah disimpan plain text.
- **Konfirmasi Hapus dengan Password Admin:** Menghapus personil mewajibkan input dan verifikasi password admin aktif (`POST /api/v1/users/:id/verify-delete`).
- **5 Desain Tema Kartu ID Card:** Wajib mendukung rendering sisi depan (foto, nama, jabatan, barcode/QR ID, site) dan sisi belakang (4 poin ketentuan kartu perusahaan) dengan 5 palet tema ribbon asli: B1 Navy (#0b1e3f), B2 Blue (#1877f2), B3 Red (#dc3545), B4 Tech (#202124), dan B5 White (#ffffff).

---

## Review Focus

1. **Password Verification Bypass pada Hapus Personil:** Memastikan aksi hapus tidak dapat dipicu tanpa mencocokkan password admin pengeksekusi di backend.
2. **Cascading Dropdown Area ➔ Posisi ➔ Personel pada Cetak ID Card:** Pilihan posisi hanya aktif setelah Area dipilih; daftar nama terisi sesuai filter dan memiliki opsi `SEMUA PERSONEL`.
3. **Komponen Penggajian Personil (Payroll Data):** Form tambah/edit harus memvalidasi dan menyimpan nominal `gaji_pokok`, `tunjangan`, `lembur`, `potongan_bpjs`, `potongan_tidak_masuk`, dan `potongan_lupa_absensi`.
4. **Penanganan Multi-Site Assignment vs Single-Site:** Mendukung penugasan fleksibel personel ke 1 lokasi atau banyak lokasi fasilitas (`lokasi_site_member[]`).
5. **Kesesuaian Desain Cetak Kartu Fisik (Print CSS Layout):** Memastikan halaman cetak kartu ID Card memiliki ukuran standar kartu identitas (CR80: 85.6mm x 53.98mm) dan bersih dari elemen navigasi browser saat dicetak (`@media print`).

---

## File Structure & Responsibilities

| File Path | Responsibility |
|---|---|
| [`apps/backend/src/modules/users/users.service.ts`](file:///c:/project/Patrol-Management-System/apps/backend/src/modules/users/users.service.ts) | Layanan database untuk personil: CRUD, filter posisi & site, verifikasi password saat hapus data, konfigurasi payroll default. |
| [`apps/backend/src/modules/users/users.controller.ts`](file:///c:/project/Patrol-Management-System/apps/backend/src/modules/users/users.controller.ts) | Endpoint REST API personil (`/api/v1/users`, `/verify-delete`, `/id-card-batch`). |
| [`apps/web-admin/src/lib/DataContext.tsx`](file:///c:/project/Patrol-Management-System/apps/web-admin/src/lib/DataContext.tsx) | State management global untuk daftar personil, sinkronisasi API, modal triggers, dan data cetak. |
| [`apps/web-admin/src/components/PersonilManagementView.tsx`](file:///c:/project/Patrol-Management-System/apps/web-admin/src/components/PersonilManagementView.tsx) | Antarmuka utama Data Induk Personil: header actions, cascading filter cetak ID Card, tabel data dengan filter multi-kolom, modal Tambah Personel 2-panel, modal Edit Personel, dan modal Hapus dengan verifikasi password. |
| [`apps/web-admin/src/components/PrintIdCardModal.tsx`](file:///c:/project/Patrol-Management-System/apps/web-admin/src/components/PrintIdCardModal.tsx) | Modal & preview lembar cetak ID Card 2 sisi dengan 5 palet tema ribbon (B1 Navy, B2 Blue, B3 Red, B4 Tech, B5 White). |
| [`tests/e2e/personil-flow.spec.ts`](file:///c:/project/Patrol-Management-System/tests/e2e/personil-flow.spec.ts) | Pengujian otomasi E2E Playwright mencakup alur Tambah Personil, Edit, Filter Cetak ID Card, dan Hapus Berotentikasi. |

---

## Tasks Breakdown

### Task 1: Backend API Enhancement (CRUD, Payroll Settings, & Delete Password Verification)

**Files:**
- Modify: [`apps/backend/src/modules/users/users.service.ts`](file:///c:/project/Patrol-Management-System/apps/backend/src/modules/users/users.service.ts)
- Modify: [`apps/backend/src/modules/users/users.controller.ts`](file:///c:/project/Patrol-Management-System/apps/backend/src/modules/users/users.controller.ts)
- Test: `apps/backend/src/modules/users/users.spec.ts`

**Interfaces:**
- Consumes: Database connection pool & Bcrypt hasher.
- Produces:
  - `POST /api/v1/users/verify-delete`: `{ adminId: string, targetUserId: string, passwordConfirm: string } -> { success: boolean, message: string }`
  - `POST /api/v1/users`: Create user with payroll fields (`gajiPokok`, `tunjangan`, `lembur`, `potonganBpjs`, `potonganTidakMasuk`, `potonganLupaAbsensi`).
  - `PUT /api/v1/users/:id`: Update user profile & payroll settings.
  - `GET /api/v1/users/id-card-batch`: Get printable card payloads for selected site and position.

- [x] **Step 1: Write the failing unit test for delete password verification & payroll field handling**
- [x] **Step 2: Run test to verify it fails (`npm test --workspace=@patrol/backend`)**
- [x] **Step 3: Implement `verifyAndDeleteUser` with Bcrypt password comparison in `users.service.ts`**
- [x] **Step 4: Implement endpoint and DTOs in `users.controller.ts`**
- [x] **Step 5: Run test to verify it passes**
- [x] **Step 6: Commit backend enhancements**

---

### Task 2: Data Context & State Management Synchronization

**Files:**
- Modify: [`apps/web-admin/src/lib/DataContext.tsx`](file:///c:/project/Patrol-Management-System/apps/web-admin/src/lib/DataContext.tsx)
- Test: Build check (`npm run build --workspace=@patrol/web-admin`)

**Interfaces:**
- Consumes: Backend REST APIs.
- Produces:
  - `UserItem` model enriched with `payroll`: `{ gajiPokok: number, tunjangan: number, lembur: number, potonganBpjs: number, potonganTidakMasuk: number, potonganLupaAbsensi: number }`.
  - `verifyAndDeleteUser(targetId: string, adminPassword: string): Promise<boolean>`
  - `getPersonnelForIdCard(siteName: string, position: string): UserItem[]`

- [x] **Step 1: Update `UserItem` interface with payroll settings and rank details**
- [x] **Step 2: Implement `verifyAndDeleteUser` in `DataContext.tsx` with API call to `/users/verify-delete`**
- [x] **Step 3: Implement cascading helper for ID Card target retrieval**
- [x] **Step 4: Verify TypeScript compilation without errors**
- [x] **Step 5: Commit DataContext updates**

---

### Task 3: Form Tambah Personel 2-Panel (100% Parity dengan `exampleModalCenter`)

**Files:**
- Modify: [`apps/web-admin/src/components/PersonilManagementView.tsx`](file:///c:/project/Patrol-Management-System/apps/web-admin/src/components/PersonilManagementView.tsx)

**Interfaces:**
- Consumes: `useData().sites`, `useData().addUser`.
- Produces: Modal "FORM TAMBAH PERSONEL" dengan layout 2 kolom:
  - **Panel Kiri (Data Personel):**
    - `nama_anggota` (Nama lengkap personel)
    - `jam_kerja` (8-24 jam)
    - `username` & `password`
    - `posisi`: Admin Area, Security, Cleaning Service, Driver, Staf
    - `jabatan_select`: Anggota/Personel, Komandan, Chief (kondisional jika Security)
    - `lokasi_site_anggota` / `lokasi_site_member[]`
  - **Panel Kanan (Gaji & Potongan):**
    - `gaji_pokok`, `tunjangan`, `lembur`
    - `potongan_bpjs`, `potongan_tidak_masuk`, `potongan_lupa_absensi`
  - **Live Selfie / Foto Profil:**
    - Tombol Ambil Foto via webcam atau unggah file foto.

- [x] **Step 1: Implement HTML/CSS styling 2-panel matching patroli.site (`.panel-personil`, `.judul-panel`)**
- [x] **Step 2: Connect state inputs with auto-currency formatting (IDR currency mask)**
- [x] **Step 3: Add conditional dropdown for `jabatan_select` when position is Security**
- [x] **Step 4: Verify form submission saves data to context and backend**
- [x] **Step 5: Commit Form Tambah Personel**

---

### Task 4: Form Edit Personel & Modal Hapus Berotentikasi Password (`modalHapus`)

**Files:**
- Modify: [`apps/web-admin/src/components/PersonilManagementView.tsx`](file:///c:/project/Patrol-Management-System/apps/web-admin/src/components/PersonilManagementView.tsx)

**Interfaces:**
- Consumes: `deleteTarget: UserItem | null`, `verifyAndDeleteUser`.
- Produces:
  - Edit modal prefilled with target personnel's information and payroll settings.
  - Delete protection modal: Peringatan merah box `PERINGATAN PENGHAPUSAN DATA`, menampilkan nama personil yang akan dihapus, dan input password admin wajib isi.

- [x] **Step 1: Implement Edit Modal with pre-loaded values and tab switching**
- [x] **Step 2: Implement `modalHapus` UI matching `patroli.site` warning box and password input**
- [x] **Step 3: Connect delete submission to `verifyAndDeleteUser` with error handling**
- [x] **Step 4: Verify invalid password rejects deletion with red error message**
- [x] **Step 5: Verify valid password deletes personnel and refreshes table**
- [x] **Step 6: Commit Edit & Delete Modals**

---

### Task 5: Cascading Filter Header & Cetak ID Card 5 Tema Ribbon

**Files:**
- Modify: [`apps/web-admin/src/components/PersonilManagementView.tsx`](file:///c:/project/Patrol-Management-System/apps/web-admin/src/components/PersonilManagementView.tsx)
- Modify: [`apps/web-admin/src/components/PrintIdCardModal.tsx`](file:///c:/project/Patrol-Management-System/apps/web-admin/src/components/PrintIdCardModal.tsx)

**Interfaces:**
- Consumes: Cascading selection: `cetak_area` ➔ `cetak_posisi` ➔ `cetak_nama`.
- Produces:
  - Tombol `#btn-cetak` membuka `PrintIdCardModal` dengan data personil yang dipilih atau seluruh personel di posisi/area tersebut (`__SEMUA__`).
  - 5 Tema Ribbon: **B1 Navy**, **B2 Blue**, **B3 Red**, **B4 Tech**, **B5 White**.
  - Layout kartu 2 sisi: Tampak Depan (Front) & Tampak Belakang (Back) lengkap dengan 4 poin ketentuan kartu.

- [x] **Step 1: Implement cascading disabled/enabled logic for `#cetak_area`, `#cetak_posisi`, `#cetak_nama`**
- [x] **Step 2: Add dynamic option loading for `#cetak_nama` including `SEMUA PERSONEL` option**
- [x] **Step 3: Implement exact 5-theme ribbon palette switcher in `PrintIdCardModal.tsx`**
- [x] **Step 4: Implement Front & Back card preview with print-ready CSS (`@media print`)**
- [x] **Step 5: Commit ID Card Printing feature**

---

### Task 6: E2E Automation Testing & Live PostGIS Verification

**Files:**
- Create: `tests/e2e/personil-management-flow.spec.ts`

**Interfaces:**
- Verifies the full user journey: Tambah Personel ➔ Edit ➔ Filter Cetak ID Card ➔ Hapus dengan Verifikasi Password.

- [x] **Step 1: Write Playwright E2E test covering creation of Security, Cleaning, and Driver personnel**
- [x] **Step 2: Test delete password verification (wrong password rejected, correct password approved)**
- [x] **Step 3: Test cascading ID Card selection and 5-theme card modal rendering**
- [x] **Step 4: Run Playwright test suite and verify 100% green**
- [x] **Step 5: Verify all workspaces compile without errors (`npm run build`)**

---

## Self-Review Checklist

- [x] **Spec coverage:** Seluruh fitur di `patroli.site/xxxx_xxxxxxxx` (Form Tambah, Edit, Hapus dengan Password, Header Filter, Tabel Filter Multi-kolom, Cetak ID Card 5 Tema) tercakup dalam Task 1-6.
- [x] **Step scan:** Setiap langkah terdefinisi dengan jelas dan memiliki hasil yang dapat diuji.
- [x] **Type consistency:** Tipe `UserItem`, DTOs, dan parameter fungsi konsisten di seluruh lapisan backend dan frontend.
- [x] **Review Focus:** 5 fokus pengujian (bypass password hapus, cascading filter, validasi payroll, multi-site, dan print CSS) telah dipetakan ke task masing-masing.
- [x] **Proportion:** Rencana terstruktur padat tanpa kode yang membengkak atau spekulatif.
