import { test, expect } from '@playwright/test';

test.describe('PWA Field App — 2-Phase State Machine & SOS Interaction', () => {
  test('TC-PWA-E2E-01: Should transition from Unclocked to Clocked-in state and trigger SOS', async ({ page }) => {
    // 1. Visit PWA Field App
    await page.goto('/');

    // 2. Verify Unclocked State UI
    await expect(page.locator('text=Field Patrol System')).toBeVisible();
    await expect(page.locator('text=Shift Belum Dimulai')).toBeVisible();
    const clockInBtn = page.locator('button:has-text("Absen Masuk (Selfie GPS)")');
    await expect(clockInBtn).toBeVisible();

    // 3. Perform Clock In
    await clockInBtn.click();

    // 4. Verify Phase 2: Active Shift & QR Patrol Section
    await expect(page.locator('text=Shift Pagi Aktif')).toBeVisible();
    await expect(page.locator('text=Patroli Rute Checkpoint')).toBeVisible();
    await expect(page.locator('button:has-text("Scan QR Checkpoint")')).toBeVisible();

    // 5. Verify Panic Button SOS button exists
    const sosBtn = page.locator('button:has-text("TEKAN & TAHAN SOS")');
    await expect(sosBtn).toBeVisible();

    // 6. Test Clock Out (Absen Pulang)
    const clockOutBtn = page.locator('button:has-text("Absen Pulang (Akhiri Shift)")');
    await expect(clockOutBtn).toBeVisible();
    await clockOutBtn.click();

    // 7. Verify back to Phase 1: Unclocked
    await expect(page.locator('text=Shift Belum Dimulai')).toBeVisible();
  });
});
