import { test, expect } from '@playwright/test';

test.describe('PWA Field App — 100% Parity Touch-Card Grid & Operational Flows', () => {
  test('TC-PWA-E2E-01: Verify all 8 touch cards, greeting, navigation to pages, and panic button', async ({ page }) => {
    // 1. Visit PWA Field App (Unified on Port 3001)
    await page.goto('/validasi-patroli');

    // 2. Verify Greeting Header
    await expect(page.locator('text=HELLO,')).toBeVisible();

    // Wait for initial info modal and dismiss it
    const modalUnderstandBtn = page.getByRole('button', { name: 'Saya Mengerti' });
    try {
      await modalUnderstandBtn.waitFor({ state: 'visible', timeout: 2000 });
      await modalUnderstandBtn.click();
    } catch {}

    // 3. Verify All 8 Touch Cards Matching patroli.site
    await expect(page.getByRole('button', { name: 'ABSEN MASUK' })).toBeVisible();
    await expect(page.locator('button.ps-card:has-text("IZIN")').or(page.locator('button.ps-card:has-text("INPUT")'))).toBeVisible();
    await expect(page.getByRole('button', { name: 'RIWAYAT ABSEN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'RIWAYAT KEGIATAN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PANIC BUTTON' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'UPDATE PROFILE' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'BANTUAN TEKNIS' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LOGOUT SISTEM' })).toBeVisible();

    // 4. Test Absen Masuk -> Navigates to xxxxx_xx.php
    await page.getByRole('button', { name: 'ABSEN MASUK' }).click({ force: true });
    await page.waitForURL('**/validasi-patroli/xxxxx_xx.php');
    await expect(page.locator('text=ABSEN MASUK')).toBeVisible();

    // 5. Test Return to Dashboard
    await page.goto('/validasi-patroli');
    try {
      const modal2 = page.getByRole('button', { name: 'Saya Mengerti' });
      await modal2.waitFor({ state: 'visible', timeout: 2000 });
      await modal2.click();
    } catch {}

    // 6. Test Panic Button SOS -> Navigates to xxxxx_xxxxxxx.php
    await page.getByRole('button', { name: 'PANIC BUTTON' }).click({ force: true });
    await page.waitForURL('**/validasi-patroli/xxxxx_xxxxxxx.php');
    await expect(page.locator('text=memicu sirine')).toBeVisible();

    // 7. Test Return to Dashboard
    await page.goto('/validasi-patroli');
    await expect(page.locator('text=HELLO,')).toBeVisible();
  });
});
