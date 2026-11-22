const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const page = await context.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in as sec_agus...');
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('SecAgus123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Inspecting validasi-patroli DOM structure...');
  const pageData = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim().replace(/\n+/g, ' '),
      href: a.href,
      pathname: a.pathname
    }));
    const buttons = Array.from(document.querySelectorAll('button, [onclick]')).map(b => ({
      text: b.innerText?.trim() || b.value,
      onclick: b.getAttribute('onclick'),
      dataTarget: b.getAttribute('data-target')
    }));
    const fullHtml = document.body.innerHTML;
    return { links, buttons, fullHtmlSnippet: fullHtml.slice(0, 4000) };
  });

  fs.writeFileSync('docs/data-preparation/mobile-dashboard-dom.json', JSON.stringify(pageData, null, 2), 'utf-8');
  console.log('Links found on mobile portal:');
  pageData.links.forEach(l => console.log(`  - ${l.text} -> ${l.href}`));

  await browser.close();
})();
