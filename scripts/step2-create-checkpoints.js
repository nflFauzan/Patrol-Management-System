const { chromium } = require('playwright');

const USERNAME = process.env.PATROL_USER || 'nun';
const PASSWORD = process.env.PATROL_PASSWORD || 'nun12345';
const BASE_URL = 'https://patroli.site';

const checkpointsToCreate = [
  {
    kategori: 'Security',
    nama_aset: 'POS 2 PINTU BARAT',
    jenis_aset: 'Keamanan',
    lokasi: 'Pintu Gerbang Barat Sentul',
    deskripsi_aset: 'Pemeriksaan akses kendaraan barat & sterilisasi area',
    lokasi_area_search: 'aeon mall sentul'
  },
  {
    kategori: 'Security',
    nama_aset: 'RUANG SERVER LANTAI 2',
    jenis_aset: 'Fasilitas Vital',
    lokasi: 'Ruang IT Server Lantai 2',
    deskripsi_aset: 'Pemeriksaan pintu akses kontrol suhu & kelistrikan server',
    lokasi_area_search: 'aeon mall sentul'
  },
  {
    kategori: 'Security',
    nama_aset: 'LOADING DOCK LOGISTIK',
    jenis_aset: 'Keamanan Logistik',
    lokasi: 'Area Bongkar Muat Barang',
    deskripsi_aset: 'Pemeriksaan segel kontainer & manifes pengiriman barang',
    lokasi_area_search: 'gudang logistik cakung'
  },
  {
    kategori: 'Cleaning Service',
    nama_aset: 'LOBBY UTAMA LANTAI 1',
    jenis_aset: 'Kebersihan Publik',
    lokasi: 'Area Lobby Utama Sentul',
    deskripsi_aset: 'Penyapuan, pengepelan lantai, dan sanitasi meja resepsionis',
    lokasi_area_search: 'aeon mall sentul'
  },
  {
    kategori: 'Cleaning Service',
    nama_aset: 'KANTIN KARYAWAN',
    jenis_aset: 'Fasilitas Umum',
    lokasi: 'Kantin Karyawan Lantai Dasar',
    deskripsi_aset: 'Pembersihan meja makan, tempat sampah, dan sterilisasi wastafel',
    lokasi_area_search: 'aeon mall sentul'
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

  console.log('Navigating to Checkpoint page (xxxx_xxxxxxxxxx)...');
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxxxx`, { waitUntil: 'networkidle' });

  for (const cp of checkpointsToCreate) {
    // Check if cp already exists in table
    const exists = await page.evaluate((name) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      return rows.some(r => r.innerText.toUpperCase().includes(name.toUpperCase()));
    }, cp.nama_aset);

    if (exists) {
      console.log(`Checkpoint ${cp.nama_aset} already exists, skipping.`);
      continue;
    }

    console.log(`Creating checkpoint: ${cp.nama_aset} (${cp.kategori})...`);
    await page.click('button:has-text("TAMBAH CHECKPOINT"), button[data-target="#exampleModalCenter"]');
    await page.waitForTimeout(1000);

    // Select kategori
    await page.locator('#exampleModalCenter select[name="kategori"]').selectOption(cp.kategori);
    await page.waitForTimeout(500);

    // Fill fields
    await page.locator('#exampleModalCenter input[name="nama_aset"]').fill(cp.nama_aset);
    await page.locator('#exampleModalCenter input[name="jenis_aset"]').fill(cp.jenis_aset);
    await page.locator('#exampleModalCenter input[name="lokasi"]').fill(cp.lokasi);
    await page.locator('#exampleModalCenter input[name="deskripsi_aset"]').fill(cp.deskripsi_aset);

    // Select lokasi_area
    const areaOptions = await page.locator('#exampleModalCenter select[name="lokasi_area"] option').evaluateAll(opts => 
      opts.map(o => ({ value: o.value, text: o.text }))
    );
    console.log('Available area options:', areaOptions);

    const matchedOpt = areaOptions.find(o => o.value.toLowerCase().includes(cp.lokasi_area_search) || o.text.toLowerCase().includes(cp.lokasi_area_search));
    if (matchedOpt) {
      await page.locator('#exampleModalCenter select[name="lokasi_area"]').selectOption(matchedOpt.value);
    } else {
      console.error(`Could not match area option for ${cp.lokasi_area_search}`);
    }

    // Submit form
    console.log(`Submitting checkpoint ${cp.nama_aset}...`);
    await page.locator('#exampleModalCenter button[type="submit"], #exampleModalCenter input[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // Reload and verify
  await page.goto(`${BASE_URL}/xxxx_xxxxxxxxxx`, { waitUntil: 'networkidle' });
  const allCheckpoints = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    return rows.map(r => ({
      lokasi: r.cells[0]?.innerText?.trim().replace(/\n+/g, ' '),
      kategori: r.cells[1]?.innerText?.trim().replace(/\n+/g, ' '),
      aset: r.cells[2]?.innerText?.trim().replace(/\n+/g, ' ')
    }));
  });
  console.log('Current Checkpoints in table:', JSON.stringify(allCheckpoints, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error('Error in step 2:', err);
  process.exit(1);
});
