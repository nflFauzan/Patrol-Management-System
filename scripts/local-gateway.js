/**
 * Enterprise Unified Local Gateway (Single-Port Reverse Proxy)
 * Patrol & Facility Management System (Enterprise In-House)
 * 
 * Satu pintu gerbang lokal di port 8080 yang menyatukan:
 * - Web Admin Command Center (:3001) -> http://localhost:8080/admin
 * - PWA Field Mobile App     (:5173) -> http://localhost:8080/pwa
 * - Backend Fastify API      (:3000) -> http://localhost:8080/api/v1
 * - Real-Time Socket.io      (:3000) -> http://localhost:8080/socket.io
 * - Smartphone Simulator     (:8080) -> http://localhost:8080/simulator
 * - Live Portal Dashboard    (:8080) -> http://localhost:8080/
 */

const http = require('http');
const https = require('https');
const net = require('net');
const tls = require('tls');
const url = require('url');

const GATEWAY_PORT = process.env.GATEWAY_PORT ? parseInt(process.env.GATEWAY_PORT, 10) : 8080;
const BACKEND_PORT = 3000;
const ADMIN_PORT = 3001;
const PWA_PORT = 5173;
const DB_PORT = 5432;
const REDIS_PORT = 6379;

// Connection pooling agents to eliminate connection latency & socket exhaustion
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50, rejectUnauthorized: false });

// Helper: Cek koneksi port TCP untuk status healthcheck
function checkPort(port, host = '127.0.0.1', timeoutMs = 800) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);

    socket.once('connect', () => {
      const latency = Date.now() - start;
      socket.destroy();
      resolve({ active: true, latency });
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve({ active: false, latency: timeoutMs });
    });

    socket.once('error', () => {
      socket.destroy();
      resolve({ active: false, latency: 0 });
    });

    socket.connect(port, host);
  });
}

