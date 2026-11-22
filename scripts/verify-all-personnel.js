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

  // Change pageLength to 50 or 100
  await page.evaluate(() => {
    $('#personil').DataTable().page.len(50).draw();
  });
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => {
    const tableInfo = document.querySelector('#personil_info')?.innerText;
    const rows = Array.from(document.querySelectorAll('#personil tbody tr')).map(r => ({
      lokasi: r.cells[0]?.innerText?.trim().replace(/\n+/g, ' '),
      jabatan_posisi: r.cells[1]?.innerText?.trim().replace(/\n+/g, ' '),
      nama: r.cells[2]?.innerText?.trim().replace(/\n+/g, ' ')
    }));
    return { tableInfo, rows };
  });

  console.log('DataTable info:', info.tableInfo);
  console.log('All Rows:', JSON.stringify(info.rows, null, 2));

  await browser.close();
})();
