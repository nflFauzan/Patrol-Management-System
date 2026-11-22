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

  console.log('Opening edit for Chief Hendra (1465)...');
  await page.click('a.edit-record[data-id="1465"]');
  await page.waitForTimeout(2000);

  // Fill password_baru
  console.log('Updating password_baru to ChiefHendra123...');
  await page.locator('#myModal input[name="password_baru"]').fill('ChiefHendra123');

  // Submit edit form
  await page.locator('#myModal button[type="submit"]:has-text("Simpan Perubahan")').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Now inspect what pwdLama is stored!
  const updatedData = await page.evaluate(async () => {
    const resp = await fetch('personil_edit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: 'id=1465'
    });
    const html = await resp.text();
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.querySelector('input[name="password_lama"]')?.value;
  });
  console.log('Updated stored hash for Chief Hendra:', updatedData);

  // Now let's try logging in as chief_hendra with ChiefHendra123 on login.php!
  console.log('Testing login on login.php with chief_hendra / ChiefHendra123...');
  const testContext = await browser.newContext();
  const testPage = await testContext.newPage();
  await testPage.goto('https://patroli.site/login.php');
  await testPage.locator('input[name="username"]').first().fill('chief_hendra');
  await testPage.locator('input[name="password"]').first().fill('ChiefHendra123');
  await testPage.locator('input[name="login"]').click();
  await testPage.waitForLoadState('networkidle');
  await testPage.waitForTimeout(2000);

  console.log('Test Page URL after login:', testPage.url());
  console.log('Test Page Title:', await testPage.title());
  console.log('Test Page Text snippet:', (await testPage.evaluate(() => document.body.innerText)).slice(0, 300).replace(/\n+/g, ' '));

  await browser.close();
})();
