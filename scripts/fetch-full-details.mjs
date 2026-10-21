import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:/Users/HALLO/.gemini/antigravity-ide/brain/20cbb54f-17a5-4307-a24a-70e83b6fd759/scratch';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Login
  await page.goto('https://patroli.site/login.php', { waitUntil: 'networkidle' });
  await page.fill('input[name="username"]', 'testi');
  await page.fill('input[name="password"]', 'testing123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('input[name="login"]'),
  ]);

  // Navigate to cleaning service page
  await page.goto('https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxx', { waitUntil: 'networkidle' });

  // Now perform fetch inside browser context to get complete server responses
  const serversideData = await page.evaluate(async () => {
    const res = await fetch('serverside-cleaning.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        draw: '1',
        start: '0',
        length: '100',
        is_category: '',
      }),
    });
    return await res.json();
  });
  fs.writeFileSync(path.join(OUT_DIR, 'serverside-cleaning-full.json'), JSON.stringify(serversideData, null, 2), 'utf-8');
  console.log('Saved serverside-cleaning-full.json with records:', serversideData.recordsTotal);

  // Fetch detail for 7546 and 7544
  for (const id of ['7546', '7544']) {
    const detailHtml = await page.evaluate(async (recId) => {
      const res = await fetch('detail-cleaning.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: recId }),
      });
      return await res.text();
    }, id);
    fs.writeFileSync(path.join(OUT_DIR, `detail-cleaning-${id}.html`), detailHtml, 'utf-8');
    console.log(`Saved detail-cleaning-${id}.html (${detailHtml.length} bytes)`);

    // Fetch tl.php for id
    const tlHtml = await page.evaluate(async (recId) => {
      const res = await fetch('tl.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: recId }),
      });
      return await res.text();
    }, id);
    fs.writeFileSync(path.join(OUT_DIR, `tl-${id}.html`), tlHtml, 'utf-8');
    console.log(`Saved tl-${id}.html (${tlHtml.length} bytes)`);
  }

  await browser.close();
}

run().catch(console.error);
