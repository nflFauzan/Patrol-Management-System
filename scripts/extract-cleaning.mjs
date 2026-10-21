import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'C:/Users/HALLO/.gemini/antigravity-ide/brain/20cbb54f-17a5-4307-a24a-70e83b6fd759/scratch';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.log('Chromium launch failed, trying msedge channel...', e.message);
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Intercept network requests to log AJAX / API calls
  const ajaxCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    const contentType = response.headers()['content-type'] || '';
    if (url.includes('.php') || contentType.includes('json') || contentType.includes('text/html')) {
      if (!url.includes('.js') && !url.includes('.css') && !url.includes('.png') && !url.includes('.jpg')) {
        try {
          const text = await response.text();
          ajaxCalls.push({ url, status, contentType, bodyLength: text.length, snippet: text.slice(0, 500) });
        } catch (e) {}
      }
    }
  });

  console.log('Navigating to login page...');
  await page.goto('https://patroli.site/login.php', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT_DIR, '01-login-page.png') });

  console.log('Filling login form...');
  await page.fill('input[name="username"]', 'testi');
  await page.fill('input[name="password"]', 'testing123');
  await page.screenshot({ path: path.join(OUT_DIR, '02-login-filled.png') });

  console.log('Submitting login...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
    page.click('input[name="login"], button[type="submit"], input[type="submit"]'),
  ]);

  console.log('Current URL after login:', page.url());
  await page.screenshot({ path: path.join(OUT_DIR, '03-after-login.png') });

  // Save dashboard/navigation HTML
  const afterLoginHtml = await page.content();
  fs.writeFileSync(path.join(OUT_DIR, 'after-login.html'), afterLoginHtml, 'utf-8');

  // Extract navigation links from the navbar
  const links = await page.$$eval('a', (elements) => elements.map(el => ({ text: el.innerText.trim(), href: el.href })));
  fs.writeFileSync(path.join(OUT_DIR, 'navbar-links.json'), JSON.stringify(links, null, 2), 'utf-8');

  // Find the exact Cleaning Service link under LAPORAN
  let cleaningLink = links.find(l => l.text.toLowerCase().includes('cleaning') || l.href.includes('cleaning'));
  console.log('Found Cleaning Link in navbar:', cleaningLink);

  const targetUrl = cleaningLink ? cleaningLink.href : 'https://patroli.site/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxx';
  console.log('Navigating to target URL:', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 20000 }).catch(async (err) => {
    console.log('Direct navigation warning:', err.message);
  });

  console.log('Target Page URL:', page.url());
  await page.waitForTimeout(3000); // let jQuery DataTables render
  await page.screenshot({ path: path.join(OUT_DIR, '04-target-page.png'), fullPage: true });

  const targetHtml = await page.content();
  fs.writeFileSync(path.join(OUT_DIR, 'target-page.html'), targetHtml, 'utf-8');

  // Check if there is an alert, card, table, filters on this page
  const pageDetails = await page.evaluate(() => {
    const table = document.querySelector('table');
    const headers = table ? Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim()) : [];
    const filterForms = Array.from(document.querySelectorAll('form, .filter, .card-header, .box-header, .breadcrumb, .alert')).map(el => el.outerHTML);
    return {
      title: document.title,
      headers,
      filterFormsCount: filterForms.length,
      hasTable: !!table,
      tableRowCount: table ? table.querySelectorAll('tbody tr').length : 0,
      tableClass: table ? table.className : '',
      tableId: table ? table.id : '',
    };
  });
  console.log('Page details:', pageDetails);
  fs.writeFileSync(path.join(OUT_DIR, 'page-details.json'), JSON.stringify(pageDetails, null, 2), 'utf-8');

  // Look for rows in the data table and inspect the Action column
  const rows = await page.$$('table tbody tr');
  console.log(`Table has ${rows.length} rows.`);
  if (rows.length > 0) {
    const firstRowButtons = await rows[0].$$('button, a.btn');
    console.log(`First row has ${firstRowButtons.length} buttons.`);
    for (let i = 0; i < firstRowButtons.length; i++) {
      const btnText = await firstRowButtons[i].innerText().catch(() => '');
      const btnClass = await firstRowButtons[i].getAttribute('class').catch(() => '');
      const btnHtml = await firstRowButtons[i].evaluate(el => el.outerHTML).catch(() => '');
      console.log(`Row 0 Button ${i}: text="${btnText}", class="${btnClass}", html=${btnHtml}`);
    }

    // Click the first detail button if available
    const detailBtn = await rows[0].$('button:has-text("Detail"), a:has-text("Detail"), .btn-info, .btn-primary, [data-target*="modal"], [data-toggle="modal"]');
    if (detailBtn) {
      console.log('Clicking Detail button...');
      await detailBtn.click();
      await page.waitForTimeout(3000); // wait for modal animation / ajax
      await page.screenshot({ path: path.join(OUT_DIR, '05-detail-modal.png') });

      // Find any visible modal
      const modalInfo = await page.evaluate(() => {
        const modals = Array.from(document.querySelectorAll('.modal'));
        return modals.map(m => ({
          id: m.id,
          class: m.className,
          style: m.getAttribute('style'),
          html: m.outerHTML,
          text: m.innerText,
        }));
      });
      fs.writeFileSync(path.join(OUT_DIR, 'modal-detail.json'), JSON.stringify(modalInfo, null, 2), 'utf-8');
      console.log(`Saved ${modalInfo.length} modal elements.`);
    } else {
      console.log('Detail button not found directly in row 0');
    }
  }

  // Save all network AJAX calls
  fs.writeFileSync(path.join(OUT_DIR, 'ajax-calls.json'), JSON.stringify(ajaxCalls, null, 2), 'utf-8');

  await browser.close();
  console.log('Playwright extraction finished successfully.');
}

run().catch(console.error);
