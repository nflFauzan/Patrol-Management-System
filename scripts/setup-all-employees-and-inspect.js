const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'https://patroli.site';

const employeeList = [
  { id: '1453', username: 'sec_agus', newPass: 'SecAgus123', role: 'Security Anggota', name: 'Agus Pratama' },
  { id: '1452', username: 'danru_budi', newPass: 'DanruBudi123', role: 'Security Komandan', name: 'Danru Budi Santoso' },
  { id: '1465', username: 'chief_hendra', newPass: 'ChiefHendra123', role: 'Security Chief', name: 'Chief Hendra Wijaya' },
  { id: '1466', username: 'clean_siti', newPass: 'CleanSiti123', role: 'Cleaning Service', name: 'Siti Aminah' },
  { id: '1467', username: 'driver_joko', newPass: 'DriverJoko123', role: 'Driver', name: 'Joko Wahyudi' }
];

async function main() {
  console.log('Launching VISIBLE browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 250,
    args: ['--start-maximized']
  });

  const adminContext = await browser.newContext({ viewport: null });
  const adminPage = await adminContext.newPage();
  await adminPage.addInitScript(() => { window.print = () => {}; });

  console.log('Logging into Admin...');
  await adminPage.goto(`${BASE_URL}/login.php`);
  await adminPage.locator('input[name="username"]').first().fill('nun');
  await adminPage.locator('input[name="password"]').first().fill('nun12345');
  await adminPage.locator('input[name="login"]').click();
  await adminPage.waitForLoadState('networkidle');

  await adminPage.goto(`${BASE_URL}/xxxx_xxxxxxxx`);
  await adminPage.waitForLoadState('networkidle');

  // Update password for each employee if not Chief Hendra (already updated)
  for (const emp of employeeList) {
    if (emp.username === 'chief_hendra') continue;

    console.log(`Setting password for ${emp.name} (${emp.username}) to ${emp.newPass}...`);
    await adminPage.click(`a.edit-record[data-id="${emp.id}"]`);
    await adminPage.waitForTimeout(1500);

    await adminPage.locator('#myModal input[name="password_baru"]').fill(emp.newPass);
    await adminPage.locator('#myModal button[type="submit"]:has-text("Simpan Perubahan")').click();
    await adminPage.waitForLoadState('networkidle');
    await adminPage.waitForTimeout(1500);
  }

  await adminContext.close();

  // Now, test login and inspect dashboard for ALL 5 EMPLOYEES!
  const employeeDashboards = [];

  for (const emp of employeeList) {
    console.log(`\n======================================================`);
    console.log(`Logging in as ${emp.name} (${emp.role}) - ${emp.username}...`);
    console.log(`======================================================`);

    const empContext = await browser.newContext({
      viewport: { width: 412, height: 915 }, // Realistic Mobile Viewport
      isMobile: true,
      hasTouch: true,
      permissions: ['geolocation', 'camera'],
      geolocation: { latitude: -6.566877, longitude: 106.857619 } // AEON MALL SENTUL coordinates
    });
    const empPage = await empContext.newPage();
    await empPage.addInitScript(() => { window.print = () => {}; });

    await empPage.goto(`${BASE_URL}/login.php`);
    await empPage.locator('input[name="username"]').first().fill(emp.username);
    await empPage.locator('input[name="password"]').first().fill(emp.newPass);
    await empPage.locator('input[name="login"]').click();
    await empPage.waitForLoadState('networkidle');
    await empPage.waitForTimeout(2000);

    const currentUrl = empPage.url();
    console.log(`URL after login: ${currentUrl}`);

    const screenshotPath = `docs/data-preparation/screenshot-mobile-${emp.username}.png`;
    await empPage.screenshot({ path: screenshotPath, fullPage: true });

    const dashboardData = await empPage.evaluate(() => {
      const title = document.title;
      const text = document.body.innerText.replace(/\n+/g, ' ');
      const links = Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim().replace(/\n+/g, ' '),
        href: a.getAttribute('href'),
        className: a.className
      })).filter(l => l.text);
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]')).map(b => ({
        text: b.innerText?.trim() || b.value,
        id: b.id,
        className: b.className
      })).filter(b => b.text);
      return { title, text: text.slice(0, 1500), links, buttons };
    });

    employeeDashboards.push({
      ...emp,
      url: currentUrl,
      screenshot: screenshotPath,
      dashboardData
    });

    console.log(`Menus/Buttons available for ${emp.username}:`, dashboardData.links.map(l => l.text).join(' | '));
    await empContext.close();
  }

  fs.writeFileSync('docs/data-preparation/employee-dashboards-inspected.json', JSON.stringify(employeeDashboards, null, 2), 'utf-8');
  console.log('\nSaved all inspected employee dashboards to docs/data-preparation/employee-dashboards-inspected.json');

  await browser.close();
}

main().catch(err => {
  console.error('Error in setup and inspection:', err);
  process.exit(1);
});
