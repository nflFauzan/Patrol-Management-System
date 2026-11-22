const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('nun');
  await page.locator('input[name="password"]').first().fill('nun12345');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');
  await page.goto('https://patroli.site/xxxx_xxxxxxxxxx', { waitUntil: 'networkidle' });
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tbody tr')).map(tr => {
      const tds = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim().replace(/\n+/g, ' '));
      const links = Array.from(tr.querySelectorAll('a')).map(a => a.href);
      return { tds, links };
    });
  });
  console.log('Checkpoints in Admin:', JSON.stringify(rows, null, 2));
  await browser.close();
}

main().catch(console.error);
