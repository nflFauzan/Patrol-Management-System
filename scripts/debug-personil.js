const { chromium } = require('playwright');

const USERNAME = process.env.PATROL_USER || 'nun';
const PASSWORD = process.env.PATROL_PASSWORD || 'nun12345';
const BASE_URL = 'https://patroli.site';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.print = () => {}; });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('dialog', async d => {
    console.log('PAGE DIALOG:', d.type(), d.message());
    await d.accept();
  });
  page.on('response', res => {
    if (res.url().includes('insert-personil') || res.url().includes('serverside-personil')) {
      console.log(`RESPONSE [${res.status()}] ${res.url()}`);
    }
  });

  await page.goto(`${BASE_URL}/login.php`);
  await page.locator('input[name="username"]').first().fill(USERNAME);
  await page.locator('input[name="password"]').first().fill(PASSWORD);
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  await page.goto(`${BASE_URL}/xxxx_xxxxxxxx`, { waitUntil: 'networkidle' });

  console.log('Opening modal Tambah Personel...');
  await page.click('button:has-text("TAMBAH PERSONEL")');
  await page.waitForTimeout(1000);

  // Fill form for Cleaning Service
  await page.locator('#exampleModalCenter input#nama_anggota').fill('Siti Aminah');
  await page.locator('#exampleModalCenter input#jam_kerja').fill('8');
  await page.locator('#exampleModalCenter input#username').fill('clean_siti');
  await page.locator('#exampleModalCenter input#password').fill('TestingPass2026!');

  console.log('Selecting posisi = Cleaning Service...');
  await page.locator('#exampleModalCenter select#posisi').selectOption('Cleaning Service');
  await page.evaluate(() => {
    $('#posisi').trigger('change');
  });
  await page.waitForTimeout(500);

  const formValuesBefore = await page.evaluate(() => {
    return {
      posisi: $('#posisi').val(),
      posisi_final: $('#posisi_final').val(),
      posisi_hidden: $('#posisi_hidden').val(),
      jabatan_final: $('#jabatan_final').val(),
      wrap_single_visible: $('#wrap-lokasi-single').is(':visible'),
      wrap_multiple_visible: $('#wrap-lokasi-multiple').is(':visible'),
      wrap_jabatan_visible: $('#wrap-jabatan').is(':visible'),
      lokasi_site_anggota_val: $('#lokasi_site_anggota').val(),
      lokasi_site_anggota_required: $('#lokasi_site_anggota').prop('required')
    };
  });
  console.log('Form values before select site:', JSON.stringify(formValuesBefore, null, 2));

  // Select site
  await page.locator('#exampleModalCenter select#lokasi_site_anggota').selectOption('aeon mall sentul');

  // Set salary
  await page.locator('#exampleModalCenter input#gaji_pokok').fill('3.500.000');
  await page.locator('#exampleModalCenter input#tunjangan').fill('300.000');
  await page.locator('#exampleModalCenter input#lembur').fill('25.000');
  await page.locator('#exampleModalCenter input#potongan_bpjs').fill('75.000');
  await page.locator('#exampleModalCenter input#potongan_tidak_masuk').fill('150.000');
  await page.locator('#exampleModalCenter input#potongan_lupa_absensi').fill('25.000');

  // Check form submit handler
  const formPayload = await page.evaluate(() => {
    const f = document.querySelector('form[action="insert-personil.php"]');
    const data = new FormData(f);
    const obj = {};
    for (const [k, v] of data.entries()) {
      obj[k] = v;
    }
    return obj;
  });
  console.log('Form payload prepared:', JSON.stringify(formPayload, null, 2));

  // Listen for navigation or request
  const [response] = await Promise.all([
    page.waitForResponse(res => res.url().includes('insert-personil.php'), { timeout: 10000 }).catch(e => null),
    page.locator('#exampleModalCenter button[type="submit"]:has-text("Simpan Personel")').click()
  ]);

  if (response) {
    console.log('insert-personil.php status:', response.status());
    const text = await response.text();
    console.log('insert-personil.php response text:', text.slice(0, 500));
  } else {
    console.log('No response received from insert-personil.php (form may have been blocked by client-side validation)');
    const invalidFields = await page.evaluate(() => {
      const invalids = Array.from(document.querySelectorAll('#exampleModalCenter :invalid'));
      return invalids.map(i => ({ name: i.name, id: i.id, validationMessage: i.validationMessage }));
    });
    console.log('Invalid fields:', invalidFields);
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();
