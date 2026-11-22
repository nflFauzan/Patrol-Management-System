-- ==============================================================================
-- PATROL MANAGEMENT SYSTEM — SUPABASE ALL-IN-ONE INITIALIZATION SCRIPT
-- PT Berdikari Maju Selaras, Bogor
-- Contains: Extensions + Schema + Corporate Seed Data + RBAC & Migrations
-- ==============================================================================

-- >>> PART 1: EXTENSIONS & CORE SCHEMA <<<
-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- 2. COMPANY PROFILE (Konfigurasi Tunggal Perusahaan & WhatsApp Gateway)
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(150) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(30),
    contact_email VARCHAR(100),
    logo_url TEXT,
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    
    -- Konfigurasi WhatsApp Gateway (Fonnte / Wablas)
    wa_gateway_provider VARCHAR(50) DEFAULT 'fonnte',
    wa_api_token TEXT,
    wa_emergency_group_id VARCHAR(100),
    is_wa_notifications_enabled BOOLEAN DEFAULT TRUE,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. SITES (Cabang / Fasilitas: Kantor Pusat, Pabrik, Gudang, Kawasan)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    address TEXT,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    geofence_radius_meters INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Konfigurasi Jam Kerja Shift per Fasilitas
    shift_pagi_in TIME DEFAULT '07:00:00',
    shift_pagi_out TIME DEFAULT '15:00:00',
    shift_siang_in TIME DEFAULT '15:00:00',
    shift_siang_out TIME DEFAULT '23:00:00',
    shift_malam_in TIME DEFAULT '23:00:00',
    shift_malam_out TIME DEFAULT '07:00:00',
    shift_staff_in TIME DEFAULT '08:00:00',
    shift_staff_out TIME DEFAULT '17:00:00',
    shift_chief_in TIME DEFAULT '08:00:00',
    shift_chief_out TIME DEFAULT '17:00:00',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sites_coords ON sites USING GIST (coordinates);

-- ============================================================================
-- 4. CHECKPOINTS (Titik Pantau Patroli / Sanitasi dengan Barcode QR Code)
-- ============================================================================
CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    qr_code_token VARCHAR(128) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Security', 'Cleaning Service'
    name VARCHAR(100) NOT NULL,
    location_detail VARCHAR(150),
    task_description TEXT,
    asset_type VARCHAR(100) DEFAULT 'General Asset',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_site ON checkpoints(site_id);
CREATE INDEX IF NOT EXISTS idx_checkpoints_token ON checkpoints(qr_code_token);

-- ============================================================================
-- 5. USERS (Personil: Satpam, Cleaning, Driver, Danru, Chief, Admin HR/GA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nik VARCHAR(50) UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(30),
    role VARCHAR(50) NOT NULL, -- 'SUPERADMIN', 'HR_GA_MANAGER', 'CHIEF_SECURITY', 'CLEANING_SUPERVISOR', 'DRIVER_COORDINATOR', 'DANRU', 'PETUGAS'
    division VARCHAR(50) NOT NULL, -- 'Security', 'Cleaning Service', 'Driver', 'Management'
    security_rank VARCHAR(50) DEFAULT 'ANGGOTA', -- 'ANGGOTA', 'KOMANDAN', 'CHIEF'
    working_hours_per_day INT DEFAULT 8,
    gaji_pokok NUMERIC(15,2) DEFAULT 0,
    tunjangan NUMERIC(15,2) DEFAULT 0,
    lembur_per_jam NUMERIC(15,2) DEFAULT 0,
    potongan_bpjs NUMERIC(15,2) DEFAULT 0,
    potongan_alpa NUMERIC(15,2) DEFAULT 0,
    potongan_lupa_absen NUMERIC(15,2) DEFAULT 0,
    photo_key TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_division ON users(division);

-- ============================================================================
-- 6. USER SITE ASSIGNMENTS (Penugasan Fasilitas Petugas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_site_assignments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, site_id)
);

