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

  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xxxxxxxxx.php');
  await page.evaluate(() => {
    document.getElementById('result').value = '1052';
    document.getElementById('formScan').submit();
  });
  await page.waitForLoadState('networkidle');

  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => s.innerText).filter(s => s.includes('Webcam') || s.includes('tl') || s.includes('keterangan') || s.includes('submit'));
  });

  console.log('Scripts count:', scripts.length);
  scripts.forEach((s, idx) => console.log(`--- SCRIPT ${idx} --- \n`, s.slice(0, 1000)));

  const submitButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]')).map(b => ({
      text: b.innerText?.trim() || b.value,
      id: b.id,
      className: b.className,
      style: b.getAttribute('style'),
      parentStyle: b.parentElement?.getAttribute('style')
    }));
  });
  console.log('Buttons on cek.php:', JSON.stringify(submitButtons, null, 2));

  await browser.close();
})();
