const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.print = () => {}; });
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('nun');
  await page.locator('input[name="password"]').first().fill('nun12345');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto('https://patroli.site/xxxx_xxxxxxxx');
  await page.waitForLoadState('networkidle');

  const footer = await page.evaluate(() => {
    const f = document.querySelector('#exampleModalCenter .modal-footer');
    return f ? { html: f.innerHTML, text: f.innerText } : null;
  });
  console.log('Modal footer:', JSON.stringify(footer, null, 2));

  await browser.close();
})();
