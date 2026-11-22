const { chromium } = require('playwright');

(async () => {
  console.log('Launching VISIBLE browser window on desktop...');
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  console.log('Navigating to patroli.site...');
  await page.goto('https://patroli.site/login.php');
  await page.waitForTimeout(2000);

  console.log('Visible browser opened successfully!');
  await browser.close();
})();
