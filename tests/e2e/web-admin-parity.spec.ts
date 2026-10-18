import { test, expect } from '@playwright/test';

test.describe('Web Admin Command Center — 100% Parity Navigation & Modules', () => {
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test('TC-ADMIN-E2E-01: Verify Command Center top ribbons, matrix tabs, payroll, and export center', async ({ page }) => {
    // 1. Visit Web Admin Home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Verify Title & Brand
    await expect(page.locator('.brand-text:has-text("TES-PT")')).toBeVisible();

    // 3. Verify KPI Dashboard Elements
    await expect(page.locator('.kpi-label:has-text("TOTAL PERSONIL")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("HADIR HARI INI")')).toBeVisible();

    // 4. Test Navbar Navigation to Data Induk -> Personil
    await page.locator('button:has-text("Data Induk")').click();
    await expect(page.locator('a.patroli-dropdown-item:has-text("Personil")')).toBeVisible();
    await page.locator('a.patroli-dropdown-item:has-text("Personil")').click();
    await page.waitForURL('**/datainduk/personil');
    await expect(page.locator('#btn-tambah')).toBeVisible();

    // 5. Test Navigation to Absensi
    await page.locator('button:has-text("Absensi")').click();
    await expect(page.locator('a.patroli-dropdown-item:has-text("Semua Data")')).toBeVisible();
    await page.locator('a.patroli-dropdown-item:has-text("Semua Data")').click();
    await page.waitForURL('**/absensi');

    // 6. Test Navigation to Gaji
    await page.locator('a[href="/gaji"]').click();
    await page.waitForURL('**/gaji');

    // 7. Test Navigation to Pesan Siaran
    await page.locator('a[href="/pesan-siaran"]').click();
    await page.waitForURL('**/pesan-siaran');

    // 8. Test Navigation to Export Laporan
    await page.locator('a[href="/export-laporan"]').click();
    await page.waitForURL('**/export-laporan');
  });
});
