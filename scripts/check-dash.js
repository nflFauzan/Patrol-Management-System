const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    const res = await page.goto('https://patroli.site/login.php', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Login page status:', res ? res.status() : 'no response');
    const title = await page.title();
    console.log('Title:', title);

    const hasForm = await page.locator('input[name="username"]').count();
    console.log('Has login form:', hasForm > 0);

    if (hasForm > 0) {
      await page.locator('input[name="username"]').first().fill('nun');
      await page.locator('input[name="password"]').first().fill('nun12345');
      await page.locator('input[name="login"]').click();
      await page.waitForLoadState('networkidle');

      console.log('Dashboard URL:', page.url());
      const cards = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.card, .info-box, [class*="card"]')).map(c => c.innerText.trim().replace(/\n+/g, ' '));
      });
      console.log('Cards on dashboard:');
      cards.slice(0, 15).forEach(c => console.log(' - ' + c.slice(0, 80)));
    }
  } catch (err) {
    console.log('Error checking dashboard:', err.message);
  } finally {
    await browser.close();
  }
})();
