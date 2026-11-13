import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './auth-helper';

test.describe('FASE 2: Audit Divisi Security (Satpam) — PWA Field & Laporan Web Admin Parity', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ context, page }) => {
    await authenticateAsAdmin(context, page);
  });

  test('TC-PHASE2-01: Verify PWA Field Satpam 8 Touch Cards, Dual Status & Profile Header', async ({ page }) => {
    await page.goto('/validasi-patroli', { waitUntil: 'domcontentloaded' });

    // Dismiss initial info modal if shown
    try {
      const modalUnderstandBtn = page.getByRole('button', { name: 'Saya Mengerti' });
      await modalUnderstandBtn.waitFor({ state: 'visible', timeout: 1500 });
      await modalUnderstandBtn.click();
    } catch {}

    // 1. Profile Greeting & Division Badge
    await expect(page.locator('text=HELLO,')).toBeVisible();
    await expect(page.getByText('SECURITY', { exact: true })).toBeVisible();

    // 2. 8 Operational Touch Cards (100% Parity with patroli.site/validasi-patroli/)
    await expect(page.getByRole('button', { name: 'ABSEN MASUK' })).toBeVisible();
    await expect(page.locator('button.ps-card:has-text("IZIN")').or(page.locator('button.ps-card:has-text("INPUT")'))).toBeVisible();
    await expect(page.getByRole('button', { name: 'RIWAYAT ABSEN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'RIWAYAT KEGIATAN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PANIC BUTTON' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'UPDATE PROFILE' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'BANTUAN TEKNIS' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LOGOUT SISTEM' })).toBeVisible();

    // 3. Bottom Marquee Running Text
    await expect(page.locator('text=DISIPLIN ABSENSI')).toBeVisible();
  });

  test('TC-PHASE2-02: Verify PWA Absen Masuk Page & Camera Viewfinder Flow', async ({ page }) => {
    await page.goto('/validasi-patroli/xxxxx_xx.php', { waitUntil: 'domcontentloaded' });

    // Verify Header
    await expect(page.locator('text=ABSEN MASUK')).toBeVisible();

    // Verify camera container & form elements
    await expect(page.locator('video, img[alt="Preview Selfie"]')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('button:has-text("Foto")')).toBeVisible();
  });

  test('TC-PHASE2-03: Verify PWA Panic Button SOS Page & Alert Triggers', async ({ page }) => {
    await page.goto('/validasi-patroli/xxxxx_xxxxxxx.php', { waitUntil: 'domcontentloaded' });

    // Verify Panic Page Content
    await expect(page.locator('text=memicu sirine')).toBeVisible();
    await expect(page.locator('#sosButton, button:has-text("SOS")')).toBeVisible();
    await expect(page.locator('button:has-text("batalkan")')).toBeVisible();
  });

  test('TC-PHASE2-04: Verify PWA Patrol Scan Page (cek.php Parity)', async ({ page }) => {
    await page.goto('/validasi-patroli/xxxxx_xxxxxxxxx.php', { waitUntil: 'domcontentloaded' });

    // Verify Scanner view
    await expect(page.locator('text=Silakan Scan QR Code')).toBeVisible();
    await expect(page.locator('#reader-full')).toBeVisible();
    await expect(page.locator('button:has-text("Kembali ke Dashboard")')).toBeVisible();
  });

  test('TC-PHASE2-05: Verify Web Admin Laporan Security Anggota, Komandan, Chief & Tracking Patroli', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Laporan Security Anggota
    await page.goto('http://localhost:3001/laporan/security/anggota', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('th:has-text("Lokasi / Site")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Nama Personil")')).toBeVisible();
    await expect(page.locator('th:has-text("Titik Pos & Temuan")')).toBeVisible();
    await expect(page.locator('th:has-text("Waktu Pemindaian")')).toBeVisible();
    await expect(page.locator('th:has-text("Aksi")')).toBeVisible();

    // 2. Laporan Komandan
    await page.goto('http://localhost:3001/laporan/security/komandan', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('th:has-text("Lokasi / Site")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Nama Komandan")')).toBeVisible();
    await expect(page.locator('th:has-text("Shift & Apel Regu")')).toBeVisible();
    await expect(page.locator('th:has-text("Catatan Mutasi & Inventaris")')).toBeVisible();
    await expect(page.locator('th:has-text("Waktu Serah Terima")')).toBeVisible();

    // 3. Laporan Chief
    await page.goto('http://localhost:3001/laporan/security/chief', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('th:has-text("Lokasi / Site")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Komandan yang Dievaluasi")')).toBeVisible();
    await expect(page.locator('th:has-text("Kedisiplinan & Koordinasi")')).toBeVisible();
    await expect(page.locator('th:has-text("Status Insiden & Catatan")')).toBeVisible();
    await expect(page.locator('th:has-text("Waktu Evaluasi")')).toBeVisible();

    // 4. Tracking Patroli
    await page.goto('http://localhost:3001/laporan/tracking-patroli', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('button:has-text("Timeline")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Peta Spasial")')).toBeVisible();
    await expect(page.locator('button:has-text("Filter")')).toBeVisible();
    await expect(page.locator('button:has-text("Cetak / Download PDF")')).toBeVisible();
  });
});

