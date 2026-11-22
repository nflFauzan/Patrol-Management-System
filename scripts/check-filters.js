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

  await page.goto(`${BASE_URL}/xxxx_xxxxxxxx`, { waitUntil: 'networkidle' });

  const filterState = await page.evaluate(() => {
    return {
      filter_lokasi: $('#filter_lokasi').val(),
      filter_posisi: $('#filter_posisi').val(),
      filter_nama: $('#filter_nama').val(),
      posisiOptions: Array.from(document.querySelectorAll('#filter_posisi option')).map(o => ({ value: o.value, text: o.text })),
      lokasiOptions: Array.from(document.querySelectorAll('#filter_lokasi option')).map(o => ({ value: o.value, text: o.text }))
    };
  });
  console.log('Filter State:', JSON.stringify(filterState, null, 2));

  // Let's set filter_posisi to 'Cleaning Service' and draw
  console.log('Testing filter_posisi = Cleaning Service...');
  await page.evaluate(() => {
    $('#filter_posisi').val('Cleaning Service').trigger('change');
  });
  await page.waitForTimeout(1500);

  const cleaningRows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#personil tbody tr')).map(r => r.innerText.trim().replace(/\n+/g, ' '));
  });
  console.log('Cleaning rows:', cleaningRows);

  // Let's set filter_posisi to '' (Semua Personel) and draw
  console.log('Testing filter_posisi = empty (Semua)...');
  await page.evaluate(() => {
    $('#filter_posisi').val('').trigger('change');
    $('#filter_lokasi').val('').trigger('change');
  });
  await page.waitForTimeout(1500);

  const allRows = await page.evaluate(() => {
    return {
      info: document.querySelector('#personil_info')?.innerText,
      rows: Array.from(document.querySelectorAll('#personil tbody tr')).map(r => r.innerText.trim().replace(/\n+/g, ' '))
    };
  });
  console.log('All rows:', allRows);

  await browser.close();
})();
