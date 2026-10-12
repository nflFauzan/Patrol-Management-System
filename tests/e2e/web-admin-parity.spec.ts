import { test, expect } from '@playwright/test';

test.describe('Web Admin Command Center — 100% Parity Navigation & Modules', () => {
  test.use({
    baseURL: 'http://localhost:3001',
    viewport: { width: 1440, height: 900 },
  });

  test('TC-ADMIN-E2E-01: Verify Command Center top ribbons, matrix tabs, payroll, and export center', async ({ page }) => {
    // 1. Visit Web Admin
    await page.goto('/');

    // 2. Verify Title & Brand
    await expect(page.locator('text=Enterprise Facility & Patrol Command Center')).toBeVisible();

    // 3. Verify Navigation Ribbon Tabs
    await expect(page.locator('button:has-text("DASHBOARD")')).toBeVisible();
    await expect(page.locator('button:has-text("DATA INDUK")')).toBeVisible();
    await expect(page.locator('button:has-text("ABSENSI (31-HARI)")')).toBeVisible();
    await expect(page.locator('button:has-text("PATROLI (24-JAM)")')).toBeVisible();
    await expect(page.locator('button:has-text("LAPORAN DIVISI")')).toBeVisible();
    await expect(page.locator('button:has-text("GAJI (H/L/I)")')).toBeVisible();
    await expect(page.locator('button:has-text("PESAN SIARAN")')).toBeVisible();
    await expect(page.locator('button:has-text("EXPORT CENTER")')).toBeVisible();

    // 4. Test Tab 2: DATA INDUK
    await page.locator('button:has-text("DATA INDUK")').click();
    await expect(page.locator('text=Data Induk Fasilitas & Personil')).toBeVisible();
    await expect(page.locator('text=Area & Shift Fasilitas')).toBeVisible();

    // Check Checkpoint subtab
    await page.locator('button:has-text("Checkpoint / Aset")').click();
    await expect(page.locator('text=Total Checkpoint:')).toBeVisible();

    // Check Personil subtab
    await page.locator('button:has-text("Personil & Finansial")').click();
    await expect(page.locator('text=Total Personil Terdaftar:')).toBeVisible();

    // 5. Test Tab 3: ABSENSI (31-HARI)
    await page.locator('button:has-text("ABSENSI (31-HARI)")').click();
    await expect(page.locator('text=Monitoring Absensi Kalender Matriks (1–31 Hari)')).toBeVisible();
    await expect(page.locator('text=Petunjuk Status:')).toBeVisible();

    // 6. Test Tab 4: PATROLI (24-JAM)
    await page.locator('button:has-text("PATROLI (24-JAM)")').click();
    await expect(page.locator('text=Monitoring Patroli Matriks 24 Jam')).toBeVisible();

    // 7. Test Tab 5: LAPORAN DIVISI
    await page.locator('button:has-text("LAPORAN DIVISI")').click();
    await expect(page.locator('text=Pusat Laporan & Supervisi Operasional')).toBeVisible();
    await expect(page.locator('button:has-text("Security Anggota")')).toBeVisible();
    await expect(page.locator('button:has-text("Security Komandan")')).toBeVisible();
    await expect(page.locator('button:has-text("Security Chief")')).toBeVisible();
    await expect(page.locator('button:has-text("Cleaning Service")')).toBeVisible();
    await expect(page.locator('button:has-text("Driver Logistik")')).toBeVisible();
    await expect(page.locator('button:has-text("Tracking Peta Patroli")')).toBeVisible();

    // 8. Test Tab 6: GAJI (H/L/I)
    await page.locator('button:has-text("GAJI (H/L/I)")').click();
    await expect(page.locator('text=Rekapitulasi Gaji & Kompensasi Bulanan (H/L/I Engine)')).toBeVisible();
    await expect(page.locator('th:has-text("Gaji Bersih")')).toBeVisible();

    // 9. Test Tab 7: PESAN SIARAN
    await page.locator('button:has-text("PESAN SIARAN")').click();
    await expect(page.locator('text=Pusat Pesan Siaran & Instruksi Harian')).toBeVisible();

    // 10. Test Tab 8: EXPORT CENTER
    await page.locator('button:has-text("EXPORT CENTER")').click();
    await expect(page.locator('text=Pusat Unduhan Laporan Resmi (Export Center 4 Modul)')).toBeVisible();
    await expect(page.locator('text=1. Export Absensi Personil')).toBeVisible();
    await expect(page.locator('text=2. Export Absensi Area / Site')).toBeVisible();
    await expect(page.locator('text=3. Export Kegiatan Personil')).toBeVisible();
    await expect(page.locator('text=4. Export Kegiatan Area / Pos')).toBeVisible();

    // 11. Test Emergency SOS trigger simulation
    await page.locator('button:has-text("🚨 Test Alarm SOS")').click();
    await expect(page.locator('text=ALARM DARURAT AKTIF:')).toBeVisible();
    await expect(page.locator('button:has-text("Konfirmasi Respon (Acknowledge)")')).toBeVisible();
    await page.locator('button:has-text("Konfirmasi Respon (Acknowledge)")').click();
    await expect(page.locator('button:has-text("Tandai Selesai (Resolve)")')).toBeVisible();
    await page.locator('button:has-text("Tandai Selesai (Resolve)")').click();
  });
});