// Proxy HTTP Request generik mendukung target HTTP dan HTTPS (PWA basicSsl)
function proxyHttpRequest(req, res, targetPort, targetPath = req.url) {
  const isHttps = targetPort === PWA_PORT;
  const transport = isHttps ? https : http;
  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: targetPath,
    method: req.method,
    agent: isHttps ? httpsAgent : httpAgent,
    rejectUnauthorized: false,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${targetPort}`,
      'x-forwarded-host': req.headers.host || `localhost:${GATEWAY_PORT}`,
      'x-forwarded-proto': 'http',
      'x-forwarded-for': req.socket.remoteAddress || '127.0.0.1',
    },
  };

  const proxyReq = transport.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        statusCode: 502,
        error: 'Bad Gateway',
        message: `Tidak dapat terhubung ke service lokal di port ${targetPort}. Pastikan service sudah dijalankan via start-dev.bat.`,
        targetPort,
        details: err.message,
      }, null, 2));
    }
  });

  req.pipe(proxyReq);
}

// Proxy WebSocket Upgrade menggunakan modul bawaan Node.js net / tls
function proxyWebSocketUpgrade(req, clientSocket, head, targetPort, targetPath = req.url) {
  const isHttps = targetPort === PWA_PORT;
  const connectFn = isHttps
    ? (cb) => tls.connect({ host: '127.0.0.1', port: targetPort, rejectUnauthorized: false }, cb)
    : (cb) => net.connect(targetPort, '127.0.0.1', cb);

  const proxySocket = connectFn(() => {
    let rawReq = `${req.method} ${targetPath} HTTP/${req.httpVersion}\r\n`;
    for (const [key, val] of Object.entries(req.headers)) {
      if (key.toLowerCase() === 'host') {
        rawReq += `Host: 127.0.0.1:${targetPort}\r\n`;
      } else {
        rawReq += `${key}: ${val}\r\n`;
      }
    }
    rawReq += '\r\n';

    proxySocket.write(rawReq);
    if (head && head.length > 0) {
      proxySocket.write(head);
    }
    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);
  });

  proxySocket.on('error', (err) => {
    clientSocket.destroy();
  });
  clientSocket.on('error', () => {
    proxySocket.destroy();
  });
}

// Dashboard HTML Portal Induk
function renderPortalHtml() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Patrol System - Unified Gateway (Port ${GATEWAY_PORT})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(17, 24, 39, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --accent-cyan: #06b6d4;
      --accent-emerald: #10b981;
      --accent-indigo: #6366f1;
      --accent-amber: #f59e0b;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: radial-gradient(circle at 50% 0%, #172554 0%, #090d16 65%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 2rem 1.5rem;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      width: 100%;
    }
    header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(6, 182, 212, 0.15);
      color: #67e8f9;
      border: 1px solid rgba(6, 182, 212, 0.3);
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    p.subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    .gateway-url-box {
      margin-top: 1rem;
      display: inline-flex;
      align-items: center;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1.25rem;
      border-radius: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: #38bdf8;
      font-size: 0.95rem;
    }

    /* Live Services Grid */
    .services-status-card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.25rem 1.75rem;
      margin-bottom: 2.5rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1.25rem;
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .status-badge {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #4b5563;
    }
    .status-badge.online {
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .status-badge.offline {
      background: #ef4444;
      box-shadow: 0 0 10px #ef4444;
    }
    .status-title {
      font-size: 0.825rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
    }
    .status-val {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Action Cards */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5);
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
    }
    .card-admin::before { background: linear-gradient(90deg, #6366f1, #06b6d4); }
    .card-pwa::before { background: linear-gradient(90deg, #10b981, #06b6d4); }
    .card-sim::before { background: linear-gradient(90deg, #f59e0b, #ef4444); }

    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1.25rem;
    }
    .card-title {
      font-size: 1.35rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .card-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
      flex-grow: 1;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #3b82f6;
      color: #ffffff;
    }
    .btn-primary:hover { background: #2563eb; }
    .btn-emerald {
      background: #10b981;
      color: #ffffff;
    }
    .btn-emerald:hover { background: #059669; }
    .btn-amber {
      background: #f59e0b;
      color: #111827;
    }
    .btn-amber:hover { background: #d97706; }
    .card-link-sub {
      margin-top: 0.75rem;
      font-size: 0.825rem;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      text-align: center;
    }

    footer {
      text-align: center;
      margin-top: auto;
      color: #64748b;
      font-size: 0.875rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">
        <span class="pulse-dot"></span>
        Enterprise Unified Gateway Active
      </div>
      <h1>Patrol & Facility Management</h1>
      <p class="subtitle">Seluruh layanan terpusat di satu pintu gerbang lokal tanpa repot banyak port</p>
      <div class="gateway-url-box">
        http://localhost:${GATEWAY_PORT}
      </div>
    </header>

    <!-- Status Bar Service -->
    <div class="services-status-card" id="status-card">
      <div class="status-item">
        <span class="status-badge online" id="stat-backend"></span>
        <div>
          <div class="status-title">Backend Fastify</div>
          <div class="status-val">:3000</div>
        </div>
      </div>
      <div class="status-item">
        <span class="status-badge online" id="stat-admin"></span>
        <div>
          <div class="status-title">Web Admin</div>
          <div class="status-val">:3001</div>
        </div>
      </div>
      <div class="status-item">
        <span class="status-badge online" id="stat-pwa"></span>
        <div>
          <div class="status-title">Vite PWA Field</div>
          <div class="status-val">:5173</div>
        </div>
      </div>
      <div class="status-item">
        <span class="status-badge online" id="stat-db"></span>
        <div>
          <div class="status-title">PostGIS Spatial</div>
          <div class="status-val">:5432</div>
        </div>
      </div>
      <div class="status-item">
        <span class="status-badge online" id="stat-redis"></span>
        <div>
          <div class="status-title">Redis Cache</div>
          <div class="status-val">:6379</div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Grid -->
    <div class="grid">
      <!-- Web Admin -->
      <div class="card card-admin">
        <div class="card-icon">🏢</div>
        <h2 class="card-title">Web Admin Command Center</h2>
        <p class="card-desc">
          Dashboard pusat komando untuk Chief Security, Manajer Fasilitas, dan HRIS. Dilengkapi peta live Leaflet, radar GPS, sirine bahaya Panic SOS, dan rekap absensi otomatis.
        </p>
        <a href="/admin" class="btn btn-primary" target="_blank">
          Buka Web Admin &rarr;
        </a>
        <div class="card-link-sub">Rute: http://localhost:${GATEWAY_PORT}/admin</div>
      </div>

      <!-- PWA Field Mobile App -->
      <div class="card card-pwa">
        <div class="card-icon">📱</div>
        <h2 class="card-title">PWA Mobile Field App</h2>
        <p class="card-desc">
          Aplikasi mobile offline-first untuk Satpam (Patroli & QR Scanner), Cleaning Service (Sanitasi), dan Driver (Log Armada). Bekerja mulus meski di area basement tanpa sinyal.
        </p>
        <a href="/pwa" class="btn btn-emerald" target="_blank">
          Buka PWA Lapangan &rarr;
        </a>
        <div class="card-link-sub">Rute: http://localhost:${GATEWAY_PORT}/pwa</div>
      </div>

      <!-- Smartphone Live Simulator -->
      <div class="card card-sim">
        <div class="card-icon">📲</div>
        <h2 class="card-title">Demo Mobile Simulator</h2>
        <p class="card-desc">
          Simulasi layar smartphone di layar laptop. Sangat ideal untuk demo presentasi ke klien agar klien melihat langsung tampilan PWA di dalam frame smartphone nyata.
        </p>
        <a href="/simulator" class="btn btn-amber">
          Buka Simulasi HP &rarr;
        </a>
        <div class="card-link-sub">Rute: http://localhost:${GATEWAY_PORT}/simulator</div>
      </div>
    </div>

    <footer>
      Patrol & Facility Management System &bull; Single-Tenant In-House Enterprise &bull; Single-Port Local Gateway
    </footer>
  </div>

  <script>
    // Poll service status periodically
    async function updateStatus() {
      try {
        const res = await fetch('/gateway/health');
        if (!res.ok) return;
        const data = await res.json();
        
        const setBadge = (id, active) => {
          const el = document.getElementById(id);
          if (!el) return;
          el.className = 'status-badge ' + (active ? 'online' : 'offline');
        };

        setBadge('stat-backend', data.backend?.active);
        setBadge('stat-admin', data.admin?.active);
        setBadge('stat-pwa', data.pwa?.active);
        setBadge('stat-db', data.db?.active);
        setBadge('stat-redis', data.redis?.active);
      } catch (e) {
        // silent fail on network hiccups
      }
    }
    updateStatus();
    setInterval(updateStatus, 12000);
  </script>
</body>
</html>`;
}

