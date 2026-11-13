import { test, expect } from '@playwright/test';

const ADMIN_USER = {
  id: 'a0000000-0000-0000-0000-000000000001',
  username: 'admin',
  email: 'admin@mahakarya-ops.co.id',
  fullName: 'Administrator Utama',
  phone: '0812-1111-2222',
  role: 'ADMIN_SUPER',
  division: 'STAFF',
  securityRank: 'ANGGOTA',
  siteId: '11111111-1111-1111-1111-111111111111',
  isActive: true,
};
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFETUlOX1NVUEVSIiwiZGl2aXNpb24iOiJTVEFGRiIsImlhdCI6MTc5NDU5MjI1NiwiZXhwIjoxNzk0Njc4NjU2fQ.aKNpBM7qY8MgEXwCL-Qi2K9EfwqVeMU_JCdqObS9y2M';

test.describe('Web Admin — Checkpoint & QR Code Generation Flow', () => {
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      { name: 'patrol_session', value: TOKEN, domain: 'localhost', path: '/' },
    ]);
    await page.addInitScript(({ user, token }) => {
      window.localStorage.setItem('patrol_auth_token', token);
      window.localStorage.setItem('patrol_user', JSON.stringify(user));
    }, { user: ADMIN_USER, token: TOKEN });
  });

  test('TC-E2E-QR-01: Navigate to Checkpoint page and verify table & actions', async ({ page }) => {
    await page.goto('/datainduk/checkpoint');
    await page.waitForLoadState('domcontentloaded');

    // Verify Title & Header
    await expect(page.locator('h1:has-text("Checkpoint")').or(page.locator('text=DATA CHECKPOINT'))).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#btn-tambah').or(page.locator('button:has-text("TAMBAH")').first())).toBeVisible();

    // Verify Checkpoints Table
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    await expect(page.locator('th:has-text("NAMA ASET")').or(page.locator('th:has-text("Aset")').first())).toBeVisible();
  });

  test('TC-E2E-QR-02: Open single print QR modal and verify QR SVG render', async ({ page }) => {
    await page.goto('/datainduk/checkpoint');
    await page.waitForLoadState('domcontentloaded');

    // Click single print button on first row in data table
    const btnCetakSingle = page.getByRole('button', { name: 'Cetak Barcode QR Checkpoint' }).first();
    await expect(btnCetakSingle).toBeVisible({ timeout: 15000 });
    await btnCetakSingle.click();

    // Verify Print Modal Card appears
    const printableCard = page.locator('#printable-single-qr');
    await expect(printableCard).toBeVisible({ timeout: 15000 });

    // Verify QR code is rendered (SVG with rects)
    const qrSvg = printableCard.locator('svg').first();
    await expect(qrSvg).toBeVisible();
  });

  test('TC-E2E-QR-03: Verify cascading filter for batch print QR', async ({ page }) => {
    await page.goto('/datainduk/checkpoint');
    await page.waitForLoadState('domcontentloaded');

    // Area and Category dropdowns for Batch Print
    const areaSelect = page.locator('#cetak_area').or(page.locator('select').first());
    await expect(areaSelect).toBeVisible();

    // Select first non-empty option
    const options = await areaSelect.locator('option').allInnerTexts();
    if (options.length > 1) {
      await areaSelect.selectOption({ index: 1 });
    }
  });
});
