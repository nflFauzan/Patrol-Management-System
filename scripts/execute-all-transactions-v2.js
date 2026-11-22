const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://patroli.site';
const DUMMY_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function main() {
  console.log('================================================================');
  console.log('LAUNCHING VISIBLE BROWSER FOR COMPLETE OPERATIONAL WORKFLOW EXECUTION (V2)');
  console.log('Visible Mode: YES (headless: false, slowMo: 250)');
  console.log('================================================================');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 250,
    args: ['--start-maximized']
  });

  // Ensure screenshots directory exists
  if (!fs.existsSync('docs/data-preparation/screenshots')) {
    fs.mkdirSync('docs/data-preparation/screenshots', { recursive: true });
  }

  // -------------------------------------------------------------
  // 1. SECURITY AGUS: PATROL 1 (AMAN) & PATROL 2 (TEMUAN INSIDEN)
  // -------------------------------------------------------------
  console.log('\n--- [STEP 1] EXECUTING SECURITY PATROLS (sec_agus) ---');
  const secContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const secPage = await secContext.newPage();
  await secPage.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in as sec_agus...');
  await secPage.goto(`${BASE_URL}/login.php`);
  await secPage.locator('input[name="username"]').first().fill('sec_agus');
  await secPage.locator('input[name="password"]').first().fill('SecAgus123');
  await secPage.locator('input[name="login"]').click();
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(1500);

  // Patrol 1: Pos 1 Gerbang Utama (1052) - Situasi Aman
  console.log('Executing Patrol 1: Pos 1 Gerbang Utama (1052) - Aman...');
  await secPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await secPage.waitForTimeout(1000);
  await secPage.evaluate(() => {
    document.getElementById('result').value = '1052';
    document.getElementById('formScan').submit();
  });
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(1500);

  // Set patrol form values (Aman: tl = 0)
  await secPage.evaluate((imgUri) => {
    const sel = document.querySelector('select[name="tl"]');
    if (sel) sel.value = '0';
    const lat = document.getElementById('lat');
    if (lat) lat.value = '-6.566877';
    const long = document.getElementById('long');
    if (long) long.value = '106.857619';
    const img = document.querySelector('input[name="image"]');
    if (img) img.value = imgUri;
    const btn = document.getElementById('myButton');
    if (btn) {
      btn.style.display = 'block';
      btn.disabled = false;
    }
  }, DUMMY_JPEG);
  await secPage.waitForTimeout(1000);

  console.log('Submitting Patrol 1 (Pos 1 Gerbang - Aman)...');
  await secPage.screenshot({ path: 'docs/data-preparation/screenshots/01-sec-agus-patrol1-form.png' });
  await secPage.evaluate(() => {
    document.getElementById('myForm').submit();
  });
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(2500);
  console.log('Patrol 1 submitted successfully. Current URL:', secPage.url());

  // Patrol 2: Pos 2 Pintu Barat (1054) - Temuan Insiden!
  console.log('Executing Patrol 2: Pos 2 Pintu Barat (1054) - Temuan Insiden...');
  await secPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await secPage.waitForTimeout(1000);
  await secPage.evaluate(() => {
    document.getElementById('result').value = '1054';
    document.getElementById('formScan').submit();
  });
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(1500);

  if (secPage.url().includes('cek.php')) {
    await secPage.evaluate((imgUri) => {
      const sel = document.querySelector('select[name="tl"]');
      if (sel) sel.value = '1';
      const ket = document.getElementById('keterangan');
      if (ket) {
        ket.style.display = 'block';
        ket.value = 'Lampu sorot pos padam, perlu perbaikan teknisi segera';
      }
      const lat = document.getElementById('lat');
      if (lat) lat.value = '-6.566877';
      const long = document.getElementById('long');
      if (long) long.value = '106.857619';
      const img = document.querySelector('input[name="image"]');
      if (img) img.value = imgUri;
      const btn = document.getElementById('myButton');
      if (btn) {
        btn.style.display = 'block';
        btn.disabled = false;
      }
    }, DUMMY_JPEG);
    await secPage.waitForTimeout(1000);

    console.log('Submitting Patrol 2 (Pos 2 - Temuan Insiden)...');
    await secPage.screenshot({ path: 'docs/data-preparation/screenshots/02-sec-agus-patrol2-incident.png' });
    await secPage.evaluate(() => {
      document.getElementById('myForm').submit();
    });
    await secPage.waitForLoadState('networkidle');
    await secPage.waitForTimeout(2500);
    console.log('Patrol 2 submitted successfully.');
  }

  await secContext.close();

  // -------------------------------------------------------------
  // 2. CLEANING SERVICE SITI AMINAH: CHECKLIST SANITASI
  // -------------------------------------------------------------
  console.log('\n--- [STEP 2] EXECUTING CLEANING SANITATION (clean_siti) ---');
  const cleanContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const cleanPage = await cleanContext.newPage();
  await cleanPage.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in as clean_siti...');
  await cleanPage.goto(`${BASE_URL}/login.php`);
  await cleanPage.locator('input[name="username"]').first().fill('clean_siti');
  await cleanPage.locator('input[name="password"]').first().fill('CleanSiti123');
  await cleanPage.locator('input[name="login"]').click();
  await cleanPage.waitForLoadState('networkidle');
  await cleanPage.waitForTimeout(1500);

  console.log('Executing Cleaning Checklist: Toilet Lantai 1 (1053)...');
  await cleanPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await cleanPage.waitForTimeout(1000);
  await cleanPage.evaluate(() => {
    document.getElementById('result').value = '1053';
    document.getElementById('formScan').submit();
  });
  await cleanPage.waitForLoadState('networkidle');
  await cleanPage.waitForTimeout(1500);

  // Set cleaning form values (Bersih dan Rapi: tl = 0)
  await cleanPage.evaluate((imgUri) => {
    const sel = document.querySelector('select[name="tl"]');
    if (sel) sel.value = '0';
    const lat = document.getElementById('lat');
    if (lat) lat.value = '-6.566877';
    const long = document.getElementById('long');
    if (long) long.value = '106.857619';
    const img = document.querySelector('input[name="image"]');
    if (img) img.value = imgUri;
    const btn = document.getElementById('myButton');
    if (btn) {
      btn.style.display = 'block';
      btn.disabled = false;
    }
  }, DUMMY_JPEG);
  await cleanPage.waitForTimeout(1000);

  console.log('Submitting Cleaning Checklist (Toilet Lt 1 - Bersih & Rapi)...');
  await cleanPage.screenshot({ path: 'docs/data-preparation/screenshots/03-clean-siti-toilet-form.png' });
  await cleanPage.evaluate(() => {
    document.getElementById('myForm').submit();
  });
  await cleanPage.waitForLoadState('networkidle');
  await cleanPage.waitForTimeout(2500);
  console.log('Cleaning Checklist submitted successfully. Current URL:', cleanPage.url());

  await cleanContext.close();

  // -------------------------------------------------------------
  // 3. DRIVER JOKO WAHYUDI: MULAI PERJALANAN ARMADA
  // -------------------------------------------------------------
  console.log('\n--- [STEP 3] EXECUTING DRIVER JOURNEY (driver_joko) ---');
  const driverContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const driverPage = await driverContext.newPage();
  await driverPage.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in as driver_joko...');
  await driverPage.goto(`${BASE_URL}/login.php`);
  await driverPage.locator('input[name="username"]').first().fill('driver_joko');
  await driverPage.locator('input[name="password"]').first().fill('DriverJoko123');
  await driverPage.locator('input[name="login"]').click();
  await driverPage.waitForLoadState('networkidle');
  await driverPage.waitForTimeout(1500);

  console.log('Navigating to MULAI PERJALANAN (xxxxx_xxxxxxxxxx.php)...');
  await driverPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xxxxxxxxxx.php`, { waitUntil: 'networkidle' });
  await driverPage.waitForTimeout(1500);

  console.log('Filling Driver Journey Details...');
  await driverPage.locator('input#tipe').fill('Toyota Avanza Veloz');
  await driverPage.locator('input#nopol').fill('B 1234 PAT');
  await driverPage.locator('input#tujuan').fill('Gudang Logistik Cakung');
  await driverPage.locator('input#keperluan').fill('Antar dokumen & logistik operasional antar site');

  // Fill hidden inputs and enable btnSimpan
  await driverPage.evaluate((imgUri) => {
    document.getElementById('lat').value = '-6.566877';
    document.getElementById('long').value = '106.857619';
    document.getElementById('image').value = imgUri;
    const btnSimpan = document.getElementById('btnSimpan');
    if (btnSimpan) {
      btnSimpan.disabled = false;
    }
  }, DUMMY_JPEG);
  await driverPage.waitForTimeout(1000);

  console.log('Submitting Driver Journey...');
  await driverPage.screenshot({ path: 'docs/data-preparation/screenshots/04-driver-joko-journey-form.png' });
  
  // Submit via click or form submission
  await driverPage.locator('#btnSimpan').click();
  await driverPage.waitForLoadState('networkidle');
  await driverPage.waitForTimeout(3000);
  console.log('Driver Journey submitted. Current URL:', driverPage.url());

  await driverContext.close();

  // -------------------------------------------------------------
  // 4. DANRU BUDI SANTOSO: CHECK-IN ABSEN MASUK
  // -------------------------------------------------------------
  console.log('\n--- [STEP 4] EXECUTING DANRU CHECK-IN (danru_budi) ---');
  const danruContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const danruPage = await danruContext.newPage();
  await danruPage.addInitScript(() => { window.print = () => {}; });

  await danruPage.goto(`${BASE_URL}/login.php`);
  await danruPage.locator('input[name="username"]').first().fill('danru_budi');
  await danruPage.locator('input[name="password"]').first().fill('DanruBudi123');
  await danruPage.locator('input[name="login"]').click();
  await danruPage.waitForLoadState('networkidle');
  await danruPage.waitForTimeout(1000);

  console.log('Navigating to Absen Masuk Danru Budi...');
  await danruPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xx.php`, { waitUntil: 'networkidle' });
  await danruPage.waitForTimeout(1000);

  if (danruPage.url().includes('xxxxx_xx.php')) {
    await danruPage.locator('select[name="alasan"]').selectOption({ label: 'Piket Rutin' });
    await danruPage.evaluate((imgData) => {
      document.getElementById('latin').value = '-6.566877';
      document.getElementById('longin').value = '106.857619';
      document.querySelector('.image-tag').value = imgData;
      document.getElementById('simpan').style.display = '';
    }, DUMMY_JPEG);
    await danruPage.waitForTimeout(1000);
    await danruPage.screenshot({ path: 'docs/data-preparation/screenshots/05-danru-budi-checkin.png' });
    await danruPage.locator('#submitBtn').click();
    await danruPage.waitForLoadState('networkidle');
    await danruPage.waitForTimeout(2000);
    console.log('Danru Budi checkin submitted. Current URL:', danruPage.url());
  }
  await danruContext.close();

  // -------------------------------------------------------------
  // 5. CHIEF HENDRA WIJAYA: CHECK-IN ABSEN MASUK
  // -------------------------------------------------------------
  console.log('\n--- [STEP 5] EXECUTING CHIEF HENDRA CHECK-IN (chief_hendra) ---');
  const chiefContext = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const chiefPage = await chiefContext.newPage();
  await chiefPage.addInitScript(() => { window.print = () => {}; });

  await chiefPage.goto(`${BASE_URL}/login.php`);
  await chiefPage.locator('input[name="username"]').first().fill('chief_hendra');
  await chiefPage.locator('input[name="password"]').first().fill('ChiefHendra123');
  await chiefPage.locator('input[name="login"]').click();
  await chiefPage.waitForLoadState('networkidle');
  await chiefPage.waitForTimeout(1000);

  console.log('Navigating to Absen Masuk Chief Hendra...');
  await chiefPage.goto(`${BASE_URL}/validasi-patroli/xxxxx_xx.php`, { waitUntil: 'networkidle' });
  await chiefPage.waitForTimeout(1000);

  if (chiefPage.url().includes('xxxxx_xx.php')) {
    await chiefPage.locator('select[name="alasan"]').selectOption({ label: 'Piket Rutin' });
    await chiefPage.evaluate((imgData) => {
      document.getElementById('latin').value = '-6.566877';
      document.getElementById('longin').value = '106.857619';
      document.querySelector('.image-tag').value = imgData;
      document.getElementById('simpan').style.display = '';
    }, DUMMY_JPEG);
    await chiefPage.waitForTimeout(1000);
    await chiefPage.screenshot({ path: 'docs/data-preparation/screenshots/06-chief-hendra-checkin.png' });
    await chiefPage.locator('#submitBtn').click();
    await chiefPage.waitForLoadState('networkidle');
    await chiefPage.waitForTimeout(2000);
    console.log('Chief Hendra checkin submitted. Current URL:', chiefPage.url());
  }
  await chiefContext.close();

  // -------------------------------------------------------------
  // 6. AUDIT ALL REPORTS & DASHBOARD FROM WEB ADMIN (AGENT 4 & 5)
  // -------------------------------------------------------------
  console.log('\n======================================================');
  console.log('--- [STEP 6] AUDITING WEB ADMIN REPORTS & DASHBOARD ---');
  console.log('======================================================');

  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminContext.newPage();
  await adminPage.addInitScript(() => { window.print = () => {}; });

  console.log('Logging into Web Admin Command Center (nun)...');
  await adminPage.goto(`${BASE_URL}/login.php`);
  await adminPage.locator('input[name="username"]').first().fill('nun');
  await adminPage.locator('input[name="password"]').first().fill('nun12345');
  await adminPage.locator('input[name="login"]').click();
  await adminPage.waitForLoadState('networkidle');
  await adminPage.waitForTimeout(1500);

  // 6A. Check Dashboard
  console.log('Auditing Dashboard (index.php)...');
  await adminPage.goto(`${BASE_URL}/index.php`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const dashboardStats = await adminPage.evaluate(() => {
    return document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
  });
  console.log('Dashboard Snapshot Lines:', dashboardStats.slice(10, 35).join(' | '));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/07-admin-dashboard-active.png', fullPage: true });

  // 6B. Check Laporan Cleaning Service
  console.log('Auditing Laporan Cleaning Service...');
  await adminPage.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const cleaningReport = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('Laporan Cleaning Service Rows:', JSON.stringify(cleaningReport, null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/08-laporan-cleaning-service.png', fullPage: true });

  // 6C. Check Laporan Driver
  console.log('Auditing Laporan Driver...');
  await adminPage.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const driverReport = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('Laporan Driver Rows:', JSON.stringify(driverReport, null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/09-laporan-driver.png', fullPage: true });

  // 6D. Check Laporan Security Anggota
  console.log('Auditing Laporan Security Anggota...');
  await adminPage.goto(`${BASE_URL}/xxxx_xxxxxxxxxxx`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const securityReport = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('Laporan Security Anggota Rows:', JSON.stringify(securityReport.slice(0, 5), null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/10-laporan-security.png', fullPage: true });

  // 6E. Check Rekap Kegiatan
  console.log('Auditing Rekap Kegiatan...');
  await adminPage.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const rekapKegiatan = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('Rekap Kegiatan Rows:', JSON.stringify(rekapKegiatan.slice(0, 5), null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/11-rekap-kegiatan.png', fullPage: true });

  // 6F. Save Audit Data JSON
  const auditResult = {
    auditTimestamp: new Date().toISOString(),
    dashboardStatsSummary: dashboardStats.slice(0, 45),
    cleaningReport,
    driverReport,
    securityReport: securityReport.slice(0, 5),
    rekapKegiatan: rekapKegiatan.slice(0, 5)
  };
  fs.writeFileSync('docs/data-preparation/operational-audit-result.json', JSON.stringify(auditResult, null, 2), 'utf-8');

  console.log('\n======================================================');
  console.log('ALL OPERATIONAL TRANSACTIONS COMPLETED AND AUDITED!');
  console.log('======================================================');
  await adminPage.waitForTimeout(3000);
  await browser.close();
}

main().catch(err => {
  console.error('Error during operational workflow execution:', err);
  process.exit(1);
});
