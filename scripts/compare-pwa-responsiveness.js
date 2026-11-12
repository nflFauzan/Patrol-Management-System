const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static server for apps/pwa-field/dist
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
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(distDir, reqPath);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading ' + reqPath);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const PORT = 4173;

server.listen(PORT, async () => {
  console.log(`Local PWA server running on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'mobile_small', width: 360, height: 640 },
    { name: 'mobile_iphone', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1366, height: 768 }
  ];

  const results = {};
  const outDir = path.join(__dirname, '../docs/reverse-engineering/patroli-site/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height }
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForLoadState('networkidle');

    // Dismiss initial info modal if visible
    const dismissBtn = page.locator('button:has-text("Saya Mengerti")');
    if (await dismissBtn.isVisible().catch(() => false)) {
      await dismissBtn.click().catch(() => {});
      await page.waitForTimeout(300);
    }

    const layout = await page.evaluate(() => {
      const body = document.body;
      const container = document.querySelector('.ps-menu-container') || document.querySelector('.container');
      const cards = Array.from(document.querySelectorAll('.ps-card')).map(c => {
        const rect = c.getBoundingClientRect();
        return {
          text: c.innerText.replace(/\n/g, ' '),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left)
        };
      });

      const header = document.querySelector('header');
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
          height: Math.round(headerRect.height)
        } : null,
        marqueeRect: marqueeRect ? {
          width: Math.round(marqueeRect.width),
          height: Math.round(marqueeRect.height)
        } : null,
        cardsCount: cards.length,
        cards
      };
    });

    results[vp.name] = layout;
    await page.screenshot({ path: path.join(outDir, `pwa_current_${vp.name}.png`), fullPage: false });
    await context.close();
  }

  await browser.close();
  server.close();

  fs.writeFileSync(
    path.join(__dirname, '../docs/reverse-engineering/patroli-site/pwa-current-responsiveness.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('Current PWA inspection complete.');
});

