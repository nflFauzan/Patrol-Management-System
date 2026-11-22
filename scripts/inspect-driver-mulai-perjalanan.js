const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  console.log('Launching VISIBLE browser to inspect MULAI PERJALANAN...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const page = await context.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in as driver_joko...');
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('driver_joko');
  await page.locator('input[name="password"]').first().fill('DriverJoko123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Navigating to MULAI PERJALANAN (xxxxx_xxxxxxxxxx.php)...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xxxxxxxxxx.php', { waitUntil: 'networkidle' });
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
        placeholder: i.placeholder,
        options: i.tagName === 'SELECT' ? Array.from(i.options).map(o => ({ value: o.value, text: o.text })) : undefined
      }))
    }));
    return { text: text.slice(0, 1500), forms };
  });

  console.log('MULAI PERJALANAN Text:', formDetails.text);
  console.log('MULAI PERJALANAN Forms:', JSON.stringify(formDetails.forms, null, 2));

  const screenshotPath = 'docs/data-preparation/screenshot-driver-mulai-perjalanan.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
