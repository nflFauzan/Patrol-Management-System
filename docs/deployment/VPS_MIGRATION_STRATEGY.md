 # VPS MIGRATION STRATEGY & ZERO-LOCK-IN BLUEPRINT
## Patrol Management System — From Free Staging to Production VPS
> **Strategi Migrasi Cepat, Portabilitas Data, dan Transisi Menuju Dedicated Server**  
> **Status:** Final Migration Architecture  
> **Tanggal:** 21 November 2026  
> **Perancang Sistem:** Senior Cloud Architect & DevOps Lead  

---

## 1. Filosofi Desain Bebas Keterikatan (Zero Vendor Lock-In)

Arsitektur deployment sementara yang dirancang pada fase ini mematuhi prinsip **Zero Vendor Lock-In**:
1. **Tidak Ada Kode Khusus Vendor (No Proprietary SDK)**: Aplikasi backend dibangun menggunakan NestJS murni, adapter Fastify, dan driver standar `pg` (PostgreSQL). Tidak ada ketergantungan kode yang terikat pada fitur proprietary Vercel, Supabase, maupun Render.
2. **Kesesuaian 1:1 dengan Skema Docker Lokal**: Database di Supabase/Neon menggunakan skema SQL DDL yang identik 100% dengan container Docker `postgis/postgis:17-3.5-alpine` di lingkungan lokal.
3. **Konfigurasi Berbasis Variabel Lingkungan (12-Factor App)**: Seluruh perbedaan host, port, kredensial, dan URL diatur melalui file `.env`. Migrasi ke VPS hanya memerlukan pergantian isi variabel konfigurasi tanpa mengubah satu baris pun kode sumber.

---

## 2. Target Arsitektur Produksi di Server Mandiri (Paid Dedicated VPS)

Ketika calon klien menyetujui hasil evaluasi dan kontrak pengadaan ditandatangani, seluruh sistem akan dipindahkan ke **Dedicated Cloud VPS (Ubuntu 22.04 LTS / 24.04 LTS)**:

```mermaid
flowchart TD
    subgraph InternetClients ["Pengguna Lapangan & Kantor Pusat"]
        BrowserAdmin["💻 Browser Web Admin\nhttps://patrol.korporat.co.id/admin"]
        MobilePWA["📱 PWA Petugas Mobile\nhttps://patrol.korporat.co.id/pwa"]
    end

    subgraph DedicatedVPS ["Dedicated Production VPS (Ubuntu 24.04 LTS - 8GB RAM / 4 vCPU)"]
        NginxProxy["🌐 Nginx Reverse Proxy (Port 80/443)\n- Let's Encrypt Wildcard SSL (Auto-Renew Certbot)\n- Gzip & Brotli Static Cache\n- HTTP/2 & WebSocket Upgrade Support"]

        subgraph DockerNetwork ["Docker Internal Network (patrol_network)"]
            NodeBackend["⚙️ Container: patrol_backend (Port 3000)\nNestJS 10 Fastify API & Socket.io"]
            NodeAdmin["🏢 Container: patrol_admin (Port 3001)\nNext.js 14 Web Admin SSR"]
            StaticPWA["📱 Container: patrol_pwa (Port 5173)\nNginx Alpine Serving Vite PWA Static Assets"]
            PostgresDB[("🐘 Container: patrol_postgres (Port 5432)\nPostGIS 17-3.5 Alpine\nVolume: /var/lib/postgresql/data")]
            RedisCache[("⚡ Container: patrol_redis (Port 6379)\nRedis 7 Alpine (In-Memory Cache)")]
            MinIOStorage["🗄️ Container: patrol_minio (Port 9000)\nSelf-Hosted S3 Compatible Object Storage\n(Opsional / Direct Local Disk)"]
        end
    end

    BrowserAdmin -->|HTTPS :443| NginxProxy
    MobilePWA -->|HTTPS :443| NginxProxy

    NginxProxy -->|/api/* & /socket.io/*| NodeBackend
    NginxProxy -->|/admin/* & /*| NodeAdmin
    NginxProxy -->|/pwa/* & /app/*| StaticPWA

    NodeBackend -->|TCP 5432| PostgresDB
    NodeBackend -->|TCP 6379| RedisCache
    NodeBackend -->|S3 API / Disk| MinIOStorage
```

---

## 3. Spesifikasi Minimum Hardware VPS Produksi

