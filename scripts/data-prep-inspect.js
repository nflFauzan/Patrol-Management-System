const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const USERNAME = process.env.PATROL_USER || 'nun';
const PASSWORD = process.env.PATROL_PASSWORD || 'nun12345';
const BASE_URL = 'https://patroli.site';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Override window.print so print dialogs never block execution
  await page.addInitScript(() => {
    window.print = () => { console.log('window.print called and bypassed'); };
  });

  console.log('Navigating to login...');
  await page.goto(`${BASE_URL}/login.php`, { waitUntil: 'networkidle' });

  await page.locator('input[name="username"]').first().fill(USERNAME);
  await page.locator('input[name="password"]').first().fill(PASSWORD);
  await page.locator('input[name="login"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Logged in successfully. URL:', page.url());

  const inventory = {};

  // 1. Dashboard summary
  const dashboardStats = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.split('\n').map(l => l.trim()).filter(Boolean);
  });
  inventory.dashboard = dashboardStats;

  // Function to inspect a table page
  const inspectTablePage = async (urlName, url) => {
    console.log(`Inspecting ${urlName}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    return await page.evaluate(() => {
      const title = document.title;
      const tables = Array.from(document.querySelectorAll('table')).map(t => {
        const headers = Array.from(t.querySelectorAll('th')).map(th => th.innerText.trim());
        const rows = Array.from(t.querySelectorAll('tbody tr')).map(tr => 
          Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
        );
        return { headers, rowCount: rows.length, rows };
      });
      const forms = Array.from(document.querySelectorAll('form')).map(f => ({
        action: f.getAttribute('action'),
        method: f.getAttribute('method'),
        id: f.id,
        inputs: Array.from(f.querySelectorAll('input, select, textarea')).map(i => ({
          name: i.name,
          type: i.type,
          placeholder: i.placeholder,
          required: i.required,
          value: i.value,
          options: i.tagName === 'SELECT' ? Array.from(i.options).map(o => ({ value: o.value, text: o.text })) : undefined
        }))
      }));
      const modals = Array.from(document.querySelectorAll('.modal')).map(m => ({
        id: m.id,
        title: m.querySelector('.modal-title')?.innerText?.trim(),
        inputs: Array.from(m.querySelectorAll('input, select, textarea')).map(i => ({
          name: i.name,
          type: i.type,
          placeholder: i.placeholder,
          required: i.required,
          options: i.tagName === 'SELECT' ? Array.from(i.options).map(o => ({ value: o.value, text: o.text })) : undefined
        }))
      }));
      return { title, tables, forms, modals };
    });
  };

  inventory.area = await inspectTablePage('Area', `${BASE_URL}/xxxx_xxxxxxx`);
  inventory.checkpoint = await inspectTablePage('Checkpoint', `${BASE_URL}/xxxx_xxxxxxxxxx`);
  inventory.personil = await inspectTablePage('Personil', `${BASE_URL}/xxxx_xxxxxxxx`);
  inventory.absensi = await inspectTablePage('Absensi Semua', `${BASE_URL}/xxxx_xxxxxxxxx`);
  inventory.absensiMonitoring = await inspectTablePage('Absensi Monitoring', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  inventory.laporanAnggota = await inspectTablePage('Laporan Security Anggota', `${BASE_URL}/xxxx_xxxxxxxxxxx`);
  inventory.laporanKomandan = await inspectTablePage('Laporan Security Komandan', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  inventory.laporanChief = await inspectTablePage('Laporan Security Chief', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  inventory.laporanStaff = await inspectTablePage('Laporan Staff', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  inventory.laporanCleaning = await inspectTablePage('Laporan Cleaning', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  inventory.laporanDriver = await inspectTablePage('Laporan Driver', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  inventory.rekapKegiatan = await inspectTablePage('Rekap Kegiatan', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  inventory.gaji = await inspectTablePage('Gaji', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
  inventory.pesanSiaran = await inspectTablePage('Pesan Siaran', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxx`);
  inventory.emergency = await inspectTablePage('Emergency', `${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxx`);
  inventory.exportLaporan = await inspectTablePage('Export Laporan', `${BASE_URL}/xxxxx_xxxxxxxxxxxx`);

  // Let's inspect Slip Gaji modal by clicking Slip Gaji button
  console.log('Inspecting Slip Gaji...');
  await page.goto(`${BASE_URL}/xxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, { waitUntil: 'networkidle' });
  const slipBtn = page.locator('button:has-text("Slip Gaji")').first();
  if (await slipBtn.count() > 0) {
    await slipBtn.click();
    await page.waitForTimeout(1000);
    inventory.slipGajiContent = await page.evaluate(() => {
      const m = document.querySelector('.modal.show, #slipGajiModal, [id*="slip"]');
      return m ? { id: m.id, title: m.querySelector('.modal-title')?.innerText?.trim(), text: m.innerText } : null;
    });
  }

  const outPath = path.join(__dirname, '..', 'docs', 'data-preparation', 'raw-inventory.json');
  fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2), 'utf-8');
  console.log(`Saved detailed inventory to ${outPath}`);

  await browser.close();
}

run().catch(err => {
  console.error('Error during inspection:', err);
  process.exit(1);
});
