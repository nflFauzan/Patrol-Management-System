const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  console.log('Launching VISIBLE browser to test Checkpoint Scan (cek.php)...');
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

  console.log('Logging in as sec_agus...');
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('SecAgus123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Navigating to scan page (xxxxx_xxxxxxxxx.php)...');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xxxxxxxxx.php', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Set result value to 1052 (Pos 1 Gerbang Utama) and submit formScan
  console.log('Simulating QR scan result: 1052...');
  await page.evaluate(() => {
    document.getElementById('result').value = '1052';
    document.getElementById('formScan').submit();
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('Landed on URL after QR scan:', page.url());
  console.log('Page Title:', await page.title());

  const pageData = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\n+/g, ' ');
    const forms = Array.from(document.querySelectorAll('form')).map(f => ({
      action: f.action,
      method: f.method,
      inputs: Array.from(f.querySelectorAll('input, select, textarea')).map(i => ({
        name: i.name,
        type: i.type,
        id: i.id,
        value: i.value,
        options: i.tagName === 'SELECT' ? Array.from(i.options).map(o => ({ value: o.value, text: o.text })) : undefined
      }))
    }));
    return { text: text.slice(0, 1500), forms };
  });

  console.log('Form on checkpoint page:', JSON.stringify(pageData.forms, null, 2));
  console.log('Page Text snippet:', pageData.text.slice(0, 500));

  const screenshotPath = 'docs/data-preparation/screenshot-after-scan-1052.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.waitForTimeout(2000);
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
