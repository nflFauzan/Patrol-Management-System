const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.print = () => {}; });
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('nun');
  await page.locator('input[name="password"]').first().fill('nun12345');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto('https://patroli.site/xxxx_xxxxxxxx');
  await page.waitForLoadState('networkidle');

  const formDetails = await page.evaluate(() => {
    const f = document.querySelector('form[action="insert-personil.php"]');
    return {
      onsubmit: f?.getAttribute('onsubmit'),
      action: f?.action,
      inputs: Array.from(f?.querySelectorAll('input, select, textarea') || []).map(i => ({
        id: i.id,
        name: i.name,
        className: i.className,
        required: i.required,
        type: i.type
      }))
    };
  });
  console.log('Form details:', JSON.stringify(formDetails, null, 2));

  // Also check submit button inside the modal
  const submitBtn = await page.evaluate(() => {
    const btn = document.querySelector('#simpan, button[type="submit"].btn-simpan, #exampleModalCenter button[type="submit"]');
    return btn ? { id: btn.id, text: btn.innerText, outerHTML: btn.outerHTML } : null;
  });
  console.log('Submit button:', JSON.stringify(submitBtn, null, 2));

  await browser.close();
})();
