const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    window.print = () => console.log('window.print suppressed');
  });

  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('nun');
  await page.locator('input[name="password"]').first().fill('nun12345');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto('https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  await page.waitForLoadState('networkidle');

  const btns = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('button, a')).filter(b => b.innerText.includes('Slip Gaji'));
    return list.map(b => ({
      html: b.outerHTML,
      onclick: b.getAttribute('onclick'),
      dataId: b.getAttribute('data-id'),
      target: b.getAttribute('target'),
      href: b.getAttribute('href')
    }));
  });
  console.log('Slip Gaji buttons:', JSON.stringify(btns, null, 2));

  // Also check if there's any modal or script handling slip gaji
  const modals = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.modal')).map(m => ({
      id: m.id,
      html: m.innerHTML.slice(0, 500)
    }));
  });
  console.log('Modals on Gaji page:', JSON.stringify(modals, null, 2));

  await browser.close();
})();
