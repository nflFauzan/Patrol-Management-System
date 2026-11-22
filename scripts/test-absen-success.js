const { chromium } = require('playwright');
const fs = require('fs');

const DUMMY_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function main() {
  console.log('Launching VISIBLE browser for Check-in...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const page = await context.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in as sec_agus...');
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('SecAgus123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Navigating to ABSEN MASUK...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xx.php', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Set form fields directly
  console.log('Setting lat, long, alasan, image, and revealing submit button...');
  await page.locator('select[name="alasan"]').selectOption({ label: 'Piket Rutin' });
  await page.evaluate((imgData) => {
    document.getElementById('latin').value = '-6.566877';
    document.getElementById('longin').value = '106.857619';
    document.querySelector('.image-tag').value = imgData;
    document.getElementById('simpan').style.display = '';
  }, DUMMY_JPEG);
  await page.waitForTimeout(1000);

  // Intercept response
  page.on('response', res => {
    if (res.url().includes('insert-presensi.php') || res.url().includes('validasi-patroli')) {
      console.log(`RESPONSE [${res.status()}] ${res.url()}`);
    }
  });

  console.log('Clicking #submitBtn (Simpan)...');
  await page.locator('#submitBtn').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('Current URL after submit:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' '));
  console.log('Page Text after submit:', bodyText.slice(0, 1000));

  const screenshotPath = 'docs/data-preparation/screenshot-absen-masuk-success.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.waitForTimeout(2000);
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
