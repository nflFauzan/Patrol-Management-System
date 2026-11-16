# 01 — SYSTEM OVERVIEW & ARCHITECTURAL TOPOLOGY
> **Patrol & Facility Management System (Enterprise In-House / Single-Tenant Beli Putus)**  
> Technical Audit & Architectural Baseline Analysis

---

## 1. Executive Summary & Business Scope

The **Patrol & Facility Management System** is an enterprise-grade operational management platform engineered specifically for **single-tenant in-house deployment** (*Beli Putus*). It is designed to manage physical security, cleaning operations, logistics fleet tracking, attendance compliance, emergency incident responses (Panic SOS), and administrative oversight across an organization's internal facilities (Headquarters, Manufacturing Plants, Warehouses, and Operational Sites).

In accordance with core enterprise governance rules (`AGENTS.md`):
- **Single-Tenant Corporate Hierarchy**: Strictly no multi-tenancy SaaS abstractions (no `tenant_id` columns or dynamic tenant routing). The hierarchy strictly represents corporate organization: `Pusat ➔ Fasilitas / Site ➔ Divisi ➔ Pos / Checkpoint`.
- **Three Core Operational Divisions**:
  1. **Security (Satpam)**: Roving patrol routes, QR code checkpoints, GPS geofence validation, incident reporting, and real-time Panic Button SOS.
  2. **Cleaning Service**: Periodic sanitation checklists for hygiene zones (floors, restrooms, lobbies) with photo proofs.
  3. **Logistics Drivers**: Fleet journey logs, vehicle plate tracking, departure/arrival odometer captures, and delivery task status.
- **Integrated Attendance & HRIS Pre-Payroll Engine**: Shift adherence calculation, grace-period lateness computation, effective working hours, cross-midnight shifts, and payroll deductions/allowances for internal HR export.
- **Media Retention & Storage**: 180-day (6-month) automatic retention lifecycle for selfie verifications and patrol inspection photos.
- **Real-Time Emergency Broadcast**: 3-second continuous hold on the mobile Panic SOS button broadcasting immediate WebSocket telemetry to Web Admin Command Center and triggering WhatsApp Gateway alerts with precision Google Maps links.

---

## 2. Monorepo Repository Structure & Topography

The project is structured as an npm workspaces monorepo:

```
Patrol-Management-System/
├── AGENTS.md                                # AI Agent Guidelines & Corporate Standards
├── package.json                             # Monorepo root configuration & scripts
├── docker-compose.yml                       # PostgreSQL 17 + PostGIS 3.5 & Redis 7 services
├── docker/
│   └── init-db/
│       ├── 01_init_schema.sql               # Base tables, PostGIS extensions, & geofence functions
│       └── 02_seed_data.sql                 # Baseline corporate accounts, sites, & checkpoints
├── packages/
│   └── types/                               # Single Source of Truth (SSOT) shared TypeScript types
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts                     # Core entities, DTOs, Enums, & WebSocket contracts
├── apps/
│   ├── backend/                             # NestJS 10 + Fastify + PostgreSQL + Socket.io
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── common/                      # Guards, decorators, upload utilities
│   │       ├── database/                    # DatabaseService (pg Pool) & SQL migrations
│   │       ├── modules/                     # Domain modules (auth, users, patrol, attendance, etc.)
│   │       ├── app.module.ts
│   │       └── main.ts
│   ├── web-admin/                           # Next.js 14 App Router Command Center & Management
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   └── src/
│   │       ├── app/                         # App Router pages (/dashboard, /datainduk, /laporan, etc.)
│   │       ├── components/                  # Admin UI components, modals, tables, layout
│   │       ├── field/                       # Duplicated mobile PWA pages and services
│   │       ├── lib/                         # AuthContext, DataContext, Excel export helpers
│   │       └── middleware.ts                # Next.js edge route protection & cookie inspector
│   └── pwa-field/                           # Vite 5 + React 18 + React Router 6 Mobile PWA
│       ├── package.json
│       ├── vite.config.ts                   # VitePWA plugin configuration & proxy rules
│       ├── tailwind.config.js
│       └── src/
│           ├── components/                  # Mobile UI modals & skeuomorphic buttons
│           ├── pages/                       # Mobile operational pages (ClockIn, PatrolScan, Panic, etc.)
│           ├── services/                    # Axios API client
│           └── App.tsx                      # React Router route tree
├── docs/                                    # Technical documentation & audit artifacts
│   ├── system-audit/                        # Comprehensive audit deliverables (this directory)
│   ├── redesign/                            # Redesign specifications & page inventories
│   └── superpowers/                         # Execution specs & plans
└── scripts/                                 # Operational automation & parity verification scripts
    ├── local-gateway.js                     # Port 8080 single-entry reverse proxy
    ├── check-db.js                          # Database connectivity & count inspector
    └── check-rbac-db.js                     # RBAC schema & permissions validator
```

