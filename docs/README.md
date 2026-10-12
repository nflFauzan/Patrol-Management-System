# Dokumentasi Perancangan Sistem Enterprise (Pre-Development Documents)
## Project: Enterprise Patrol & Facility Management System (Beli Putus)
**Model:** Single-Tenant Enterprise In-House Solution  
**Target:** Korporasi Pemilik Fasilitas Mandiri (Security, Cleaning Service, Driver)

Folder ini berisi seluruh dokumen analisis, cetak biru arsitektur, skema basis data geospasial, dan kontrak API pra-pengembangan (*pre-development*) yang telah disepakati dan disesuaikan 100% untuk sistem beli putus:

```
docs/
├── 01_AUDIT_REPORT.md                 # Analisis sistem legacy patroli.site & evaluasi fitur domain
├── 02_PRD_PRODUCT_REQUIREMENTS.md     # Product Requirement Document (PRD) 3 divisi, RBAC & fitur HRIS
├── 03_SYSTEM_ARCHITECTURE.md          # Arsitektur monorepo (NestJS Fastify + Postgres PostGIS + Next.js + Vite PWA)
├── 04_DATABASE_SCHEMA_POSTGIS.md      # Skema DDL PostgreSQL 18 + PostGIS lengkap (14 tabel) & fungsi spasial
├── 05_API_AND_WEBSOCKET_SPEC.md       # Kontrak REST API & WebSocket event matrix terintegrasi WhatsApp Gateway
└── README.md                          # Indeks direktori dokumentasi
```

---

## Ringkasan Keputusan Arsitektur Final:

1. **Model Bisnis**: **Beli Putus / Single-Tenant Enterprise** (didekasikan untuk satu korporasi tanpa batasan kuota semu, tanpa konsep SaaS multi-tenant).
2. **Cakupan 3 Divisi Lengkap**: **Security (Satpam)**, **Cleaning Service (Kebersihan)**, dan **Driver (Armada Transportasi)**.
3. **Backend Engine**: **TypeScript (NestJS)** dengan Fastify Engine dan arsitektur modular yang bersih.
4. **Basis Data Spasial**: **PostgreSQL 18** dengan ekstensi **PostGIS** untuk geofencing radius akurat (`ST_DWithin`) dan indeks spasial GiST.
5. **Real-Time & Darurat**: **Socket.io WebSocket** (audio sirine di Command Center) terhubung otomatis dengan **WhatsApp Gateway API (Fonnte/Wablas)** untuk pengiriman pesan darurat + link Google Maps ke grup pengawas.
6. **Portal Web Admin**: **Next.js 14** (App Router) + Tailwind CSS + Shadcn UI + Peta Leaflet + Ekspor Rekap Kehadiran Excel Siap HRIS.
7. **Aplikasi Lapangan (Field Client)**: **Vite + React PWA** yang sangat ringan (< 300 KB) untuk HP satpam/cleaning/driver, ramah sinyal minim, dan kompatibel 100% dengan Android Chrome & iOS Safari.
8. **Retensi Media**: Foto presensi dan patroli disimpan selama **6 Bulan (180 Hari)** sebelum auto-purge via *Lifecycle Expiration Rule* Object Storage.
