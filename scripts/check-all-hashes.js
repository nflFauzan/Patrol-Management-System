const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://patroli.site/login.php');
  await page.locator('input[name="username"]').first().fill('nun');
  await page.locator('input[name="password"]').first().fill('nun12345');
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto('https://patroli.site/xxxx_xxxxxxxx');
  await page.waitForLoadState('networkidle');

  const ids = ['1452', '1453', '1465', '1466', '1467'];
  const results = [];

  for (const id of ids) {
    const data = await page.evaluate(async (personilId) => {
      const resp = await fetch('personil_edit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: `id=${personilId}`
      });
      const html = await resp.text();
      const div = document.createElement('div');
      div.innerHTML = html;
      const nama = div.querySelector('input[name="nama_anggota"]')?.value;
      const username = div.querySelector('input[name="username"]')?.value;
      const pwdLama = div.querySelector('input[name="password_lama"]')?.value;
      const posisi = div.querySelector('select[name="posisi"]')?.value;
      const jabatan = div.querySelector('select[name="jabatan"]')?.value;
      return { id: personilId, nama, username, pwdLama, posisi, jabatan };
    }, id);
    results.push(data);
  }

  console.log('All 5 Personnel Stored Auth Data:', JSON.stringify(results, null, 2));
  await browser.close();
})();
