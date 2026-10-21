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
  await page.goto('https://patroli.site/login.php', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  console.log('Logging in...');
  await page.fill('input[name="username"]', 'testi');
  await page.fill('input[name="password"]', 'testing123');
  
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    page.click('input[name="login"]'),
  ]);

  await page.waitForTimeout(2000);
  console.log('Logged in. Navigating directly to Chief page: https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  
  // Listen to all network requests & responses
  page.on('request', (req) => {
    if (['fetch', 'xhr'].includes(req.resourceType())) {
      console.log('>> [REQUEST]', req.method(), req.url(), req.postData());
    }
  });

  page.on('response', async (res) => {
    if (['fetch', 'xhr'].includes(res.request().resourceType())) {
      try {
        const body = await res.text();
        console.log('<< [RESPONSE]', res.url(), 'Status:', res.status(), 'Length:', body.length);
        const outDir = path.join(__dirname, '../docs/superpowers/plans');
        fs.writeFileSync(path.join(outDir, `ajax_response_${Date.now()}.html`), `<!-- URL: ${res.url()} -->\n` + body);
      } catch (err) {
        console.log('Could not read response body:', err.message);
      }
    }
  });

  await page.goto('https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const screenshotDir = path.join(__dirname, '../docs/superpowers/screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  await page.screenshot({ path: path.join(screenshotDir, 'patroli_site_chief_page_loaded.png'), fullPage: true });
  console.log('Chief page screenshot saved.');

  // Dump the page HTML
  const pageContent = await page.content();
  fs.writeFileSync(path.join(__dirname, '../docs/superpowers/plans/chief_page_raw.html'), pageContent);
  console.log('Page HTML dumped to chief_page_raw.html');

  // Let's inspect the table and rows
  const tableData = await page.evaluate(() => {
    const table = document.querySelector('table');
    if (!table) return { error: 'No table found' };
    const headers = Array.from(table.querySelectorAll('th')).map((th) => th.innerText.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr')).map((tr) => {
      return Array.from(tr.querySelectorAll('td')).map((td) => ({
        text: td.innerText.trim(),
        html: td.innerHTML,
      }));
    });
    return { headers, rows };
  });

  console.log('Table Headers:', tableData.headers);
  console.log('Table Rows Count:', tableData.rows ? tableData.rows.length : 0);
  if (tableData.rows && tableData.rows.length > 0) {
    console.log('First Row Data:', JSON.stringify(tableData.rows[0], null, 2));
  }

  // Find all detail buttons/links
  const detailButtons = await page.$$('a.detail-record, a:has-text("DETAIL"), button:has-text("DETAIL"), .btn-info, [data-target]');
  console.log(`Found ${detailButtons.length} candidate detail buttons.`);

  for (let i = 0; i < detailButtons.length; i++) {
    const btn = detailButtons[i];
    const text = await btn.innerText();
    const href = await btn.getAttribute('href');
    const dataTarget = await btn.getAttribute('data-target');
    const dataId = await btn.getAttribute('data-id');
    const className = await btn.getAttribute('class');
    console.log(`Button ${i}: text="${text}", href="${href}", data-target="${dataTarget}", data-id="${dataId}", class="${className}"`);
  }

  // Click the first detail button
  const firstDetailBtn = await page.$('a.detail-record, a:has-text("DETAIL"), button:has-text("DETAIL")');
  if (firstDetailBtn) {
    console.log('Clicking DETAIL button...');
    await firstDetailBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(screenshotDir, 'patroli_site_chief_detail_modal_open.png') });
    console.log('Modal open screenshot saved to patroli_site_chief_detail_modal_open.png');

    // Get any visible modal or dynamic element
    const modalContent = await page.evaluate(() => {
      const modals = document.querySelectorAll('.modal.show, .modal[style*="display: block"], .modal-body, .patroli-detail, #myModal, #myModalpat, #myModalchief');
      return Array.from(modals).map((m) => ({
        id: m.id,
        className: m.className,
        style: m.getAttribute('style'),
        innerHTML: m.innerHTML,
        outerHTML: m.outerHTML,
      }));
    });

    console.log(`Found ${modalContent.length} modal elements.`);
    if (modalContent.length > 0) {
      fs.writeFileSync(path.join(__dirname, '../docs/superpowers/plans/chief_detail_modal.html'), modalContent[0].outerHTML);
      console.log('Chief detail modal HTML saved to chief_detail_modal.html');
    }

    // Also get full HTML after modal opened
    const fullHtmlAfter = await page.content();
    fs.writeFileSync(path.join(__dirname, '../docs/superpowers/plans/chief_page_with_modal.html'), fullHtmlAfter);
  } else {
    console.log('No detail button could be clicked.');
  }

  await browser.close();
  console.log('Script completed.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
