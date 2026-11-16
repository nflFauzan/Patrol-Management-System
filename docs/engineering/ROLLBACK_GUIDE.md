# Rollback Strategy & Disaster Recovery Guide
> **Patrol & Facility Management System (Enterprise In-House)**  
> Emergency restoration procedures, database rollback commands, and operational mitigation.

---

## 1. Rollback Scenarios & Triggers

A rollback is mandatory in any of the following events:
1. Critical database corruption or migration incompatibility.
2. Unrecoverable deployment regression causing 502/503 errors on the Gateway.
3. Security breach or severe authentication bypass discovered in production.

---

## 2. Git & Application Code Rollback

### Step 1: Identify Last Known Stable Commit
The baseline stable commit before the Phase 1–7 improvements is:
- **Baseline Commit**: `6df80bf` (`feat(baseline): phase 0 verified baseline and backup documentation`)

### Step 2: Checkout / Revert Branch
```bash
# Save any critical untracked logs or artifacts
git stash save "uncommitted-state"

# Reset working branch to baseline commit
git checkout feature/patrol-system-improvements
git revert <faulty_commit_hash>
# Or hard reset if emergency on dedicated branch:
# git reset --hard 6df80bf
```

### Step 3: Rebuild Workspace Packages
```bash
npm run build --workspace=@patrol/types
npm run build --workspace=@patrol/backend
npm run build --workspace=@patrol/pwa-field
npm run build --workspace=@patrol/web-admin
```

---

## 3. Database Restoration from Verified Backup

A full verified backup was created in Phase 0 and confirmed restorable:
- **Backup File**: `backups/patrol_management_backup_20261116_174238.dump`
- **Format**: PostgreSQL custom format archive (`pg_dump -Fc`)
- **Verified Contents**: 22 tables, 7 roles, 6 users, 2 sites, 7 checkpoints.

### Step 1: Disconnect Active Backend Connections
```bash
docker exec patrol_postgres psql -U patrol_admin -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'patrol_management' AND pid <> pg_backend_pid();"
```

### Step 2: Drop and Recreate Database
```bash
docker exec patrol_postgres dropdb -U patrol_admin patrol_management
docker exec patrol_postgres createdb -U patrol_admin patrol_management
```

### Step 3: Restore Database Dump
```bash
docker exec -i patrol_postgres pg_restore -U patrol_admin -d patrol_management < backups/patrol_management_backup_20261116_174238.dump
```

### Step 4: Verify Restoration Integrity
```bash
node scripts/check-db.js
```
Expected output:
```
Testing PostgreSQL & PostGIS connection...
✅ Connection Successful!
- Database: PostgreSQL 17.11 on x86_64-pc-linux-musl
- PostGIS: 3.5 USE_GEOS=1 USE_PROJ=1 USE_STATS=1
- Seeded Sites: 2
- Seeded Checkpoints: 7
- Seeded Users: 6
```

---

## 4. Frontend & Service Worker Cache Invalidation

When rolling back PWA clients:
1. PWA clients running in production cache assets via Service Worker.
2. In `apps/pwa-field/vite.config.ts`, increment `VitePWA` version or trigger `workbox.skipWaiting()`.
3. Client Service Worker automatically evicts stale precache entries and fetches updated bundles on next page refresh.
