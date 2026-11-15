# PATROLI SITE — ROLE-BASED NAVIGATION & PERMISSIONS MATRIX
> **Granular Information Architecture, Role Entitlements, and Multi-Experience UI Mapping**  
> Document Version: 1.0.0 — Target Monorepo: `Patrol-Management-System`

---

## 1. Role Architecture Overview

The system strictly enforces a **Single-Tenant Corporate Hierarchy** without SaaS multi-tenancy. Authorization is driven by a dual-tier security mechanism:
1. **Primary Operational Role (`UserRole`) & Security Rank (`SecurityRank`)**: Controls the operational domain and field capabilities.
2. **Granular Permissions (`PermissionDefinition`)**: Controls access to administrative modules, data editing, and reporting tools.

Under no circumstances should non-administrative roles (Guards, Cleaners, Drivers, Staff) have access to Master Data configuration, system RBAC, salary parameters, or candidate approvals.

```
                  ┌───────────────────────────────┐
                  │       SUPER ADMIN             │ (Full System Sovereignty)
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
┌────────▼────────┐                               ┌────────▼────────┐
│   OPS MANAGER   │ (Multi-Site Operations)       │   HRD & PAYROLL │ (Attendance & Wages)
└────────┬────────┘                               └─────────────────┘
         │
┌────────▼────────┐
│ SITE SUPERVISOR │ / CHIEF SECURITY (Single Facility Command)
└────────┬────────┘
         │
┌────────▼────────┐
│    COMMANDER    │ / DANRU (Shift Leader)
└────────┬────────┘
         │
 ┌───────┴────────────────────────┬────────────────────────┐
 │                                │                        │
┌▼─────────────────┐     ┌────────▼───────┐       ┌────────▼───────┐
│ SECURITY OFFICER │     │    CLEANER     │       │     DRIVER     │
│ (Patrol/SOS/QR)  │     │ (Sanitation)   │       │ (Fleet Log)    │
└──────────────────┘     └────────────────┘       └────────────────┘
```

---

## 2. Comprehensive Role Matrix

### 2.1 Super Admin (`ADMIN_SUPER`)

| Dimension | Specification |
|---|---|
| **Role Code** | `ADMIN_SUPER` |
| **Primary Dashboard** | Desktop Command Center (`/dashboard`) with full 5-stat metrics, live Leaflet spatial radar, shift compliance tracker, and system alerts. |
| **Visible Sidebar Menus** | **OPERASIONAL**: Komando Utama, Monitoring Patroli, Pemantauan Absensi, Pusat Darurat SOS.<br>**DATA INDUK**: Data Personil, Persetujuan Akun, Titik Checkpoint QR, Fasilitas & Area, Hak Akses & Role.<br>**REKAP & LAPORAN**: Laporan Operasional, Pusat Ekspor Dokumen, Penggajian (Payroll), Pesan Siaran. |
| **Accessible Routes** | All 26 Web Admin routes and preview field simulation routes. |
| **Primary Actions** | Add/edit/delete facilities & geofence; add/edit/delete QR checkpoints; approve/reject user registrations; assign salary parameters; manage custom RBAC roles; broadcast emergency announcements; override attendance; resolve Panic SOS; export HRIS spreadsheets. |
| **Restricted Actions** | None (root corporate sovereignty). |
| **Mobile Experience** | Responsive desktop view with collapsible slide-out drawer; full access to management tools optimized for tablet/mobile viewports. |
| **Design Notes** | Prominent system health indicators; live WebSocket telemetry; instant access to high-impact actions like panic resolution and broadcast. |

---

### 2.2 Operations Manager (`OPS_MANAGER`)

| Dimension | Specification |
|---|---|
| **Role Code** | `OPS_MANAGER` |
| **Primary Dashboard** | Multi-Facility Operational Dashboard (`/dashboard`) with facility filtering across all corporate sites. |
| **Visible Sidebar Menus** | **OPERASIONAL**: Komando Utama, Monitoring Patroli, Pemantauan Absensi, Pusat Darurat SOS.<br>**DATA INDUK**: Data Personil, Persetujuan Akun, Titik Checkpoint QR, Fasilitas & Area.<br>**REKAP & LAPORAN**: Laporan Operasional, Pusat Ekspor Dokumen, Pesan Siaran. |
| **Accessible Routes** | `/dashboard`, `/validasi-patroli`, `/absensi`, `/emergency`, `/datainduk/personil`, `/datainduk/approval`, `/datainduk/checkpoint`, `/datainduk/area`, `/laporan/*`, `/export-laporan`, `/pesan-siaran`. |
| **Primary Actions** | Approve new personnel; view and audit all patrol and sanitation logs; broadcast messages to all sites; acknowledge and resolve SOS incidents; export analytical reports. |
| **Restricted Actions** | Cannot modify RBAC definitions (`RBAC:MANAGE`); cannot access financial payroll records (`GAJI:ACCESS`). |
| **Mobile Experience** | Mobile drawer navigation; quick-action buttons to review pending approvals and active SOS emergencies. |
| **Design Notes** | Prioritize comparative multi-site compliance statistics and visual anomaly alerts. |