---

## 3. Technology Stack & Framework Matrix

| Component Layer | Technology / Library | Version | Role in Ecosystem | Architectural Status |
| :--- | :--- | :--- | :--- | :--- |
| **Workspace Manager** | npm Workspaces | v10+ | Orchestrates multi-package builds and dependencies | Healthy |
| **Shared Types** | TypeScript | v5.4.5 | Monorepo Single Source of Truth (`@patrol/types`) | Healthy |
| **Backend Framework** | NestJS | v10.3.8 | Enterprise Modular API Framework | Healthy |
| **HTTP Transport** | Fastify (`@nestjs/platform-fastify`) | v4.26.2 | High-throughput asynchronous HTTP engine | Healthy |
| **Database** | PostgreSQL + PostGIS | 17 / 3.5 | Spatial geometry (`Point`), GiST indexing, `ST_DWithin` | Healthy |
| **Realtime Dispatch** | Socket.io | v4.7.5 | Bi-directional WebSocket gateway for SOS & Patrol | Healthy |
| **Database Access** | `pg` (node-postgres Pool) | v8.11.5 | Raw parameterized SQL queries via `DatabaseService` | Working, but lacks migration runner |
| **Admin Frontend** | Next.js App Router | v14.2.3 | Desktop Command Center & Master Data Portal | Fragmentation issues present |
| **Field Mobile Frontend**| Vite + React | v5.2.11 / v18.3.1 | Mobile PWA for field personnel | Duplicated inside `web-admin` |
| **PWA Engine** | `vite-plugin-pwa` (Workbox) | v0.20.0 | Offline asset caching & Service Worker generator | Only in `pwa-field`, incomplete offline sync |
| **Local Storage Engine**| `idb` (IndexedDB Wrapper) | v8.0.4 | Browser client-side persistence | Installed in packages but UNUSED |
| **Mapping Engine** | Leaflet + React-Leaflet | v1.9.4 | Desktop geofence editing & SOS radar visualization | Healthy |
| **QR Code Scanner** | `html5-qrcode` | v2.3.8 | Camera-based barcode/QR code reader | Working, but lacks offline retry |
| **Document Export** | ExcelJS & jsPDF | v4.4.0 / v4.2.1 | Generation of HRIS Excel spreadsheets and PDF audit logs | Healthy |
| **Local Gateway** | Node.js native `http`/`https` proxy | Custom | Single-port reverse proxy at `:8080` | Fragile bridge masking app split |

---

## 4. Current Architecture Diagram

