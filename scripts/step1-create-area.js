const { chromium } = require('playwright');
const fs = require('fs');

const USERNAME = process.env.PATROL_USER || 'nun';
const PASSWORD = process.env.PATROL_PASSWORD || 'nun12345';
const BASE_URL = 'https://patroli.site';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.print = () => {};
  });

  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login.php`, { waitUntil: 'networkidle' });
  await page.locator('input[name="username"]').first().fill(USERNAME);
  await page.locator('input[name="password"]').first().fill(PASSWORD);
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  // STEP 1: CREATE AREA
  console.log('Checking existing areas on xxxx_xxxxxxx...');
  await page.goto(`${BASE_URL}/xxxx_xxxxxxx`, { waitUntil: 'networkidle' });

  const existingAreas = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.map(r => r.cells[0]?.innerText?.trim());
  });
  console.log('Existing areas in table:', existingAreas);

  const targetArea = 'GUDANG LOGISTIK CAKUNG';
  if (!existingAreas.some(a => a && a.toUpperCase() === targetArea)) {
    console.log(`Adding area: ${targetArea}...`);
    // Click button to open modal
    await page.click('button.btn-tambah-area, button[data-target="#exampleModalCenter"]');
    await page.waitForTimeout(1000);

    // Fill form
    await page.locator('#exampleModalCenter input[name="lokasi_area"]').fill(targetArea);
    await page.locator('#exampleModalCenter input[name="latitude"]').fill('-6.182431');
    await page.locator('#exampleModalCenter input[name="longitude"]').fill('106.945217');

    await page.locator('#exampleModalCenter select[name="pagi_masuk_jam"]').selectOption('07');
    await page.locator('#exampleModalCenter select[name="pagi_masuk_menit"]').selectOption('00');
    await page.locator('#exampleModalCenter select[name="pagi_pulang_jam"]').selectOption('15');
    await page.locator('#exampleModalCenter select[name="pagi_pulang_menit"]').selectOption('00');

    await page.locator('#exampleModalCenter select[name="siang_masuk_jam"]').selectOption('15');
    await page.locator('#exampleModalCenter select[name="siang_masuk_menit"]').selectOption('00');
    await page.locator('#exampleModalCenter select[name="siang_pulang_jam"]').selectOption('23');
    await page.locator('#exampleModalCenter select[name="siang_pulang_menit"]').selectOption('00');

    await page.locator('#exampleModalCenter select[name="malam_masuk_jam"]').selectOption('23');
    await page.locator('#exampleModalCenter select[name="malam_masuk_menit"]').selectOption('00');
    await page.locator('#exampleModalCenter select[name="malam_pulang_jam"]').selectOption('07');
    await page.locator('#exampleModalCenter select[name="malam_pulang_menit"]').selectOption('00');

    await page.locator('#exampleModalCenter select[name="staf_masuk_jam"]').selectOption('08');
    await page.locator('#exampleModalCenter select[name="staf_masuk_menit"]').selectOption('00');
    await page.locator('#exampleModalCenter select[name="staf_pulang_jam"]').selectOption('17');
    await page.locator('#exampleModalCenter select[name="staf_pulang_menit"]').selectOption('00');

    await page.locator('#exampleModalCenter select[name="chief_masuk_jam"]').selectOption('08');
    await page.locator('#exampleModalCenter select[name="chief_masuk_menit"]').selectOption('00');
    await page.locator('#exampleModalCenter select[name="chief_pulang_jam"]').selectOption('17');
    await page.locator('#exampleModalCenter select[name="chief_pulang_menit"]').selectOption('00');

    // Click submit
    console.log('Submitting form insert-area...');
    await page.locator('#exampleModalCenter button.btn-simpan-area, #exampleModalCenter button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify
    const updatedAreas = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      return rows.map(r => r.cells[0]?.innerText?.trim());
    });
    console.log('Updated areas in table:', updatedAreas);
  } else {
    console.log(`Area ${targetArea} already exists!`);
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error in step 1:', err);
  process.exit(1);
});
