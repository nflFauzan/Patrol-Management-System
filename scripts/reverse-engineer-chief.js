const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto('https://patroli.site/login.php', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  const screenshotDir = path.join(__dirname, '../docs/superpowers/screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  await page.screenshot({ path: path.join(screenshotDir, 'debug_login_page.png') });
  console.log('Login page screenshot saved to debug_login_page.png');

  // Inspect form inputs
  const inputs = await page.$$eval('input, button', (els) =>
    els.map((el) => ({
      tagName: el.tagName,
      name: el.getAttribute('name'),
      type: el.getAttribute('type'),
      id: el.id,
      placeholder: el.getAttribute('placeholder'),
      value: el.value,
      outerHTML: el.outerHTML,
    }))
  );
  console.log('Inputs found:', JSON.stringify(inputs, null, 2));

  // Fill login
  console.log('Filling login fields...');
  // Check if there is an input for username and password
  const userInput = await page.$('input[name="user"], input[name="username"], input[name="email"], input[type="text"]');
  if (userInput) {
    await userInput.fill('testi');
  } else {
    console.log('Could not find username input!');
  }

  const passInput = await page.$('input[name="pass"], input[name="password"], input[type="password"]');
  if (passInput) {
    await passInput.fill('testing123');
  } else {
    console.log('Could not find password input!');
  }

  await page.screenshot({ path: path.join(screenshotDir, 'debug_filled_login.png') });

  console.log('Submitting form...');
  const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Masuk"), .btn-primary');
  if (submitBtn) {
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }).catch((e) => console.log('Navigation event timeout, checking current URL...')),
      submitBtn.click(),
    ]);
  } else {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);
  }

  await page.waitForTimeout(3000);
  console.log('Current URL after login attempt:', page.url());
  await page.screenshot({ path: path.join(screenshotDir, 'debug_after_login.png') });

  // Let's print out the page title and any error message or navbar items
  const title = await page.title();
  console.log('Page Title:', title);

  const links = await page.$$eval('a', (els) =>
    els.map((a) => ({
      text: a.innerText.trim(),
      href: a.href,
    }))
  );
  console.log('Links on page after login:', links.filter((l) => l.text.length > 0));

  await browser.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
