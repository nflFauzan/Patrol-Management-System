import { test, expect } from '@playwright/test';

test.describe('Web Admin — EXPORT LAPORAN Parity Flow (100% patroli.site Parity)', () => {
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test('TC-EXPORT-E2E-01: Verify 4-Card Layout, Cascading Dropdowns, 5 KPI Chips, and Printable Preview', async ({
    page,
  }) => {
    // 1. Visit Web Admin Export Laporan Page
    await page.goto('/export-laporan');
    await page.waitForLoadState('networkidle');

    // Verify 4 Card Headers
    await expect(page.locator('text=ABSENSI PERSONIL')).toBeVisible();
    await expect(page.locator('text=ABSENSI AREA')).toBeVisible();
    await expect(page.locator('text=KEGIATAN PERSONIL')).toBeVisible();
    await expect(page.locator('text=KEGIATAN AREA')).toBeVisible();

    // 2. Test Card 1: ABSENSI PERSONIL Cascading Dropdown
    const areaSelect = page.locator('#area');
    const kategoriSelect = page.locator('#kategori');
    const personilSelect = page.locator('#personil');

    await expect(areaSelect).toBeVisible();
    await expect(kategoriSelect).toBeVisible();
    await expect(personilSelect).toBeVisible();

    // Select KANTOR PUSAT
    await areaSelect.selectOption('kantor pusat');
    await page.waitForTimeout(300);

    // Select Security
    await kategoriSelect.selectOption('Security');
    await page.waitForTimeout(300);

    // Select Budi Santoso
    await personilSelect.selectOption('budi santoso');

    // 3. Test Printable PDF Modal for Card 1
    const btnPdf1 = page.locator('button:has-text("PDF")').first();
    await btnPdf1.click();

    // Verify Modal & Header
    await expect(page.locator('text=Preview Cetak Dokumen Resmi')).toBeVisible();
    await expect(page.locator('text=CETAK ABSENSI PERSONIL')).toBeVisible();

    // Verify 5 KPI Chips
    await expect(page.locator('text=JUMLAH KEHADIRAN')).toBeVisible();
    await expect(page.locator('text=LUPA ABSEN PULANG')).toBeVisible();
    await expect(page.locator('text=IZIN / SAKIT')).toBeVisible();
    await expect(page.locator('text=TERLAMBAT')).toBeVisible();
    await expect(page.locator('text=PULANG AWAL')).toBeVisible();

    // Verify Table Headers
    await expect(page.locator('th:has-text("ABSEN MASUK")')).toBeVisible();
    await expect(page.locator('th:has-text("ABSEN PULANG")')).toBeVisible();
    await expect(page.locator('th:has-text("JAM EFEKTIF")')).toBeVisible();

    // Close Modal
    await page.locator('.printable-document').locator('..').locator('button:has-text("Cetak")').locator('..').locator('button').last().click();
    await expect(page.locator('text=Preview Cetak Dokumen Resmi')).not.toBeVisible();

    // 4. Test Card 4: KEGIATAN AREA Printable Preview
    const btnPdf4 = page.locator('button:has-text("PDF")').nth(3);
    await btnPdf4.click();

    await expect(page.locator('text=PATROLI SITE - DATA PATROLI PER AREA')).toBeVisible();
    await expect(page.locator('th:has-text("DESKRIPSI TUGAS / TEMUAN")')).toBeVisible();
    await expect(page.locator('th:has-text("STATUS")')).toBeVisible();
    await expect(page.locator('th:has-text("TINDAK LANJUT")')).toBeVisible();
  });
});

