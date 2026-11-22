const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
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

  console.log('Navigating to INPUT KEGIATAN (xxxxx_xxxxxxxxx.php)...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xxxxxxxxx.php', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const pageData = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\n+/g, ' ');
    const forms = Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action,
      method: f.method,
      id: f.id,
      inputs: Array.from(f.querySelectorAll('input, select, textarea')).map(i => ({
        name: i.name,
        type: i.type,
        id: i.id,
        value: i.value,
        options: i.tagName === 'SELECT' ? Array.from(i.options).map(o => ({ value: o.value, text: o.text })) : undefined
      }))
    }));
    const scripts = Array.from(document.querySelectorAll('script:not([src])')).map(s => s.innerText);
    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]')).map(b => ({
      text: b.innerText?.trim() || b.value,
      id: b.id,
      className: b.className,
      onclick: b.getAttribute('onclick')
    }));
    return { text: text.slice(0, 1500), forms, buttons, scriptsSnippet: scripts.map(s => s.slice(0, 600)) };
  });

  fs.writeFileSync('docs/data-preparation/input-kegiatan-details.json', JSON.stringify(pageData, null, 2), 'utf-8');
  console.log('Page Text:', pageData.text);
  console.log('Forms:', JSON.stringify(pageData.forms, null, 2));
  console.log('Buttons:', JSON.stringify(pageData.buttons, null, 2));

  const screenshotPath = 'docs/data-preparation/screenshot-input-kegiatan-form.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