Berdasarkan pengujian beban dan audit konsumsi memori (*memory footprint*):
- **CPU:** 4 vCPU (x86_64 atau ARM64).
- **RAM:** 8 GB RAM (Toleransi buffer untuk PostGIS spatial index dan kompilasi Next.js).
- **Penyimpanan:** 100 GB NVMe SSD (Mendukung GiST Spatial Indexing dan penyimpanan foto 180 hari).
- **Sistem Operasi:** Ubuntu 22.04 LTS atau 24.04 LTS.
- **Rekomendasi Provider VPS Indonesia / Global:**
  - *Lokal (Latensi Rendah <15ms):* Biznet Gio, IDCloudHost, CBN Cloud, DigitalOcean Singapore, Linode Singapore.
  - *Estimasi Biaya VPS:* Rp250.000 – Rp500.000 / bulan.

---

## 4. Prosedur Migrasi Langkah-Demi-Langkah (Cutover Execution Plan)

```
[Tahap 1: Persiapan VPS Baru] ➔ [Tahap 2: Ekspor Data Staging] ➔ [Tahap 3: Impor ke VPS] ➔ [Tahap 4: DNS Switch] ➔ [DONE]
```

### Tahap 1: Setup Docker & Docker Compose pada VPS
1. Akses server VPS via SSH:
   ```bash
   ssh root@vps-ip-address
   ```
2. Pasang Docker Engine dan Docker Compose plugin terbaru:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
   apt-get install -y nginx certbot python3-certbot-nginx
   ```
3. Clone repositori ke direktori operasional server:
   ```bash
   git clone <repo-url> /opt/patrol-management-system
   cd /opt/patrol-management-system
   ```

---

### Tahap 2: Ekspor Basis Data dari Supabase / Neon (Staging)
1. Lakukan *snapshot dump* penuh dari basis data cloud sementara:
   ```bash
   # Ekspor data dan skema dari Supabase Staging
   pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require" \
     --format=c \
     --no-owner \
     --no-privileges \
     --file=/opt/patrol-management-system/staging_migration.dump
   ```
2. Verifikasi integritas ukuran berkas `.dump`.

---

### Tahap 3: Impor Basis Data ke PostgreSQL PostGIS Lokal VPS
1. Jalankan container PostgreSQL PostGIS di VPS:
   ```bash
   docker compose up -d postgres redis
   ```
2. Jalankan pemulihan data (*restore*):
   ```bash
   docker exec -i patrol_postgres pg_restore \
     -U patrol_admin \
     -d patrol_management \
     --clean --if-exists \
     < /opt/patrol-management-system/staging_migration.dump
   ```
3. Validasi status koneksi dan keutuhan data:
   ```bash
   node scripts/check-db.js
   node scripts/check-rbac-db.js
   ```

---

### Tahap 4: Migrasi Media & Foto Bukti Lapangan
1. **Jika Menggunakan Supabase Storage:**  
   Gunakan utilitas CLI `rclone` atau script Node.js sederhana untuk mengunduh seluruh isi bucket `patrol-media` langsung ke folder `./uploads` di server VPS.
2. **Jika Menggunakan Ephemeral Disk:**  
   Salin arsip foto yang tersisa ke folder `./uploads/` VPS dan atur hak akses file:
   ```bash
   mkdir -p /opt/patrol-management-system/uploads
   chmod -R 755 /opt/patrol-management-system/uploads
   ```

---

### Tahap 5: Konfigurasi Nginx Reverse Proxy & Sertifikat SSL Otomatis
Buat konfigurasi virtual host Nginx `/etc/nginx/sites-available/patrol.conf`:
```nginx
server {
    server_name patrol.korporat.co.id;

    client_max_body_size 15M;

    # 1. API Fastify
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Uploads Statis
    location /uploads/ {
        alias /opt/patrol-management-system/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 3. WebSocket Socket.io (Realtime SOS & GPS)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # 4. PWA Field Mobile App
    location /pwa/ {
        proxy_pass http://127.0.0.1:5173/;
        proxy_set_header Host $host;
    }

    # 5. Web Admin Command Center (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```
Aktifkan SSL gratis permanen via Let's Encrypt:
```bash
ln -s /etc/nginx/sites-available/patrol.conf /etc/nginx/sites-enabled/
certbot --nginx -d patrol.korporat.co.id
```

---

### Tahap 6: Prosedur Rollback & Rencana Kontinjensi (Rollback Plan)

Jika pada saat pengalihan (*cutover*) ke VPS baru terjadi kendala hardware atau jaringan:
1. **Rollback DNS Cepat:** Arahkan kembali DNS record atau berikan URL Vercel/Cloudflare Pages staging sementara ke pengguna.
2. **Data Backup Snapshot:** Sebelum mematikan environment staging Supabase, ambil snapshot dump cadangan final.
3. **Waktu Downtime:** Estimasi downtime saat migrasi penuh adalah **kurang dari 15 menit**.