```mermaid
graph TB
    subgraph ClientLayer ["Client Devices & Viewports"]
        BrowserAdmin["Desktop Admin / Chief\n(Web Browser)\nhttp://localhost:3001\nor http://localhost:8080/admin"]
        MobileField["Field Personnel\n(Smartphone PWA)\nhttp://localhost:5173\nor http://localhost:8080/pwa\n(Also mirrored at :3001/validasi-patroli)"]
    end

    subgraph GatewayLayer ["Local Gateway (:8080 - scripts/local-gateway.js)"]
        Proxy["Reverse Proxy Server\n- /admin -> :3001\n- /pwa -> :5173\n- /api -> :3000\n- /socket.io -> :3000\n- /simulator -> Mock Phone Frame"]
    end

    subgraph FrontendApps ["Frontend Applications (Fragmented Monorepo)"]
        NextAdmin["apps/web-admin (Next.js 14)\n- Pages: /dashboard, /datainduk/*, /absensi, /emergency, /laporan, /gaji\n- Embedded Copy: src/field/* (Mirror of pwa-field!)\n- Middleware: Reads patrol_session cookie (>20 chars)\n- AuthContext: Client-side mock fallback on network failure"]
        VitePWA["apps/pwa-field (Vite + React Router)\n- Pages: /validasi-patroli/*, /login\n- VitePWA: Service worker precaching static assets\n- Axios Client: Hardcoded /api/v1 prefix\n- No Offline Queue: Direct HTTP calls only"]
    end

    subgraph BackendApp ["apps/backend (NestJS 10 + Fastify Engine :3000)"]
        Fastify["Fastify HTTP Server & Guards\n- JwtAuthGuard\n- RolesGuard\n- PermissionsGuard"]
        SocketGateway["Socket.io EventsGateway (:3000)\n- sos:new\n- patrol:checkpoint_scanned\n- gps:update"]
        
        subgraph BackendModules ["Core Domain Modules"]
            AuthModule["AuthModule\n(Bcrypt 10, JWT 24h, Brute-Force 5x Lockout)"]
            UsersModule["UsersModule & RbacController\n(Approval Queue, Roles, Permissions)"]
            AttendanceModule["AttendanceModule\n(Clock-In/Out, Late calc, PostGIS Geofence)"]
            PatrolModule["PatrolModule\n(Checkpoint Scans, Hourly 24h Matrix, Incidents)"]
            EmergencyModule["SosModule\n(Panic alerts, WhatsApp Webhook dispatch)"]
            MasterModule["SitesModule & CheckpointsModule"]
            ReportsModule["ReportsModule (HRIS Export & Multi-Role Logs)"]
        end
    end

    subgraph DataStorage ["Data Persistence Layer (Docker Services)"]
        Postgres[("PostgreSQL 17 + PostGIS 3.5 (:5432)\n- users (extended with approval columns)\n- roles, permissions, role_permissions, user_roles\n- sites, checkpoints (Point geometry)\n- attendances, patrol_logs, emergency_alerts\n- driver_trip_logs, cleaning_checklists, chief_evaluations\n- Spatial Function: is_within_site_geofence()")]
        RedisCache[("Redis 7 (:6379)\n- Session cache & Pub/Sub")]
    end

    subgraph ExternalServices ["External Communications"]
        WAGateway["WhatsApp Gateway API\n(Fonnte / Wablas Service)\nDispatches emergency alert with Google Maps URL"]
    end

    ClientLayer --> GatewayLayer
    GatewayLayer --> NextAdmin
    GatewayLayer --> VitePWA
    GatewayLayer --> Fastify
    GatewayLayer --> SocketGateway

    NextAdmin -.->|"Direct bypass (26 hardcoded fetch calls)"| Fastify
    VitePWA -->|"Proxy /api"| Fastify
    NextAdmin -->|"Socket.io listener"| SocketGateway
    VitePWA -->|"Socket.io listener"| SocketGateway

    Fastify --> BackendModules
    BackendModules --> Postgres
    BackendModules --> RedisCache
    EmergencyModule -->|"HTTP POST alert payload"| WAGateway
```

---

## 5. End-to-End Application Flows

