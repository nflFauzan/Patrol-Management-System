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
