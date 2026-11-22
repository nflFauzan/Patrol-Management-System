const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 } // AEON MALL SENTUL
  });
  const page = await context.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in as sec_agus...');
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('SecAgus123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Navigating to ABSEN MASUK (xxxxx_xx.php)...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xx.php', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const formDetails = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\n+/g, ' ');
    const forms = Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action,
      method: f.method,
      inputs: Array.from(f.querySelectorAll('input, select, textarea')).map(i => ({
        name: i.name,
        type: i.type,
        id: i.id,
        value: i.value,
        required: i.required
      }))
    }));
    const scripts = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.innerText);
    return { text: text.slice(0, 1000), forms, scriptsSnippet: scripts.map(s => s.slice(0, 500)) };
  });

  fs.writeFileSync('docs/data-preparation/absen-masuk-inspection.json', JSON.stringify(formDetails, null, 2), 'utf-8');
  console.log('Absen Masuk Text:', formDetails.text);
  console.log('Forms:', JSON.stringify(formDetails.forms, null, 2));

  await browser.close();
})();