### Flow 1: Authentication & Session Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor User as User / Personnel
    participant Browser as Web Browser (PWA / Admin)
    participant MW as Next.js Middleware / AuthContext
    participant API as Backend AuthController (:3000)
    participant DB as PostgreSQL 17 Database

    User->>Browser: Opens / or /login
    Browser->>MW: Check cookie 'patrol_session'
    alt Cookie exists & length > 20 chars
        MW-->>Browser: 307 Redirect to /dashboard (Bypasses Login Form!)
    else No session cookie
        Browser->>User: Renders Login Form
    end

    User->>Browser: Submits username & password
    Browser->>API: POST /api/v1/auth/login { username, password, hp_input }
    API->>API: Honeypot check (hp_input must be empty)
    API->>DB: Query user by username & check locked_until
    alt 5 consecutive password failures
        API->>DB: UPDATE locked_until = NOW() + 15 min
        API-->>Browser: 423 Locked
    else Password matches
        alt is_approved == false
            API-->>Browser: 403 Forbidden ("Akun dalam antrean approval")
        else rejection_reason != null
            API-->>Browser: 403 Forbidden ("Pendaftaran ditolak: ...")
        else is_active == false
            API-->>Browser: 401 Unauthorized ("Akun nonaktif")
        else Active & Approved
            API->>DB: Query resolved permissions (user_roles -> role_permissions)
            API-->>Browser: 200 OK { user, token, refreshToken, expiresIn }
            Browser->>Browser: Set localStorage & cookie 'patrol_session'
            Browser-->>User: Redirect to role-appropriate screen
        end
    end
```

### Flow 2: Registration & Administrator Approval
```mermaid
sequenceDiagram
    autonumber
    actor Candidate as New Personnel Candidate
    participant RegPage as /register Page
    participant API as Backend Auth / Users Module
    participant DB as PostgreSQL Database
    actor Admin as Super Admin / HRD Manager
    participant AdminUI as /datainduk/approval UI

    Candidate->>RegPage: Fills NIK (16 digits), Name, Phone, Desired Division, Password
    RegPage->>API: POST /api/v1/auth/register
    API->>API: Honeypot check & password confirmation validation
    API->>DB: Check NIK / username uniqueness
    API->>DB: INSERT INTO users (is_approved=false, is_active=false, role=DEFAULT_BY_DIVISION)
    API-->>RegPage: 201 Created (Pending candidate record)
    RegPage-->>Candidate: Displays "Pendaftaran Berhasil, Menunggu Approval"

    Admin->>AdminUI: Opens /datainduk/approval
    AdminUI->>API: GET /api/v1/users/approval-queue (Bearer Token)
    API->>DB: SELECT * FROM users WHERE is_approved = false
    API-->>AdminUI: List of pending candidates

    alt Admin Approves Candidate
        Admin->>AdminUI: Selects Role, Assigned Site, Division, Salary Attributes
        AdminUI->>API: POST /api/v1/users/:id/approve { roleId, division, siteId, gajiPokok, tunjangan }
        API->>DB: UPDATE users SET is_approved=true, is_active=true, approved_by=adminId
        API->>DB: INSERT INTO user_roles (user_id, role_id)
        API->>DB: INSERT INTO user_site_assignments (user_id, site_id)
        API-->>AdminUI: 200 OK (Candidate activated)
    else Admin Rejects Candidate
        Admin->>AdminUI: Enters Rejection Reason
        AdminUI->>API: POST /api/v1/users/:id/reject { reason }
        API->>DB: UPDATE users SET is_approved=false, is_active=false, rejection_reason=reason
        API-->>AdminUI: 200 OK (Candidate rejected)
    end
