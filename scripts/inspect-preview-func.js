const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('sec_agus');
  await page.locator('input[name="password"]').first().fill('SecAgus123');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto('https://patroli.site/validasi-patroli/xxxxx_xx.php');
  const previewCode = await page.evaluate(() => {
    return {
      preview: window.preview ? window.preview.toString() : null,
      allInlineScript: Array.from(document.querySelectorAll('script')).map(s => s.innerText).join('\n')
    };
  });
  console.log('preview function:', previewCode.preview);
  const relevantSnippet = previewCode.allInlineScript.slice(0, 3000);
  console.log('Script snippet:', relevantSnippet);

  await browser.close();
})();
