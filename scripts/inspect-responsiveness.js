const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'mobile_small', width: 360, height: 640 },
    { name: 'mobile_iphone', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1366, height: 768 }
  ];

  const results = {};

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    });
    const page = await context.newPage();

    // Login
    await page.goto('https://patroli.site/login.php');
    await page.fill('input[name="username"]', 'hendra.chief');
    await page.fill('input[name="password"]', 'hendra123');
    await page.click('input[name="login"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});

    console.log(`[${vp.name}] URL:`, page.url());

    // Dismiss modal if present
    const modalBtn = page.locator('#modalPanduanAwal button, text=Saya Mengerti');
    if (await modalBtn.isVisible().catch(() => false)) {
      await modalBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    }

    // Inspect layout of container and cards
    const layout = await page.evaluate(() => {
      const body = document.body;
      const container = document.querySelector('.container');
      const cards = Array.from(document.querySelectorAll('.card')).map(c => {
        const rect = c.getBoundingClientRect();
        return {
          text: c.innerText.replace(/\n/g, ' '),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left)
        };
      });
      const header = document.querySelector('div[style*="gradient"]');
      const headerRect = header ? header.getBoundingClientRect() : null;
      const marquee = document.querySelector('.marquee-container');
      const marqueeRect = marquee ? marquee.getBoundingClientRect() : null;

      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        bodyStyle: {
          overflow: window.getComputedStyle(body).overflow,
          position: window.getComputedStyle(body).position,
          width: window.getComputedStyle(body).width,
          height: window.getComputedStyle(body).height
        },
        containerStyle: container ? {
          display: window.getComputedStyle(container).display,
          gridTemplateColumns: window.getComputedStyle(container).gridTemplateColumns,
          gap: window.getComputedStyle(container).gap,
          padding: window.getComputedStyle(container).padding,
          margin: window.getComputedStyle(container).margin,
          maxWidth: window.getComputedStyle(container).maxWidth,
          width: Math.round(container.getBoundingClientRect().width),
          height: Math.round(container.getBoundingClientRect().height)
        } : null,
        headerRect: headerRect ? {
          width: Math.round(headerRect.width),
          height: Math.round(headerRect.height),
          padding: window.getComputedStyle(header).padding
        } : null,
        marqueeRect: marqueeRect ? {
          width: Math.round(marqueeRect.width),
          height: Math.round(marqueeRect.height),
          bottom: window.getComputedStyle(marquee).bottom,
          position: window.getComputedStyle(marquee).position
        } : null,
        cardsCount: cards.length,
        cards
      };
    });

    results[vp.name] = layout;

    const outDir = path.join(__dirname, '../docs/reverse-engineering/patroli-site/screenshots');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(outDir, `target_${vp.name}.png`), fullPage: false });
    await context.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(__dirname, '../docs/reverse-engineering/patroli-site/responsiveness-data.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('Responsiveness inspection complete. Output written to docs/reverse-engineering/patroli-site/responsiveness-data.json');
})();

