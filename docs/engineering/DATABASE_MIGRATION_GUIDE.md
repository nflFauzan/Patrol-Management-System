# Database Migration & Schema Guide
> **Patrol & Facility Management System (Enterprise In-House)**  
> PostgreSQL 17 + PostGIS 3.5 Schema Architecture and Migration Execution Procedures.

---

## 1. Database Architecture & Technology Stack

- **RDBMS Engine**: PostgreSQL 17.11 (Alpine Linux Docker container `patrol_postgres`)
- **Spatial Extension**: PostGIS 3.5 (`USE_GEOS=1 USE_PROJ=1 USE_STATS=1`)
- **Port Mapping**: Host port `5433` mapped to Container port `5432`
- **Default Database**: `patrol_management`
- **Administrative User**: `patrol_admin`

---

## 2. Key Tables & Schema Definitions

### A. Authentication, Users & Approval (`users`)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    division VARCHAR(50) NOT NULL,
    security_rank VARCHAR(50) DEFAULT 'ANGGOTA',
    working_hours_per_day NUMERIC(4,2) DEFAULT 8.00,
    gaji_pokok NUMERIC(12,2) DEFAULT 0,
    tunjangan NUMERIC(12,2) DEFAULT 0,
    lembur_per_jam NUMERIC(12,2) DEFAULT 0,
    potongan_bpjs NUMERIC(12,2) DEFAULT 0,
    potongan_alpa NUMERIC(12,2) DEFAULT 0,
    potongan_lupa_absen NUMERIC(12,2) DEFAULT 0,
    photo_key TEXT,
    is_active BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    requested_role VARCHAR(100),
    requested_division VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### B. Dynamic Role-Based Access Control (`roles`, `permissions`, `role_permissions`, `user_roles`)
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);
```

### C. Checkpoints & PostGIS Spatial Geofencing (`checkpoints`, `patrol_logs`)
```sql
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    location_detail TEXT,
    task_description TEXT,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patrol_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    status_result VARCHAR(50) NOT NULL,
    notes TEXT,
    photo_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patrol_logs_coords ON patrol_logs USING GIST (coordinates);
CREATE INDEX idx_patrol_logs_checkpoint ON patrol_logs (checkpoint_id);
CREATE INDEX idx_patrol_logs_site_date ON patrol_logs (site_id, scanned_at);
```

### D. Attendance & Shifts (`attendances`)
```sql
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status_type INT NOT NULL, -- 1: Clock In, 2: Clock Out, 3: Sick, 4: Permission
    shift_name VARCHAR(50),
    reason VARCHAR(100),
    notes TEXT,
    attachment_key TEXT,
    clock_in_at TIMESTAMP WITH TIME ZONE,
    clock_in_coordinates GEOMETRY(Point, 4326),
    clock_in_photo_key TEXT,
    clock_in_distance_meters NUMERIC(8,2),
    is_late BOOLEAN DEFAULT false,
    late_minutes INT DEFAULT 0,
    clock_out_at TIMESTAMP WITH TIME ZONE,
    clock_out_coordinates GEOMETRY(Point, 4326),
    clock_out_photo_key TEXT,
    clock_out_distance_meters NUMERIC(8,2),
    work_duration_minutes INT DEFAULT 0,
    overtime_minutes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Migration History & Execution

Migrations are stored in `apps/backend/src/database/migrations/`:

| File | Description | Status |
| :--- | :--- | :--- |
| `010_rbac_and_approval.sql` | Introduces `roles`, `permissions`, `role_permissions`, `user_roles`, approval queue columns, and account lockout tracking. | Applied & Verified |
| `011_add_portal_permissions_and_requested_role.sql` | Adds `ADMIN:DASHBOARD_ACCESS` and `FIELD:DASHBOARD_ACCESS` permissions, adds `requested_role` and `requested_division` to `users`. | Applied & Verified |

### Applying Migrations Manually
```bash
docker exec -i patrol_postgres psql -U patrol_admin -d patrol_management < apps/backend/src/database/migrations/011_add_portal_permissions_and_requested_role.sql
```

### Verifying Schema Integrity
```bash
node scripts/check-db.js
node scripts/check-rbac-db.js
```
