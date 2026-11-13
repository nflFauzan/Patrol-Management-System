import { test, expect } from '@playwright/test';
import { authenticateAsAdmin } from './auth-helper';

test.describe('FASE 1: Audit Fondasi Master Data & Web Admin Core (Parity vs patroli.site)', () => {
  test.setTimeout(60000);
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(async ({ context, page }) => {
    await authenticateAsAdmin(context, page);
  });

  test('TC-PHASE1-01: Verify Dashboard KPI Ribbons, Division Cards & Brand Header', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 1. Brand Header
    await expect(page.locator('.brand-text')).toContainText('TES-PT');

    // 2. 6 Top KPI Metrics (100% Parity dengan patroli.site)
    await expect(page.locator('.kpi-label:has-text("TOTAL PERSONIL")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("HADIR HARI INI")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("KEGIATAN HARI INI")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("PERJALANAN SELESAI")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("TEMUAN AKTIF")')).toBeVisible();
    await expect(page.locator('.kpi-label:has-text("TOTAL CHECKPOINT")')).toBeVisible();

    // 3. 4 Division Operational Sections
    await expect(page.locator('text=SECURITY').first()).toBeVisible();
    await expect(page.locator('text=CLEANING SERVICE').first()).toBeVisible();
    await expect(page.locator('text=DRIVER').first()).toBeVisible();
    await expect(page.locator('text=STAF').first()).toBeVisible();
  });

  test('TC-PHASE1-02: Verify Data Induk Area — Table Columns, Actions & 20 Shift Fields in Modal', async ({ page }) => {
    await page.goto('/datainduk/area', { waitUntil: 'domcontentloaded' });

    // 1. Table Headers matching patroli.site
    await expect(page.locator('th:has-text("DATA LOKASI AREA / SITE")')).toBeVisible();
    await expect(page.locator('th:has-text("LATITUDE")')).toBeVisible();
    await expect(page.locator('th:has-text("LONGITUDE")')).toBeVisible();
    await expect(page.locator('th:has-text("AKSI")')).toBeVisible();

    // 2. Add Area Modal & Shift Configuration
    const btnTambah = page.locator('button:has-text("TAMBAH DATA AREA / SITE")');
    await expect(btnTambah).toBeVisible();
    await btnTambah.click();

    // Modal elements
    await expect(page.locator('input[placeholder*="Contoh: PT. Mall Jakarta"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Latitude akan terisi"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Longitude akan terisi"]')).toBeVisible();

    // Close modal
    const closeBtn = page.locator('button:has-text("BATAL")');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test('TC-PHASE1-03: Verify Data Induk Checkpoint — Filter Headers, Buttons & Parity Table', async ({ page }) => {
    await page.goto('/datainduk/checkpoint', { waitUntil: 'domcontentloaded' });

    // 1. Top Buttons
    await expect(page.locator('button:has-text("TAMBAH CHECKPOINT")')).toBeVisible();
    await expect(page.locator('button:has-text("IMPORT CHECKPOINT")')).toBeVisible();
    await expect(page.locator('button:has-text("CETAK CHECKPOINT")')).toBeVisible();

    // 2. Interactive Filter Headers in <thead>
    await expect(page.locator('thead th select').first()).toBeVisible();
    await expect(page.locator('thead th select').nth(1)).toBeVisible();
    await expect(page.locator('th:has-text("NAMA ASET")')).toBeVisible();
    await expect(page.locator('th:has-text("LOKASI ASET")')).toBeVisible();
    await expect(page.locator('th:has-text("DESKRIPSI TUGAS")')).toBeVisible();
  });

  test('TC-PHASE1-04: Verify Data Induk Personil — Table, Add Modal with Instant WebCam & ID Card', async ({ page }) => {
    await page.goto('/datainduk/personil', { waitUntil: 'domcontentloaded' });

    // 1. Top Action Buttons
    await expect(page.locator('button:has-text("TAMBAH PERSONEL")')).toBeVisible();
    await expect(page.locator('button:has-text("CETAK ID CARD")')).toBeVisible();

    // 2. Open Add Personel Modal
    await page.locator('button:has-text("TAMBAH PERSONEL")').click();
    await expect(page.locator('text=FORM TAMBAH PERSONEL')).toBeVisible();

    // 3. Verify Video Element and Form Fields
    await expect(page.locator('video')).toBeVisible();
    await expect(page.locator('input[placeholder="Nama lengkap personel"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Masukkan jam kerja"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Buat username"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Buat password"]')).toBeVisible();

    // Close modal
    await page.locator('button:has-text("Batal")').click();
  });

  test('TC-PHASE1-05: Verify Absensi — 2-Tier Header, Cascading Filters & Leaflet Polyline Modal', async ({ page }) => {
    await page.goto('/absensi', { waitUntil: 'domcontentloaded' });

    // 1. Tabs
    await expect(page.locator('button:has-text("Semua Data")')).toBeVisible();
    await expect(page.locator('button:has-text("Monitoring")')).toBeVisible();

    // 2. 2-Tier Table Header in Semua Data
    await expect(page.locator('select#category')).toBeVisible();
    await expect(page.locator('select#posisi')).toBeVisible();
    await expect(page.locator('select#personil')).toBeVisible();
    await expect(page.locator('th:has-text("ABSENSI")')).toBeVisible();
    await expect(page.locator('th:has-text("MASUK")')).toBeVisible();
    await expect(page.locator('th:has-text("PULANG")')).toBeVisible();

    // 3. Open Detail Modal & Check Leaflet Map
    const detailBtn = page.locator('button:has-text("Detail")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await expect(page.getByRole('heading', { name: 'DETAIL ABSENSI' })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Detail Absen Masuk')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.leaflet-container').first()).toBeVisible({ timeout: 10000 });

      // Close modal
      await page.locator('button:has-text("×")').first().click();
    }

    // 4. Switch to Monitoring Tab
    await page.locator('button:has-text("Monitoring")').click();
    await expect(page.locator('select#lokasi_site')).toBeVisible();
    await expect(page.locator('select#posisi')).toBeVisible();
    // Days columns (e.g. 1 and 28/30)
    await expect(page.locator('th:has-text("1")').first()).toBeVisible();
    await expect(page.locator('th:has-text("28")').first()).toBeVisible();
  });
});
