const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -6.566877, longitude: 106.857619 }
  });
  const page = await context.newPage();

  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('SecAgus123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xx.php', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const elements = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, input[type="button"], a.btn, .btn')).map(b => ({
      text: b.innerText.trim(),
      id: b.id,
      className: b.className,
      onclick: b.getAttribute('onclick'),
      style: b.getAttribute('style')
    }));
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerText).filter(s => s.includes('Webcam') || s.includes('submitBtn') || s.includes('take_snapshot'));
    return { btns, scripts };
  });

  console.log('Buttons on Absen Masuk:', JSON.stringify(elements.btns, null, 2));
  console.log('Camera scripts count:', elements.scripts.length);
  elements.scripts.forEach((s, idx) => console.log(`--- SCRIPT ${idx} --- \n`, s.slice(0, 800)));

  await browser.close();
})();
