const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('driver_joko');
  await page.locator('input[name="password"]').first().fill('DriverJoko123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');
  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xxxxxxxxxx.php', { waitUntil: 'networkidle' });
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, input[type="submit"]')).map(b => ({
      tagName: b.tagName,
      id: b.id,
      className: b.className,
      text: b.innerText,
      disabled: b.disabled,
      outerHTML: b.outerHTML
    }));
  });
  console.log('Buttons:', JSON.stringify(buttons, null, 2));
  await browser.close();
}

main().catch(console.error);
