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

  const result = await page.evaluate(async () => {
    const res = await fetch('serverside-personil.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: 'draw=1&start=0&length=100&search[value]=&lokasi=&posisi=&nama='
    });
    const resp = await res.json();
    const list = resp.data.map(r => {
      const div = document.createElement('div');
      div.innerHTML = r[2];
      const nama = div.innerText.trim();
      div.innerHTML = r[1];
      const role = div.innerText.trim().replace(/\n+/g, ' ');
      div.innerHTML = r[0];
      const lokasi = div.innerText.trim();
      return { nama, role, lokasi };
    });
    const btn = Array.from(document.querySelectorAll('button, a.btn')).find(b => b.innerText.includes('BATAS MAKSIMAL'));
    return {
      recordsTotal: resp.recordsTotal,
      list,
      limitBtn: btn ? btn.outerHTML : null
    };
  });

  console.log('Total Personil:', result.recordsTotal);
  console.log('Personnel List:', JSON.stringify(result.list, null, 2));
  console.log('Limit Button:', result.limitBtn);

  await browser.close();
})();
