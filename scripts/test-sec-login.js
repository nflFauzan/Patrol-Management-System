const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://patroli.site/login.php');

  // Try some passwords for sec_agus
  const candidates = ['nun12345', '123456', 'sec_agus', 'agus123', 'password'];
  for (const pwd of candidates) {
    await page.locator('input[name="username"]').first().fill('sec_agus');
    await page.locator('input[name="password"]').first().fill(pwd);
    await page.locator('input[name="login"]').click();
    await page.waitForLoadState('networkidle');
    console.log(`Testing sec_agus with pwd '${pwd}' -> URL: ${page.url()}`);
    if (page.url() !== 'https://patroli.site/login.php') {
      console.log('SUCCESSFUL LOGIN FOR sec_agus! Redirected to:', page.url());
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
      console.log('Body preview:', bodyText);
      break;
    }
  }

  await browser.close();
})();
