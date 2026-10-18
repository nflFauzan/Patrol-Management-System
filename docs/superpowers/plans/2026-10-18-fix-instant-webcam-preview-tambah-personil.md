# Fix Instant WebCam Live Preview on Form Tambah Personil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menampilkan live stream WebCam secara instan (langsung aktif dan memancarkan video feed kamera laptop/perangkat) saat modal "FORM TAMBAH PERSONEL" dibuka, persis seperti pada `patroli.site`, tanpa delay dan tanpa layar hitam/blank.

**Architecture:** Memperbaiki lifecycle React WebCam di [PersonilManagementView.tsx](file:///c:/project/Patrol-Management-System/apps/web-admin/src/components/PersonilManagementView.tsx) dengan mengeliminasi *ref attachment race condition* (memastikan elemen `<video>` selalu ter-mount dalam DOM dan terikat langsung ke `MediaStream`), menambahkan fallback constraint resolusi fleksibel (`ideal: 640x480` hingga generic `{ video: true }`), serta sinkronisasi state `isCameraActive` dan `capturedPhoto`.

**Tech Stack:** React 18, Next.js 14 App Router, HTML5 `navigator.mediaDevices.getUserMedia`, HTML5 `<video>` & `<canvas>`, Playwright E2E.

**Spec:** Dokumen acuan `patroli.site` pada form tambah personel `#exampleModalCenter` panel `.panel-kamera`.

---

## Global Constraints

- Wajib menggunakan zero-dependency native HTML5 `navigator.mediaDevices.getUserMedia` & `<video>` element.
- Harus kompatibel dengan perangkat laptop, webcam USB eksternal, dan mock media stream browser di lingkungan Playwright.
- Elemen `<video>` wajib memiliki atribut `autoPlay`, `playsInline`, dan `muted` agar browser tidak memblokir autoplay stream.
- Zero Compilation Error across all monorepo workspaces (`@patrol/types`, `@patrol/backend`, `@patrol/pwa-field`, `@patrol/web-admin`).

---

## Review Focus

1. **Ref Attachment Race Condition**: `<video>` tidak boleh di-unmount secara kondisional (`isCameraActive ? <video> : <div>`) karena menyebabkan `videoRef.current` bernilai `null` saat stream tiba dari `getUserMedia`.
2. **Webcam Stream Resolution Fallback**: Kamera hardware laptop lama/driver tertentu menolak constraint ukuran kaku `{ width: 320, height: 240 }`. Harus menggunakan fallback berjenjang ke `{ video: { facingMode: 'user' } }` atau `{ video: true }`.
3. **Capture & Retake Transition**: Saat tombol "Ambil Foto" diklik, frame video di-freeze ke `<canvas>` base64 dan ditampilkan via `<img id="preview-foto">`. Saat "Ambil Ulang Foto" diklik, preview foto disembunyikan dan `<video>` kembali aktif secara mulus tanpa reconnect delay.
4. **Clean Hardware Teardown**: Ketika modal "Tambah Personel" ditutup (`Batal` atau `×`), semua track kamera `stream.getTracks().forEach(t => t.stop())` harus dimatikan agar lampu indikator webcam laptop padam dan hardware tidak terkunci.
5. **Permissions & Error Feedback**: Jika pengguna menolak izin kamera atau webcam tidak terdeteksi, tampilkan pesan status informatif dan fallback tanpa membuat aplikasi freeze.

---

## Task Decomposition

### Task 1: Refactor WebCam Lifecycle & Eliminate Ref Race Condition in `PersonilManagementView.tsx`

**Files:**
- Modify: `apps/web-admin/src/components/PersonilManagementView.tsx:90-140, 1150-1200`

**Interfaces:**
- Consumes: `isTambahModalOpen` boolean state.
- Produces: Instant video stream binding ke `videoRef.current.srcObject`, state `cameraLoading` boolean, dan fallback hardware stream resolution.

- [x] **Step 1: Refactor Kamera Hook & Stream Controller**
  - Buat helper function `startCameraStream()` yang mencoba:
    1. Constraint primer: `{ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } }`
    2. Fallback constraint jika gagal: `{ video: true }`
  - Gunakan ref callback atau `useEffect` terpisah yang mengikat `stream` ke `videoRef.current.srcObject` secara sinkron.
  - Panggil `video.play()` dengan promise `.catch()` agar tidak memicu unhandled rejection jika browser menahan frame pertama.

- [x] **Step 2: Update JSX Struktur DOM `.camera-box`**
  - Pastikan elemen `<video ref={videoRef} autoPlay playsInline muted className="..." />` **selalu ter-mount** dalam DOM saat modal terbuka (gunakan CSS `hidden` / `block` atau `opacity` daripada conditional unmount).
  - Tambahkan indikator status pemuatan ("Mengaktifkan kamera...") saat stream sedang diinisialisasi.
  - Tampilkan `<img id="preview-foto" ... />` hanya ketika `capturedPhoto !== null`.

- [x] **Step 3: Verifikasi Kompilasi & Build**
  - Jalankan `npm run build --workspace=@patrol/web-admin` dan pastikan lolos exit code 0.

---

### Task 2: Automated Playwright E2E Live Video Feed Verification

**Files:**
- Modify: `tests/e2e/personil-flow.spec.ts`

**Interfaces:**
- Consumes: Playwright mock camera args (`--use-fake-ui-for-media-stream`, `--use-fake-device-for-media-stream`).
- Produces: Test assertion bahwa elemen `<video>` memiliki `readyState >= 2` (HAVE_CURRENT_DATA) dan sedang memutar video.

- [x] **Step 1: Tambahkan Assertion Video Playback State pada `personil-flow.spec.ts`**
  - Klik `#btn-tambah`.
  - Tunggu `#exampleModalCenter` terbuka.
  - Verifikasi `<video>` terlihat dan properti `video.readyState >= 2` dan `!video.paused`.
  - Klik `#btn-capture` ("Ambil Foto"), pastikan `<img id="preview-foto">` tampil dengan source data URL base64.
  - Klik `#btn-retake` ("Ambil Ulang Foto"), pastikan `<video>` kembali tampil dan preview foto tersembunyi.
  - Klik "Batal", pastikan stream tracks berhenti.

- [x] **Step 2: Jalankan Test E2E**
  - Jalankan: `npx playwright test tests/e2e/personil-flow.spec.ts`
  - Ekspektasi: PASS 100%.

---

### Task 3: Visual & Physical Device Verification

**Files:**
- Capture: `camera_instant_verified.png`

- [x] **Step 1: Capture screenshot visual**
  - Ambil tangkapan layar browser live yang menampilkan video feed aktif di panel `.panel-kamera`.
- [x] **Step 2: Jalankan full test suite verification**
  - `npm run build --workspaces` (Semua 4 workspace: PASS)
  - `npm test` (Unit tests: 28/28 PASS)
  - `npx playwright test` (E2E tests: 3/3 PASS)
