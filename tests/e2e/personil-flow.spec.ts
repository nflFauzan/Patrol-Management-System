import { test, expect } from '@playwright/test';

test.describe('Web Admin — Data Induk Personil Flow & Parity (100% patroli.site)', () => {
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test('TC-PERSONIL-E2E-01: Verify 2-Panel Form Tambah, Cascading ID Card Filter, and Password-Protected Deletion', async ({
    page,
  }) => {
    // 1. Visit Web Admin Data Induk Personil
    await page.goto('/datainduk/personil');
    await page.waitForLoadState('networkidle');

    // Verify Title & Header Action Buttons
    await expect(page.locator('#btn-tambah')).toBeVisible();
    await expect(page.locator('#btn-import')).toBeVisible();

    // 2. Test Cascading Filter Cetak ID Card
    const areaSelect = page.locator('#cetak_area');
    const posisiSelect = page.locator('#cetak_posisi');
    const namaSelect = page.locator('#cetak_nama');
    const btnCetak = page.locator('#btn-cetak');

    await expect(areaSelect).toBeVisible();
    await expect(posisiSelect).toBeDisabled();
    await expect(namaSelect).toBeDisabled();
    await expect(btnCetak).toBeDisabled();

    // Select Area
    await expect(areaSelect.locator('option')).toHaveCount(3);
    await areaSelect.selectOption('Site Proyek Demo');
    await expect(posisiSelect).toBeEnabled();

    // Select Posisi
    await posisiSelect.selectOption('Security');
    await expect(namaSelect).toBeEnabled();

    // Select 'SEMUA PERSONEL' option
    await namaSelect.selectOption('__SEMUA__');
    await expect(btnCetak).toBeEnabled();

    // 3. Test ID Card Modal & 5-Theme Ribbon Switcher
    await btnCetak.click();
    await expect(page.locator('text=Cetak Kartu Tanda Anggota (ID Card Resmi)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'B1 Navy', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'B2 Blue', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'B3 Red', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'B4 Tech', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'B5 White', exact: true })).toBeVisible();

    // Switch theme to B3 Red
    await page.getByRole('button', { name: 'B3 Red', exact: true }).click();
    await expect(page.locator('button:has-text("Cetak Kartu ID (B3 Red)")')).toBeVisible();

    // Close ID Card modal
    await page.locator('button:has-text("Tutup")').click();

    // 4. Test 2-Panel Form Tambah Personil Modal (100% patroli.site parity)
    await page.locator('#btn-tambah').click();
    await expect(page.locator('#exampleModalCenter')).toBeVisible();
    await expect(page.locator('#exampleModalCenter .modal-title')).toContainText('FORM TAMBAH PERSONEL');
    await expect(page.locator('.panel-personil').getByText('DATA PERSONEL', { exact: true })).toBeVisible();
    await expect(page.locator('.panel-personil').getByText('GAJI, TUNJANGAN & POTONGAN', { exact: true })).toBeVisible();
    await expect(page.locator('.panel-kamera').getByText('FOTO PERSONEL', { exact: true })).toBeVisible();
    await expect(page.locator('#btn-capture')).toBeVisible();
    await expect(page.locator('#jam_kerja')).toBeVisible();
    await expect(page.locator('#gaji_pokok')).toBeVisible();
    await expect(page.locator('#potongan_bpjs')).toBeVisible();
    await expect(page.locator('#potongan_tidak_masuk')).toBeVisible();
    await expect(page.locator('#potongan_lupa_absensi')).toBeVisible();

    // Verify Live WebCam video element is mounted and visible
    const videoLocator = page.locator('.camera-box video');
    await expect(videoLocator).toBeVisible();

    // Test Snap Photo
    await page.locator('#btn-capture').click();
    await expect(page.locator('#preview-foto')).toBeVisible();
    await expect(page.locator('#btn-retake')).toBeVisible();

    // Test Retake Photo (toggles back to live video)
    await page.locator('#btn-retake').click();
    await expect(page.locator('#preview-foto')).not.toBeVisible();
    await expect(videoLocator).toBeVisible();

    // Close Tambah modal
    await page.locator('#exampleModalCenter button:has-text("Batal")').click();

    // 5. Test Authenticated Deletion Modal (modalHapus)
    const firstHapusBtn = page.locator('button:has-text("Hapus")').first();
    await expect(firstHapusBtn).toBeVisible();
    await firstHapusBtn.click();

    await expect(page.locator('#modalHapus')).toBeVisible();
    await expect(page.locator('#modalHapus:has-text("PERINGATAN PENGHAPUSAN DATA")')).toBeVisible();
    await expect(page.locator('#admin_password_confirm')).toBeVisible();

    // Submit with wrong password
    await page.locator('#admin_password_confirm').fill('WrongPassword123');
    await page.locator('#modalHapus button:has-text("Hapus Data")').click();

    // Expect error message
    await expect(page.locator('text=Password verifikasi admin salah')).toBeVisible();

    // Cancel modal
    await page.locator('#modalHapus button:has-text("Batal")').click();
  });
});
