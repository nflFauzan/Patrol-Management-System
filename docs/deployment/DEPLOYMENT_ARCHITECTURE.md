# DEPLOYMENT ARCHITECTURE DESIGN
## Patrol Management System — Client Presentation Environment
> **Dokumen Desain Topologi & Arsitektur Deployment Multi-Cloud Gratis (Rp0)**  
> **Status:** Final Architectural Specification  
> **Tanggal:** 21 November 2026  
> **Arsitek Sistem:** Senior DevOps Engineer & Cloud Architect  

---

## 1. Ikhtisar Arsitektur

Arsitektur deployment sementara ini dirancang untuk mendemonstrasikan sistem secara utuh kepada calon klien dengan performa tinggi, keamanan standar korporat, dan **biaya infrastruktur 100% gratis (Rp0)**. Arsitektur ini memisahkan beban kerja ke dalam komponen yang berspesialisasi tinggi tanpa mengubah logika bisnis kode sumber:
- **Frontend Presentation Layer**: Didistribusikan melalui Global Edge CDN (Vercel & Cloudflare Pages) dengan sertifikat SSL/TLS otomatis untuk mendukung izin perangkat keras (kamera & GPS ponsel).
- **Application & Real-Time Layer**: Dijalankan pada container cloud yang mendukung persistent TCP/WebSocket (Render atau Koyeb) untuk menyiarkan radar GPS dan sirine darurat Panic SOS.
- **Database & Spatial Layer**: Dikelola oleh managed PostgreSQL cloud dengan ekstensi PostGIS 3.5 native (Supabase atau Neon).
- **Object Storage Layer**: Penyimpanan berkas foto swafoto dan bukti patroli secara persisten di cloud object storage (Supabase Storage).

---

## 2. Arsitektur A: Recommended Free Architecture (Pilihan Utama)

Arsitektur ini memberikan stabilitas tertinggi, pemisahan tanggung jawab yang bersih, dan kompatibilitas 100% terhadap seluruh fitur aplikasi.

### 2.1. Diagram Topologi Arsitektur A

```mermaid
flowchart TD
    subgraph Users ["Client Devices (Internet)"]
        AdminDevice["💻 Laptop / PC Klien\n(Manajemen & HRIS)"]
        FieldDevice["📱 Smartphone Petugas\n(Satpam / Cleaning / Driver)"]
    end

    subgraph EdgeCDN ["Presentation Layer (Edge CDN)"]
        VercelApp["🏢 Vercel Edge Network\nApps: web-admin (Next.js 14)\nURL: https://patrol-admin.vercel.app"]
        CFPagesApp["📱 Cloudflare Pages Global CDN\nApps: pwa-field (Vite PWA)\nURL: https://patrol-pwa.pages.dev"]
    end

    subgraph AppService ["Compute Layer (Container Cloud)"]
        RenderBackend["⚙️ Render.com Web Service\nNestJS 10 + Fastify + Socket.io\nURL: https://patrol-api.onrender.com\n(512 MB RAM / 0.1 vCPU)"]
        UptimeCron["⏰ UptimeRobot (Free Ping)\nHTTP GET /api/v1/health\nInterval: 10 Menit (No Sleep)"]
    end

    subgraph DataStorage ["Data & Media Layer (Cloud Infrastructure)"]
        SupabasePG[("🐘 Supabase Managed PostgreSQL\n- PostGIS 3.5 Extension Active\n- GiST Spatial Indexing\n- 500 MB Storage (TLS Encrypted)")]
        SupabaseBucket["🗄️ Supabase Object Storage\n- Bucket: 'patrol-media' (1 GB Free)\n- Public Read CDN Access"]
    end

    subgraph ExternalServices ["External Gateways"]
        WAGateway["📲 WhatsApp Gateway API\n(Fonnte / Wablas Service)"]
        GoogleMaps["🗺️ Google Maps Navigation API\n(Titik Presisi SOS)"]
    end

    %% User Connections
    AdminDevice -->|HTTPS| VercelApp
    FieldDevice -->|HTTPS| CFPagesApp

    %% Frontend to Backend
    VercelApp -->|HTTPS REST API / WSS WebSocket| RenderBackend
    CFPagesApp -->|HTTPS REST API / WSS WebSocket| RenderBackend

    %% Keep Alive Ping
    UptimeCron -.->|HTTP Ping (Mencegah Sleep)| RenderBackend

    %% Backend to Storage & DB
    RenderBackend -->|Direct TCP 5432 (SSL Mode Require)| SupabasePG
    RenderBackend -->|REST / S3 Upload File Base64| SupabaseBucket
    SupabaseBucket -.->|Public Media URL| VercelApp
    SupabaseBucket -.->|Public Media URL| CFPagesApp

    %% Emergency Notifications
    RenderBackend -->|HTTP POST Alarm Darurat| WAGateway
    WAGateway -->|WhatsApp Chat + Link Maps| GoogleMaps
```

### 2.2. Spesifikasi Layanan & Komponen Arsitektur A

