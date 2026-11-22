const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://patroli.site';
const DUMMY_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function main() {
  console.log('Testing and completing Driver & Patrol 2 workflows in VISIBLE browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 250,
    args: ['--start-maximized']
  });

  // ---------------------------------------------------------
  // 1. DRIVER JOKO: MULAI PERJALANAN
  // ---------------------------------------------------------
  console.log('\n--- DRIVER JOKO: SUBMITTING JOURNEY ---');
  const driverContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const driverPage = await driverContext.newPage();
  driverPage.on('dialog', async d => {
    console.log('Driver dialog message:', d.message());
    await d.accept();
  });

  await driverPage.goto(`${BASE_URL}/login.php`);
  await driverPage.locator('input[name="username"]').first().fill('driver_joko');
  await driverPage.locator('input[name="password"]').first().fill('DriverJoko123');
  await driverPage.locator('input[name="login"]').click();
  await driverPage.waitForLoadState('networkidle');

  await driverPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await driverPage.waitForTimeout(1000);

  // Fill inputs
  await driverPage.locator('input#tipe').fill('Toyota Avanza Veloz');
  await driverPage.locator('input#nopol').fill('B 1234 PAT');
  await driverPage.locator('input#tujuan').fill('Gudang Logistik Cakung');
  await driverPage.locator('input#keperluan').fill('Antar dokumen & logistik operasional');

  // Bypass and populate fields
  await driverPage.evaluate((img) => {
    document.getElementById('lat').value = '-6.566877';
    document.getElementById('long').value = '106.857619';
    document.getElementById('image').value = img;
  }, DUMMY_JPEG);
  await driverPage.waitForTimeout(500);

  console.log('Submitting form-driver directly via HTMLFormElement.prototype.submit...');
  await driverPage.evaluate(() => {
    const frm = document.getElementById('form-driver');
    HTMLFormElement.prototype.submit.call(frm);
  });
  await driverPage.waitForLoadState('networkidle');
  await driverPage.waitForTimeout(3000);
  console.log('Landed on URL after driver submit:', driverPage.url());
  await driverPage.screenshot({ path: 'docs/data-preparation/screenshots/04b-driver-submitted-result.png' });
  await driverContext.close();

  // ---------------------------------------------------------
  // 2. SECURITY AGUS: PATROL 2 (TEMUAN INSIDEN 1054)
  // ---------------------------------------------------------
  console.log('\n--- SEC AGUS: SUBMITTING PATROL 2 (TEMUAN INSIDEN) ---');
  const secContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const secPage = await secContext.newPage();
  secPage.on('dialog', async d => {
    console.log('Sec dialog message:', d.message());
    await d.accept();
  });

  await secPage.goto(`${BASE_URL}/login.php`);
  await secPage.locator('input[name="username"]').first().fill('sec_agus');
  await secPage.locator('input[name="password"]').first().fill('SecAgus123');
  await secPage.locator('input[name="login"]').click();
  await secPage.waitForLoadState('networkidle');

  await secPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await secPage.waitForTimeout(1000);
  console.log('Scanning checkpoint 1054...');
  await secPage.evaluate(() => {
    document.getElementById('result').value = '1054';
    document.getElementById('formScan').submit();
  });
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(2000);
  console.log('URL after scanning 1054:', secPage.url());

  const pageText = await secPage.evaluate(() => document.body.innerText);
  console.log('Content on scan result page (first 300 chars):', pageText.slice(0, 300));

  if (secPage.url().includes('cek.php')) {
    await secPage.evaluate((img) => {
      const sel = document.querySelector('select[name="tl"]');
      if (sel) {
        sel.value = '1';
        sel.dispatchEvent(new Event('change'));
      }
      const ket = document.getElementById('keterangan');
      if (ket) {
        ket.style.display = 'block';
        ket.value = 'Lampu sorot pos padam, perlu perbaikan teknisi segera';
      }
      const lat = document.getElementById('lat');
      if (lat) lat.value = '-6.566877';
      const long = document.getElementById('long');
      if (long) long.value = '106.857619';
      const imageEl = document.querySelector('input[name="image"]');
      if (imageEl) imageEl.value = img;
    }, DUMMY_JPEG);
    await secPage.waitForTimeout(1000);

    console.log('Submitting Patrol 2 form...');
    await secPage.screenshot({ path: 'docs/data-preparation/screenshots/02b-sec-agus-patrol2-ready.png' });
    await secPage.evaluate(() => {
      const f = document.getElementById('myForm');
      HTMLFormElement.prototype.submit.call(f);
    });
    await secPage.waitForLoadState('networkidle');
    await secPage.waitForTimeout(3000);
    console.log('URL after Patrol 2 submit:', secPage.url());
  }
  await secContext.close();

  // ---------------------------------------------------------
  // 3. AUDIT WEB ADMIN REPORTS AGAIN
  // ---------------------------------------------------------
  console.log('\n--- AUDITING WEB ADMIN REPORTS AGAIN ---');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${BASE_URL}/login.php`);
  await adminPage.locator('input[name="username"]').first().fill('nun');
  await adminPage.locator('input[name="password"]').first().fill('nun12345');
  await adminPage.locator('input[name="login"]').click();
  await adminPage.waitForLoadState('networkidle');

  // Check Laporan Driver
  await adminPage.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const driverReport = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('\nUpdated Laporan Driver Rows:', JSON.stringify(driverReport, null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/09-laporan-driver.png', fullPage: true });

  // Check Dashboard
  await adminPage.goto(`${BASE_URL}/index.php`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const dashboardStats = await adminPage.evaluate(() => {
    return document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
  });
  console.log('\nUpdated Dashboard Stats:', dashboardStats.slice(10, 40).join(' | '));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/07-admin-dashboard-active.png', fullPage: true });

  await browser.close();
}

main().catch(console.error);
