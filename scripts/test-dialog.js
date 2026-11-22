const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    console.log('Dialog popped up:', dialog.type(), dialog.message());
    await dialog.accept();
  });

  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('wrongpassword');
  await page.locator('input[name="login"]').click();
  await page.waitForTimeout(2000);
  console.log('After login attempt, current URL:', page.url());

  await browser.close();
})();
