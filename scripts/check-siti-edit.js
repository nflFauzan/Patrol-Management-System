const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('nun');
  await page.locator('input[name="password"]').first().fill('nun12345');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto('https://patroli.site/xxxx_xxxxxxxx');
  await page.waitForLoadState('networkidle');

  // Check script handling .edit-record
  const editHandlerScript = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerText);
    return scripts.filter(s => s.includes('edit-record') || s.includes('myModal'));
  });
  console.log('Edit handler scripts:', editHandlerScript);

  // Click edit for Siti Aminah and wait for response
  page.on('response', async res => {
    if (res.url().includes('edit') || res.url().includes('personil') || res.url().includes('php')) {
      console.log('AJAX URL called on edit:', res.url());
      if (res.url().includes('edit') || res.url().includes('get_')) {
        const text = await res.text();
        console.log('AJAX response snippet:', text.slice(0, 500));
      }
    }
  });

  console.log('Clicking edit for Siti Aminah (1466)...');
  await page.click('a.edit-record[data-id="1466"]');
  await page.waitForTimeout(3000);

  const modalInputs = await page.evaluate(() => {
    const m = document.querySelector('#myModal');
    return Array.from(m.querySelectorAll('input, select')).map(i => ({
      name: i.name,
      type: i.type,
      value: i.value,
      readonly: i.readOnly
    }));
  });
  console.log('Siti Aminah modal inputs:', JSON.stringify(modalInputs, null, 2));

  await browser.close();
})();
