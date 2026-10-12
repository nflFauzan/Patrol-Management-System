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
