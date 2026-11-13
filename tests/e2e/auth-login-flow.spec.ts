import { test, expect } from '@playwright/test';

test.describe('Enterprise Command Center — Login & Auth Guard Flows', () => {
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test('TC-AUTH-01: Unauthenticated request to / redirects automatically to /login', async ({ page }) => {
    // 1. Visit root dashboard directly without any session
    await page.goto('/');

    // 2. Expect immediate redirect to /login
    await page.waitForURL('**/login**');
    expect(page.url()).toContain('/login');

    // 3. Verify Enterprise Login Page Aesthetics & Elements
    await expect(page.getByText('PT MAHAKARYA FACILITY & SECURITY ENTERPRISE', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Masuk ke Command Center' })).toBeVisible();
    await expect(page.locator('text=Enterprise Command Center & Pemantauan Operasional Lapangan')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Satpam / Security' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cleaning Service' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Driver Logistik' })).toBeVisible();
    await expect(page.locator('text=PostGIS 3.5')).toBeVisible();

    // 4. Verify 1-click Quick Demo Account Pills
    await expect(page.locator('button:has-text("Administrator")')).toBeVisible();
    await expect(page.locator('button:has-text("Hendra")')).toBeVisible();
    await expect(page.locator('button:has-text("Ahmad")')).toBeVisible();
  });

  test('TC-AUTH-02: Login with 1-click Admin demo credentials redirects to / and shows profile', async ({ page }) => {
    // 1. Visit /login
    await page.goto('/login');

    // 2. Click Administrator demo account pill
    await page.locator('button:has-text("Administrator")').click();

    // 3. Verify inputs filled with 'admin' and 'admin123'
    await expect(page.locator('input[placeholder="Masukkan username"]')).toHaveValue('admin');
    await expect(page.locator('input[placeholder="Masukkan password"]')).toHaveValue('admin123');

    // 4. Click Submit Button
    await page.getByRole('button', { name: 'Masuk ke Command Center' }).click();

    // 5. Expect redirection to dashboard /
    await page.waitForURL('http://localhost:3001/');
    expect(page.url()).toBe('http://localhost:3001/');

    // 6. Verify Navbar displays the authenticated user name
    await expect(page.locator('text=Administrator Utama')).toBeVisible();

    // 7. Test Logout action
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.locator('button[title="Keluar dari Sistem (Logout)"]').click();

    // 8. Expect return to /login
    await page.waitForURL('**/login**');
    expect(page.url()).toContain('/login');
  });

  test('TC-AUTH-03: Accessing /absensi while logged out redirects back to /login', async ({ page }) => {
    // 1. Attempt accessing /absensi without session
    await page.goto('/absensi');

    // 2. Expect redirect to /login
    await page.waitForURL('**/login**');
    expect(page.url()).toContain('/login');
    expect(page.url()).toContain('returnUrl=%2Fabsensi');
  });
});
