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

  const scripts = await page.evaluate(() => {
    // Get inline scripts
    const inline = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.innerText);
    return inline.filter(t => t.includes('insert-personil') || t.includes('webcam') || t.includes('exampleModalCenter') || t.includes('posisi'));
  });

  console.log('Relevant scripts count:', scripts.length);
  for (let i = 0; i < scripts.length; i++) {
    console.log(`--- SCRIPT ${i} ---`);
    console.log(scripts[i].slice(0, 1000));
  }

  await browser.close();
})();
