import { test, expect } from '@playwright/test';

test.describe('FASE 4: Audit Reporting Engine, HRIS Recap, Emergency SOS & Export Center Parity', () => {
  test.setTimeout(90000);

  test('TC-PHASE4-01: Export Laporan 4-Card Cascading Layout & Filter Fields Parity', async ({ page }) => {
    await page.goto('http://localhost:3001/export-laporan', { waitUntil: 'domcontentloaded' });

    // Verify main header
    await expect(page.locator('h1')).toContainText('Export Laporan');

    // Verify Card 1: ABSENSI PERSONIL
    await expect(page.locator('span:has-text("ABSENSI PERSONIL")')).toBeVisible();
    await expect(page.locator('select#area')).toBeVisible();
    await expect(page.locator('select#kategori')).toBeVisible();
    await expect(page.locator('select#personil')).toBeVisible();
    await expect(page.locator('button:has-text("PDF")').first()).toBeVisible();
    await expect(page.locator('button:has-text("EXCEL")').first()).toBeVisible();

    // Verify Card 2: ABSENSI AREA
    await expect(page.locator('span:has-text("ABSENSI AREA")')).toBeVisible();
    await expect(page.locator('select#area2')).toBeVisible();
    await expect(page.locator('select#kategori2')).toBeVisible();

    // Verify Card 3: KEGIATAN PERSONIL
    await expect(page.locator('span:has-text("KEGIATAN PERSONIL")')).toBeVisible();
    await expect(page.locator('select#area3')).toBeVisible();
    await expect(page.locator('select#kategori3')).toBeVisible();
    await expect(page.locator('select#personil3')).toBeVisible();

    // Verify Card 4: KEGIATAN AREA
    await expect(page.locator('span:has-text("KEGIATAN AREA")')).toBeVisible();
    await expect(page.locator('select#area4')).toBeVisible();
    await expect(page.locator('select#kategori4')).toBeVisible();
  });

  test('TC-PHASE4-02: PDF Official Print Preview & 5 KPI Attendance Chips Verification', async ({ page }) => {
    await page.goto('http://localhost:3001/export-laporan', { waitUntil: 'domcontentloaded' });

    // Click "PDF" on Card 1
    const card1PdfBtn = page.locator('button:has-text("PDF")').first();
    await expect(card1PdfBtn).toBeVisible();
    await card1PdfBtn.click();

    // Verify Print Modal appears
    const modalTitle = page.locator('text=Preview Cetak Dokumen Resmi');
    await expect(modalTitle).toBeVisible({ timeout: 15000 });

    // Verify 5 KPI Attendance Chips in Document Header
    await expect(page.locator('span:has-text("JUMLAH KEHADIRAN")')).toBeVisible();
    await expect(page.locator('span:has-text("LUPA ABSEN PULANG")')).toBeVisible();
    await expect(page.locator('span:has-text("IZIN / SAKIT")')).toBeVisible();
    await expect(page.locator('span:has-text("TERLAMBAT")')).toBeVisible();
    await expect(page.locator('span:has-text("PULANG AWAL")')).toBeVisible();

    // Verify Table Columns in PDF Preview
    await expect(page.locator('th:has-text("NO")').first()).toBeVisible();
    await expect(page.locator('th:has-text("ABSEN MASUK")').first()).toBeVisible();
    await expect(page.locator('th:has-text("ABSEN PULANG")').first()).toBeVisible();
    await expect(page.locator('th:has-text("FOTO IN")').first()).toBeVisible();
    await expect(page.locator('th:has-text("KETERANGAN")').first()).toBeVisible();
    await expect(page.locator('th:has-text("JAM EFEKTIF")').first()).toBeVisible();

    // Verify Corporate Signatures in PDF Preview
    await expect(page.locator('text=Petugas / Pelapor')).toBeVisible();
    await expect(page.locator('text=HRD & OPERATIONS MANAGER')).toBeVisible();

    // Close preview modal by clicking the X button
    const closeBtn = page.locator('button:has(svg.lucide-x)');
    await closeBtn.click();
    await expect(modalTitle).not.toBeVisible();
  });

  test('TC-PHASE4-03: Emergency SOS Command Center, Live Status & Spatial Map Parity', async ({ page }) => {
    await page.goto('http://localhost:3001/emergency', { waitUntil: 'domcontentloaded' });

    // Verify page header & live WebSocket status
    await expect(page.locator('h1:has-text("Emergency SOS Command Center")')).toBeVisible();
    await expect(page.locator('text=Live WebSocket Sinkron')).toBeVisible();
    await expect(page.locator('button:has-text("Sirine Audio Aktif")')).toBeVisible();

    // Verify Log Data Emergency Table Headers
    await expect(page.locator('th:has-text("FOTO")')).toBeVisible();
    await expect(page.locator('th:has-text("NAMA PERSONIL")')).toBeVisible();
    await expect(page.locator('th:has-text("WAKTU")')).toBeVisible();
    await expect(page.locator('th:has-text("LOKASI AREA/SITE")')).toBeVisible();
    await expect(page.locator('th:has-text("AKSI")')).toBeVisible();

    // Verify Row 1: budi santoso (Security)
    const budiRow = page.locator('tr:has-text("budi santoso")');
    await expect(budiRow).toBeVisible();
    await expect(budiRow.locator('text=kantor pusat')).toBeVisible();

    // Open "Cek Lokasi" modal
    const cekLokasiBtn = budiRow.locator('button:has-text("Cek Lokasi")');
    await expect(cekLokasiBtn).toBeVisible();
    await cekLokasiBtn.click();

    // Verify Modal Details
    const modalHeader = page.locator('h3:has-text("DETAIL LOG EMERGENCY")');
    await expect(modalHeader).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=PETA LOKASI PETUGAS (RADIUS 100 METER)')).toBeVisible();
    await expect(page.locator('a:has-text("Buka di Google Maps")')).toBeVisible();

    // Verify Action buttons in modal
    await expect(page.locator('button:has-text("Tandai Selesai / Teratasi")')).toBeVisible();
    await expect(page.locator('button:has-text("Tutup")')).toBeVisible();

    // Close modal
    await page.locator('button:has-text("Tutup")').click();
    await expect(modalHeader).not.toBeVisible();
  });
});
