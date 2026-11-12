const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.join(__dirname, '..', 'docs', 'reverse-engineering', 'patroli-site', 'raw-pages');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const cookie = 'PHPSESSID=7pkm67qlcir14cd5hvj4icj5bt; cf_clearance=Ckcc740p-lIsi13TQFimtjCWANEIzGSLLoC8v-KGUJScDKkotmU4hhm8QIqvaBz05xRCH7LtX5GgKig5ltp465UvQG3_u26VX1QZngAeADUktEvH-6-VRtITj0xMo7tb4YdoTU3D_n0Zwgptc386iRAQzjijDWH07GuznQLCLDN-fxEcSZL8t70V3rOCQ5ewVsykkuvR_IrW-5ZaObJu3FDOdq1y1c_oM7CPmYQfwYavoo5h381ATAtsv-onj9yDBtFD1sFXXKpGfL7OpWFa6iO7hNQCGPd3szVLrChSKv0J7aHdEw';

const resources = [
  { path: '/login.php', file: 'login.html' },
  { path: '/manifest.php', file: 'manifest.json' },
  { path: '/service-worker.js', file: 'service-worker.js' },
  { path: '/register.js?v=2', file: 'register.js' },
  { path: '/css/log_in.css?v=2', file: 'log_in.css' },
  { path: '/css/index.css', file: 'index.css' },
  { path: '/img/logo-ps.png', file: 'logo-ps.png', binary: true },
  { path: '/img/logo-qng.png', file: 'logo-qng.png', binary: true },
  { path: '/img/admin.png', file: 'admin.png', binary: true },
  { path: '/img/icon-192.png', file: 'icon-192.png', binary: true },
  { path: '/img/icon-512.png', file: 'icon-512.png', binary: true },
  { path: '/validasi-patroli/index.php', file: '01_dashboard_index.html' },
  { path: '/validasi-patroli/xxxxx_xx.php', file: '02_absen_masuk.html' },
  { path: '/validasi-patroli/xxxxx_xxx.php', file: '03_absen_pulang.html' },
  { path: '/validasi-patroli/xxxxx_xxxx.php', file: '04_izin_alpha.html' },
  { path: '/validasi-patroli/xxxxx_xxxxx.php', file: '05_riwayat_absen.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxx.php', file: '06_riwayat_kegiatan.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxxx.php', file: '07_panic_button.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxxxx.php', file: '08_profile.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxxxxx.php', file: '09_qr_scan.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxxxxxx.php', file: '10_driver_trip.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxxxxxxx.php', file: '11_qr_check.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxxxxxxxx.php', file: '12_laporan_komandan.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxxxxxxxxx.php', file: '13_laporan_chief.html' },
  { path: '/validasi-patroli/xxxxx_xxxxxxxxxxxxxx.php', file: '14_laporan_staff.html' },
  { path: '/validasi_akun', file: 'validasi_akun.html' }
];

function download(item) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'patroli.site',
      path: item.path,
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    };

    https.get(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const targetPath = path.join(outDir, item.file);
        fs.writeFileSync(targetPath, buffer);
        console.log(`[OK] ${item.file} (${res.statusCode}, ${buffer.length} bytes)`);
        resolve({ file: item.file, size: buffer.length, status: res.statusCode });
      });
    }).on('error', (err) => {
      console.error(`[ERR] ${item.file}:`, err.message);
      resolve({ file: item.file, error: err.message });
    });
  });
}

async function run() {
  for (const item of resources) {
    await download(item);
  }
  console.log('Done downloading all raw resources!');
}

run();

