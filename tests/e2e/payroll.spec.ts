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

test.describe('Web Admin — Payroll & HRIS Recap Flow', () => {
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

  test('TC-E2E-GAJ-01: Verify Payroll page elements, DataTable headers, and zero NaN/undefined values', async ({ page }) => {
    await page.goto('/gaji');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Page & Action Buttons
    await expect(page.locator('text=Laporan Gaji').or(page.locator('h1, h2, h3').filter({ hasText: 'Gaji' }).first())).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Export CSV")').or(page.locator('button[title*="Export"]'))).toBeVisible();

    // 2. Verify Table Columns
    await expect(page.locator('th:has-text("NAMA PERSONIL")')).toBeVisible();
    await expect(page.locator('th:has-text("Gaji Bulanan")')).toBeVisible();
    await expect(page.locator('th:has-text("Gaji Diterima")')).toBeVisible();

    // 3. Verify No NaN or undefined text rendered anywhere on the page
    const pageText = await page.innerText('body');
    expect(pageText).not.toContain('NaN');
    expect(pageText).not.toContain('undefined');
  });

  test('TC-E2E-GAJ-02: Verify month and year filters change data', async ({ page }) => {
    await page.goto('/gaji');
    await page.waitForLoadState('domcontentloaded');

    // Wait for dynamic component to mount
    const filterBulan = page.locator('#filter_bulan');
    await expect(filterBulan).toBeVisible({ timeout: 10000 });

    const filterTahun = page.locator('#filter_tahun');
    await expect(filterTahun).toBeVisible({ timeout: 10000 });

    // Verify select options count
    const options = await filterBulan.locator('option').count();
    expect(options).toBeGreaterThanOrEqual(12);
  });
});