---

### 2.3 Site Supervisor / Chief Security (`SITE_SUPERVISOR` / `CHIEF`)

| Dimension | Specification |
|---|---|
| **Role Code** | `SITE_SUPERVISOR` (or `SECURITY_OFFICER` with `CHIEF` rank) |
| **Primary Dashboard** | Facility-Specific Command Center (scoped strictly to assigned site) & Field Chief Hub. |
| **Visible Sidebar Menus (Desktop)** | **OPERASIONAL**: Komando Utama, Monitoring Patroli, Pemantauan Absensi, Pusat Darurat SOS.<br>**DATA INDUK**: Titik Checkpoint QR (View Only), Data Personil (View Only).<br>**REKAP & LAPORAN**: Laporan Operasional (Security, Cleaning, Driver), Pusat Ekspor Dokumen. |
| **Accessible Routes** | Desktop: `/dashboard`, `/validasi-patroli`, `/absensi`, `/emergency`, `/datainduk/checkpoint`, `/datainduk/personil`, `/laporan/*`.<br>Field PWA: `/validasi-patroli/`, `/clock-in`, `/clock-out`, `/patrol-scan`, `/panic`, `/chief-report`, `/attendance-history`, `/activity-history`, `/profile`. |
| **Primary Actions** | Clock-in/out with selfie & GPS; conduct spot-check patrols; submit daily Chief Evaluation Reports (`chief-report`) rating Danru performance; monitor site panic alerts; review site attendance. |
| **Restricted Actions** | Cannot approve users; cannot edit master facility settings; cannot access payroll; cannot broadcast across multiple sites. |
| **Mobile Experience (PWA)** | Dedicated Chief view in the mobile drawer; direct button to **"Laporan Chief"** evaluating 17 commanders; quick SOS button; team attendance view. |
| **Design Notes** | Seamless switching between desktop supervisory review and mobile on-site inspection. |

---

### 2.4 Security Commander / Danru (`KOMANDAN`)

| Dimension | Specification |
|---|---|
| **Role Code** | `SECURITY_OFFICER` with `SecurityRank.KOMANDAN` |
| **Primary Dashboard** | Mobile Field Operational Hub (`/validasi-patroli/`) with Danru shift control badge. |
| **Visible Navigation (Mobile Drawer)** | Beranda, Absen Masuk, Absen Pulang, Scan Patroli QR, Laporan Komandan (Handover), Riwayat Absensi, Riwayat Patroli Regu, Tombol SOS, Profil. |
| **Accessible Routes** | PWA: `/validasi-patroli/`, `/clock-in`, `/clock-out`, `/leave`, `/patrol-scan`, `/panic`, `/commander-report`, `/attendance-history`, `/activity-history`, `/profile`. |
| **Primary Actions** | Lead shift briefings; verify member attendance count; submit end-of-shift handover report (`commander-report`); scan checkpoints during supervisory rounds; trigger SOS in emergencies. |
| **Restricted Actions** | No access to Web Admin master data, user creation, or payroll. |
| **Mobile Experience** | Optimized for fast thumb operation; prominent **"Laporan Komandan"** card on dashboard; quick access to tactical patrol status of assigned shift. |
| **Design Notes** | High-contrast shift status indicator (Pagi, Siang, Malam); tactile form for quick briefing logs. |

---

### 2.5 Security Officer / Satpam Anggota (`SECURITY_OFFICER` / `ANGGOTA`)

| Dimension | Specification |
|---|---|
| **Role Code** | `SECURITY_OFFICER` with `SecurityRank.ANGGOTA` |
| **Primary Dashboard** | Mobile Field Operational Hub (`/validasi-patroli/`). |
| **Visible Navigation (Mobile Drawer)** | Beranda, Absen Masuk, Absen Pulang, Scan QR Checkpoint, Riwayat Patroli, Pengajuan Izin/Sakit, Riwayat Presensi, Tombol SOS, Profil. |
| **Accessible Routes** | PWA: `/validasi-patroli/`, `/clock-in`, `/clock-out`, `/leave`, `/patrol-scan`, `/panic`, `/attendance-history`, `/activity-history`, `/profile`. |
| **Primary Actions** | Verified GPS + selfie clock-in and clock-out; scan physical QR checkpoint codes; report abnormal checkpoint conditions with photo proof; trigger emergency Panic SOS (held for 3s). |
| **Restricted Actions** | Strictly restricted from Web Admin console and supervisory evaluation forms. |
| **Mobile Experience** | Ultra-tactile mobile interface designed for outdoor use; prominent QR scanner button; giant red Panic button; instant feedback checkmark on scan. |
| **Design Notes** | 48px minimum touch targets; high-contrast text readable in sunlight; streamlined flow from clock-in directly to patrol route. |

---

### 2.6 Cleaning Service (`CLEANER`)

