import { test, expect } from '@playwright/test';

const FIELD_USER = {
  id: 'a0000000-0000-0000-0000-000000000003',
  username: 'satpamtest',
  email: 'satpamtest@mahakarya-ops.co.id',
  fullName: 'Ahmad Fauzi',
  phone: '0812-3333-4444',
  role: 'SECURITY_OFFICER',
  division: 'SECURITY',
  securityRank: 'KOMANDAN',
  siteId: '11111111-1111-1111-1111-111111111111',
  isActive: true,
};
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFETUlOX1NVUEVSIiwiZGl2aXNpb24iOiJTVEFGRiIsImlhdCI6MTc5NDU5MjI1NiwiZXhwIjoxNzk0Njc4NjU2fQ.aKNpBM7qY8MgEXwCL-Qi2K9EfwqVeMU_JCdqObS9y2M';

test.describe('PWA Field — Camera & Selfie Capture Flow', () => {
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 390, height: 844 }, // Mobile Viewport
    permissions: ['camera', 'geolocation'],
    geolocation: { latitude: -6.2215, longitude: 106.8055 },
  });

  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      { name: 'patrol_session', value: TOKEN, domain: 'localhost', path: '/' },
    ]);
    await page.addInitScript(({ user, token }) => {
      window.localStorage.setItem('patrol_auth_token', token);
      window.localStorage.setItem('patrol_user', JSON.stringify(user));
    }, { user: FIELD_USER, token: TOKEN });
  });

  test('TC-E2E-CAM-01: Verify camera view, snapshot capture, preview image, and retake flow', async ({ page }) => {
    // 1. Navigate directly to ClockInPage
    await page.goto('/validasi-patroli/xxxxx_xx.php', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Page Header
    await expect(page.locator('text=ABSEN MASUK')).toBeVisible({ timeout: 10000 });

    // 3. Verify Video element is present and active
    const video = page.locator('video');
    await expect(video).toBeVisible({ timeout: 10000 });

    // 4. Verify Foto button is visible
    const btnFoto = page.locator('button:has-text("Foto")');
    await expect(btnFoto).toBeVisible();

    // 5. Take photo
    await btnFoto.click();

    // 6. Verify preview image appears
    const previewImg = page.locator('img[alt="Preview Selfie"]');
    await expect(previewImg).toBeVisible({ timeout: 5000 });

    // 7. Verify Simpan and Ulangi buttons appear
    const btnSimpan = page.locator('button:has-text("Simpan")');
    const btnUlangi = page.locator('button:has-text("Ulangi")');
    await expect(btnSimpan).toBeVisible();
    await expect(btnUlangi).toBeVisible();

    // 8. Test Retake (Ulangi) returns back to video stream
    await btnUlangi.click();
    await expect(page.locator('video')).toBeVisible({ timeout: 5000 });
    await expect(btnFoto).toBeVisible();
  });
});
