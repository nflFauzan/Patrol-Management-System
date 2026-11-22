const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in as driver_joko...');
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('driver_joko');
  await page.locator('input[name="password"]').first().fill('DriverJoko123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Going to xxxxx_xxxxxxxxxx.php...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xxxxxxxxxx.php', { waitUntil: 'networkidle' });

  // Inspect scripts on page
  const pageScripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => s.innerHTML).filter(t => t.includes('btnSimpan') || t.includes('insert_driver'));
  });
  console.log('Page scripts related to driver:', pageScripts);

  // Inspect form action
  const formHtml = await page.evaluate(() => {
    const f = document.querySelector('form');
    return f ? f.outerHTML : 'no form';
  });
  console.log('Form HTML:', formHtml.slice(0, 500));

  await browser.close();
}

main().catch(console.error);
