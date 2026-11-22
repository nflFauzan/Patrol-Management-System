const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://patroli.site';

const accounts = [
  { username: 'clean_siti', password: 'CleanSitiPass2026!', role: 'Cleaning Service' },
  { username: 'driver_joko', password: 'DriverJokoPass2026!', role: 'Driver' },
  { username: 'chief_hendra', password: 'ChiefHendraPass2026!', role: 'Chief Security' }
];

async function testLogins() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const acc of accounts) {
    const context = await browser.newContext({
      permissions: ['geolocation', 'camera'],
      geolocation: { latitude: -6.566877, longitude: 106.857619 }, // AEON MALL SENTUL
      viewport: { width: 375, height: 812 }, // Mobile iPhone viewport
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();
    await page.addInitScript(() => { window.print = () => {}; });

    console.log(`\nLogging in as ${acc.username} (${acc.role})...`);
    await page.goto(`${BASE_URL}/login.php`, { waitUntil: 'networkidle' });
    await page.locator('input[name="username"]').first().fill(acc.username);
    await page.locator('input[name="password"]').first().fill(acc.password);
    await page.locator('input[name="login"]').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const title = await page.title();
    console.log(`Landed on URL: ${currentUrl}, Title: ${title}`);

    // Take screenshot
    const screenshotPath = `docs/data-preparation/screenshot-login-${acc.username}.png`;
    await page.screenshot({ path: screenshotPath });

    const pageInfo = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim().replace(/\n+/g, ' '),
        href: a.getAttribute('href')
      })).filter(l => l.text);
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]')).map(b => ({
        text: b.innerText?.trim() || b.value,
        id: b.id,
        className: b.className
      }));
      const textPreview = document.body.innerText.slice(0, 1000).replace(/\n+/g, ' ');
      return { links, buttons, textPreview };
    });

    results.push({
      account: acc.username,
      role: acc.role,
      url: currentUrl,
      title,
      screenshot: screenshotPath,
      info: pageInfo
    });

    await context.close();
  }

  fs.writeFileSync('docs/data-preparation/employee-login-discovery.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('\nSaved employee login discovery to docs/data-preparation/employee-login-discovery.json');
  await browser.close();
}

testLogins().catch(err => {
  console.error('Error during test logins:', err);
  process.exit(1);
});
