import { test, expect } from '@playwright/test';

test.describe('PWA Field App — 100% Parity Touch-Card Grid & Operational Flows', () => {
  test('TC-PWA-E2E-01: Verify all 8 touch cards, dual-status banner, selfie clock-in, and modal flows', async ({ page }) => {
    // 1. Visit PWA Field App
    await page.goto('/');

    // 2. Verify Header & Identity
    await expect(page.locator('text=PATROLI SISTEM')).toBeVisible();
    await expect(page.locator('text=HELLO, BUDI SATPAM TEST')).toBeVisible();

    // 3. Verify Dual-Status Indicator
    await expect(page.locator('text=Lokasi:')).toBeVisible();
    await expect(page.locator('text=Kamera:')).toBeVisible();

    // 4. Verify All 8 Touch Cards Matching patroli.site
    await expect(page.locator('text=ABSEN MASUK')).toBeVisible();
    await expect(page.locator('text=INPUT KEGIATAN')).toBeVisible();
    await expect(page.locator('text=RIWAYAT ABSEN')).toBeVisible();
    await expect(page.locator('text=RIWAYAT KEGIATAN')).toBeVisible();
    await expect(page.locator('text=PANIC BUTTON')).toBeVisible();
    await expect(page.locator('text=UPDATE PROFILE')).toBeVisible();
    await expect(page.locator('text=BANTUAN TEKNIS')).toBeVisible();
    await expect(page.locator('text=LOGOUT SISTEM')).toBeVisible();

    // 5. Test Absen Masuk -> Opens Camera Modal
    const clockInBtn = page.locator('button:has-text("ABSEN MASUK")');
    await clockInBtn.click();
    await expect(page.locator('text=Swafoto Absen Masuk')).toBeVisible();

    // Capture photo or use fallback
    const shutterBtn = page.locator('button.rounded-full.bg-blue-600');
    if (await shutterBtn.isVisible()) {
      await shutterBtn.click();
      await page.waitForTimeout(500);
      const usePhotoBtn = page.locator('button:has-text("Gunakan Foto")');
      if (await usePhotoBtn.isVisible()) {
        await usePhotoBtn.click();
      }
    } else {
      // Close modal
      const closeBtn = page.locator('button:has-text("Batal")');
      if (await closeBtn.isVisible()) await closeBtn.click();
    }

    // 6. Test Input Kegiatan / Patrol Scan Modal
    const inputKegiatanBtn = page.locator('button:has-text("INPUT KEGIATAN")');
    await inputKegiatanBtn.click();
    await expect(page.locator('text=Scan QR Code Checkpoint')).toBeVisible();
    await page.locator('button:has(.lucide-x)').first().click();

    // 7. Test Riwayat Absen Modal
    const riwayatAbsenBtn = page.locator('button:has-text("RIWAYAT ABSEN")');
    await riwayatAbsenBtn.click();
    await expect(page.locator('text=Riwayat Absensi')).toBeVisible();
    await page.locator('button:has-text("Tutup")').click();

    // 8. Test Riwayat Kegiatan Modal
    const riwayatKegiatanBtn = page.locator('button:has-text("RIWAYAT KEGIATAN")');
    await riwayatKegiatanBtn.click();
    await expect(page.locator('text=Riwayat Kegiatan & Patroli')).toBeVisible();
    await page.locator('button:has-text("Tutup")').click();

    // 9. Test Panic Button SOS Modal
    const panicBtn = page.locator('button:has-text("PANIC BUTTON")');
    await panicBtn.click();
    await expect(page.locator('text=PANIC BUTTON SOS')).toBeVisible();
    await expect(page.locator('text=Tombol ini akan memicu sirine')).toBeVisible();
    // Close SOS modal via X button
    await page.locator('button:has(.lucide-x)').click();

    // 10. Test Update Profile Modal
    const profileBtn = page.locator('button:has-text("UPDATE PROFILE")');
    await profileBtn.click();
    await expect(page.locator('text=Update Profil Akun')).toBeVisible();
    await expect(page.locator('text=Ganti Password')).toBeVisible();
    await page.locator('button:has-text("Tutup")').click();
  });
});
