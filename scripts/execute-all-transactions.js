const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://patroli.site';
const DUMMY_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function main() {
  console.log('================================================================');
  console.log('LAUNCHING VISIBLE BROWSER FOR COMPLETE OPERATIONAL WORKFLOW EXECUTION');
  console.log('================================================================');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 250,
    args: ['--start-maximized']
  });

  // -------------------------------------------------------------
  // 1. SECURITY AGUS PRATAMA: PATROL 1 (AMAN) & PATROL 2 (TEMUAN)
  // -------------------------------------------------------------
  console.log('\n--- [AGENT 2] EXECUTING SECURITY PATROLS (sec_agus) ---');
  const secContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const secPage = await secContext.newPage();
  await secPage.addInitScript(() => { window.print = () => {}; });

  await secPage.goto(`${BASE_URL}/login.php`);
  await secPage.locator('input[name="username"]').first().fill('sec_agus');
  await secPage.locator('input[name="password"]').first().fill('SecAgus123');
  await secPage.locator('input[name="login"]').click();
  await secPage.waitForLoadState('networkidle');

  // Patrol 1: Pos 1 Gerbang Utama (1052) - Situasi Aman
  console.log('Executing Patrol 1: Pos 1 Gerbang Utama (1052) - Aman...');
  await secPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await secPage.evaluate(() => {
    document.getElementById('result').value = '1052';
    document.getElementById('formScan').submit();
  });
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(2000);

  // Fill patrol form
  await secPage.locator('select[name="tl"]').selectOption('0'); // Aman
  await secPage.locator('input#keterangan').fill('Pintu gerbang terkunci rapat, situasi kondusif');
  await secPage.evaluate((imgUri) => {
    document.getElementById('lat').value = '-6.566877';
    document.getElementById('long').value = '106.857619';
    document.querySelector('input[name="image"]').value = imgUri;
  }, DUMMY_JPEG);
  await secPage.waitForTimeout(500);

  console.log('Submitting Patrol 1...');
  await secPage.locator('button[type="submit"], input[type="submit"], .btn-simpan, button:has-text("Simpan")').first().click();
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(2500);
  console.log('Patrol 1 submitted. URL:', secPage.url());

  // Patrol 2: Pos 2 Pintu Barat (1054) or Ruang Server - Temuan Insiden!
  // Let's check available checkpoints list from database
  console.log('Executing Patrol 2: Pos 2 (Temuan Insiden)...');
  await secPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await secPage.evaluate(() => {
    // Checkpoint 1052 is Pos 1. Next checkpoint ID from our creation is 1054 or 1055
    document.getElementById('result').value = '1054';
    document.getElementById('formScan').submit();
  });
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(2000);

  if (secPage.url().includes('cek.php')) {
    await secPage.locator('select[name="tl"]').selectOption('1'); // Perlu Tindak Lanjut!
    await secPage.locator('input#keterangan').fill('Lampu sorot pos padam, perlu perbaikan teknisi');
    await secPage.evaluate((imgUri) => {
      document.getElementById('lat').value = '-6.566877';
      document.getElementById('long').value = '106.857619';
      document.querySelector('input[name="image"]').value = imgUri;
    }, DUMMY_JPEG);
    await secPage.waitForTimeout(500);

    console.log('Submitting Patrol 2 (Temuan Insiden)...');
    await secPage.locator('button[type="submit"], input[type="submit"], .btn-simpan, button:has-text("Simpan")').first().click();
    await secPage.waitForLoadState('networkidle');
    await secPage.waitForTimeout(2500);
    console.log('Patrol 2 submitted.');
  } else {
    console.log('Could not open checkpoint 1054 form, continuing...');
  }
  await secContext.close();

  // -------------------------------------------------------------
  // 2. CLEANING SERVICE SITI AMINAH: SANITASI CHECKLIST
  // -------------------------------------------------------------
  console.log('\n--- [AGENT 3] EXECUTING CLEANING SANITATION (clean_siti) ---');
  const cleanContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const cleanPage = await cleanContext.newPage();
  await cleanPage.addInitScript(() => { window.print = () => {}; });

  await cleanPage.goto(`${BASE_URL}/login.php`);
  await cleanPage.locator('input[name="username"]').first().fill('clean_siti');
  await cleanPage.locator('input[name="password"]').first().fill('CleanSiti123');
  await cleanPage.locator('input[name="login"]').click();
  await cleanPage.waitForLoadState('networkidle');

  console.log('Executing Cleaning Checklist: Toilet Lantai 1 (1053)...');
  await cleanPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await cleanPage.evaluate(() => {
    document.getElementById('result').value = '1053';
    document.getElementById('formScan').submit();
  });
  await cleanPage.waitForLoadState('networkidle');
  await cleanPage.waitForTimeout(2000);

  // Fill cleaning form
  await cleanPage.locator('select[name="tl"]').selectOption('0'); // Bersih dan Rapi
  await cleanPage.locator('input#keterangan').fill('Pembersihan lantai dan sanitasi wastafel selesai');
  await cleanPage.evaluate((imgUri) => {
    document.getElementById('lat').value = '-6.566877';
    document.getElementById('long').value = '106.857619';
    document.querySelector('input[name="image"]').value = imgUri;
  }, DUMMY_JPEG);
  await cleanPage.waitForTimeout(500);

  console.log('Submitting Cleaning Checklist...');
  await cleanPage.locator('button[type="submit"], input[type="submit"], .btn-simpan, button:has-text("Simpan")').first().click();
  await cleanPage.waitForLoadState('networkidle');
  await cleanPage.waitForTimeout(2500);
  console.log('Cleaning Checklist submitted. URL:', cleanPage.url());

  await cleanContext.close();

  // -------------------------------------------------------------
  // 3. DRIVER JOKO WAHYUDI: MULAI PERJALANAN ARMADA
  // -------------------------------------------------------------
  console.log('\n--- [AGENT 3] EXECUTING DRIVER JOURNEY (driver_joko) ---');
  const driverContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const driverPage = await driverContext.newPage();
  await driverPage.addInitScript(() => { window.print = () => {}; });

  await driverPage.goto(`${BASE_URL}/login.php`);
  await driverPage.locator('input[name="username"]').first().fill('driver_joko');
  await driverPage.locator('input[name="password"]').first().fill('DriverJoko123');
  await driverPage.locator('input[name="login"]').click();
  await driverPage.waitForLoadState('networkidle');

  console.log('Navigating to MULAI PERJALANAN...');
  await driverPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await driverPage.waitForTimeout(2000);

  // Fill driver journey form
  await driverPage.locator('input#tipe').fill('Toyota Avanza Veloz');
  await driverPage.locator('input#nopol').fill('B 1234 PAT');
  await driverPage.locator('input#tujuan').fill('Gudang Logistik Cakung');
  await driverPage.locator('input#keperluan').fill('Antar dokumen & logistik operasional');
  await driverPage.evaluate((imgUri) => {
    document.getElementById('lat').value = '-6.566877';
    document.getElementById('long').value = '106.857619';
    document.getElementById('image').value = imgUri;
  }, DUMMY_JPEG);
  await driverPage.waitForTimeout(500);

  console.log('Submitting Driver Journey...');
  await driverPage.locator('button[type="submit"], input[type="submit"], .btn-simpan, button:has-text("Simpan")').first().click();
  await driverPage.waitForLoadState('networkidle');
  await driverPage.waitForTimeout(3000);
  console.log('Driver Journey submitted. URL:', driverPage.url());

  await driverContext.close();

  // -------------------------------------------------------------
  // 4. VERIFY ON WEB ADMIN (AGENT 4 & AGENT 5)
  // -------------------------------------------------------------
  console.log('\n--- [AGENT 4 & 5] AUDITING WEB ADMIN REPORTS & DASHBOARD ---');
  const adminContext = await browser.newContext({ viewport: null });
  const adminPage = await adminContext.newPage();
  await adminPage.addInitScript(() => { window.print = () => {}; });

  await adminPage.goto(`${BASE_URL}/login.php`);
  await adminPage.locator('input[name="username"]').first().fill('nun');
  await adminPage.locator('input[name="password"]').first().fill('nun12345');
  await adminPage.locator('input[name="login"]').click();
  await adminPage.waitForLoadState('networkidle');

  // Check Dashboard
  await adminPage.goto(`${BASE_URL}/index.php`, { waitUntil: 'networkidle' });
  const dashboardStats = await adminPage.evaluate(() => {
    return document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
  });
  console.log('\nDashboard Stats After Transactions:');
  console.log(dashboardStats.slice(10, 35).join(' | '));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshot-dashboard-active.png', fullPage: true });

  // Check Laporan Cleaning Service
  await adminPage.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  const cleaningReportRows = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('\nLaporan Cleaning Service Rows:', JSON.stringify(cleaningReportRows, null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshot-laporan-cleaning-populated.png', fullPage: true });

  // Check Laporan Driver
  await adminPage.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  const driverReportRows = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('\nLaporan Driver Rows:', JSON.stringify(driverReportRows, null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshot-laporan-driver-populated.png', fullPage: true });

  // Check Laporan Security Anggota
  await adminPage.goto(`${BASE_URL}/xxxx_xxxxxxxxxxx`, { waitUntil: 'networkidle' });
  const securityReportRows = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('\nLaporan Security Anggota Rows:', JSON.stringify(securityReportRows.slice(0, 3), null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshot-laporan-security-populated.png', fullPage: true });

  // Save audit data
  const auditResult = {
    timestamp: new Date().toISOString(),
    dashboardStats: dashboardStats.slice(0, 40),
    cleaningReportRows,
    driverReportRows,
    securityReportRows: securityReportRows.slice(0, 5)
  };
  fs.writeFileSync('docs/data-preparation/operational-audit-result.json', JSON.stringify(auditResult, null, 2), 'utf-8');

  console.log('\nAll operational workflows executed and audited successfully!');
  await browser.close();
}

main().catch(err => {
  console.error('Error during operational workflow execution:', err);
  process.exit(1);
});
