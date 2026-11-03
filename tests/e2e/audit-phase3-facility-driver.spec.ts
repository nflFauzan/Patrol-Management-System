import { test, expect } from '@playwright/test';

test.describe('FASE 3: Audit Divisi Cleaning Service & Driver Logistik Parity', () => {
  test.setTimeout(90000);

  test('TC-PHASE3-01: Verify PWA Field Cleaning Service Mode & Sanitation Checklist Modal', async ({ page }) => {
    await page.goto('http://localhost:8080/pwa', { waitUntil: 'domcontentloaded' });

    // Ensure we switch to Cleaning Service
    const gantiTimBtn = page.locator('button:has-text("Ganti Tim")');
    await expect(gantiTimBtn).toBeVisible();

    // Check current role, click Ganti Tim until CLEANING is reached
    const roleBadge = page.locator('text=CLEANING • ANGGOTA');
    if (!await roleBadge.isVisible()) {
      await gantiTimBtn.click();
      if (!await roleBadge.isVisible()) {
        await gantiTimBtn.click();
      }
    }
    await expect(page.locator('text=CLEANING • ANGGOTA')).toBeVisible();

    // Open Input Kegiatan (Cleaning Scan)
    await page.locator('button:has-text("INPUT KEGIATAN")').click();
    await expect(page.locator('text=Silakan Scan QR Code')).toBeVisible();

    // Select Toilet Checkpoint
    const toiletBtn = page.locator('button:has-text("TOILET1025")');
    await expect(toiletBtn).toBeVisible();
    await toiletBtn.click();

    // Verify Sanitation Checklist Items
    await expect(page.locator('text=Checklist Sanitasi Kebersihan:')).toBeVisible();
    await expect(page.locator('label:has-text("Lantai disapu dan dipel bersih")')).toBeVisible();
    await expect(page.locator('label:has-text("Tempat sampah dikosongkan")')).toBeVisible();
    await expect(page.locator('label:has-text("Sabun & tisu direfill")')).toBeVisible();
    await expect(page.locator('label:has-text("Aroma ruangan normal")')).toBeVisible();

    // Verify Hasil Patroli dropdown & Action buttons
    await expect(page.locator('select[name="tl"]')).toBeVisible();
    await expect(page.locator('button:has-text("Simpan")')).toBeVisible();
    await expect(page.locator('button:has-text("Ulang")')).toBeVisible();

    // Return to dashboard
    const batalBtn = page.locator('button:has-text("Batal")');
    if (await batalBtn.isVisible()) {
      await batalBtn.click();
    }
    const dashboardBtn = page.locator('button:has-text("Kembali ke Dashboard")');
    if (await dashboardBtn.isVisible()) {
      await dashboardBtn.click();
    }
  });

  test('TC-PHASE3-02: Verify PWA Field Driver Mode & Vehicle Trip Odometer Modal', async ({ page }) => {
    await page.goto('http://localhost:8080/pwa', { waitUntil: 'domcontentloaded' });

    // Switch team to DRIVER
    const gantiTimBtn = page.locator('button:has-text("Ganti Tim")');
    const driverBadge = page.locator('text=DRIVER • ANGGOTA');
    while (!await driverBadge.isVisible()) {
      await gantiTimBtn.click();
    }
    await expect(driverBadge).toBeVisible();

    // Verify Dynamic Card Subtitle for Driver
    await expect(page.locator('text=Log Armada & Odometer')).toBeVisible();

    // Open Driver Trip Modal
    await page.locator('button:has-text("INPUT KEGIATAN")').click();

    // Verify Driver Modal Elements
    await expect(page.locator('h3:has-text("Log Perjalanan Driver Logistik")')).toBeVisible();
    await expect(page.locator('text=Pencatatan rute & odometer kendaraan')).toBeVisible();
    await expect(page.locator('text=Plat Nomor Kendaraan:')).toBeVisible();
    await expect(page.locator('text=Tipe Armada:')).toBeVisible();
    await expect(page.locator('text=Lokasi Asal:')).toBeVisible();
    await expect(page.locator('text=Lokasi Tujuan:')).toBeVisible();
    await expect(page.locator('text=Odometer Awal (km):')).toBeVisible();
    await expect(page.locator('button:has-text("Mulai Perjalanan Armada")')).toBeVisible();

    // Close modal via close button
    const closeBtn = page.locator('.fixed button:has(svg)').first();
    await closeBtn.click();
  });

  test('TC-PHASE3-03: Verify Web Admin Laporan Cleaning Service Table Headers & Actions', async ({ page }) => {
    await page.goto('http://localhost:3001/laporan/cleaning-service', { waitUntil: 'domcontentloaded' });

    // Verify Header
    await expect(page.locator('text=KEGIATAN CLEANING SERVICE')).toBeVisible();

    // Verify Table Headers
    await expect(page.locator('th:has-text("LOKASI / SITE")').first()).toBeVisible();
    await expect(page.locator('th:has-text("NAMA PERSONIL")')).toBeVisible();
    await expect(page.locator('th:has-text("KEGIATAN / TEMUAN")')).toBeVisible();
    await expect(page.locator('th:has-text("WAKTU")')).toBeVisible();
    await expect(page.locator('th:has-text("AKSI")')).toBeVisible();

    // Verify Action buttons in rows
    await expect(page.locator('button:has-text("Detail"), a:has-text("Detail")').first()).toBeVisible();
  });

  test('TC-PHASE3-04: Verify Web Admin Laporan Driver Table Headers & Actions', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('http://localhost:3001/laporan/driver', { waitUntil: 'domcontentloaded' });

    // Verify Header
    await expect(page.locator('text=KEGIATAN DRIVER')).toBeVisible();

    // Verify Table Headers
    await expect(page.locator('th:has-text("LOKASI / SITE")').first()).toBeVisible();
    await expect(page.locator('th:has-text("NAMA PERSONIL")')).toBeVisible();
    await expect(page.locator('th:has-text("JENIS KENDARAAN")')).toBeVisible();
    await expect(page.locator('th:has-text("WAKTU")')).toBeVisible();
    await expect(page.locator('th:has-text("TUJUAN")')).toBeVisible();
    await expect(page.locator('th:has-text("STATUS")')).toBeVisible();
    await expect(page.locator('th:has-text("ACTION")')).toBeVisible();

    // Verify Trip Status Badges
    await expect(page.locator('text=BERANGKAT').first()).toBeVisible();
    await expect(page.locator('text=SUDAH SAMPAI').first()).toBeVisible();

    // Wait for hydration and click Detail button on table
    const detailBtn = page.locator('table button:has-text("Detail")').first();
    await expect(detailBtn).toBeVisible();
    await detailBtn.click();

    // Verify Modal Header & Contents
    await expect(page.locator('text=DETAIL KEGIATAN DRIVER')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Informasi Perjalanan')).toBeVisible();
    await expect(page.locator('text=Lokasi Keberangkatan').first()).toBeVisible();
  });
});
