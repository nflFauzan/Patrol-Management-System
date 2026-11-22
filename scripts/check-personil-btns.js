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

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a.btn')).map(b => ({
      text: b.innerText.trim(),
      id: b.id,
      className: b.className,
      target: b.getAttribute('data-target')
    }));
  });
  console.log('Buttons on Personil page:', JSON.stringify(buttons, null, 2));

  await browser.close();
})();
