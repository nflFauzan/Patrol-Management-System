const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('nun');
  await page.locator('input[name="password"]').first().fill('nun12345');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Navigating to cetak-aset?kode_aset=1052...');
  await page.goto('https://patroli.site/cetak-aset?kode_aset=1052', { waitUntil: 'networkidle' });

  const pageInfo = await page.evaluate(() => {
    const text = document.body.innerText.replace(/\n+/g, ' ');
    const imgs = Array.from(document.querySelectorAll('img')).map(i => ({
      src: i.src,
      alt: i.alt
    }));
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerText);
    return { text, imgs, scriptsSnippet: scripts.map(s => s.slice(0, 500)) };
  });

  console.log('Cetak Aset Text:', pageInfo.text);
  console.log('Images:', JSON.stringify(pageInfo.imgs, null, 2));
  console.log('Scripts:', JSON.stringify(pageInfo.scriptsSnippet, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