| Komponen | Provider | Paket Layanan | Alokasi Resource | Biaya |
|---|---|---|---|:---:|
| **Web Admin Command Center** | **Vercel** | Hobby Free Tier | 100 GB Bandwidth, Unlimited SSR deploys | **Rp0** |
| **PWA Mobile Field App** | **Cloudflare Pages** | Free Plan | **Unlimited Bandwidth**, Unlimited Requests | **Rp0** |
| **Backend API & Real-Time Gateway** | **Render.com** | Free Web Service | 512 MB RAM, 0.1 CPU, Persistent WebSockets | **Rp0** |
| **Spatial Database** | **Supabase** | Free Tier | 500 MB PostgreSQL 15/16 + PostGIS 3.5 | **Rp0** |
| **Media Storage (Foto Bukti)** | **Supabase Storage** | Free Tier | 1 GB Object Storage, 2 GB Bandwidth | **Rp0** |
| **Keep-Alive Monitor** | **UptimeRobot** | Free Plan | 50 Monitor, interval 5-10 menit | **Rp0** |
| **TOTAL BIAYA INFRASTRUKTUR** | | | | **Rp0 / Bulan** |

---

### 2.3. Alur Komunikasi & Data (Flow Specifications)

#### 1. Alur Autentikasi & Autorisasi (JWT & RBAC)
```
[User Login di PWA / Web Admin]
       │
       ▼ (1) POST /api/v1/auth/login { username, password }
[Render Backend API]
       │
       ▼ (2) Query SELECT u.*, r.code, p.code FROM users u ... (Supabase DB)
[Bcrypt Password Check & User Approval Status]
       │
       ▼ (3) Terbitkan JWT Access Token (Payload: { sub, username, role, permissions })
[Client Browser] ➔ Simpan token di localStorage ('patrol_auth_token')
       │
       ▼ (4) Setiap request berikutnya menyertakan header: 'Authorization: Bearer <token>'
```

#### 2. Alur Scanning QR Code & Geofencing Lapangan
```
[Petugas Scan QR Checkpoint di PWA]
       │
       ▼ (1) Ambil koordinat GPS Presisi: navigator.geolocation.getCurrentPosition()
       ▼ (2) Ambil foto bukti via Kamera Ponsel: navigator.mediaDevices.getUserMedia()
       ▼ (3) POST /api/v1/patrol/scan { checkpointId, qrToken, lat, lng, photoBase64 }
[Render Backend API]
       │
       ▼ (4) Eksekusi Query PostGIS ke Supabase:
             ST_DWithin(s.coordinates::geography, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, geofence_radius)
       │
       ├── Jika Jarak <= Radius:
       │     Simpan log patroli (Status: SUCCESS).
       │     Simpan foto ke Supabase Storage, dapatkan URL publik.
       │     Broadcast event ke Web Admin via Socket.io ('patrol:checkpoint_scanned').
       │
       └── Jika Jarak > Radius:
             Tolak dengan status 400 Bad Request ('Di luar radius geofence lokasi').
```

#### 3. Alur Tombol Darurat Panic SOS & Broadcast Real-Time
```
[Petugas Tekan Tombol SOS 3 Detik di PWA]
       │
       ▼ (1) POST /api/v1/sos/trigger { siteId, latitude, longitude, message }
[Render Backend API]
       ├── (2a) INSERT INTO emergency_alerts (PostGIS ST_MakePoint)
       ├── (2b) Emit WebSocket Event ke Room 'site_xxx' & Global:
       │        server.emit('sos:new', { alertId, officerName, siteName, lat, lng, time })
       └── (2c) Kirim HTTP POST ke WhatsApp Gateway (Fonnte/Wablas):
                Kirim pesan darurat + link Google Maps ke grup pengawas.
       │
       ▼
[Web Admin Command Center]
       Menerima event 'sos:new' -> Bunyikan sirine audio -> Tampilkan modal darurat & radar Leaflet.
```

---

### 2.4. Konfigurasi Environment Variables Arsitektur A

#### A. Backend Service (Render.com Environment Variables)
```env
# Node Environment
NODE_ENV=production
PORT=10000
BACKEND_PORT=10000

# PostgreSQL 16 + PostGIS Database (Supabase)
# Diambil dari dashboard Supabase: Project Settings -> Database -> Connection String (URI)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
DB_HOST=db.[PROJECT-REF].supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[SUPABASE_DB_PASSWORD]
DB_NAME=postgres

# JWT Security Secrets
JWT_ACCESS_SECRET=patrol_enterprise_demo_super_secret_jwt_access_2026_xyz!
JWT_REFRESH_SECRET=patrol_enterprise_demo_super_secret_jwt_refresh_2026_xyz!
JWT_ACCESS_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Media Storage (Demo Singkat: Disk Lokal Container ./uploads)
PUBLIC_BACKEND_URL=https://patrol-api.onrender.com
# Opsi S3 / Supabase Storage untuk produksi VPS mendatang:
# S3_ENDPOINT=https://[PROJECT-REF].supabase.co/storage/v1/s3
# S3_ACCESS_KEY=[SUPABASE_S3_ACCESS_KEY]
# S3_SECRET_KEY=[SUPABASE_S3_SECRET_KEY]
# S3_BUCKET_NAME=patrol-media
# S3_REGION=ap-southeast-1

# WhatsApp Gateway (Fonnte) - Opsional
WHATSAPP_GATEWAY_PROVIDER=fonnte
WHATSAPP_API_TOKEN=[TOKEN_FONNTE_JIKA_ADA]
WHATSAPP_TARGET_GROUP=[ID_GRUP_WHATSAPP]
WA_NOTIFICATIONS_ENABLED=true

# CORS Allowed Origins
CORS_ORIGIN=https://patrol-admin.vercel.app,https://patrol-pwa.pages.dev
```

