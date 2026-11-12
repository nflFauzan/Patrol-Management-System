const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../apps/pwa-field/dist');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath);

  // If path doesn't exist or is a route without extension, serve index.html (SPA fallback)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error: ' + err.message);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = 4174;

server.listen(PORT, async () => {
  console.log(`PWA Multi-Page Server running on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 } // iPhone 12/13/14 viewport
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const routes = [
    { path: '/validasi-patroli/', name: '01_dashboard', expected: 'HELLO, HENDRA CHIEF' },
    { path: '/validasi-patroli/xxxxx_xx.php', name: '02_absen_masuk', expected: 'ABSEN MASUK' },
    { path: '/validasi-patroli/xxxxx_xxx.php', name: '03_absen_pulang', expected: 'ABSEN PULANG' },
    { path: '/validasi-patroli/xxxxx_xxxx.php', name: '04_izin_alpha', expected: 'IZIN TIDAK MASUK' },
    { path: '/validasi-patroli/xxxxx_xxxxx.php', name: '05_riwayat_absen', expected: 'DATA ABSENSIKU' },
    { path: '/validasi-patroli/xxxxx_xxxxxx.php', name: '06_riwayat_kegiatan', expected: 'DATA KEGIATAN' },
    { path: '/validasi-patroli/xxxxx_xxxxxxx.php', name: '07_panic_button', expected: 'SOS' },
    { path: '/validasi-patroli/xxxxx_xxxxxxxx.php', name: '08_profile', expected: 'PROFILE' },
    { path: '/validasi-patroli/xxxxx_xxxxxxxxx.php', name: '09_qr_scan', expected: 'Scan QR Code' },
    { path: '/validasi-patroli/xxxxx_xxxxxxxxxx.php', name: '10_driver_trip', expected: 'Perjalanan Baru' },
    { path: '/validasi-patroli/xxxxx_xxxxxxxxxxxx.php', name: '12_laporan_komandan', expected: 'FORM LAPORAN KOMANDAN' },
    { path: '/validasi-patroli/xxxxx_xxxxxxxxxxxxx.php', name: '13_laporan_chief', expected: 'FORM LAPORAN CHIEF' },
    { path: '/validasi-patroli/xxxxx_xxxxxxxxxxxxxx.php', name: '14_laporan_staff', expected: 'FORM KEGIATAN STAFF' },
    { path: '/login.php', name: '15_login', expected: 'PATROLI SITE' }
  ];

  const results = [];
  const outDir = path.join(__dirname, '../docs/reverse-engineering/patroli-site/screenshots/pages');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const r of routes) {
    const url = `http://localhost:${PORT}${r.path}`;
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // Dismiss info modal on dashboard if present
    if (r.path === '/validasi-patroli/') {
      const dismissBtn = page.locator('button:has-text("Saya Mengerti")');
      if (await dismissBtn.isVisible().catch(() => false)) {
        await dismissBtn.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }

    const content = await page.content();
    const passed = content.includes(r.expected);
    const title = await page.title();

    results.push({
      route: r.path,
      name: r.name,
      pageTitle: title,
      expectedText: r.expected,
      passed
    });

    console.log(`[ROUTE TEST] ${r.path} -> ${passed ? '✅ PASS' : '❌ FAIL'}`);
    await page.screenshot({ path: path.join(outDir, `${r.name}.png`) });
  }

  await browser.close();
  server.close();

  const allPassed = results.every(r => r.passed);
  console.log('\n--- VERIFIKASI SEMUA HALAMAN MANDIRI SELESAI ---');
  console.log(`Total Routes: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.passed).length}`);
  console.log(`All Passed: ${allPassed ? 'YES ✅ 100%' : 'NO ❌'}`);

  if (!allPassed) {
    process.exit(1);
  }
});

