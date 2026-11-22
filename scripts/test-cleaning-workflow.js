const { chromium } = require('playwright');
const fs = require('fs');

const DUMMY_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function main() {
  console.log('Launching VISIBLE browser for Cleaning Service Workflow...');
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

  console.log('Logging in as clean_siti...');
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('clean_siti');
  await page.locator('input[name="password"]').first().fill('CleanSiti123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Navigating to ABSEN MASUK for clean_siti...');
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

  console.log('Submitting Absen Masuk for clean_siti...');
  await page.locator('#submitBtn').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  console.log('Landed on Dashboard after clean_siti checkin. URL:', page.url());

  // Now inspect what links are on dashboard for clean_siti
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.replace(/\s+/g, ' ').trim(),
      href: a.href
    }));
  });
  console.log('clean_siti links:', JSON.stringify(links, null, 2));

  // Navigate to INPUT KEGIATAN
  console.log('Navigating to INPUT KEGIATAN for clean_siti...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xxxxxxxxx.php', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Simulate scanning checkpoint 1053 (Toilet Lantai 1 Timur - Cleaning Service)
  console.log('Simulating QR scan result: 1053 (Toilet Lantai 1 Timur)...');
  await page.evaluate(() => {
    document.getElementById('result').value = '1053';
    document.getElementById('formScan').submit();
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('URL after scanning 1053 as clean_siti:', page.url());
  const cleaningForm = await page.evaluate(() => {
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

  console.log('Cleaning Form details:', JSON.stringify(cleaningForm, null, 2));
  const screenshotPath = 'docs/data-preparation/screenshot-cleaning-scan-1053.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.waitForTimeout(2000);
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
