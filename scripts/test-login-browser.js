const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3001/login...');
  await page.goto('http://localhost:3001/login');
  await page.waitForLoadState('domcontentloaded');

  console.log('Clicking Administrator button...');
  await page.locator('button:has-text("Administrator")').click();

  console.log('Clicking Submit button...');
  await page.getByRole('button', { name: 'Masuk ke Command Center' }).click();

  console.log('Waiting for URL...');
  await page.waitForURL('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 15000 });

  console.log('SUCCESS! Navigated to:', page.url());
  await browser.close();
})();
