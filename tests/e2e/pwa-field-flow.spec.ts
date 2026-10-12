import { test, expect } from '@playwright/test';

test.describe('PWA Field App — 2-Phase State Machine & SOS Interaction', () => {
  test('TC-PWA-E2E-01: Should open selfie camera, clock in, verify active shift, and clock out', async ({ page }) => {
    // 1. Visit PWA Field App
    await page.goto('/');

    // 2. Verify Phase 1: Unclocked State UI
    await expect(page.locator('text=Field Patrol System')).toBeVisible();
    await expect(page.locator('text=Shift Belum Dimulai')).toBeVisible();
    const clockInBtn = page.locator('button:has-text("Absen Masuk (Selfie GPS)")');
    await expect(clockInBtn).toBeVisible();

    // 3. Click Clock In -> Opens Camera Modal
    await clockInBtn.click();
    await expect(page.locator('text=Swafoto Absen Masuk')).toBeVisible();

    // 4. Capture photo via camera shutter or fallback
    const shutterBtn = page.locator('button.rounded-full.bg-blue-600');
    if (await shutterBtn.isVisible()) {
      await shutterBtn.click();
      await expect(page.locator('button:has-text("Gunakan Foto")')).toBeVisible();
      await page.locator('button:has-text("Gunakan Foto")').click();
    } else {
      // Fallback close if camera stream unavailable in specific container
      await page.locator('button:has-text("Gunakan Foto")').click();
    }

    // 5. Verify Phase 2: Active Shift & QR Patrol Section
    await expect(page.locator('text=Shift Pagi Aktif')).toBeVisible();
    await expect(page.locator('text=Patroli Rute Checkpoint')).toBeVisible();
    await expect(page.locator('button:has-text("Scan QR Checkpoint")')).toBeVisible();

    // 6. Verify Panic Button SOS button exists
    const sosBtn = page.locator('button:has-text("TEKAN & TAHAN SOS")');
    await expect(sosBtn).toBeVisible();

    // 7. Test Clock Out (Absen Pulang)
    const clockOutBtn = page.locator('button:has-text("Absen Pulang (Selfie Akhir Shift)")');
    await expect(clockOutBtn).toBeVisible();
    await clockOutBtn.click();

    // Verify Camera Modal for Clock Out
    await expect(page.locator('text=Swafoto Absen Pulang')).toBeVisible();
    const shutterOutBtn = page.locator('button.rounded-full.bg-blue-600');
    if (await shutterOutBtn.isVisible()) {
      await shutterOutBtn.click();
      await expect(page.locator('button:has-text("Gunakan Foto")')).toBeVisible();
      await page.locator('button:has-text("Gunakan Foto")').click();
    }

    // 8. Verify back to Phase 1: Unclocked
    await expect(page.locator('text=Shift Belum Dimulai')).toBeVisible();
  });
});