-- ============================================================================
-- 7. ATTENDANCES (Presensi Masuk, Pulang, dan Izin - HRIS Ready)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    status_type INT NOT NULL, -- 1 = Hadir Masuk, 2 = Selesai Pulang, 3 = Izin/Sakit
    shift_name VARCHAR(50),
    reason VARCHAR(100),
    notes TEXT,
    attachment_key TEXT,
    
    -- Check-in Data
    clock_in_at TIMESTAMP WITH TIME ZONE,
    clock_in_coordinates GEOMETRY(Point, 4326),
    clock_in_photo_key TEXT,
    clock_in_distance_meters NUMERIC(8,2),
    is_late BOOLEAN DEFAULT FALSE,
    late_minutes INT DEFAULT 0,
    
    -- Check-out Data
    clock_out_at TIMESTAMP WITH TIME ZONE,
    clock_out_coordinates GEOMETRY(Point, 4326),
    clock_out_photo_key TEXT,
    clock_out_distance_meters NUMERIC(8,2),
    
    -- Kalkulasi Jam Kerja untuk HRIS
    work_duration_minutes INT DEFAULT 0,
    overtime_minutes INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendances_user ON attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_attendances_site ON attendances(site_id);
CREATE INDEX IF NOT EXISTS idx_attendances_coords ON attendances USING GIST (clock_in_coordinates);

-- ============================================================================
-- 8. PATROL LOGS (Log Patroli Checkpoint & Temuan Kejanggalan)
-- ============================================================================
CREATE TABLE IF NOT EXISTS patrol_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    status_result VARCHAR(50) NOT NULL, -- 'Situasi Aman Terkendali', 'Perlu Tindak Lanjut'
    notes TEXT,
    photo_key TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patrol_logs_site_date ON patrol_logs(site_id, scanned_at);
