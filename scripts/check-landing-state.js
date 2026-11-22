const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('SecAgus123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' '));
  console.log('Body Text:', bodyText.slice(0, 500));

  const allElementsWithText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, div, span, p, h1, h2, h3, h4'))
      .map(el => ({ tag: el.tagName, text: el.innerText?.trim() }))
      .filter(e => e.text && (e.text.includes('ABSEN') || e.text.includes('KEGIATAN')));
  });
  console.log('Elements with ABSEN/KEGIATAN:', JSON.stringify(allElementsWithText.slice(0, 10), null, 2));

  await browser.close();
})();
