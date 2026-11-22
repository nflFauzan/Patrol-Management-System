const { chromium } = require('playwright');
const fs = require('fs');

const USERNAME = process.env.PATROL_USER || 'nun';
const PASSWORD = process.env.PATROL_PASSWORD || 'nun12345';
const BASE_URL = 'https://patroli.site';

async function main() {
  console.log('Launching VISIBLE browser for investigation...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
    args: ['--start-maximized']
  });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  await page.addInitScript(() => { window.print = () => {}; });

  console.log('Navigating to login page...');
  await page.goto(`${BASE_URL}/login.php`);
  await page.locator('input[name="username"]').first().fill(USERNAME);
  await page.locator('input[name="password"]').first().fill(PASSWORD);
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Inspecting page source and scripts on index.php...');
  const indexInfo = await page.evaluate(() => {
    const html = document.documentElement.outerHTML;
    // Search for potential links, mentions of mobile, app, pwa, member, etc.
    const allLinks = Array.from(document.querySelectorAll('a')).map(a => a.href);
    const allScripts = Array.from(document.querySelectorAll('script')).map(s => s.src || s.innerText.slice(0, 100));
    return { allLinks, allScripts, htmlSnippet: html.slice(0, 3000) };
  });

  // Let's inspect the Absensi page (xxxx_xxxxxxxxx) detail
  console.log('Navigating to Absensi page...');
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxxx`);
  await page.waitForLoadState('networkidle');

  // Let's click on DETAIL for Agus Pratama
  console.log('Clicking DETAIL on Absensi to see transaction origin...');
  const detailBtn = page.locator('a:has-text("DETAIL"), button:has-text("DETAIL")').first();
  if (await detailBtn.count() > 0) {
    await detailBtn.click();
    await page.waitForTimeout(2000);
  }

  const modalHtml = await page.evaluate(() => {
    const modal = document.querySelector('.modal.show, #myModalab, [id*="absen"]');
    return modal ? modal.innerHTML : null;
  });

  // Let's also inspect Laporan Security page (xxxx_xxxxxxxxxxx)
  console.log('Navigating to Laporan Security Anggota...');
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxxxxx`);
  await page.waitForLoadState('networkidle');

  const patrolDetailBtn = page.locator('a:has-text("DETAIL"), button:has-text("DETAIL")').first();
  if (await patrolDetailBtn.count() > 0) {
    await patrolDetailBtn.click();
    await page.waitForTimeout(2000);
  }

  const patrolModalHtml = await page.evaluate(() => {
    const modal = document.querySelector('.modal.show, #myModalpat, [id*="patrol"]');
    return modal ? modal.innerHTML : null;
  });

  // Now let's check Personil edit modal for clean_siti and driver_joko to inspect their stored password hash and username!
  console.log('Navigating to Personil page to inspect clean_siti and driver_joko stored data...');
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxx`);
  await page.waitForLoadState('networkidle');

  // Find edit buttons
  const editButtonsData = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('a.edit-record'));
    return buttons.map(b => ({
      dataId: b.getAttribute('data-id'),
      rowText: b.closest('tr')?.innerText.trim().replace(/\n+/g, ' ')
    }));
  });
  console.log('Edit buttons found:', JSON.stringify(editButtonsData, null, 2));

  // Let's click edit for clean_siti (Siti Aminah)
  const sitiBtn = editButtonsData.find(b => b.rowText.includes('Siti Aminah'));
  let sitiFormData = null;
  if (sitiBtn) {
    console.log(`Opening edit modal for Siti Aminah (id: ${sitiBtn.dataId})...`);
    await page.click(`a.edit-record[data-id="${sitiBtn.dataId}"]`);
    await page.waitForTimeout(1500);
    sitiFormData = await page.evaluate(() => {
      const modal = document.querySelector('#myModal');
      return modal ? Array.from(modal.querySelectorAll('input, select')).map(i => ({
        name: i.name,
        type: i.type,
        value: i.value
      })) : null;
    });
  }

  const result = {
    indexLinks: indexInfo.allLinks,
    modalAbsensi: modalHtml ? modalHtml.slice(0, 1500) : null,
    modalPatroli: patrolModalHtml ? patrolModalHtml.slice(0, 1500) : null,
    editButtonsData,
    sitiFormData
  };

  fs.writeFileSync('docs/data-preparation/investigation-findings.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('Saved investigation findings.');

  await page.waitForTimeout(2000);
  await browser.close();
}

main().catch(err => {
  console.error('Error in investigation:', err);
  process.exit(1);
});
