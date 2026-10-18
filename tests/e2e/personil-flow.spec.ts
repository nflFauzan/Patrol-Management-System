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
    await areaSelect.selectOption({ index: 1 });
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
    await expect(page.locator('button:has-text("B1 Navy")')).toBeVisible();
    await expect(page.locator('button:has-text("B2 Blue")')).toBeVisible();
    await expect(page.locator('button:has-text("B3 Red")')).toBeVisible();
    await expect(page.locator('button:has-text("B4 Tech")')).toBeVisible();
    await expect(page.locator('button:has-text("B5 White")')).toBeVisible();

    // Switch theme to B3 Red
    await page.locator('button:has-text("B3 Red")').click();
    await expect(page.locator('button:has-text("Cetak Kartu ID (B3 Red)")')).toBeVisible();

    // Close ID Card modal
    await page.locator('button:has-text("Tutup")').click();

    // 4. Test 2-Panel Form Tambah Personil Modal
    await page.locator('#btn-tambah').click();
    await expect(page.locator('text=FORM TAMBAH DATA PERSONEL')).toBeVisible();
    await expect(page.locator('text=Data Identitas & Penugasan')).toBeVisible();
    await expect(page.locator('text=Rincian Gaji Pokok & Potongan')).toBeVisible();
    await expect(page.locator('text=Potongan BPJS (Rp)')).toBeVisible();
    await expect(page.locator('text=Potongan Tidak Masuk / Alpa (Rp)')).toBeVisible();
    await expect(page.locator('text=Potongan Lupa Absen (Rp)')).toBeVisible();

    // Close Tambah modal
    await page.locator('button:has-text("Batal")').click();

    // 5. Test Authenticated Deletion Modal (modalHapus)
    const firstHapusBtn = page.locator('button:has-text("Hapus")').first();
    await expect(firstHapusBtn).toBeVisible();
    await firstHapusBtn.click();

    await expect(page.locator('text=KONFIRMASI HAPUS PERSONEL')).toBeVisible();
    await expect(page.locator('text=Verifikasi Password Admin Aktif')).toBeVisible();

    // Submit with wrong password
    await page.locator('#admin_password_confirm').fill('WrongPassword123');
    await page.locator('button:has-text("Ya, Hapus Permanen")').click();

    // Expect error message
    await expect(page.locator('text=Password verifikasi admin salah')).toBeVisible();

    // Cancel modal
    await page.locator('button:has-text("Batal")').click();
  });
});