CREATE INDEX IF NOT EXISTS idx_patrol_logs_checkpoint ON patrol_logs(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_patrol_logs_coords ON patrol_logs USING GIST (coordinates);

-- ============================================================================
-- 9. INCIDENT TICKETS (Tiket Tindak Lanjut Temuan Petugas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS incident_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    patrol_log_id UUID NOT NULL REFERENCES patrol_logs(id) ON DELETE CASCADE,
    
    ticket_status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED'
    reported_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolution_photo_key TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incident_tickets_status ON incident_tickets(ticket_status);

-- ============================================================================
-- 10. EMERGENCY ALERTS (Panic Button SOS Terintegrasi WhatsApp Gateway)
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    alert_status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'
    
    is_whatsapp_dispatched BOOLEAN DEFAULT FALSE,
    whatsapp_dispatch_response TEXT,
    
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(alert_status);
CREATE INDEX IF NOT EXISTS idx_emergency_coords ON emergency_alerts USING GIST (coordinates);

-- ============================================================================
-- 11. CLEANING CHECKLISTS (Checklist Sanitasi Area Divisi Kebersihan)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
    officer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    floor_cleaned BOOLEAN DEFAULT TRUE,
    trash_emptied BOOLEAN DEFAULT TRUE,
    supplies_restocked BOOLEAN DEFAULT TRUE,
    odor_normal BOOLEAN DEFAULT TRUE,
    notes TEXT,
    photo_key TEXT,
    inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cleaning_checkpoint ON cleaning_checklists(checkpoint_id, inspected_at);

-- ============================================================================
-- 12. DRIVER TRIP LOGS (Log Perjalanan Armada Kendaraan Operasional)
-- ============================================================================
CREATE TABLE IF NOT EXISTS driver_trip_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    vehicle_plate_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    origin_location VARCHAR(150) NOT NULL,
    destination_location VARCHAR(150) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    arrived_at TIMESTAMP WITH TIME ZONE,
    trip_status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    odometer_start INT,
    odometer_end INT,
    trip_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_driver_trip_status ON driver_trip_logs(trip_status);

-- ============================================================================
-- 13. SHIFT HANDOVERS (Buku Mutasi / Serah Terima Shift Komandan Regu)
-- ============================================================================
CREATE TABLE IF NOT EXISTS shift_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    danru_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    shift_name VARCHAR(50) NOT NULL,
    handover_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    personnel_on_duty_count INT NOT NULL,
    weapons_inventory_notes TEXT,
    general_notes TEXT,
    next_danru_id UUID REFERENCES users(id)
);

-- ============================================================================
-- 14. BROADCAST MESSAGES (Pesan Siaran Pengumuman Internal)
-- ============================================================================
CREATE TABLE IF NOT EXISTS broadcast_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(30) DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 15. CHIEF EVALUATIONS (Supervisi Mutu & Penilaian Komandan oleh Chief)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chief_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    chief_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    komandan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    discipline_score INT DEFAULT 100,
    coordination_score INT DEFAULT 100,
    attendance_score INT DEFAULT 100,
    incident_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chief_eval_site ON chief_evaluations(site_id);

-- ============================================================================
-- 16. STAFF ACTIVITY LOGS (Laporan Kegiatan Staf Operasional Non-Lapangan)
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_act_site ON staff_activity_logs(site_id);

-- ============================================================================
-- 17. SPATIAL GEOFENCING FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION is_within_site_geofence(
    p_site_id UUID,
    p_lng DOUBLE PRECISION,
    p_lat DOUBLE PRECISION
)
RETURNS TABLE (
    is_valid BOOLEAN,
    distance_meters NUMERIC,
    max_radius_meters INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ST_DWithin(
            s.coordinates::geography,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
            s.geofence_radius_meters
        ) AS is_valid,
        ROUND(
            ST_Distance(
                s.coordinates::geography,
                ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
            )::numeric, 
            2
        ) AS distance_meters,
        s.geofence_radius_meters AS max_radius_meters
    FROM sites s
    WHERE s.id = p_site_id;
END;
$$;


-- >>> PART 2: PT BERDIKARI MAJU SELARAS SEED DATA <<<
-- ============================================================================
-- 02_SEED_DATA.SQL
-- Initial Enterprise Seed Data for Patrol Management System
-- ============================================================================

-- 1. Company Profile
INSERT INTO
    company_profile (
        company_name,
        contact_phone,
        contact_email,
        timezone,
        wa_gateway_provider,
        wa_emergency_group_id,
        is_wa_notifications_enabled
    )
VALUES (
        'PT Berdikari Maju Selaras',
        '0812-9988-7766',
        'support@berdikarimajuselaras.id',
        'Asia/Jakarta',
        'fonnte',
        '120363041234567890@g.us',
        TRUE
    );

-- 2. Sites (Fasilitas Operasional Korporat)
INSERT INTO
    sites (
        id,
        name,
        address,
        coordinates,
        geofence_radius_meters,
        is_active
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Kantor Pusat & Operasional Bogor',
        'Jl. Raya Sholeh Iskandar No. 22–23, RT.01/RW.09, Kedung Jaya, Tanah Sareal, Kota Bogor, Jawa Barat 16164',
        ST_SetSRID (
            ST_MakePoint (106.810320, -6.564061),
            4326
        ),
        100,
        TRUE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Pos Logistik & Distribusi Mitra',
        'Kawasan Industri Sentul, Jl. Babakan Madang, Kabupaten Bogor, Jawa Barat',
        ST_SetSRID (
            ST_MakePoint (106.857800, -6.535000),
            4326
        ),
        200,
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Checkpoints (Titik Pantau Patroli & Sanitasi)
INSERT INTO
    checkpoints (
        id,
        site_id,
        qr_code_token,
        category,
        name,
        location_detail,
        task_description,
        is_active
    )
VALUES (
        'c1111111-1111-1111-1111-111111111101',
        '11111111-1111-1111-1111-111111111111',
        'QR-BMS-GATE-01',
        'Security',
        'Pos Gerbang Masuk Sholeh Iskandar',
        'Gate A Pintu Masuk Utama',
        'Periksa ID Card pengunjung dan kendaraan masuk',
        TRUE
    ),
    (
        'c1111111-1111-1111-1111-111111111102',
        '11111111-1111-1111-1111-111111111111',
        'QR-BMS-LOBBY-02',
        'Security',
        'Lobby & Resepsionis Lt 1',
        'Main Hall Kantor',
        'Pastikan area steril dan pintu akses tertutup rapat',
        TRUE
    ),
    (
        'c1111111-1111-1111-1111-111111111103',
        '11111111-1111-1111-1111-111111111111',
        'QR-BMS-SERVER-03',
        'Security',
        'Ruang Server IT Lt 3',
        'Ruang 304 Khusus IT',
        'Cek suhu AC server dan lampu indikator UPS',
        TRUE
    ),
    (
        'c1111111-1111-1111-1111-111111111104',
        '11111111-1111-1111-1111-111111111111',
        'QR-BMS-HYDRANT-04',
        'Security',
        'Tangga Darurat & Hydrant',
        'Koridor Darurat Barat',
        'Pastikan jalur evakuasi bebas rintangan dan tekanan APAR normal',
        TRUE
    ),
    (
        'c1111111-1111-1111-1111-111111111105',
        '11111111-1111-1111-1111-111111111111',
        'QR-BMS-CLEAN-05',
        'Cleaning Service',
        'Restroom & Sanitasi Lt 2',
        'Toilet Pria & Wanita Lt 2',
        'Checklist sanitasi, pembersihan lantai, dan refill sabun',
        TRUE
    ),
    (
        'c2222222-2222-2222-2222-222222222201',
        '22222222-2222-2222-2222-222222222222',
        'QR-DST-GATE-01',
        'Security',
        'Pos Keamanan Gerbang Distribusi',
        'Pintu Masuk Truk',
        'Periksa surat jalan armada dan supir logistik',
        TRUE
    ),
    (
        'c2222222-2222-2222-2222-222222222202',
        '22222222-2222-2222-2222-222222222222',
        'QR-DST-DOCK-02',
        'Security',
        'Loading Dock Bongkar Muat',
        'Dock 1 - 4',
        'Pastikan ganjal roda truk terpasang saat aktivitas bongkar muat',
        TRUE
    )
ON CONFLICT (qr_code_token) DO NOTHING;

-- 4. Enterprise Personnel (Seed Users)
INSERT INTO
    users (
        id,
        nik,
        username,
        password_hash,
        full_name,
        phone_number,
        role,
        division,
        security_rank,
        working_hours_per_day,
        gaji_pokok,
        tunjangan,
        lembur_per_jam,
        is_active
    )
VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'NIK-ADM-001',
        'admin',
        '$2a$10$dyNM/NFQ4Lz05LFJkqvf9O64IXyGt8Ap0psrrYwXkL.PP.HsuoN8K',
        'Administrator Utama',
        '0812-1111-2222',
        'ADMIN_SUPER',
        'STAFF',
        'ANGGOTA',
        8,
        8000000,
        2000000,
        50000,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        'NIK-SEC-CHIEF-01',
        'hendra.chief',
        '$2a$10$jWHXFJBLNec8P/zLG.I5huqHTBat7q76ILTKjRjOL5BvCSx6QTjq6',
        'Hendra Wijaya',
        '0812-3333-4444',
        'SECURITY_OFFICER',
        'SECURITY',
        'CHIEF',
        8,
        7000000,
        1500000,
        45000,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000005',
        'NIK-SEC-DANRU-01',
        'satpamtest',
        '$2a$10$mUymTIhbE610TWCY4m3tFOxEvk7zHA/xE/dnKMoSDLcAffE3OL4eG',
        'Ahmad Fauzi',
        '0812-5555-6666',
        'SECURITY_OFFICER',
        'SECURITY',
        'KOMANDAN',
        8,
        6000000,
        1200000,
        40000,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000006',
        'NIK-SEC-001',
        'buditest',
        '$2a$10$YcjeELAssnF4TzlAr8O55.Al9FHH2arNJ63k0iZSf3/5Ebat9rAri',
        'Budi Santoso',
        '0812-7777-8888',
        'SECURITY_OFFICER',
        'SECURITY',
        'ANGGOTA',
        8,
        5200000,
        800000,
        30000,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000007',
        'NIK-CLN-001',
        'akmal',
        '$2a$10$aa./lnvHrRy0P5NxkxEKxumiltqZclhpM7EcOno7j0ndtfntzhj/.',
        'Akmal Subagja',
        '0812-9999-0000',
        'CLEANER',
        'CLEANING',
        'ANGGOTA',
        8,
        4800000,
        500000,
        25000,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000008',
        'NIK-DRV-001',
        'dedi.driver',
        '$2a$10$2HIoI.H0Zz09MdrHkawsAeNu4UU6tqgvqVchIRzMsqG2UhVRfEIwi',
        'Dedi Supriyadi',
        '0812-2222-3333',
        'DRIVER',
        'DRIVER',
        'ANGGOTA',
        8,
        5000000,
        700000,
        30000,
        true
    )
ON CONFLICT (username) DO NOTHING;

-- 5. User Site Assignments
INSERT INTO
    user_site_assignments (user_id, site_id)
VALUES (
        'a0000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'a0000000-0000-0000-0000-000000000001',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'a0000000-0000-0000-0000-000000000005',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'a0000000-0000-0000-0000-000000000006',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'a0000000-0000-0000-0000-000000000007',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'a0000000-0000-0000-0000-000000000008',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'a0000000-0000-0000-0000-000000000005',
        '22222222-2222-2222-2222-222222222222'
    )
ON CONFLICT DO NOTHING;

-- >>> PART 3: RBAC & APPROVAL MIGRATION (010) <<<
-- ============================================================================
-- 010_rbac_and_approval.sql
-- Enterprise RBAC (roles, permissions, role_permissions, user_roles)
-- and User Approval & Lockout Audit Fields
-- ============================================================================

-- 1. Master Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Relasi Role - Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Relasi User - Roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 5. Audit & Approval Fields pada Users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Indeks Performa
CREATE INDEX IF NOT EXISTS idx_users_approval ON users(is_approved, is_active);
CREATE INDEX IF NOT EXISTS idx_users_nik ON users(nik);

-- 6. Seed Permissions
INSERT INTO permissions (code, name, category, description) VALUES
('DATA_INDUK:VIEW', 'Lihat Data Induk', 'DATA_INDUK', 'Melihat area, checkpoint, dan personil'),
('DATA_INDUK:MANAGE', 'Kelola Data Induk', 'DATA_INDUK', 'Tambah, edit, hapus area, checkpoint, personil'),
('USER:APPROVE', 'Approval Registrasi', 'USER', 'Menyetujui atau menolak pendaftaran personil baru'),
('RBAC:MANAGE', 'Kelola Role & Hak Akses', 'SYSTEM', 'Mengatur penugasan izin peran kustom'),
('ABSENSI:VIEW', 'Melihat Data Absensi', 'ATTENDANCE', 'Melihat log presensi dan matriks shift'),
('ABSENSI:VERIFY', 'Koreksi & Verifikasi Absen', 'ATTENDANCE', 'Menyetujui izin, lembur, dan absensi manual'),
('PATROL:VALIDATE', 'Validasi Patroli Lapangan', 'PATROL', 'Memeriksa temuan abnormal dan tindak lanjut patroli'),
('CLEANING:VERIFY', 'Validasi Kebersihan', 'CLEANING', 'Memverifikasi checklist dan sanitasi'),
('DRIVER:MONITOR', 'Monitoring Logistik Driver', 'DRIVER', 'Melihat log armada dan kilometer kendaraan'),
('GAJI:ACCESS', 'Akses Modul Penggajian', 'PAYROLL', 'Melihat dan mengekspor rekapitulasi slip gaji'),
('LAPORAN:EXPORT', 'Ekspor Laporan Resmi', 'REPORT', 'Mengekspor laporan PDF dan Excel'),
('BROADCAST:SEND', 'Kirim Pesan Siaran', 'COMMUNICATION', 'Mengirim siaran ke personil lapangan'),
('SOS:RESOLVE', 'Tangani Alarm SOS Darurat', 'EMERGENCY', 'Merespons dan menyelesaikan insiden Panic SOS')
ON CONFLICT (code) DO NOTHING;

-- 7. Seed Roles Bawaan
INSERT INTO roles (code, name, description, is_system) VALUES
('ADMIN_SUPER', 'Super Administrator', 'Akses penuh ke seluruh modul, konfigurasi sistem, dan RBAC', TRUE),
('OPS_MANAGER', 'Operations Manager', 'Pengawasan seluruh site, laporan analitik, dan persetujuan personil', TRUE),
('SITE_SUPERVISOR', 'Site Supervisor / Chief Security', 'Operasional pos dan personil pada site yang ditugaskan', TRUE),
('HRD_PAYROLL', 'Staf HRD & Penggajian', 'Pengelolaan presensi, shift, dan rekapitulasi gaji personil', TRUE),
('SECURITY_OFFICER', 'Petugas Keamanan (Satpam)', 'Patroli checkpoint QR, geofence, laporan insiden, dan Panic SOS', TRUE),
('CLEANER', 'Petugas Cleaning Service', 'Checklist sanitasi berkala zona lantai dan toilet', TRUE),
('DRIVER', 'Driver Logistik Armada', 'Pencatatan rute, armada, dan kilometer perjalanan', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 8. Map ADMIN_SUPER ke seluruh permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN_SUPER'
ON CONFLICT DO NOTHING;

-- Map OPS_MANAGER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'OPS_MANAGER' AND p.code IN (
    'DATA_INDUK:VIEW', 'USER:APPROVE', 'ABSENSI:VIEW', 'ABSENSI:VERIFY',
    'PATROL:VALIDATE', 'CLEANING:VERIFY', 'DRIVER:MONITOR', 'LAPORAN:EXPORT',
    'BROADCAST:SEND', 'SOS:RESOLVE'
)
ON CONFLICT DO NOTHING;

-- Map SITE_SUPERVISOR permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'SITE_SUPERVISOR' AND p.code IN (
    'DATA_INDUK:VIEW', 'ABSENSI:VIEW', 'PATROL:VALIDATE', 'CLEANING:VERIFY',
    'DRIVER:MONITOR', 'LAPORAN:EXPORT', 'BROADCAST:SEND', 'SOS:RESOLVE'
)
ON CONFLICT DO NOTHING;

-- Map HRD_PAYROLL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'HRD_PAYROLL' AND p.code IN (
    'DATA_INDUK:VIEW', 'ABSENSI:VIEW', 'ABSENSI:VERIFY', 'GAJI:ACCESS', 'LAPORAN:EXPORT'
)
ON CONFLICT DO NOTHING;

-- Map OPERATIONAL roles permissions (Satpam, Cleaner, Driver)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'SECURITY_OFFICER' AND p.code IN ('PATROL:VALIDATE', 'SOS:RESOLVE')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'CLEANER' AND p.code IN ('CLEANING:VERIFY', 'SOS:RESOLVE')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'DRIVER' AND p.code IN ('DRIVER:MONITOR', 'SOS:RESOLVE')
ON CONFLICT DO NOTHING;

-- 9. Map existing users to seeded roles based on their role column
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u
JOIN roles r ON r.code = u.role
ON CONFLICT DO NOTHING;


-- >>> PART 4: PORTAL PERMISSIONS & REQUESTED ROLE (011) <<<
-- ============================================================================
-- 011_add_portal_permissions_and_requested_role.sql
-- Add requested_role & requested_division for registration workflow
-- and Master Portal Permissions (ADMIN:DASHBOARD_ACCESS & FIELD:DASHBOARD_ACCESS)
-- ============================================================================

-- 1. Add requested role and division columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS requested_role VARCHAR(50),
ADD COLUMN IF NOT EXISTS requested_division VARCHAR(50);

-- 2. Add Portal Dashboard Access Permissions
INSERT INTO permissions (code, name, category, description) VALUES
('ADMIN:DASHBOARD_ACCESS', 'Akses Dashboard Web Admin', 'PORTAL', 'Izin untuk membuka dan menggunakan Command Center Web Admin'),
('FIELD:DASHBOARD_ACCESS', 'Akses Dashboard Mobile PWA', 'PORTAL', 'Izin untuk membuka dan menggunakan aplikasi lapangan PWA')
ON CONFLICT (code) DO NOTHING;

-- 3. Assign Portal Permissions to Roles
-- ADMIN_SUPER gets both Admin and Field access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN_SUPER' AND p.code IN ('ADMIN:DASHBOARD_ACCESS', 'FIELD:DASHBOARD_ACCESS')
ON CONFLICT DO NOTHING;

-- OPS_MANAGER gets Admin access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'OPS_MANAGER' AND p.code IN ('ADMIN:DASHBOARD_ACCESS')
ON CONFLICT DO NOTHING;

-- SITE_SUPERVISOR gets both Admin and Field access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'SITE_SUPERVISOR' AND p.code IN ('ADMIN:DASHBOARD_ACCESS', 'FIELD:DASHBOARD_ACCESS')
ON CONFLICT DO NOTHING;

-- HRD_PAYROLL gets Admin access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'HRD_PAYROLL' AND p.code IN ('ADMIN:DASHBOARD_ACCESS')
ON CONFLICT DO NOTHING;

-- Operational field roles get Field access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('SECURITY_OFFICER', 'CLEANER', 'DRIVER') AND p.code = 'FIELD:DASHBOARD_ACCESS'
ON CONFLICT DO NOTHING;