| Dimension | Specification |
|---|---|
| **Role Code** | `CLEANER` (Division `CLEANING`) |
| **Primary Dashboard** | Mobile Field Sanitation Hub (`/validasi-patroli/`). |
| **Visible Navigation (Mobile Drawer)** | Beranda, Absen Masuk, Absen Pulang, Input Kegiatan Sanitasi, Riwayat Kebersihan, Pengajuan Izin/Sakit, Tombol SOS, Profil. |
| **Accessible Routes** | PWA: `/validasi-patroli/`, `/clock-in`, `/clock-out`, `/leave`, `/staff-activity` (Sanitation Mode), `/panic`, `/attendance-history`, `/activity-history`, `/profile`. |
| **Primary Actions** | Clock-in/out with selfie & GPS; record completion of toilet, lobby, and floor sanitation checklists; upload photo evidence of clean areas or facility damages; trigger SOS. |
| **Restricted Actions** | Strictly no access to security patrol checkpoints or administrative master data. |
| **Mobile Experience** | Photo-first workflow; simple dropdown for zone selection (Toilet Lt 1, Lobby, Pantry); camera button to capture proof of cleanliness; tactile submission. |
| **Design Notes** | Soft emerald accent highlights reinforcing sanitation/cleanliness theme while maintaining uniform skeuomorphic design tokens. |

---

### 2.7 Driver Logistik Armada (`DRIVER`)

| Dimension | Specification |
|---|---|
| **Role Code** | `DRIVER` (Division `DRIVER`) |
| **Primary Dashboard** | Mobile Logistics Fleet Hub (`/validasi-patroli/`). |
| **Visible Navigation (Mobile Drawer)** | Beranda, Absen Masuk, Absen Pulang, Log Perjalanan Armada, Riwayat Perjalanan, Pengajuan Izin/Sakit, Tombol SOS, Profil. |
| **Accessible Routes** | PWA: `/validasi-patroli/`, `/clock-in`, `/clock-out`, `/leave`, `/driver-trip`, `/panic`, `/attendance-history`, `/activity-history`, `/profile`. |
| **Primary Actions** | Clock-in/out at vehicle pool; log departure trip (vehicle type, license plate, departure odometer reading, destination, purpose); log arrival trip (arrival odometer reading, cargo status); upload dashboard/odometer photo proof; trigger SOS. |
| **Restricted Actions** | No access to security or facility management controls. |
| **Mobile Experience** | Car/Fleet themed tactile cards; prominent camera capture for dashboard odometer reading; quick destination selector; clear "BERANGKAT" vs "SUDAH SAMPAI" status toggles. |
| **Design Notes** | Warm amber accent highlights for logistics; large numeric keypads for accurate odometer entry. |

---

### 2.8 Staff / Karyawan Umum (`STAFF`)

| Dimension | Specification |
|---|---|
| **Role Code** | `STAFF` (Division `STAFF`) |
| **Primary Dashboard** | Mobile Personal Attendance & Activity Hub (`/validasi-patroli/`). |
| **Visible Navigation (Mobile Drawer)** | Beranda, Absen Masuk, Absen Pulang, Input Aktivitas Harian, Riwayat Presensi Pribadi, Pengajuan Izin/Sakit, Tombol SOS, Profil. |
| **Accessible Routes** | PWA: `/validasi-patroli/`, `/clock-in`, `/clock-out`, `/leave`, `/staff-activity`, `/panic`, `/attendance-history`, `/activity-history`, `/profile`. |
| **Primary Actions** | Office check-in/out within geofence; submit daily operational work log (Administrasi, Koordinasi, Meeting, Pengecekan); submit leave requests; trigger SOS. |
| **Restricted Actions** | No administrative rights. |
| **Mobile Experience** | Clean, minimalist operational dashboard focusing on attendance compliance and task logging. |
| **Design Notes** | Standard neutral slate surfaces; direct access to monthly working hours summary. |

---

### 2.9 HRD & Payroll Officer (`HRD_PAYROLL`)

| Dimension | Specification |
|---|---|
| **Role Code** | `HRD_PAYROLL` |
| **Primary Dashboard** | HRD & Attendance Management Center (`/absensi` & `/gaji`). |
| **Visible Sidebar Menus (Desktop)** | **OPERASIONAL**: Pemantauan Absensi.<br>**DATA INDUK**: Data Personil (View Only).<br>**REKAP & LAPORAN**: Penggajian (Payroll), Pusat Ekspor Dokumen, Laporan Operasional. |
| **Accessible Routes** | `/absensi`, `/gaji`, `/export-laporan`, `/datainduk/personil`, `/laporan`. |
| **Primary Actions** | Audit monthly attendance matrices; verify overtime and late penalty deductions; recalculate payroll slip values; batch print salary slips; export official HRIS xlsx/csv records. |
| **Restricted Actions** | Cannot alter security patrol configurations, site geofences, or RBAC roles. |
| **Mobile Experience** | Responsive tablet/desktop view for reviewing wage tables and attendance approvals. |
| **Design Notes** | High-density data tables; currency formatting in Indonesian Rupiah (`Rp 4.800.000`); printable pay slip templates. |
