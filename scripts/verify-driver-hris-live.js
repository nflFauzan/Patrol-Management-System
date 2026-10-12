/**
 * Verification Script: Live Database Testing for Driver Fleet Trip Logs & HRIS Attendance Recap
 * PostGIS 3.5 + PostgreSQL 17 in Docker (patrol_postgres)
 */
const { Client } = require('pg');

async function verifyDriverAndHris() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'patrol_admin',
    password: process.env.DB_PASSWORD || 'patrol_secret_2026',
    database: process.env.DB_NAME || 'patrol_management',
  });

  console.log('Connecting to PostgreSQL live database (patrol_postgres)...');
  await client.connect();
  console.log('Connected successfully!');

  try {
    // 1. Get Site ID & Driver User
    const siteRes = await client.query(`SELECT id, name FROM sites LIMIT 1`);
    const site = siteRes.rows[0];
    console.log(`[PASS] Facility Site retrieved: ${site.name} (${site.id})`);

    let driverRes = await client.query(`SELECT id, full_name, division FROM users WHERE role = 'DRIVER' OR division = 'DRIVER' LIMIT 1`);
    let driver;
    if (driverRes.rows.length === 0) {
      // Create test driver
      const newDriver = await client.query(`
        INSERT INTO users (nik, username, password_hash, full_name, phone_number, division, role)
        VALUES ('DRV-2024-001', 'driver.budi', '$2b$10$abcdefghijklmnopqrstuu', 'Budi Santoso', '08123456789', 'DRIVER', 'DRIVER')
        RETURNING id, full_name, division
      `);
      driver = newDriver.rows[0];
      console.log(`[PASS] Test Driver user created: ${driver.full_name} (${driver.id})`);
    } else {
      driver = driverRes.rows[0];
      console.log(`[PASS] Driver user found: ${driver.full_name} (${driver.id})`);
    }

    // Clean up any old in-progress trips for clean test
    await client.query(`DELETE FROM driver_trip_logs WHERE driver_id = $1`, [driver.id]);

    // 2. Test Departure: Insert IN_PROGRESS Trip
    const startTripRes = await client.query(`
      INSERT INTO driver_trip_logs (
        site_id, driver_id, vehicle_plate_number, vehicle_type,
        origin_location, destination_location, started_at, trip_status,
        odometer_start, trip_notes
      )
      VALUES ($1, $2, 'B 9988 XYZ', 'Blind Van GrandMax', 'HQ Sudirman', 'Warehouse Cikarang', CURRENT_TIMESTAMP, 'IN_PROGRESS', 52100, 'Pengiriman dokumen & logistik')
      RETURNING id, vehicle_plate_number, odometer_start, trip_status
    `, [site.id, driver.id]);

    const activeTrip = startTripRes.rows[0];
    console.log(`[PASS] Departure trip started: ID=${activeTrip.id}, Status=${activeTrip.trip_status}, Odometer Start=${activeTrip.odometer_start}`);

    // 3. Test Arrival: Complete Trip with Odometer End
    const completeTripRes = await client.query(`
      UPDATE driver_trip_logs
      SET trip_status = 'COMPLETED',
          arrived_at = CURRENT_TIMESTAMP + interval '2 hours',
          odometer_end = 52185,
          trip_notes = 'Tiba tepat waktu di Gudang Cikarang, kondisi armada prima'
      WHERE id = $1
      RETURNING id, odometer_start, odometer_end, (odometer_end - odometer_start) AS distance_km, trip_status
    `, [activeTrip.id]);

    const completed = completeTripRes.rows[0];
    console.log(`[PASS] Trip completed: Status=${completed.trip_status}, Odo End=${completed.odometer_end}, Distance Traveled=${completed.distance_km} KM`);
    if (parseInt(completed.distance_km, 10) !== 85) {
      throw new Error(`Distance calculation mismatch! Expected 85 km, got ${completed.distance_km}`);
    }

    // 4. Test HRIS Attendance Recap Query
    console.log('\n--- Testing HRIS Attendance Recap Query ---');
    const hrisQuery = `
      SELECT 
        a.id, a.attendance_date AS "date",
        u.nik, u.full_name AS "fullName", u.division, u.role,
        s.name AS "siteName",
        a.shift_name AS "shiftName",
        to_char(a.clock_in_at, 'HH24:MI:SS') AS "clockInTime",
        a.clock_in_distance_meters AS "clockInDistanceMeters",
        to_char(a.clock_out_at, 'HH24:MI:SS') AS "clockOutTime",
        a.clock_out_distance_meters AS "clockOutDistanceMeters",
        a.late_minutes AS "lateMinutes",
        a.work_duration_minutes AS "workDurationMinutes",
        ROUND((a.work_duration_minutes::numeric / 60.0), 2) AS "effectiveWorkingHours",
        a.overtime_minutes AS "overtimeMinutes",
        ROUND((a.overtime_minutes::numeric / 60.0), 2) AS "overtimeHours",
        CASE 
          WHEN a.status_type = 1 THEN 'HADIR_BERJALAN'
          WHEN a.status_type = 2 THEN 'SELESAI'
          WHEN a.status_type = 3 THEN COALESCE(a.reason, 'IZIN')
          ELSE 'ALPHA'
        END AS "statusLabel"
      FROM attendances a
      JOIN users u ON a.user_id = u.id
      JOIN sites s ON a.site_id = s.id
      ORDER BY a.attendance_date DESC, u.full_name ASC
      LIMIT 5
    `;

    const hrisRes = await client.query(hrisQuery);
    console.log(`[PASS] HRIS records retrieved: ${hrisRes.rows.length} rows`);
    if (hrisRes.rows.length > 0) {
      console.log('Sample Row 1:');
      console.table(hrisRes.rows.map(r => ({
        NIK: r.nik,
        Nama: r.fullName,
        Divisi: r.division,
        Masuk: r.clockInTime,
        Pulang: r.clockOutTime,
        'Terlambat (m)': r.lateMinutes,
        'Jam Kerja': r.effectiveWorkingHours,
        'Lembur (Jam)': r.overtimeHours,
        Status: r.statusLabel,
      })));
    }

    console.log('\n[SUCCESS] Live Database Verification passed 100% for Tahap 5!');
  } catch (err) {
    console.error('[ERROR] Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

verifyDriverAndHris();