```

### Flow 3: Field Operations (Patrol Checkpoint & Panic SOS)
```mermaid
sequenceDiagram
    autonumber
    actor Officer as Field Security Officer
    participant PWA as Mobile PWA App
    participant Geolocation as Device GPS API
    participant Camera as Device MediaDevices / Camera
    participant API as Backend Fastify API (:3000)
    participant WS as Socket.io Gateway
    participant WA as WhatsApp Gateway (Fonnte/Wablas)
    actor CommandAdmin as Command Center Admin

    Note over Officer, PWA: Skenario 1: Scan QR Checkpoint
    Officer->>PWA: Opens /validasi-patroli/patrol-scan
    PWA->>Camera: Requests rear camera feed & starts QR decoder
    Officer->>Camera: Points camera at physical QR checkpoint
    Camera-->>PWA: Decoded QR token string
    PWA->>Geolocation: getCurrentPosition({ enableHighAccuracy: true })
    Geolocation-->>PWA: Coordinates (lat, lng)
    PWA->>API: POST /api/v1/patrol/scan { qrPayload, lat, lng, siteId }
    API->>API: PostGIS geofence check (is_within_site_geofence)
    API->>WS: Emit 'patrol:checkpoint_scanned'
    WS-->>CommandAdmin: Live telemetry update on map
    API-->>PWA: 200 OK { scannedCheckpoint, statusResult }

    Note over Officer, PWA: Skenario 2: Panic Button SOS
    Officer->>PWA: Presses and holds SOS button for 3 continuous seconds
    PWA->>Geolocation: Obtains precise GPS coordinates
    PWA->>API: POST /api/v1/sos/trigger { lat, lng, siteId, message }
    API->>WS: Broadcast 'sos:new' to room 'site:all'
    WS-->>CommandAdmin: Immediate audio siren & modal popup with radar coordinates
    API->>WA: HTTP POST emergency payload to WhatsApp group supervisor
    WA-->>Officer: WhatsApp group receives alert with Google Maps hyperlink
```

---

## 6. Key Architectural Anomalies & Technical Disconnects

During the deep-dive audit of the source tree, five foundational architectural disconnects were confirmed through code inspection:

1. **Dual Frontend & Code Duplication**:
   - `apps/pwa-field` (Vite + React Router) and `apps/web-admin` (Next.js 14) are two completely separate frontend projects.
   - However, someone copied all 14 pages and components from `apps/pwa-field` directly into `apps/web-admin/src/field/` and exposed them via Next.js dynamic routes (`/validasi-patroli/[slug]`).
   - Consequently, bug fixes or UI updates applied to one application do not propagate to the other, creating massive divergence.

2. **The "Reverse Proxy Gateway" Patchwork**:
   - Because the system was fragmented into three separate dev servers (Admin at `:3001`, PWA at `:5173`, Backend at `:3000`), a custom reverse proxy script (`scripts/local-gateway.js`) was introduced at port `:8080`.
   - While it proxies `/admin` to `:3001` and `/pwa` to `:5173`, internal hyperlinks inside the apps still link to absolute roots (e.g. `/dashboard` instead of `/admin/dashboard`, or `/validasi-patroli` instead of `/pwa/validasi-patroli`), causing broken sub-resource routing when users navigate without the reverse proxy.

3. **Hardcoded Internal API Calls**:
   - In 26 distinct component files in `apps/web-admin`, `fetch('http://localhost:3000/api/v1/...')` is hardcoded directly.
   - This bypasses the Next.js API rewrite layer, bypasses the gateway proxy, breaks SSL termination, and prevents the app from functioning when accessed over a local area network (LAN) IP or on a mobile smartphone connecting to the host machine.

4. **Middleware Session Short-Circuit**:
   - In `apps/web-admin/src/middleware.ts`, checking authentication relies exclusively on `request.cookies.get('patrol_session')?.value?.length > 20`.
   - When any authenticated cookie exists, navigating to `/` or clicking "MASUK" (`/login`) immediately triggers a `NextResponse.redirect('/dashboard')`.
   - The user is completely blocked from accessing the login screen to view credentials, switch accounts, or log out cleanly.

5. **Disjointed RBAC Backend Pipeline**:
   - The database has fully seeded `roles`, `permissions`, and `role_permissions` tables, and `UsersService` populates permissions during login.
   - However, `JwtStrategy.validate()` in `apps/backend/src/modules/auth/jwt.strategy.ts` executes a query that fails to join `user_roles` and `role_permissions`, returning `user` with `permissions: undefined`.
   - Any endpoint protected by `@Permissions(...)` using `PermissionsGuard` will always reject non-superadmin users, forcing controllers to fall back to hardcoded `@Roles(...)` enums.
