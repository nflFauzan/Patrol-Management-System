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

  // Call serverside-personil.php directly from page context
  const resp = await page.evaluate(async () => {
    const res = await fetch('serverside-personil.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: 'draw=1&start=0&length=100&search[value]=&lokasi=&posisi=&nama='
    });
    return await res.json();
  });

  console.log('Total records:', resp.recordsTotal);
  console.log('Filtered records:', resp.recordsFiltered);
  console.log('Data:', JSON.stringify(resp.data, null, 2));

  await browser.close();
})();
