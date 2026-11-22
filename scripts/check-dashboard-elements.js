const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('SecAgus123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  const elements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*')).filter(el => el.children.length === 0 && el.innerText?.trim());
    return all.map(el => ({
      text: el.innerText.trim(),
      tag: el.tagName,
      parentTag: el.parentElement?.tagName,
      href: el.getAttribute('href') || el.parentElement?.getAttribute('href'),
      onclick: el.getAttribute('onclick') || el.parentElement?.getAttribute('onclick'),
      className: el.className
    })).filter(e => e.text.includes('KEGIATAN') || e.text.includes('ABSEN'));
  });

  console.log('Matching elements on dashboard:', JSON.stringify(elements, null, 2));
  await browser.close();
})();
