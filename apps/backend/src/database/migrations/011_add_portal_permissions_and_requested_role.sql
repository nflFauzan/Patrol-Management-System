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
