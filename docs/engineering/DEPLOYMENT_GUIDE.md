# Production & Development Deployment Guide
> **Patrol & Facility Management System (Enterprise In-House)**  
> Operational deployment manual for Single-Port Gateway, Docker Containers, and Frontend/Backend Applications.

---

## 1. System Requirements

### Hardware Requirements (Minimum On-Premise Server)
- **CPU**: 4 Cores (x86_64 or ARM64)
- **RAM**: 8 GB (16 GB Recommended for production workloads)
- **Storage**: 100 GB SSD (NVMe recommended for PostGIS spatial indexing)
- **Operating System**: Ubuntu 22.04 LTS / Debian 12 / Windows Server 2022

### Software Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **Docker & Docker Compose**: v24.x+
- **PostgreSQL**: 17.x with PostGIS 3.5 extension (provided via Docker Compose)
- **Redis**: 7.x (optional for caching/session store)

---

## 2. Architecture & Port Mapping

```
[Client Web Browser / PWA Mobile]
              │
              ▼
    :8080 Single-Port Gateway (scripts/local-gateway.js / Nginx)
        ├── /api/*          ➔ :3000 (NestJS + Fastify API)
        ├── /socket.io/*    ➔ :3000 (Real-Time WebSocket Gateway)
        ├── /admin/*, /*    ➔ :3001 (Next.js 14 Web Admin)
        └── /pwa/*, /app/*  ➔ :5173 (Vite + React PWA Mobile)
              │
        [Database Layer]
        ├── PostgreSQL 17 + PostGIS 3.5 (:5433 host ➔ :5432 container)
        └── Redis 7 (:6379)
```

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <repository_url> Patrol-Management-System
cd Patrol-Management-System
npm install
```

### Step 2: Configure Environment Variables
Create `.env` at the root directory:
```env
# Application
NODE_ENV=production
PORT=3000
GATEWAY_PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=patrol_admin
DB_PASSWORD=patrol_secret_2026
DB_NAME=patrol_management

# Authentication & Security
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_min_32_characters_here
JWT_EXPIRATION=8h

# Media & Storage
UPLOAD_DIR=./uploads
RETENTION_DAYS=180

# External Gateways
WHATSAPP_GATEWAY_PROVIDER=fonnte
WHATSAPP_API_TOKEN=your_token_here
```

### Step 3: Launch PostgreSQL + PostGIS via Docker
```bash
docker-compose up -d postgres
```
Verify database health:
```bash
node scripts/check-db.js
```

### Step 4: Run Database Migrations
```bash
docker exec -i patrol_postgres psql -U patrol_admin -d patrol_management < apps/backend/src/database/migrations/010_rbac_and_approval.sql
docker exec -i patrol_postgres psql -U patrol_admin -d patrol_management < apps/backend/src/database/migrations/011_add_portal_permissions_and_requested_role.sql
```

### Step 5: Build All Packages
```bash
npm run build --workspace=@patrol/types
npm run build --workspace=@patrol/backend
npm run build --workspace=@patrol/pwa-field
npm run build --workspace=@patrol/web-admin
```

### Step 6: Start All Services via Single Gateway
For production background management (PM2 recommended):
```bash
pm2 start apps/backend/dist/main.js --name "patrol-backend"
pm2 start "npm start --workspace=@patrol/web-admin" --name "patrol-admin"
pm2 start "npm run preview --workspace=@patrol/pwa-field" --name "patrol-pwa"
pm2 start scripts/local-gateway.js --name "patrol-gateway"
```

For local development:
```bash
start-dev.bat
```
Access the Unified Portal at `http://localhost:8080`.
