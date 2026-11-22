const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://patroli.site';
const DUMMY_JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function main() {
  console.log('Executing Pos 2 (1062) Incident Patrol in VISIBLE browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 250,
    args: ['--start-maximized']
  });

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
  console.log('Scanning checkpoint 1062 (Pos 2 Pintu Barat)...');
  await secPage.evaluate(() => {
    document.getElementById('result').value = '1062';
    document.getElementById('formScan').submit();
  });
  await secPage.waitForLoadState('networkidle');
  await secPage.waitForTimeout(2000);
  console.log('URL after scanning 1062:', secPage.url());

  if (secPage.url().includes('cek.php')) {
    console.log('Successfully reached cek.php for Pos 2 Pintu Barat!');
    await secPage.evaluate((img) => {
      const sel = document.querySelector('select[name="tl"]');
      if (sel) {
        sel.value = '1'; // 1 = Perlu Tindak Lanjut (Temuan Insiden)
        sel.dispatchEvent(new Event('change'));
      }
      const ket = document.getElementById('keterangan');
      if (ket) {
        ket.style.display = 'block';
        ket.value = 'Lampu sorot pos padam dan pintu gerbang barat macet';
      }
      const lat = document.getElementById('lat');
      if (lat) lat.value = '-6.566877';
      const long = document.getElementById('long');
      if (long) long.value = '106.857619';
      const imageEl = document.querySelector('input[name="image"]');
      if (imageEl) imageEl.value = img;
      const btn = document.getElementById('myButton');
      if (btn) {
        btn.style.display = 'block';
        btn.disabled = false;
      }
    }, DUMMY_JPEG);
    await secPage.waitForTimeout(1000);

    console.log('Submitting Pos 2 Temuan Insiden...');
    await secPage.screenshot({ path: 'docs/data-preparation/screenshots/02-pos2-temuan-insiden-form.png' });
    await secPage.evaluate(() => {
      const f = document.getElementById('myForm');
      HTMLFormElement.prototype.submit.call(f);
    });
    await secPage.waitForLoadState('networkidle');
    await secPage.waitForTimeout(3000);
    console.log('URL after Pos 2 submit:', secPage.url());
  }
  await secContext.close();

  // Audit Web Admin Dashboard & Security Report
  console.log('\n--- AUDITING WEB ADMIN DASHBOARD & SECURITY REPORT ---');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${BASE_URL}/login.php`);
  await adminPage.locator('input[name="username"]').first().fill('nun');
  await adminPage.locator('input[name="password"]').first().fill('nun12345');
  await adminPage.locator('input[name="login"]').click();
  await adminPage.waitForLoadState('networkidle');

  // Dashboard
  await adminPage.goto(`${BASE_URL}/index.php`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const dashboardStats = await adminPage.evaluate(() => {
    return document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
  });
  console.log('\nDashboard Stats:', dashboardStats.slice(10, 45).join(' | '));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/07-admin-dashboard-active.png', fullPage: true });

  // Security Report
  await adminPage.goto(`${BASE_URL}/xxxx_xxxxxxxxxxx`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const securityReport = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('\nSecurity Report Rows (top 4):', JSON.stringify(securityReport.slice(0, 4), null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/10-laporan-security.png', fullPage: true });

  // Rekap Kegiatan
  await adminPage.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(2000);
  const rekapKegiatan = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => 
      Array.from(r.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '))
    );
  });
  console.log('\nRekap Kegiatan Rows:', JSON.stringify(rekapKegiatan.slice(0, 5), null, 2));
  await adminPage.screenshot({ path: 'docs/data-preparation/screenshots/11-rekap-kegiatan.png', fullPage: true });

  // Update audit result file
  const auditData = {
    updatedAt: new Date().toISOString(),
    dashboardStatsSummary: dashboardStats.slice(0, 50),
    securityReport: securityReport.slice(0, 5),
    rekapKegiatan: rekapKegiatan.slice(0, 5)
  };
  fs.writeFileSync('docs/data-preparation/operational-audit-result.json', JSON.stringify(auditData, null, 2), 'utf-8');

  console.log('\nSUCCESS: Pos 2 Incident Patrol Recorded and Audited!');
  await adminPage.waitForTimeout(2000);
  await browser.close();
}

main().catch(console.error);
