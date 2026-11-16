# 05 — DATABASE AND DATA MODEL REVIEW (REVISED)
> **Patrol & Facility Management System (Enterprise In-House / Single-Tenant)**  
> Schema Evaluation, Registration Preferences, Offline Audit Fields, and Migration Scripts  
> Document Version: 2.0.0 — Status: Revised for Final Review

---

## 1. Existing Database Schema Audit

The PostgreSQL 17 + PostGIS 3.5 database schema was inspected directly through database inspection scripts (`check-db.js` and `check-rbac-db.js`) and migration history (`01_init_schema.sql` and `010_rbac_and_approval.sql`).

### Current Table Inventory:

| Table Name | Primary Function | Spatial Geometry Column | Verification Status in Live DB |
| :--- | :--- | :--- | :--- |
| `company_profile` | Single corporate tenant metadata & WhatsApp config | None | **Present & Seeded** |
| `sites` | Facility locations, geofence radius, shift schedules | `coordinates GEOMETRY(Point, 4326)` | **Present & Seeded** (2 sites) |
| `checkpoints` | Patrol & sanitation physical QR tags | None | **Present & Seeded** (5 checkpoints) |
| `users` | Personnel accounts, authentication, salary attributes | None | **Present & Seeded** (6 staff) |
| `user_site_assignments` | M:N assignment between personnel and facilities | None | **Present & Seeded** |
| `attendances` | Clock-in, clock-out, lateness, overtime, work duration | `clock_in_coordinates`, `clock_out_coordinates` | **Present** |
| `patrol_logs` | Checkpoint scans, status result, condition notes | `coordinates GEOMETRY(Point, 4326)` | **Present** |
| `incident_tickets` | Tickets for abnormal patrol findings | None | **Present** |
| `emergency_alerts` | Panic Button SOS alerts & WhatsApp dispatch status | `coordinates GEOMETRY(Point, 4326)` | **Present** |
| `cleaning_checklists` | Sanitation checklist per zone with photo keys | None | **Present** |
| `driver_trip_logs` | Fleet journey, plate, odometer start/end | None | **Present** |
| `shift_handovers` | Commander handover briefings and duty counts | None | **Present** |
| `broadcast_messages` | Push broadcast announcements | None | **Present** |
| `chief_evaluations` | Supervisory discipline & coordination scores | None | **Present** |
| `roles` | RBAC master roles | None | **Present & Seeded** (7 roles) |
| `permissions` | Granular permission definitions | None | **Present & Seeded** (13 permissions) |
| `role_permissions` | M:N mapping between roles and permissions | None | **Present & Seeded** (42 mappings) |
| `user_roles` | M:N mapping between users and roles | None | **Present & Seeded** (6 mappings) |

---

## 2. Evaluation of Schema Against Revised Architecture Decisions

### 2.1 Confirmation of Existing Foundations
- The base relational structure (`roles`, `permissions`, `role_permissions`, `user_roles`) was established in `010_rbac_and_approval.sql`.
- `users` table already contains audit columns: `is_approved`, `approved_by`, `approved_at`, `rejection_reason`, `failed_login_attempts`, and `locked_until`.

### 2.2 Critical Schema Gaps Addressed in Revision

1. **Requested Role During Registration**:
   - Currently, `users` table lacks a `requested_role_id` column.
   - The registration API was inserting a hardcoded fallback directly into `users.role`.
   - **Resolution**: Add `requested_role_id UUID REFERENCES roles(id)` to store the candidate's requested preference. This column acts as metadata for administrator review and **never grants permissions directly**.

2. **Offline Idempotency & Transaction Lifecycle State**:
   - `attendances`, `patrol_logs`, `cleaning_checklists`, and `driver_trip_logs` lack deduplication keys.
   - When offline transactions sync, network retries risk creating duplicate records.
   - **Resolution**: Add `client_transaction_id VARCHAR(64) UNIQUE` and `sync_status VARCHAR(30) DEFAULT 'SYNCED'` supporting:
     - `PENDING_OFFLINE`
     - `SYNCING`
     - `SYNCED`
     - `REJECTED`
     - `NEEDS_REVIEW`

3. **Clock Manipulation & Delay Auditing**:
   - Missing fields to track device time vs server time.
   - **Resolution**: Add `device_timestamp TIMESTAMP WITH TIME ZONE`, `synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`, `clock_skew_minutes INT DEFAULT 0`, and `clock_skew_flag BOOLEAN DEFAULT FALSE`.

4. **Configurable Corporate Emergency Phone Hotline**:
   - `company_profile` only contained WhatsApp configuration.
   - **Resolution**: Add `emergency_phone_number VARCHAR(30) DEFAULT '021-5000-9999'` to `company_profile` so the offline Panic SOS screen dials an administrator-configured control room telephone number rather than a hardcoded string.

