const { chromium } = require('playwright');

const USERNAME = process.env.PATROL_USER || 'nun';
const PASSWORD = process.env.PATROL_PASSWORD || 'nun12345';
const BASE_URL = 'https://patroli.site';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  await page.goto(`${BASE_URL}/login.php`);
  await page.locator('input[name="username"]').first().fill(USERNAME);
  await page.locator('input[name="password"]').first().fill(PASSWORD);
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto(`${BASE_URL}/xxxx_xxxxxxxx`, { waitUntil: 'networkidle' });

  // Open modal
  await page.click('button:has-text("TAMBAH PERSONEL")');
  await page.waitForTimeout(1000);

  // Fill form
  await page.locator('#exampleModalCenter input#nama_anggota').fill('Siti Aminah');
  await page.locator('#exampleModalCenter input#jam_kerja').fill('8');
  await page.locator('#exampleModalCenter input#username').fill('clean_siti');
  await page.locator('#exampleModalCenter input#password').fill('TestingPass2026!');

  // Select posisi
  await page.locator('#exampleModalCenter select#posisi').selectOption('Cleaning Service');
  await page.evaluate(() => {
    $('#posisi').trigger('change');
  });
  await page.waitForTimeout(500);

  await page.locator('#exampleModalCenter select#lokasi_site_anggota').selectOption('aeon mall sentul');
  await page.locator('#exampleModalCenter input#gaji_pokok').fill('3.500.000');
  await page.locator('#exampleModalCenter input#tunjangan').fill('300.000');

  // Set dummy image like Chief Hendra had
  await page.evaluate(() => {
    $('.image-tag').val('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  });

  // Intercept request/response
  page.on('response', async res => {
    if (res.url().includes('insert-personil.php')) {
      console.log('insert-personil.php response status:', res.status());
      console.log('insert-personil.php location header:', res.headers()['location']);
    }
  });

  await page.locator('#exampleModalCenter button[type="submit"]:has-text("Simpan Personel")').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Current URL after submit:', page.url());
  const alertText = await page.evaluate(() => {
    const alert = document.querySelector('.alert, .pesan, [class*="alert"]');
    return alert ? alert.innerText : null;
  });
  console.log('Alert text on page:', alertText);

  await browser.close();
})();
