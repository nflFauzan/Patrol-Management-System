const { chromium } = require('playwright');
const fs = require('fs');

// Minimal 1x1 valid JPEG base64
const DUMMY_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function main() {
  console.log('Launching VISIBLE browser for Check-in (Absen Masuk)...');
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
    geolocation: { latitude: -6.566877, longitude: 106.857619 } // Exactly AEON MALL SENTUL
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

  // Select alasan: Piket Rutin
  console.log('Selecting status: Piket Rutin...');
  await page.locator('select[name="alasan"]').selectOption({ label: 'Piket Rutin' });

  // Ensure lat/long and image are filled
  await page.evaluate((jpegUri) => {
    // Fill coordinates if empty
    const latIn = document.querySelector('#latin');
    const longIn = document.querySelector('#longin');
    if (latIn && !latIn.value) latIn.value = '-6.566877';
    if (longIn && !longIn.value) longIn.value = '106.857619';

    // Set image
    const imgInput = document.querySelector('input[name="image"]');
    if (imgInput) imgInput.value = jpegUri;
  }, DUMMY_JPEG);

  console.log('Submitting Absen Masuk form...');
  // Intercept response
  page.on('response', async res => {
    if (res.url().includes('insert-presensi.php')) {
      console.log('insert-presensi.php HTTP Status:', res.status());
      console.log('Location header:', res.headers()['location']);
    }
  });

  // Submit button
  const submitBtn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Simpan")').first();
  await submitBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('Current URL after submit:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' '));
  console.log('Body Text after submit:', bodyText.slice(0, 1000));

  // Take screenshot of new dashboard
  const screenshotPath = 'docs/data-preparation/screenshot-after-absen-masuk-sec_agus.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();
}

main().catch(err => {
  console.error('Error submitting absen masuk:', err);
  process.exit(1);
});
