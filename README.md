# Patrol & Facility Management System (Enterprise In-House)

Sistem Informasi Manajemen Operasional Lapangan Terpadu (Single-Tenant In-House Enterprise) untuk Pengelolaan Satpam (Security), Cleaning Service, dan Driver Armada di seluruh fasilitas korporat (Kantor Pusat, Pabrik, Gudang, Logistik).

---

## 🏗 Struktur Monorepo

```tree
Patrol-Management-System/
├── apps/
│   ├── backend/        # NestJS (Fastify) + Socket.io + PostGIS + Redis API
│   ├── web-admin/      # Next.js 14 App Router + Tailwind CSS Command Center
│   └── pwa-field/      # Vite + React PWA (Workbox offline, MediaDevices, QR scanner)
├── packages/
│   └── types/          # Shared TypeScript models, DTOs, and WebSocket contracts
├── docs/               # Spesifikasi Teknis, PRD, Arsitektur, Skema DB, API
├── docker/             # Docker Compose & PostgreSQL PostGIS Init Scripts
│   └── init-db/
│       ├── 01_init_schema.sql  # 14 Tabel DDL + PostGIS Extension + Geofence functions
│       └── 02_seed_data.sql    # Data Awal Demo Korporat (SCBD, Cikarang, Staff)
└── docker-compose.yml  # PostgreSQL 17 + PostGIS 3.5 & Redis 7
```

---

## 🚀 Quick Start (Development)

### 1. Prasyarat Sistem
- **Node.js**: v20.x atau v24.x
- **Docker Desktop** (WSL2 engine aktif)

### 2. Menjalankan Container Database & Cache
```bash
# Menjalankan PostgreSQL PostGIS dan Redis di latar belakang
npm run docker:up

# Memeriksa status container
docker compose ps

# Mematikan container
npm run docker:down
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan Layanan (Development Mode)
```bash
# Menjalankan Backend API (Port 3000)
npm run dev:backend

# Menjalankan Web Admin Command Center (Port 3001)
npm run dev:admin

# Menjalankan Mobile Field App PWA (Port 5173)
npm run dev:pwa
```

---

## 🔐 Akun Demo Bawaan (Default Seed)
Semua akun demo menggunakan password: `admin123`

| Username | Peran (Role) | Divisi | Akses Portal |
| :--- | :--- | :--- | :--- |
| `superadmin` | SUPERADMIN | Management | Web Admin Command Center |
| `hrmanager` | HR_GA_MANAGER | Management | Web Admin (Rekap HRIS) |
| `chiefsec` | CHIEF_SECURITY | Security | Web Admin Command Center |
| `danru1` | DANRU | Security | Web Admin & PWA Field |
| `testi` | PETUGAS | Security | Mobile PWA Field App |
| `cleaner1` | PETUGAS | Cleaning Service | Mobile PWA Field App |
| `driver1` | PETUGAS | Driver | Mobile PWA Field App |

---

## 📖 Dokumentasi Lengkap
Dokumentasi teknis lengkap tersedia di direktori `docs/`:
- [`docs/01_AUDIT_REPORT.md`](docs/01_AUDIT_REPORT.md) — Temuan Audit & Celah Keamanan patroli.site
- [`docs/02_PRD_PRODUCT_REQUIREMENTS.md`](docs/02_PRD_PRODUCT_REQUIREMENTS.md) — PRD Sistem Enterprise 3 Divisi
- [`docs/03_SYSTEM_ARCHITECTURE.md`](docs/03_SYSTEM_ARCHITECTURE.md) — Arsitektur Monorepo & Pipeline Media
- [`docs/04_DATABASE_SCHEMA_POSTGIS.md`](docs/04_DATABASE_SCHEMA_POSTGIS.md) — Skema 14 Tabel PostgreSQL & PostGIS
- [`docs/05_API_AND_WEBSOCKET_SPEC.md`](docs/05_API_AND_WEBSOCKET_SPEC.md) — Spesifikasi REST API & Socket.io