// Layar Simulator Smartphone untuk Demo Klien
function renderSimulatorHtml() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smartphone Simulator - Patrol PWA</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090d16;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      color: #f3f4f6;
    }
    .top-bar {
      margin-bottom: 1.25rem;
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .btn-back {
      background: #1e293b;
      color: #94a3b8;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s;
    }
    .btn-back:hover { color: #ffffff; background: #334155; }
    .sim-info {
      font-size: 0.9rem;
      color: #94a3b8;
    }
    /* Phone Mockup Frame */
    .phone-frame {
      width: 410px;
      height: 840px;
      background: #1e293b;
      border: 12px solid #334155;
      border-radius: 54px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .dynamic-island {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 110px;
      height: 28px;
      background: #000000;
      border-radius: 20px;
      z-index: 100;
      pointer-events: none;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: #ffffff;
      border-radius: 42px;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <a href="/" class="btn-back">&larr; Kembali ke Gateway Hub</a>
    <div class="sim-info">📱 Simulasi Layar Smartphone untuk Demo Klien (Field PWA)</div>
  </div>

  <div class="phone-frame">
    <div class="dynamic-island"></div>
    <iframe src="/pwa" allow="camera; geolocation; microphone"></iframe>
  </div>
</body>
</html>`;
}

// Server Utama Gateway
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';

  // 1. Endpoint Health Check Gateway
  if (pathname === '/gateway/health') {
    const [backend, admin, pwa, db, redis] = await Promise.all([
      checkPort(BACKEND_PORT),
      checkPort(ADMIN_PORT),
      checkPort(PWA_PORT),
      checkPort(DB_PORT),
      checkPort(REDIS_PORT, '127.0.0.1', 150),
    ]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      gateway: { port: GATEWAY_PORT, status: 'online' },
      backend: { port: BACKEND_PORT, ...backend },
      admin: { port: ADMIN_PORT, ...admin },
      pwa: { port: PWA_PORT, ...pwa },
      db: { port: DB_PORT, ...db },
      redis: { port: REDIS_PORT, active: redis.active, status: redis.active ? 'online' : 'optional_inactive' },
    }));
  }

  // 2. Layar Induk Portal di "/"
  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderPortalHtml());
  }

  // 3. Layar Simulator Smartphone di "/simulator"
  if (pathname === '/simulator') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderSimulatorHtml());
  }

  // 4. Routing API Backend NestJS (/api/*)
  if (pathname.startsWith('/api/') || pathname === '/api') {
    return proxyHttpRequest(req, res, BACKEND_PORT);
  }

  // 4b. Routing Uploads Statis Backend (/uploads/*)
  if (pathname.startsWith('/uploads/') || pathname === '/uploads') {
    return proxyHttpRequest(req, res, BACKEND_PORT);
  }

  // 5. Routing Socket.io HTTP Polling (/socket.io/*)
  if (pathname.startsWith('/socket.io/')) {
    return proxyHttpRequest(req, res, BACKEND_PORT);
  }

  // 6. Routing Aset Khusus Next.js (/_next/*)
  if (pathname.startsWith('/_next/')) {
    return proxyHttpRequest(req, res, ADMIN_PORT);
  }

  // 7. Routing Aset Khusus Vite PWA (/@vite, /@fs, /src, dll)
  if (
    pathname.startsWith('/@vite') ||
    pathname.startsWith('/@fs') ||
    pathname.startsWith('/@id') ||
    pathname.startsWith('/@react-refresh') ||
    pathname.startsWith('/src/') ||
    pathname.startsWith('/node_modules/') ||
    pathname.startsWith('/workbox-') ||
    pathname === '/sw.js' ||
    pathname === '/manifest.webmanifest' ||
    pathname.endsWith('.webmanifest')
  ) {
    return proxyHttpRequest(req, res, PWA_PORT);
  }

  // 8. Routing Khusus Web Admin (/admin, /admin/*)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const adminPath = pathname.replace(/^\/admin/, '') || '/';
    const targetUrl = adminPath + (parsedUrl.search || '');
    return proxyHttpRequest(req, res, ADMIN_PORT, targetUrl);
  }

  // 9. Routing Khusus PWA (/pwa, /pwa/*, /app, /app/*, /validasi-patroli/*, dan rute operasional PWA)
  if (
    pathname === '/pwa' || pathname.startsWith('/pwa/') ||
    pathname === '/app' || pathname.startsWith('/app/') ||
    pathname.startsWith('/validasi-patroli/') ||
    pathname === '/clock-in' ||
    pathname === '/clock-out' ||
    pathname === '/patrol-scan' ||
    pathname === '/driver-trip' ||
    pathname.endsWith('.php')
  ) {
    let pwaPath = pathname;
    if (pathname === '/pwa' || pathname.startsWith('/pwa/') || pathname === '/app' || pathname.startsWith('/app/')) {
      pwaPath = pathname.replace(/^\/(pwa|app)/, '') || '/';
    }
    const targetUrl = pwaPath + (parsedUrl.search || '');
    return proxyHttpRequest(req, res, PWA_PORT, targetUrl);
  }

  // 10. Known Next.js App Routes
  const adminPages = [
    '/absensi',
    '/datainduk',
    '/emergency',
    '/export-laporan',
    '/gaji',
    '/laporan',
    '/monitoring-patroli',
    '/pesan-siaran',
  ];
  if (adminPages.some(page => pathname === page || pathname.startsWith(page + '/'))) {
    return proxyHttpRequest(req, res, ADMIN_PORT);
  }

  // 11. Referer-based Smart Fallback untuk gambar/aset statis tanpa prefix
  const referer = req.headers['referer'] || '';
  if (referer.includes('/pwa') || referer.includes('/app') || referer.includes(':5173')) {
    return proxyHttpRequest(req, res, PWA_PORT);
  }
  if (referer.includes('/admin') || referer.includes('/_next') || referer.includes(':3001')) {
    return proxyHttpRequest(req, res, ADMIN_PORT);
  }

  // Default fallback ke Web Admin
  return proxyHttpRequest(req, res, ADMIN_PORT);
});

// Penanganan WebSocket Upgrade (Socket.io untuk Backend, Vite HMR, Next HMR)
server.on('upgrade', (req, clientSocket, head) => {
  const pathname = url.parse(req.url).pathname || '';
  const wsProtocol = req.headers['sec-websocket-protocol'] || '';

  // A. Socket.io (NestJS Backend SOS & GPS Realtime)
  if (pathname.startsWith('/socket.io/')) {
    return proxyWebSocketUpgrade(req, clientSocket, head, BACKEND_PORT);
  }

  // B. Vite HMR (Hot Module Replacement)
  if (wsProtocol === 'vite-hmr' || pathname.startsWith('/@vite')) {
    return proxyWebSocketUpgrade(req, clientSocket, head, PWA_PORT);
  }

  // C. Next.js Webpack HMR
  if (pathname.startsWith('/_next/')) {
    return proxyWebSocketUpgrade(req, clientSocket, head, ADMIN_PORT);
  }

  // Fallback WS ke Backend
  return proxyWebSocketUpgrade(req, clientSocket, head, BACKEND_PORT);
});

// Menjalankan Gateway Server
server.listen(GATEWAY_PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log('   PATROL & FACILITY MANAGEMENT - ENTERPRISE UNIFIED GATEWAY');
  console.log('================================================================');
  console.log(`🚀 Gateway Satu Pintu Aktif di : http://localhost:${GATEWAY_PORT}`);
  console.log(`   - Portal Induk & Health     : http://localhost:${GATEWAY_PORT}/`);
  console.log(`   - Web Admin Command Center  : http://localhost:${GATEWAY_PORT}/admin`);
  console.log(`   - PWA Mobile Field App      : http://localhost:${GATEWAY_PORT}/pwa`);
  console.log(`   - Smartphone Simulator Demo : http://localhost:${GATEWAY_PORT}/simulator`);
  console.log(`   - Backend API Gateway       : http://localhost:${GATEWAY_PORT}/api/v1`);
  console.log('----------------------------------------------------------------');
  console.log('Semua layanan dev tetap aktif dengan Hot-Reload penuh.');
  console.log('Tekan Ctrl+C untuk menghentikan gateway.');
  console.log('================================================================');
});
