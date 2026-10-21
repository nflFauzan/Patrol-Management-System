import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Laporan Security Chief & Detail Modal 100% Parity', () => {
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test('TC-CHF-E2E-01: Verify Laporan Security Chief table and Detail Modal parity', async ({ page }) => {
    const screenshotDir = path.join(__dirname, '../../docs/superpowers/screenshots');

    // 1. Visit Laporan Security Chief page
    await page.goto('/laporan/security/chief', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.card-header.alert.bg-dark', { timeout: 10000 });

    // 2. Verify Container & Header Alert
    const header = page.locator('.card-header.alert.bg-dark');
    await expect(header).toBeVisible();
    await expect(header).toContainText('KEGIATAN CHIEF');

    // 3. Verify Table Columns & Filter
    await expect(page.locator('#filterAreaChief')).toBeVisible();
    await expect(page.locator('th:has-text("Nama Komandan")')).toBeVisible();
    await expect(page.locator('th:has-text("Kedisiplinan")')).toBeVisible();
    await expect(page.locator('th:has-text("Koordinasi")')).toBeVisible();
    await expect(page.locator('th:has-text("Kehadiran")')).toBeVisible();
    await expect(page.locator('th:has-text("Insiden")')).toBeVisible();
    await expect(page.locator('th:has-text("AKSI")')).toBeVisible();

    // 4. Verify Badges in Table Row
    const row = page.locator('table tbody tr').first();
    await expect(row).toBeVisible();
    await expect(row.locator('.badge-secondary')).toContainText('DANDAN KOMANDAN');
    await expect(row.locator('.badge-success').first()).toContainText('Baik');
    await expect(row.locator('.badge-primary')).toContainText('Lengkap');

    // Screenshot Table
    await page.screenshot({ path: path.join(screenshotDir, 'local_laporan_chief_table.png'), fullPage: false });

    // 5. Click Detail Button
    const detailBtn = row.locator('a.detail-record, a:has-text("Detail")');
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