5. **Interface Separation Permissions**:
   - Separate access control for desktop admin portal vs mobile field app.
   - **Resolution**: Seed `admin.dashboard.access` and `field.dashboard.access` into `permissions`.

---

## 3. Proposed Database Migration Script (`011_target_architecture_sync.sql`)

```sql
-- ============================================================================
-- Migration: 011_target_architecture_sync.sql
-- Description: Idempotency keys, sync lifecycle states, requested roles,
--              emergency phone configuration, and interface permissions
-- ============================================================================

-- 1. Candidate Registration Preference in users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS requested_role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_requested_role ON users(requested_role_id);

-- 2. Configurable Emergency Phone in company_profile
ALTER TABLE company_profile
ADD COLUMN IF NOT EXISTS emergency_phone_number VARCHAR(30) DEFAULT '021-5000-9999';

-- 3. Offline Idempotency, Lifecycle State, & Clock Skew Audit
-- A. attendances
ALTER TABLE attendances 
ADD COLUMN IF NOT EXISTS client_transaction_id VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS device_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_offline_sync BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(30) DEFAULT 'SYNCED',
ADD COLUMN IF NOT EXISTS clock_skew_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS clock_skew_flag BOOLEAN DEFAULT FALSE;

-- B. patrol_logs
ALTER TABLE patrol_logs 
ADD COLUMN IF NOT EXISTS client_transaction_id VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS device_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_offline_sync BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(30) DEFAULT 'SYNCED',
ADD COLUMN IF NOT EXISTS clock_skew_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS clock_skew_flag BOOLEAN DEFAULT FALSE;

-- C. cleaning_checklists
ALTER TABLE cleaning_checklists 
ADD COLUMN IF NOT EXISTS client_transaction_id VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS device_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_offline_sync BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(30) DEFAULT 'SYNCED';

-- D. driver_trip_logs
ALTER TABLE driver_trip_logs 
ADD COLUMN IF NOT EXISTS client_transaction_id VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS device_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_offline_sync BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(30) DEFAULT 'SYNCED';

-- E. emergency_alerts
ALTER TABLE emergency_alerts 
ADD COLUMN IF NOT EXISTS client_transaction_id VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS is_offline_sync BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(30) DEFAULT 'SYNCED';

-- 4. Precision Checkpoint Coordinates & Radius
ALTER TABLE checkpoints
ADD COLUMN IF NOT EXISTS coordinates GEOMETRY(Point, 4326),
ADD COLUMN IF NOT EXISTS allowed_radius_meters INT DEFAULT 25;

CREATE INDEX IF NOT EXISTS idx_checkpoints_coords ON checkpoints USING GIST (coordinates);

-- 5. Database Trigger: Sync users.role varchar with user_roles junction
CREATE OR REPLACE FUNCTION sync_user_role_to_user_roles()
RETURNS TRIGGER AS $$
DECLARE
    v_role_id UUID;
BEGIN
    SELECT id INTO v_role_id FROM roles WHERE code = NEW.role LIMIT 1;
    IF v_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (NEW.id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_user_role ON users;
CREATE TRIGGER trg_sync_user_role
AFTER INSERT OR UPDATE OF role ON users
FOR EACH ROW
EXECUTE FUNCTION sync_user_role_to_user_roles();

-- 6. Anti-Lockout Trigger: Protect the last active ADMIN_SUPER
CREATE OR REPLACE FUNCTION prevent_last_admin_super_removal()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_count INT;
    v_admin_role_id UUID;
BEGIN
    SELECT id INTO v_admin_role_id FROM roles WHERE code = 'ADMIN_SUPER';

    -- Triggered when removing role from user_roles
    IF (TG_OP = 'DELETE' AND OLD.role_id = v_admin_role_id) THEN
        SELECT COUNT(*) INTO v_admin_count 
        FROM user_roles ur
        JOIN users u ON u.id = ur.user_id
        WHERE ur.role_id = v_admin_role_id AND u.is_active = true AND u.is_approved = true;
        
        IF v_admin_count <= 1 THEN
            RAISE EXCEPTION 'Operasi ditolak: Sistem wajib mempertahankan minimal satu Super Administrator yang aktif.';
        END IF;
    END IF;

    -- Triggered when deactivating user in users
    IF (TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false) THEN
        IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = OLD.id AND role_id = v_admin_role_id) THEN
            SELECT COUNT(*) INTO v_admin_count 
            FROM user_roles ur
            JOIN users u ON u.id = ur.user_id
            WHERE ur.role_id = v_admin_role_id AND u.is_active = true AND u.id != OLD.id;
            
            IF v_admin_count = 0 THEN
                RAISE EXCEPTION 'Operasi ditolak: Tidak dapat menonaktifkan Super Administrator aktif terakhir.';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_removal ON user_roles;
CREATE TRIGGER trg_prevent_last_admin_removal
BEFORE DELETE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION prevent_last_admin_super_removal();

DROP TRIGGER IF EXISTS trg_prevent_last_admin_deactivation ON users;
CREATE TRIGGER trg_prevent_last_admin_deactivation
BEFORE UPDATE OF is_active ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_last_admin_super_removal();

-- 7. Seed Interface Separation and Granular Operational Permissions
INSERT INTO permissions (code, name, category, description) VALUES
-- Interface Separation
('admin.dashboard.access', 'Akses Command Center Admin', 'NAVIGATION', 'Izin memasuki antarmuka desktop web admin'),
('field.dashboard.access', 'Akses Aplikasi Mobile Lapangan', 'NAVIGATION', 'Izin memasuki antarmuka mobile field PWA'),

-- Master Data & Management
('DASHBOARD:VIEW', 'Lihat Komando Utama', 'SYSTEM', 'Melihat statistik operasional dan radar utama'),
('DATA_INDUK:VIEW', 'Lihat Data Induk', 'DATA_INDUK', 'Melihat area, checkpoint, dan personil'),
('DATA_INDUK:MANAGE', 'Kelola Data Induk', 'DATA_INDUK', 'Tambah, edit, hapus area dan checkpoint'),
('USER:VIEW', 'Lihat Personil', 'USER', 'Melihat daftar profil dan kontak personil'),
('USER:MANAGE', 'Kelola Personil', 'USER', 'Mengedit data personil, penugasan site, dan gaji'),
('USER:APPROVE', 'Approval Registrasi', 'USER', 'Menyetujui atau menolak pendaftaran personil baru'),
('RBAC:MANAGE', 'Kelola Role & Hak Akses', 'SYSTEM', 'Membuat peran kustom dan mengubah pemetaan izin'),

-- Attendance & Time Tracking
('ATTENDANCE:CHECK_IN', 'Presensi Masuk', 'ATTENDANCE', 'Clock-in selfie swafoto dan validasi geofence'),
('ATTENDANCE:CHECK_OUT', 'Presensi Pulang', 'ATTENDANCE', 'Clock-out dan kalkulasi durasi kerja efektif'),
('ATTENDANCE:LEAVE', 'Pengajuan Izin Sakit', 'ATTENDANCE', 'Mengajukan izin sakit dan cuti kerja'),
('ATTENDANCE:VIEW_OWN', 'Lihat Absensi Sendiri', 'ATTENDANCE', 'Melihat riwayat presensi pribadi 30 hari'),
('ABSENSI:VIEW', 'Monitoring Presensi Fasilitas', 'ATTENDANCE', 'Melihat log presensi dan matriks shift 31 hari'),
('ABSENSI:VERIFY', 'Koreksi & Verifikasi Absen', 'ATTENDANCE', 'Menyetujui absen offline berstatus NEEDS_REVIEW'),

-- Security Patrols
('PATROL:SCAN', 'Pindai Checkpoint QR', 'PATROL', 'Memindai barcode/QR rute checkpoint patroli'),
('PATROL:VIEW', 'Monitoring Matriks Patroli 24H', 'PATROL', 'Melihat matriks patroli per jam 00:00 s/d 23:00'),
('PATROL:VALIDATE', 'Validasi & Tindak Lanjut', 'PATROL', 'Memeriksa temuan abnormal dan tindak lanjut'),
('PATROL:HANDOVER', 'Serah Terima Shift Komandan', 'PATROL', 'Mengisi buku mutasi regu keamanan'),
('CHIEF:EVALUATE', 'Evaluasi Supervisi Chief', 'PATROL', 'Mengisi kartu penilaian kinerja komandan'),

-- Cleaning & Driver Operations
('CLEANING:SUBMIT', 'Checklist Sanitasi Kebersihan', 'CLEANING', 'Mengisi checklist kebersihan zona dan foto bukti'),
('CLEANING:VERIFY', 'Validasi Mutu Kebersihan', 'CLEANING', 'Memverifikasi hasil pembersihan zona lantai/toilet'),
('DRIVER:LOG_TRIP', 'Pencatatan Perjalanan Armada', 'DRIVER', 'Mencatat perjalanan armada dan foto odometer'),
('DRIVER:MONITOR', 'Monitoring Logistik Armada', 'DRIVER', 'Melihat log perjalanan dan kilometer kendaraan'),

-- Emergency & Broadcast
('SOS:TRIGGER', 'Pemicu Panic Button SOS', 'EMERGENCY', 'Menahan tombol darurat SOS 3 detik'),
('SOS:VIEW', 'Monitoring Radar Darurat SOS', 'EMERGENCY', 'Melihat peta radar dan sirine alarm aktif'),
('SOS:RESOLVE', 'Tangani Alarm Darurat SOS', 'EMERGENCY', 'Merespons dan menyelesaikan insiden darurat'),
('BROADCAST:SEND', 'Kirim Pesan Siaran', 'COMMUNICATION', 'Mengirim siaran pengumuman ke personil lapangan'),

-- Payroll & Exports
('GAJI:ACCESS', 'Akses Modul Penggajian', 'PAYROLL', 'Melihat rekapitulasi gaji dan cetak slip gaji'),
('LAPORAN:EXPORT', 'Ekspor Dokumen Resmi', 'REPORT', 'Mengekspor laporan PDF dan Excel HRIS')
ON CONFLICT (code) DO NOTHING;

-- 8. Map default permissions to standard roles
-- A. ADMIN_SUPER: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN_SUPER'
ON CONFLICT DO NOTHING;

-- B. OPS_MANAGER: All admin permissions except RBAC:MANAGE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'OPS_MANAGER' AND p.code NOT IN ('RBAC:MANAGE')
ON CONFLICT DO NOTHING;

-- C. SITE_SUPERVISOR / CHIEF
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'SITE_SUPERVISOR' AND p.code IN (
    'admin.dashboard.access', 'field.dashboard.access',
    'DASHBOARD:VIEW', 'DATA_INDUK:VIEW', 'USER:VIEW',
    'ABSENSI:VIEW', 'ABSENSI:VERIFY', 'PATROL:VIEW', 'PATROL:VALIDATE',
    'CHIEF:EVALUATE', 'CLEANING:VERIFY', 'DRIVER:MONITOR',
    'SOS:VIEW', 'SOS:RESOLVE', 'BROADCAST:SEND', 'LAPORAN:EXPORT'
)
ON CONFLICT DO NOTHING;

-- D. SECURITY_OFFICER (Field Satpam)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'SECURITY_OFFICER' AND p.code IN (
    'field.dashboard.access', 'ATTENDANCE:CHECK_IN', 'ATTENDANCE:CHECK_OUT',
    'ATTENDANCE:LEAVE', 'ATTENDANCE:VIEW_OWN', 'ACTIVITY:VIEW_OWN',
    'PATROL:SCAN', 'PATROL:HANDOVER', 'SOS:TRIGGER', 'PROFILE:MANAGE'
)
ON CONFLICT DO NOTHING;

-- E. CLEANER (Field Cleaning)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'CLEANER' AND p.code IN (
    'field.dashboard.access', 'ATTENDANCE:CHECK_IN', 'ATTENDANCE:CHECK_OUT',
    'ATTENDANCE:LEAVE', 'ATTENDANCE:VIEW_OWN', 'ACTIVITY:VIEW_OWN',
    'CLEANING:SUBMIT', 'SOS:TRIGGER', 'PROFILE:MANAGE'
)
ON CONFLICT DO NOTHING;

-- F. DRIVER (Logistics Driver)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'DRIVER' AND p.code IN (
    'field.dashboard.access', 'ATTENDANCE:CHECK_IN', 'ATTENDANCE:CHECK_OUT',
    'ATTENDANCE:LEAVE', 'ATTENDANCE:VIEW_OWN', 'ACTIVITY:VIEW_OWN',
    'DRIVER:LOG_TRIP', 'SOS:TRIGGER', 'PROFILE:MANAGE'
)
ON CONFLICT DO NOTHING;
```

