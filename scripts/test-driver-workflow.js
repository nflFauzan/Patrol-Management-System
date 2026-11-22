const { chromium } = require('playwright');
const fs = require('fs');

const DUMMY_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function main() {
  console.log('Launching VISIBLE browser for Driver Workflow...');
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

  console.log('Logging in as driver_joko...');
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('driver_joko');
  await page.locator('input[name="password"]').first().fill('DriverJoko123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Navigating to ABSEN MASUK for driver_joko...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xx.php', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Set form fields for check-in
  await page.locator('select[name="alasan"]').selectOption({ label: 'Piket Rutin' });
  await page.evaluate((imgData) => {
    document.getElementById('latin').value = '-6.566877';
    document.getElementById('longin').value = '106.857619';
    document.querySelector('.image-tag').value = imgData;
    document.getElementById('simpan').style.display = '';
  }, DUMMY_JPEG);
  await page.waitForTimeout(1000);

  console.log('Submitting Absen Masuk for driver_joko...');
  await page.locator('#submitBtn').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  console.log('Landed on Dashboard after driver_joko checkin. URL:', page.url());

  // Check links on driver dashboard
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.replace(/\s+/g, ' ').trim(),
      href: a.href
    }));
  });
  console.log('driver_joko links:', JSON.stringify(links, null, 2));

  // Navigate to INPUT KEGIATAN
  console.log('Navigating to INPUT KEGIATAN for driver_joko...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xxxxxxxxx.php', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const driverPageDetails = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\n+/g, ' ');
    const forms = Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action,
      method: f.method,
      inputs: Array.from(f.querySelectorAll('input, select, textarea')).map(i => ({
        name: i.name,
        type: i.type,
        id: i.id,
        value: i.value,
        options: i.tagName === 'SELECT' ? Array.from(i.options).map(o => ({ value: o.value, text: o.text })) : undefined
      }))
    }));
    return { text: text.slice(0, 1000), forms };
  });

  console.log('Driver Page details:', JSON.stringify(driverPageDetails, null, 2));
  const screenshotPath = 'docs/data-preparation/screenshot-driver-input.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.waitForTimeout(2000);
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
