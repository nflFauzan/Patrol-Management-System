import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './auth-helper';

test.describe('Web Admin Command Center — 100% Parity Navigation & Modules', () => {
  test.setTimeout(90000);
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(async ({ context, page }) => {
    await authenticateAsAdmin(context, page);
  });

  test('TC-ADMIN-E2E-01: Verify Command Center top ribbons and Master Data Personil', async ({ page }) => {
    // 1. Visit Web Admin Home
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 2. Verify Title & Brand
    await expect(page.locator('.brand-text:has-text("TES-PT")')).toBeVisible();

    // 3. Verify KPI Dashboard Elements
    await expect(page.locator('.kpi-label:has-text("TOTAL PERSONIL")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("HADIR HARI INI")')).toBeVisible();

    // 4. Test Navigation to Data Induk -> Personil
    await page.goto('/datainduk/personil', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*datainduk\/personil/, { timeout: 15000 });
    await expect(page.locator('#btn-tambah')).toBeVisible({ timeout: 15000 });
  });

  test('TC-ADMIN-E2E-02: Verify Absensi and Gaji modules navigation', async ({ page }) => {
    // 1. Test Navigation to Absensi
    await page.goto('/absensi', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*absensi/, { timeout: 15000 });

    // 2. Test Navigation to Gaji
    await page.goto('/gaji', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*gaji/, { timeout: 15000 });
  });

  test('TC-ADMIN-E2E-03: Verify Pesan Siaran and Export Laporan modules navigation', async ({ page }) => {
    // 1. Test Navigation to Pesan Siaran
    await page.goto('/pesan-siaran', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*pesan-siaran/, { timeout: 15000 });

    // 2. Test Navigation to Export Laporan
    await page.goto('/export-laporan', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*export-laporan/, { timeout: 15000 });
  });
});
