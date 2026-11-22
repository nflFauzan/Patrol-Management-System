const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  console.log('Launching VISIBLE browser to inspect INPUT KEGIATAN...');
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

  console.log('Clicking INPUT KEGIATAN...');
  const inputKegiatanLink = page.locator('a:has-text("INPUT KEGIATAN")');
  const href = await inputKegiatanLink.getAttribute('href');
  console.log('INPUT KEGIATAN link href:', href);

  await inputKegiatanLink.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Landed on URL:', page.url());
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
    const links = Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href }));
    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]')).map(b => ({
      text: b.innerText?.trim() || b.value,
      id: b.id,
      className: b.className
    }));
    return { text: text.slice(0, 1500), forms, links, buttons };
  });

  fs.writeFileSync('docs/data-preparation/input-kegiatan-inspection.json', JSON.stringify(pageData, null, 2), 'utf-8');
  console.log('Text on INPUT KEGIATAN:', pageData.text);
  console.log('Forms:', JSON.stringify(pageData.forms, null, 2));

  const screenshotPath = 'docs/data-preparation/screenshot-input-kegiatan-sec_agus.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.waitForTimeout(2000);
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
