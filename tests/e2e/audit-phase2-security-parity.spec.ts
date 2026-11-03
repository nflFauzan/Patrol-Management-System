import { test, expect } from '@playwright/test';

test.describe('FASE 2: Audit Divisi Security (Satpam) — PWA Field & Laporan Web Admin Parity', () => {
  test.setTimeout(90000);

  test('TC-PHASE2-01: Verify PWA Field Satpam 8 Touch Cards, Dual Status & Profile Header', async ({ page }) => {
    // Navigate via Unified Gateway to avoid SSL cert warnings
    await page.goto('http://localhost:8080/pwa', { waitUntil: 'domcontentloaded' });

    // 1. App Header & Title
    await expect(page.locator('h1')).toContainText('PATROLI SISTEM');
    await expect(page.locator('text=Online')).toBeVisible();

    // 2. Profile Greeting & Role Badge
    await expect(page.locator('text=SECURITY • ANGGOTA')).toBeVisible();

    // 3. Sensor Readiness Indicators (GPS & Camera)
    await expect(page.locator('text=Lokasi:')).toBeVisible();
    await expect(page.locator('text=Kamera:')).toBeVisible();

    // 4. 8 Operational Touch Cards (100% Parity with patroli.site/validasi-patroli/)
    await expect(page.locator('button:has-text("ABSEN MASUK")')).toBeVisible();
    await expect(page.locator('button:has-text("INPUT KEGIATAN")')).toBeVisible();
    await expect(page.locator('button:has-text("RIWAYAT ABSEN")')).toBeVisible();
    await expect(page.locator('button:has-text("RIWAYAT KEGIATAN")')).toBeVisible();
    await expect(page.locator('button:has-text("PANIC BUTTON")')).toBeVisible();
    await expect(page.locator('button:has-text("UPDATE PROFILE")')).toBeVisible();
    await expect(page.locator('a:has-text("BANTUAN TEKNIS")')).toBeVisible();
    await expect(page.locator('button:has-text("LOGOUT SISTEM")')).toBeVisible();

    // 5. Izin / Alpha Application Trigger
    await expect(page.locator('button:has-text("Ajukan Form Izin / Sakit / Cuti")')).toBeVisible();
  });

  test('TC-PHASE2-02: Verify PWA Absen Masuk Modal & Geofence / Selfie Flow', async ({ page }) => {
    await page.goto('http://localhost:8080/pwa', { waitUntil: 'domcontentloaded' });

    // Click Absen Masuk card
    const btnAbsen = page.locator('button:has-text("ABSEN MASUK")');
    await btnAbsen.click();

    // Verify Selfie Modal elements (Swafoto Absen Masuk)
    await expect(page.locator('h3:has-text("Swafoto Absen Masuk")')).toBeVisible();

    // Verify camera viewfinder container is present
    await expect(page.locator('.aspect-\\[3\\/4\\]')).toBeVisible();

    // Close modal via top-right close button
    const closeBtn = page.locator('.fixed button:has(svg)').first();
    await closeBtn.click();
  });

  test('TC-PHASE2-03: Verify PWA Panic Button SOS Modal & 3-Second Hold / False Alarm Prevention', async ({ page }) => {
    await page.goto('http://localhost:8080/pwa', { waitUntil: 'domcontentloaded' });

    // Open Panic SOS
    const btnPanic = page.locator('button:has-text("PANIC BUTTON")');
    await btnPanic.click();

    // Verify Panic Modal Content
    await expect(page.locator('h2:has-text("PANIC BUTTON SOS")')).toBeVisible();
    await expect(page.locator('text=memicu sirine di perangkat anggota yang lain & Web Command Center')).toBeVisible();
    await expect(page.locator('button:has-text("TEKAN & TAHAN (3 DETIK)")')).toBeVisible();
    await expect(page.locator('text=Koordinat GPS Anda:')).toBeVisible();

    // Close modal via close button
    const closeBtn = page.locator('.fixed button:has(svg)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test('TC-PHASE2-04: Verify PWA Patrol Scan Modal & Inspection Form (cek.php Parity)', async ({ page }) => {
    await page.goto('http://localhost:8080/pwa', { waitUntil: 'domcontentloaded' });

    // Open Patrol Scanner
    const btnScan = page.locator('button:has-text("INPUT KEGIATAN")');
    await btnScan.click();

    // Verify Step 1: Scanner view
    await expect(page.locator('text=Silakan Scan QR Code')).toBeVisible();
    await expect(page.locator('input[placeholder*="kode aset"]')).toBeVisible();

    // Simulate scanning checkpoint via quick test button
    const checkpointBtn = page.locator('button:has-text("POS GERBANG UTAMA")');
    await expect(checkpointBtn).toBeVisible();
    await checkpointBtn.click();

    // Verify Step 2: Inspection Form (cek.php parity)
    await expect(page.locator('text=POS GERBANG UTAMA')).toBeVisible();
    await expect(page.locator('text=PEMERIKSAAN AKSES MASUK TAMU')).toBeVisible();
    await expect(page.locator('select[name="tl"]')).toBeVisible();
    await expect(page.locator('button:has-text("Simpan")')).toBeVisible();
    await expect(page.locator('button:has-text("Ulang")')).toBeVisible();

    // Return to dashboard via step Batal -> Kembali ke Dashboard
    const batalBtn = page.locator('button:has-text("Batal")');
    if (await batalBtn.isVisible()) {
      await batalBtn.click();
    }
    const dashboardBtn = page.locator('button:has-text("Kembali ke Dashboard")');
    if (await dashboardBtn.isVisible()) {
      await dashboardBtn.click();
    }
  });

  test('TC-PHASE2-05: Verify Web Admin Laporan Security Anggota, Komandan, Chief & Tracking Patroli', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Laporan Security Anggota
    await page.goto('http://localhost:3001/laporan/security/anggota', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('th:has-text("LOKASI / SITE")').first()).toBeVisible();
    await expect(page.locator('th:has-text("NAMA PERSONIL")')).toBeVisible();
    await expect(page.locator('th:has-text("KEGIATAN / TEMUAN")')).toBeVisible();
    await expect(page.locator('th:has-text("WAKTU")')).toBeVisible();
    await expect(page.locator('th:has-text("AKSI")')).toBeVisible();

    // 2. Laporan Komandan
    await page.goto('http://localhost:3001/laporan/security/komandan', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('th:has-text("SHIFT")')).toBeVisible();
    await expect(page.locator('th:has-text("NAMA KOMANDAN")')).toBeVisible();
    await expect(page.locator('th:has-text("KEHADIRAN PERSONIL")')).toBeVisible();
    await expect(page.locator('th:has-text("CATATAN")')).toBeVisible();

    // 3. Laporan Chief
    await page.goto('http://localhost:3001/laporan/security/chief', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('th:has-text("Nama Komandan")')).toBeVisible();
    await expect(page.locator('th:has-text("Kedisiplinan")')).toBeVisible();
    await expect(page.locator('th:has-text("Koordinasi")')).toBeVisible();
    await expect(page.locator('th:has-text("Kehadiran")')).toBeVisible();
    await expect(page.locator('th:has-text("Insiden")')).toBeVisible();

    // 4. Tracking Patroli
    await page.goto('http://localhost:3001/laporan/tracking-patroli', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=Tracking Patroli Personil')).toBeVisible();
    await expect(page.locator('button:has-text("Filter")')).toBeVisible();
    await expect(page.locator('button:has-text("Cetak / Download PDF")')).toBeVisible();
  });
});

