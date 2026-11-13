-- ============================================================================
-- 02_SEED_DATA.SQL
-- Initial Enterprise Seed Data for Patrol Management System
-- ============================================================================

-- 1. Company Profile
INSERT INTO company_profile (
    company_name, contact_phone, contact_email, timezone,
    wa_gateway_provider, wa_emergency_group_id, is_wa_notifications_enabled
)
VALUES (
    'PT Mahakarya Facility & Security Enterprise',
    '0812-9988-7766',
    'support@mahakarya-ops.co.id',
    'Asia/Jakarta',
    'fonnte',
    '120363041234567890@g.us',
    TRUE
);

-- 2. Sites (Fasilitas Operasional Korporat)
INSERT INTO sites (id, name, address, coordinates, geofence_radius_meters, is_active)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'Head Office Sudirman',
        'Sudirman Central Business District (SCBD) Lot 28, Senayan, Jakarta Selatan',
        ST_SetSRID(ST_MakePoint(106.8055, -6.2215), 4326),
        100,
        TRUE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Warehouse & Logistics Hub Cikarang',
        'Kawasan Industri GIIC Blok AA No. 12, Cikarang Pusat, Kabupaten Bekasi',
        ST_SetSRID(ST_MakePoint(107.1685, -6.3533), 4326),
        250,
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Checkpoints (Titik Pantau Patroli & Sanitasi)
INSERT INTO checkpoints (id, site_id, qr_code_token, category, name, location_detail, task_description, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111111', 'QR-HQ-GATE-01', 'Security', 'Pos Utama Gerbang Masuk', 'Gate A Pintu Barat', 'Periksa ID Card pengunjung dan kendaraan masuk', TRUE),
    ('c1111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111111', 'QR-HQ-LOBBY-02', 'Security', 'Lobby & Resepsionis Lt 1', 'Main Hall', 'Pastikan area steril dan pintu akses tertutup rapat', TRUE),
    ('c1111111-1111-1111-1111-111111111103', '11111111-1111-1111-1111-111111111111', 'QR-HQ-SERVER-03', 'Security', 'Ruang Server IT Lt 3', 'Ruang 304 Khusus IT', 'Cek suhu AC server dan lampu indikator UPS', TRUE),
    ('c1111111-1111-1111-1111-111111111104', '11111111-1111-1111-1111-111111111111', 'QR-HQ-HYDRANT-04', 'Security', 'Tangga Darurat & Hydrant', 'Koridor Darurat Barat', 'Pastikan jalur evakuasi bebas rintangan dan tekanan APAR normal', TRUE),
    ('c1111111-1111-1111-1111-111111111105', '11111111-1111-1111-1111-111111111111', 'QR-HQ-CLEAN-05', 'Cleaning Service', 'Restroom & Sanitasi Lt 2', 'Toilet Pria & Wanita Lt 2', 'Checklist sanitasi, pembersihan lantai, dan refill sabun', TRUE),
    
    ('c2222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222222', 'QR-CKR-GATE-01', 'Security', 'Pos Keamanan Gerbang Gudang', 'Pintu Masuk Truk', 'Periksa surat jalan armada dan supir logistik', TRUE),
    ('c2222222-2222-2222-2222-222222222202', '22222222-2222-2222-2222-222222222222', 'QR-CKR-DOCK-02', 'Security', 'Loading Dock Bongkar Muat', 'Dock 1 - 4', 'Pastikan ganjal roda truk terpasang saat aktivitas bongkar muat', TRUE)
ON CONFLICT (qr_code_token) DO NOTHING;

-- 4. Enterprise Personnel (Seed Users)
INSERT INTO users (id, nik, username, password_hash, full_name, phone_number, role, division, security_rank, working_hours_per_day, gaji_pokok, tunjangan, lembur_per_jam, is_active)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'NIK-ADM-001', 'admin', '$2a$10$dyNM/NFQ4Lz05LFJkqvf9O64IXyGt8Ap0psrrYwXkL.PP.HsuoN8K', 'Administrator Utama', '0812-1111-2222', 'ADMIN_SUPER', 'STAFF', 'ANGGOTA', 8, 8000000, 2000000, 50000, true),
    ('a0000000-0000-0000-0000-000000000004', 'NIK-SEC-CHIEF-01', 'hendra.chief', '$2a$10$jWHXFJBLNec8P/zLG.I5huqHTBat7q76ILTKjRjOL5BvCSx6QTjq6', 'Hendra Wijaya', '0812-3333-4444', 'SECURITY_OFFICER', 'SECURITY', 'CHIEF', 8, 7000000, 1500000, 45000, true),
    ('a0000000-0000-0000-0000-000000000005', 'NIK-SEC-DANRU-01', 'satpamtest', '$2a$10$mUymTIhbE610TWCY4m3tFOxEvk7zHA/xE/dnKMoSDLcAffE3OL4eG', 'Ahmad Fauzi', '0812-5555-6666', 'SECURITY_OFFICER', 'SECURITY', 'KOMANDAN', 8, 6000000, 1200000, 40000, true),
    ('a0000000-0000-0000-0000-000000000006', 'NIK-SEC-001', 'buditest', '$2a$10$YcjeELAssnF4TzlAr8O55.Al9FHH2arNJ63k0iZSf3/5Ebat9rAri', 'Budi Santoso', '0812-7777-8888', 'SECURITY_OFFICER', 'SECURITY', 'ANGGOTA', 8, 5200000, 800000, 30000, true),
    ('a0000000-0000-0000-0000-000000000007', 'NIK-CLN-001', 'akmal', '$2a$10$aa./lnvHrRy0P5NxkxEKxumiltqZclhpM7EcOno7j0ndtfntzhj/.', 'Akmal Subagja', '0812-9999-0000', 'CLEANER', 'CLEANING', 'ANGGOTA', 8, 4800000, 500000, 25000, true),
    ('a0000000-0000-0000-0000-000000000008', 'NIK-DRV-001', 'dedi.driver', '$2a$10$2HIoI.H0Zz09MdrHkawsAeNu4UU6tqgvqVchIRzMsqG2UhVRfEIwi', 'Dedi Supriyadi', '0812-2222-3333', 'DRIVER', 'DRIVER', 'ANGGOTA', 8, 5000000, 700000, 30000, true)
ON CONFLICT (username) DO NOTHING;

-- 5. User Site Assignments
INSERT INTO user_site_assignments (user_id, site_id)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
    ('a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
    ('a0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111'),
    ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111'),
    ('a0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111'),
    ('a0000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111'),
    ('a0000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111'),
    ('a0000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;