---

## 4. Rollback Strategy & Data Preservation Protocol

Before running any migration on the database:
1. **Pre-Migration Backup**:
   ```bash
   docker exec -t postgres_container pg_dump -U postgres -d patrol_db --format=custom > backup_pre_migration_011.dump
   ```
2. **Safe Rollback Script**:
   Each `ALTER TABLE` statement uses non-destructive `ADD COLUMN IF NOT EXISTS`. Rolling back merely involves dropping newly added columns without altering preexisting data:
   ```sql
   ALTER TABLE users DROP COLUMN IF EXISTS requested_role_id;
   ALTER TABLE attendances DROP COLUMN IF EXISTS client_transaction_id, DROP COLUMN IF EXISTS device_timestamp, DROP COLUMN IF EXISTS sync_status, DROP COLUMN IF EXISTS clock_skew_flag;
   ALTER TABLE patrol_logs DROP COLUMN IF EXISTS client_transaction_id, DROP COLUMN IF EXISTS device_timestamp, DROP COLUMN IF EXISTS sync_status, DROP COLUMN IF EXISTS clock_skew_flag;
   DROP TRIGGER IF EXISTS trg_sync_user_role ON users;
   DROP TRIGGER IF EXISTS trg_prevent_last_admin_removal ON user_roles;
   DROP TRIGGER IF EXISTS trg_prevent_last_admin_deactivation ON users;
   ```
3. **Data Loss Prevention**: No existing columns or table rows are deleted during this migration.
