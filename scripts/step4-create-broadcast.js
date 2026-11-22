const { chromium } = require('playwright');

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

  console.log('Navigating to Pesan Siaran (xxxxx_xxxxxxxxxxxxxxx)...');
  await page.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });

  // Open modal or check form
  console.log('Opening modal Tambah Pesan Siaran...');
  await page.click('button:has-text("TAMBAH PESAN SIARAN"), button[data-target="#exampleModalCenter"]');
  await page.waitForTimeout(1000);

  const areaOptions = await page.locator('#exampleModalCenter select[name="lokasi_area"] option').evaluateAll(opts =>
    opts.map(o => ({ value: o.value, text: o.text }))
  );
  console.log('Available area options for broadcast:', areaOptions);

  const matchedOpt = areaOptions.find(o => o.value.toLowerCase().includes('cakung') || o.text.toLowerCase().includes('cakung'));
  if (matchedOpt) {
    await page.locator('#exampleModalCenter select[name="lokasi_area"]').selectOption(matchedOpt.value);
  } else {
    console.log('Cakung option not found, using first available area');
  }

  const broadcastMsg = 'SOP PENJAGAAN & LOGISTIK DI GUDANG CAKUNG AKTIF MULAI MINGGU INI. SELURUH PERSONEL WAJIB PATUHI PROTOKOL.';
  await page.locator('#exampleModalCenter textarea[name="isi_pesan"]').fill(broadcastMsg);

  console.log('Submitting Pesan Siaran...');
  await page.locator('#exampleModalCenter button[type="submit"], #exampleModalCenter input[type="submit"]').first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Verify in table
  await page.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(r => ({
      pesan: r.cells[0]?.innerText?.trim().replace(/\n+/g, ' '),
      lokasi: r.cells[1]?.innerText?.trim().replace(/\n+/g, ' ')
    }));
  });
  console.log('Current Pesan Siaran rows:', JSON.stringify(rows, null, 2));

  await browser.close();
})();
