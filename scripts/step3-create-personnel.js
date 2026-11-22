const { chromium } = require('playwright');

const USERNAME = process.env.PATROL_USER || 'nun';
const PASSWORD = process.env.PATROL_PASSWORD || 'nun12345';
const BASE_URL = 'https://patroli.site';

// 1x1 transparent png data uri for avatar placeholder if needed
const DUMMY_PNG_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const personnelToCreate = [
  {
    nama_anggota: 'Chief Hendra Wijaya',
    jam_kerja: '10',
    username: 'chief_hendra',
    password: 'TestingPass2026!',
    posisi: 'Security',
    jabatan_select: 'chief',
    site_type: 'single',
    site: 'aeon mall sentul',
    gapok: '5.500.000',
    tunjangan: '750.000',
    lembur: '30.000',
    bpjs: '120.000',
    pot_izin: '200.000',
    pot_lupa: '50.000'
  },
  {
    nama_anggota: 'Siti Aminah',
    jam_kerja: '8',
    username: 'clean_siti',
    password: 'TestingPass2026!',
    posisi: 'Cleaning Service',
    site_type: 'single',
    site: 'aeon mall sentul',
    gapok: '3.500.000',
    tunjangan: '300.000',
    lembur: '25.000',
    bpjs: '75.000',
    pot_izin: '150.000',
    pot_lupa: '25.000'
  },
  {
    nama_anggota: 'Joko Wahyudi',
    jam_kerja: '8',
    username: 'driver_joko',
    password: 'TestingPass2026!',
    posisi: 'Driver',
    site_type: 'single',
    site: 'aeon mall sentul',
    gapok: '3.700.000',
    tunjangan: '350.000',
    lembur: '25.000',
    bpjs: '80.000',
    pot_izin: '150.000',
    pot_lupa: '25.000'
  },
  {
    nama_anggota: 'Rina Oktaviani',
    jam_kerja: '8',
    username: 'staff_rina',
    password: 'TestingPass2026!',
    posisi: 'Staf',
    site_type: 'single',
    site: 'aeon mall sentul',
    gapok: '4.000.000',
    tunjangan: '400.000',
    lembur: '25.000',
    bpjs: '85.000',
    pot_izin: '150.000',
    pot_lupa: '25.000'
  },
  {
    nama_anggota: 'Bambang Pengelola',
    jam_kerja: '8',
    username: 'admin_bambang',
    password: 'TestingPass2026!',
    posisi: 'Admin Area',
    site_type: 'multi',
    sites: ['aeon mall sentul', 'gudang logistik cakung'],
    gapok: '5.000.000',
    tunjangan: '600.000',
    lembur: '25.000',
    bpjs: '100.000',
    pot_izin: '150.000',
    pot_lupa: '25.000'
  },
  {
    nama_anggota: 'Surya Saputra',
    jam_kerja: '10',
    username: 'sec_surya',
    password: 'TestingPass2026!',
    posisi: 'Security',
    jabatan_select: 'anggota',
    site_type: 'single',
    site: 'gudang logistik cakung',
    gapok: '3.800.000',
    tunjangan: '400.000',
    lembur: '25.000',
    bpjs: '75.000',
    pot_izin: '150.000',
    pot_lupa: '25.000'
  }
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => { window.print = () => {}; });

  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login.php`, { waitUntil: 'networkidle' });
  await page.locator('input[name="username"]').first().fill(USERNAME);
  await page.locator('input[name="password"]').first().fill(PASSWORD);
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Navigating to Personil page (xxxx_xxxxxxxx)...');
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxx`, { waitUntil: 'networkidle' });

  for (const p of personnelToCreate) {
    // Check if already in table
    const exists = await page.evaluate((uname) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      return rows.some(r => r.innerText.toUpperCase().includes(uname.toUpperCase()));
    }, p.nama_anggota);

    if (exists) {
      console.log(`Personil ${p.nama_anggota} already exists, skipping.`);
      continue;
    }

    console.log(`Adding Personil: ${p.nama_anggota} (${p.posisi})...`);
    await page.click('button:has-text("TAMBAH PERSONEL"), button[data-target="#exampleModalCenter"]');
    await page.waitForTimeout(1000);

    // Fill basic fields
    await page.locator('#exampleModalCenter input#nama_anggota').fill(p.nama_anggota);
    await page.locator('#exampleModalCenter input#jam_kerja').fill(p.jam_kerja);
    await page.locator('#exampleModalCenter input#username').fill(p.username);
    await page.locator('#exampleModalCenter input#password').fill(p.password);

    // Select posisi and trigger change event
    await page.locator('#exampleModalCenter select#posisi').selectOption(p.posisi);
    await page.evaluate(() => {
      $('#posisi').trigger('change');
    });
    await page.waitForTimeout(500);

    // If security, select jabatan
    if (p.posisi === 'Security') {
      await page.locator('#exampleModalCenter select#jabatan_select').selectOption(p.jabatan_select);
      await page.evaluate(() => {
        $('#jabatan_select').trigger('change');
      });
      await page.waitForTimeout(300);
    }

    // Set site
    if (p.site_type === 'single') {
      await page.locator('#exampleModalCenter select#lokasi_site_anggota').selectOption(p.site);
    } else if (p.site_type === 'multi') {
      await page.evaluate((sites) => {
        $('#lokasi_site_member').val(sites).trigger('change');
      }, p.sites);
    }

    // Set gaji fields
    await page.locator('#exampleModalCenter input#gaji_pokok').fill(p.gapok);
    await page.locator('#exampleModalCenter input#tunjangan').fill(p.tunjangan);
    await page.locator('#exampleModalCenter input#lembur').fill(p.lembur);
    await page.locator('#exampleModalCenter input#potongan_bpjs').fill(p.bpjs);
    await page.locator('#exampleModalCenter input#potongan_tidak_masuk').fill(p.pot_izin);
    await page.locator('#exampleModalCenter input#potongan_lupa_absensi').fill(p.pot_lupa);

    // Set image tag fallback
    await page.evaluate((uri) => {
      $('.image-tag').val(uri);
    }, DUMMY_PNG_DATA_URI);

    // Submit
    console.log(`Submitting personil ${p.nama_anggota}...`);
    await page.locator('#exampleModalCenter button[type="submit"]:has-text("Simpan Personel")').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
  }

  // Reload and verify
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxx`, { waitUntil: 'networkidle' });
  const tableData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#personil tbody tr'));
    return rows.map(r => ({
      lokasi: r.cells[0]?.innerText?.trim().replace(/\n+/g, ' '),
      jabatan_posisi: r.cells[1]?.innerText?.trim().replace(/\n+/g, ' '),
      nama: r.cells[2]?.innerText?.trim().replace(/\n+/g, ' ')
    }));
  });
  console.log('Verified Personil table rows:', JSON.stringify(tableData, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error('Error in step 3:', err);
  process.exit(1);
});
