const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const ADMIN_USER = {
    id: 'a0000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@mahakarya-ops.co.id',
    fullName: 'Administrator Utama',
    phone: '0812-1111-2222',
    role: 'ADMIN_SUPER',
    division: 'STAFF',
    securityRank: 'ANGGOTA',
    siteId: '11111111-1111-1111-1111-111111111111',
    isActive: true,
  };
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFETUlOX1NVUEVSIiwiZGl2aXNpb24iOiJTVEFGRiIsImlhdCI6MTc5NDU5MjI1NiwiZXhwIjoxNzk0Njc4NjU2fQ.aKNpBM7qY8MgEXwCL-Qi2K9EfwqVeMU_JCdqObS9y2M';

  await context.addCookies([
    { name: 'patrol_session', value: TOKEN, domain: 'localhost', path: '/' },
  ]);
  await page.addInitScript(({ user, token }) => {
    window.localStorage.setItem('patrol_auth_token', token);
    window.localStorage.setItem('patrol_user', JSON.stringify(user));
  }, { user: ADMIN_USER, token: TOKEN });

  console.log('Navigating to /datainduk/checkpoint...');
  await page.goto('http://localhost:3001/datainduk/checkpoint');
  await page.waitForLoadState('domcontentloaded');

  const btn = page.getByRole('button', { name: 'Cetak Barcode QR Checkpoint' }).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Clicking button...');
  await btn.click();

  await page.waitForTimeout(2000);

  const modalHtml = await page.evaluate(() => {
    const m = document.getElementById('printable-single-qr');
    return m ? m.outerHTML.substring(0, 300) : 'NOT FOUND';
  });
  console.log('MODAL HTML:', modalHtml);

  await browser.close();
})();
