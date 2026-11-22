const { chromium } = require('playwright');
const fs = require('fs');

const USERNAME = process.env.PATROL_USER || 'nun';
const PASSWORD = process.env.PATROL_PASSWORD || 'nun12345';
const BASE_URL = 'https://patroli.site';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  await page.goto(`${BASE_URL}/login.php`);
  await page.locator('input[name="username"]').first().fill(USERNAME);
  await page.locator('input[name="password"]').first().fill(PASSWORD);
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  // Dashboard stats
  console.log('Inspecting Dashboard stats...');
  await page.goto(`${BASE_URL}/index.php`, { waitUntil: 'networkidle' });
  const dashboardStats = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.split('\n').map(l => l.trim()).filter(Boolean);
  });

  // Check Area
  await page.goto(`${BASE_URL}/xxxx_xxxxxxx`, { waitUntil: 'networkidle' });
  const areas = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => ({
      nama: r.cells[0]?.innerText?.trim().replace(/\n+/g, ' '),
      lat: r.cells[1]?.innerText?.trim(),
      lng: r.cells[2]?.innerText?.trim()
    }));
  });

  // Check Checkpoints
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxxxx`, { waitUntil: 'networkidle' });
  const checkpoints = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => ({
      lokasi: r.cells[0]?.innerText?.trim().replace(/\n+/g, ' '),
      kategori: r.cells[1]?.innerText?.trim().replace(/\n+/g, ' '),
      aset: r.cells[2]?.innerText?.trim().replace(/\n+/g, ' ')
    }));
  });

  // Check Personil
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxx`, { waitUntil: 'networkidle' });
  const personnel = await page.evaluate(async () => {
    const res = await fetch('serverside-personil.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: 'draw=1&start=0&length=100&search[value]=&lokasi=&posisi=&nama='
    });
    const resp = await res.json();
    return resp.data.map(r => {
      const div = document.createElement('div');
      div.innerHTML = r[2];
      const nama = div.innerText.trim();
      div.innerHTML = r[1];
      const role = div.innerText.trim().replace(/\n+/g, ' ');
      div.innerHTML = r[0];
      const lokasi = div.innerText.trim();
      return { nama, role, lokasi };
    });
  });

  // Check Gaji table
  await page.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  const gajiRows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => ({
      nama: r.cells[0]?.innerText?.trim().replace(/\n+/g, ' '),
      posisi: r.cells[1]?.innerText?.trim().replace(/\n+/g, ' '),
      lokasi: r.cells[2]?.innerText?.trim().replace(/\n+/g, ' '),
      gaji: r.cells[9]?.innerText?.trim(),
      diterima: r.cells[10]?.innerText?.trim()
    }));
  });

  // Check Pesan Siaran
  await page.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  const pesanRows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => ({
      pesan: r.cells[0]?.innerText?.trim().replace(/\n+/g, ' '),
      lokasi: r.cells[1]?.innerText?.trim().replace(/\n+/g, ' ')
    }));
  });

  const summary = {
    areas,
    checkpoints,
    personnel,
    gajiRows,
    pesanRows,
    dashboardSummary: dashboardStats.slice(0, 30)
  };

  fs.writeFileSync('docs/data-preparation/verified-environment-summary.json', JSON.stringify(summary, null, 2), 'utf-8');
  console.log('Saved verified environment summary.');
  console.log('Summary Preview:', JSON.stringify({
    totalAreas: areas.length,
    totalCheckpoints: checkpoints.length,
    totalPersonnel: personnel.length,
    totalGajiRecords: gajiRows.length,
    totalPesanSiaran: pesanRows.length
  }, null, 2));

  await browser.close();
})();
