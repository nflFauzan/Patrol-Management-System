import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './auth-helper';

test.describe('FASE 3: Audit Divisi Cleaning Service & Driver Logistik Parity', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ context, page }) => {
    await authenticateAsAdmin(context, page);
  });

  test('TC-PHASE3-01: Verify PWA Field Cleaning Service Mode & Sanitation Checklist Modal', async ({ page }) => {
    await page.goto('/validasi-patroli', { waitUntil: 'domcontentloaded' });

    // Dismiss initial info modal if shown
    try {
      const modalUnderstandBtn = page.getByRole('button', { name: 'Saya Mengerti' });
      await modalUnderstandBtn.waitFor({ state: 'visible', timeout: 1500 });
      await modalUnderstandBtn.click();
    } catch {}

    // Switch role to STAFF (Cleaning)
    const roleSelect = page.locator('select[title="Ganti Peran Personil"]');
    await roleSelect.selectOption('STAFF');
    await expect(page.getByText('CLEANING', { exact: true })).toBeVisible();

    // Navigate to Staff Activity Page
    await page.goto('/validasi-patroli/xxxxx_xxxxxxxxxxxxxx.php', { waitUntil: 'domcontentloaded' });

    // Verify Staff / Cleaning Form Elements
    await expect(page.locator('text=FORM KEGIATAN STAFF')).toBeVisible();
    await expect(page.locator('text=Jenis Kegiatan')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Jelaskan rincian"]')).toBeVisible();
    await expect(page.locator('button:has-text("Simpan Kegiatan")')).toBeVisible();
  });

  test('TC-PHASE3-02: Verify PWA Field Driver Mode & Vehicle Trip Form', async ({ page }) => {
    await page.goto('/validasi-patroli', { waitUntil: 'domcontentloaded' });

    // Dismiss initial info modal if shown
    try {
      const modalUnderstandBtn = page.getByRole('button', { name: 'Saya Mengerti' });
      await modalUnderstandBtn.waitFor({ state: 'visible', timeout: 1500 });
      await modalUnderstandBtn.click();
    } catch {}

    // Switch role to DRIVER
    const roleSelect = page.locator('select[title="Ganti Peran Personil"]');
    await roleSelect.selectOption('DRIVER');
    await expect(page.getByText('DRIVER', { exact: true })).toBeVisible();

    // Navigate to Driver Trip Page
    await page.goto('/validasi-patroli/xxxxx_xxxxxxxxxx.php', { waitUntil: 'domcontentloaded' });

    // Verify Driver Trip Form Elements
    await expect(page.locator('text=Perjalanan Baru')).toBeVisible();
    await expect(page.locator('button:has-text("Ambil Foto Keberangkatan")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Toyota Avanza"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="B 1234 PS"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="alamat tujuan"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Antar logistik"]')).toBeVisible();
    await expect(page.locator('button:has-text("Simpan Perjalanan")')).toBeVisible();
  });

  test('TC-PHASE3-03: Verify Web Admin Laporan Cleaning Service Table Headers & Actions', async ({ page }) => {
    await page.goto('http://localhost:3001/laporan/cleaning-service', { waitUntil: 'domcontentloaded' });

    // Verify Search Input
    await expect(page.locator('input[placeholder*="petugas"]')).toBeVisible();

    // Verify Table Headers
    await expect(page.locator('th:has-text("Lokasi / Site")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Petugas Cleaning")')).toBeVisible();
    await expect(page.locator('th:has-text("Zona & Tugas Sanitasi")')).toBeVisible();
    await expect(page.locator('th:has-text("Waktu Pengerjaan")')).toBeVisible();
    await expect(page.locator('th:has-text("Aksi")')).toBeVisible();

    // Verify Action buttons in rows
    await expect(page.locator('button:has-text("Detail")').first()).toBeVisible();
  });

  test('TC-PHASE3-04: Verify Web Admin Laporan Driver Table Headers & Actions', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('http://localhost:3001/laporan/driver', { waitUntil: 'domcontentloaded' });

    // Verify Search Input
    await expect(page.locator('input[placeholder*="driver"]')).toBeVisible();

    // Verify Table Headers
    await expect(page.locator('th:has-text("Pool / Asal")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Driver & Armada")')).toBeVisible();
    await expect(page.locator('th:has-text("Tujuan & Keperluan")')).toBeVisible();
    await expect(page.locator('th:has-text("Status & Waktu")')).toBeVisible();
    await expect(page.locator('th:has-text("Aksi")')).toBeVisible();

    // Verify Trip Status Badges
    await expect(page.locator('text=BERANGKAT').first()).toBeVisible();
    await expect(page.locator('text=SUDAH SAMPAI').first()).toBeVisible();

    // Wait for hydration and click Detail button on table
    const detailBtn = page.locator('table button:has-text("Detail")').first();
    await expect(detailBtn).toBeVisible();
    await detailBtn.click();

    // Verify Modal Header & Contents
    await expect(page.locator('text=DETAIL KEGIATAN DRIVER')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Informasi Perjalanan')).toBeVisible();
    await expect(page.locator('text=Lokasi Keberangkatan').first()).toBeVisible();
  });
});
