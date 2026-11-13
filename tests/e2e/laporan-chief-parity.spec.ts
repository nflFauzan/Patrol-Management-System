import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { authenticateAsAdmin } from './auth-helper';

test.describe('Laporan Security Chief & Detail Modal 100% Parity', () => {
  test.setTimeout(90000);
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(async ({ context, page }) => {
    await authenticateAsAdmin(context, page);
  });

  test('TC-CHF-E2E-01: Verify Laporan Security Chief table and Detail Modal parity', async ({ page }) => {
    const screenshotDir = path.join(__dirname, '../../docs/superpowers/screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // 1. Visit Laporan Security Chief page
    await page.goto('/laporan/security/chief', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=Evaluasi Chief')).toBeVisible();

    // 2. Verify Table Columns & Search Filter
    await expect(page.locator('input[placeholder*="Cari komandan"]')).toBeVisible();
    await expect(page.locator('th:has-text("Lokasi / Site")')).toBeVisible();
    await expect(page.locator('th:has-text("Komandan yang Dievaluasi")')).toBeVisible();
    await expect(page.locator('th:has-text("Kedisiplinan & Koordinasi")')).toBeVisible();
    await expect(page.locator('th:has-text("Status Insiden & Catatan")')).toBeVisible();
    await expect(page.locator('th:has-text("Waktu Evaluasi")')).toBeVisible();
    await expect(page.locator('th:has-text("Aksi")')).toBeVisible();

    // 3. Verify Badges & Content in Table Row
    const row = page.locator('table tbody tr').first();
    await expect(row).toBeVisible();
    await expect(row).toContainText('DANDAN KOMANDAN');
    await expect(row).toContainText('Baik');
    await expect(row).toContainText('Lengkap');

    // Screenshot Table
    await page.screenshot({ path: path.join(screenshotDir, 'local_laporan_chief_table.png'), fullPage: false });

    // 4. Click Detail Button
    const detailBtn = row.locator('button:has-text("Detail")');
    await expect(detailBtn).toBeVisible();
    await detailBtn.click();

    // 6. Verify Modal Container & Title
    await expect(page.locator('h6:has-text("DETAIL KEGIATAN CHIEF")')).toBeVisible();

    // 7. Verify Modal Profile Card
    const profile = page.locator('.komandan-profile');
    await expect(profile).toBeVisible();
    await expect(profile.locator('h3')).toContainText('DANDAN KOMANDAN');
    await expect(profile.locator('.komandan-position')).toContainText('Komandan Regu');
    await expect(profile.locator('.komandan-role')).toContainText('Laporan Komandan');
    await expect(profile.locator('.komandan-status-badge')).toContainText('Selesai');

    // 8. Verify Grid Cards
    await expect(page.locator('h4:has-text("Penilaian Komandan")')).toBeVisible();
    await expect(page.locator('h4:has-text("Kehadiran Regu")')).toBeVisible();
    await expect(page.locator('h4:has-text("Detail Insiden")')).toBeVisible();
    await expect(page.locator('h4:has-text("Catatan")')).toBeVisible();
    await expect(page.locator('h4:has-text("Informasi Laporan")')).toBeVisible();

    // Screenshot Open Modal
    await page.screenshot({ path: path.join(screenshotDir, 'local_laporan_chief_modal_detail.png'), fullPage: false });

    // 9. Close Modal
    const closeBtn = page.locator('button[aria-label="Close"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(page.locator('.komandan-detail')).not.toBeVisible();
  });
});
