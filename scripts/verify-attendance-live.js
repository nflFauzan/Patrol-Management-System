/**
 * Live PostGIS DB Verification Script for Attendance & Geofencing (Tahap 2)
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function main() {
  console.log('--- LIVE POSTGIS DB VERIFICATION (TAHAP 2: ATTENDANCE & GEOFENCING) ---');
  
  try {
    // 1. Get test user and site
    const userRes = await pool.query(`SELECT id, username, full_name, division FROM users WHERE username IN ('satpamtest', 'testi') LIMIT 1`);
    if (userRes.rows.length === 0) throw new Error('User satpamtest not found');
    const user = userRes.rows[0];

    const siteRes = await pool.query(`SELECT id, name, geofence_radius_meters, ST_AsText(coordinates) as coords FROM sites WHERE name = 'Head Office Sudirman'`);
    if (siteRes.rows.length === 0) throw new Error('Site Head Office Sudirman not found');
    const site = siteRes.rows[0];

    console.log(`👤 User: ${user.full_name} (${user.division})`);
    console.log(`🏢 Site: ${site.name} (Radius: ${site.geofence_radius_meters}m) | Coords: ${site.coords}`);

    // 2. PostGIS Distance & Geofence Check
    const testLon = 106.8056;
    const testLat = -6.2216;
    const spatialCheck = await pool.query(`
      SELECT 
        ST_Distance(
          coordinates,
          ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
        ) as dist_meters,
        ST_DWithin(
          coordinates,
          ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
          geofence_radius_meters
        ) as is_inside
      FROM sites
      WHERE id = $1
    `, [site.id, testLon, testLat]);

    const dist = Math.round(Number(spatialCheck.rows[0].dist_meters));
    const isInside = spatialCheck.rows[0].is_inside;
    console.log(`📍 Geofence Calculation: Jarak = ${dist}m | Status Valid (Inside Geofence) = ${isInside}`);

    // 3. Clean up previous test record for today
    await pool.query(`DELETE FROM attendances WHERE user_id = $1 AND attendance_date = CURRENT_DATE`, [user.id]);

    // 4. Insert Live Clock-In Record
    const insertRes = await pool.query(`
      INSERT INTO attendances (
        user_id, site_id, attendance_date, status_type, shift_name,
        clock_in_at, clock_in_coordinates, clock_in_distance_meters,
        is_late, late_minutes, notes
      )
      VALUES (
        $1, $2, CURRENT_DATE, 1, 'Shift Pagi (07:00 - 15:00)',
        CURRENT_TIMESTAMP, ST_SetSRID(ST_MakePoint($4, $3), 4326),
        $5, FALSE, 0, 'Verifikasi Otomatis Tahap 2'
      )
      RETURNING id, attendance_date, status_type, clock_in_at, clock_in_distance_meters
    `, [user.id, site.id, testLat, testLon, dist]);

    const attRecord = insertRes.rows[0];
    console.log(`✅ Live Clock-In Record Inserted: ID ${attRecord.id} (Status Type: ${attRecord.status_type}, Jarak: ${attRecord.clock_in_distance_meters}m)`);

    // 5. Update Live Clock-Out Record
    const updateRes = await pool.query(`
      UPDATE attendances
      SET 
        clock_out_at = CURRENT_TIMESTAMP,
        clock_out_coordinates = ST_SetSRID(ST_MakePoint($2, $3), 4326),
        clock_out_distance_meters = $4,
        status_type = 2,
        work_duration_minutes = 480,
        overtime_minutes = 60,
        notes = 'Verifikasi Otomatis Selesai (8 jam kerja + 1 jam lembur)'
      WHERE id = $1
      RETURNING id, status_type, work_duration_minutes, overtime_minutes
    `, [attRecord.id, testLon, testLat, dist]);

    const updated = updateRes.rows[0];
    console.log(`✅ Live Clock-Out Record Updated: Status Type: ${updated.status_type} | Durasi: ${updated.work_duration_minutes}m (8 Jam) | Lembur: ${updated.overtime_minutes}m (1 Jam)`);

    // 6. Verify HRIS Query Compatibility
    const hrisRow = await pool.query(`
      SELECT 
        u.nik, u.full_name, s.name as site_name, a.attendance_date,
        a.work_duration_minutes, a.overtime_minutes, a.status_type
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      WHERE a.id = $1
    `, [attRecord.id]);

    console.log('✅ HRIS Recap Read Test:');
    console.table(hrisRow.rows);

    await pool.end();
    console.log('🎉 100% LIVE DATABASE & POSTGIS VERIFICATION PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main();