#### B. Web Admin (Vercel Environment Variables)
```env
# URL Publik Backend API di Render
NEXT_PUBLIC_API_URL=https://patrol-api.onrender.com/api/v1
NEXT_PUBLIC_WS_URL=https://patrol-api.onrender.com
NODE_ENV=production
```

#### C. PWA Mobile Field (Cloudflare Pages Environment Variables)
```env
# URL Publik Backend API di Render
VITE_API_URL=https://patrol-api.onrender.com/api/v1
VITE_WS_URL=https://patrol-api.onrender.com
NODE_ENV=production
```

---

## 3. Arsitektur B: Alternative Free Architecture (Cadangan)

Arsitektur B disiapkan sebagai rencana darurat (*contingency plan*) jika Render atau Supabase mengalami kendala kuota atau limitasi jaringan.

### 3.1. Diagram Topologi Arsitektur B

```mermaid
flowchart TD
    subgraph Users ["Client Devices"]
        AdminDevice["💻 Laptop Admin"]
        FieldDevice["📱 Ponsel Petugas"]
    end

    subgraph EdgeCDN ["Frontend Hosts"]
        NetlifyApp["🏢 Netlify CDN\nApps: web-admin (Next.js SSR)\nURL: https://patrol-admin.netlify.app"]
        VercelPWA["📱 Vercel Static\nApps: pwa-field (Vite PWA)\nURL: https://patrol-pwa.vercel.app"]
    end

    subgraph AppService ["Compute Host"]
        KoyebBackend["⚙️ Koyeb MicroVM (Eco Nano)\nNestJS + Fastify + Socket.io\nURL: https://patrol-api.koyeb.app\n(512 MB RAM / 0.1 vCPU)"]
    end

    subgraph DataStorage ["Database & Storage"]
        NeonPG[("🐘 Neon.tech Serverless Postgres\n- PostGIS 3.5 Active\n- 500 MB Storage\n- Auto-Resume < 1s")]
        CloudinaryMedia["🖼️ Cloudinary Media Cloud\n- 25 GB Free Monthly Credit\n- Base64 Direct Upload REST API"]
    end

    AdminDevice -->|HTTPS| NetlifyApp
    FieldDevice -->|HTTPS| VercelPWA

    NetlifyApp -->|REST API / WSS| KoyebBackend
    VercelPWA -->|REST API / WSS| KoyebBackend

    KoyebBackend -->|TLS 5432 Direct Pool| NeonPG
    KoyebBackend -->|Upload Foto Base64| CloudinaryMedia
```

### 3.2. Perbandingan Karakteristik Arsitektur A vs Arsitektur B

| Aspek | Arsitektur A (Recommended) | Arsitektur B (Alternative) |
|---|---|---|
| **Frontend Admin** | Vercel (Native Next.js) | Netlify (Plugin Next runtime) |
| **Frontend PWA** | Cloudflare Pages (Bebas Batas Bandwidth) | Vercel Static |
| **Backend Compute** | Render.com Web Service | Koyeb MicroVM |
| **Database Engine** | Supabase (PostgreSQL 16 + PostGIS) | Neon.tech (Serverless PostgreSQL + PostGIS) |
| **Penyimpanan Media** | Supabase Storage (1 GB Terpadu) | Cloudinary (25 GB Credit Gambar) |
| **Penanganan Cold Start** | UptimeRobot Ping (Mencegah Render Sleep) | Neon Serverless Auto-Resume Cepat (<1s) |
| **Estimasi Setup Time** | ~25–30 Menit | ~30–40 Menit |
| **Biaya Bulanan** | **Rp0** | **Rp0** |

---

## 4. Konfigurasi HTTPS, SSL & Cross-Origin Resource Sharing (CORS)

1. **Sertifikat SSL / HTTPS Otomatis**:
   - Vercel, Cloudflare Pages, dan Netlify secara otomatis menerbitkan sertifikat TLS dari Let's Encrypt / DigiCert.
   - Mengaktifkan fitur enkripsi end-to-end yang menjamin izin browser untuk `navigator.geolocation` dan `navigator.mediaDevices.getUserMedia` aktif tanpa peringatan keamanan (*Insecure Origin*).
2. **Pengaturan CORS pada Backend**:
   - Backend NestJS Fastify (`main.ts`) dikonfigurasi untuk memeriksa header `Origin`.
   - Mengizinkan request yang berasal dari domain frontend resmi (`patrol-admin.vercel.app` dan `patrol-pwa.pages.dev`).
   - Menyertakan header `Access-Control-Allow-Credentials: true` untuk pertukaran token dan session aman.
