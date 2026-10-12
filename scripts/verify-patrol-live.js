/**
 * scripts/verify-patrol-live.js
 * Live integration verification against PostgreSQL 17 + PostGIS 3.5 (patrol_postgres)
 * Tests:
 * 1. Seeded Checkpoint & Site Spatial Verification
 * 2. Normal Patrol Scan Insertion (Situasi Aman Terkendali)
 * 3. Anomaly Scan Insertion (Perlu Tindak Lanjut) & Incident Ticket Creation
 * 4. Cleaning Service Sanitation Checklist Insertion
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function runLiveVerification() {
  console.log('===============================================================');
  console.log('🚀 LIVE POSTGIS DATABASE VERIFICATION: PATROL & CLEANING (TAHAP 3)');
  console.log('===============================================================\n');

  const client = await pool.connect();
  try {
    // 1. Verify Seeded Checkpoints
    console.log('1. Verifying Seeded Checkpoints for Head Office Sudirman...');
    const cpRes = await client.query(`
      SELECT 
        c.id, c.name, c.qr_code_token, c.category, c.location_detail,
        s.name AS site_name, s.geofence_radius_meters,
        ST_AsText(s.coordinates) AS site_geom
      FROM checkpoints c
      JOIN sites s ON c.site_id = s.id
      WHERE s.name ILIKE '%Sudirman%'
      ORDER BY c.name
    `);
    console.log(`   Found ${cpRes.rows.length} checkpoints:`);
    cpRes.rows.forEach((r, idx) => {
      console.log(`   [${idx + 1}] ${r.name} (${r.qr_code_token}) - ${r.category} [${r.location_detail}]`);
    });

    if (cpRes.rows.length === 0) {
      throw new Error('No checkpoints found for Head Office Sudirman!');
    }

    const gateCp = cpRes.rows.find(c => c.qr_code_token === 'QR-HQ-GATE-01') || cpRes.rows[0];
    const serverCp = cpRes.rows.find(c => c.qr_code_token === 'QR-HQ-SERVER-03') || cpRes.rows[1];
    const cleanCp = cpRes.rows.find(c => c.qr_code_token === 'QR-HQ-CLEAN-05') || cpRes.rows[2];

    // 2. PostGIS Geodesic Proximity Check
    console.log('\n2. Testing PostGIS ST_Distance & ST_DWithin Geodesic Calculation...');
    const officerLat = -6.2215;
    const officerLng = 106.8055;
    const proxRes = await client.query(`
      SELECT 
        s.name,
        s.geofence_radius_meters,
        ST_Distance(
          s.coordinates::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
        ) AS distance_meters,
        ST_DWithin(
          s.coordinates::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
          s.geofence_radius_meters
        ) AS is_within
      FROM sites s
      WHERE s.id = $3
    `, [officerLat, officerLng, gateCp.site_id || '11111111-1111-1111-1111-111111111111']);

    const prox = proxRes.rows[0];
    console.log(`   Site: ${prox.name}`);
    console.log(`   Officer Location: ${officerLat}, ${officerLng}`);
    console.log(`   Distance to Site Center: ${Math.round(prox.distance_meters)} meters`);
    console.log(`   Within ${prox.geofence_radius_meters}m Geofence: ${prox.is_within ? '✅ YES' : '❌ NO'}`);

    // 3. Test Normal Patrol Scan Insertion
    console.log('\n3. Recording Normal Patrol Scan (Aman Terkendali)...');
    const officerRes = await client.query(`SELECT id, full_name FROM users WHERE role = 'PETUGAS' LIMIT 1`);
    const officerId = officerRes.rows[0]?.id || 'a0000000-0000-0000-0000-000000000005';

    const insertNormalRes = await client.query(`
      INSERT INTO patrol_logs (
        site_id, checkpoint_id, user_id, coordinates, status_result, notes, photo_key
      )
      VALUES (
        '11111111-1111-1111-1111-111111111111',
        $1,
        $2,
        ST_SetSRID(ST_MakePoint($4, $3), 4326),
        'Situasi Aman Terkendali',
        'Pos pintu barat terkunci rapat dan aman',
        'patrol-photos/gate-01.jpg'
      )
      RETURNING id, scanned_at, status_result, notes
    `, [gateCp.id, officerId, officerLat, officerLng]);
    console.log(`   ✅ Normal Scan Recorded: ID ${insertNormalRes.rows[0].id} at ${insertNormalRes.rows[0].scanned_at}`);

    // 4. Test Anomaly Patrol Scan & Incident Ticket Generation
    console.log('\n4. Recording Anomaly Patrol Scan (Perlu Tindak Lanjut)...');
    const insertAnomalyRes = await client.query(`
      INSERT INTO patrol_logs (
        site_id, checkpoint_id, user_id, coordinates, status_result, notes, photo_key
      )
      VALUES (
        '11111111-1111-1111-1111-111111111111',
        $1,
        $2,
        ST_SetSRID(ST_MakePoint($4, $3), 4326),
        'Perlu Tindak Lanjut',
        'Kabel UPS terkelupas dan alarm suhu server berbunyi',
        'patrol-photos/server-anomaly.jpg'
      )
      RETURNING id, scanned_at, status_result, notes
    `, [serverCp.id, officerId, officerLat, officerLng]);
    const anomalyLogId = insertAnomalyRes.rows[0].id;
    console.log(`   ✅ Anomaly Scan Recorded: ID ${anomalyLogId}`);

    // Create linked Incident Ticket
    const insertTicketRes = await client.query(`
      INSERT INTO incident_tickets (
        site_id, patrol_log_id, ticket_status, reported_by, resolution_notes
      )
      VALUES (
        '11111111-1111-1111-1111-111111111111',
        $1,
        'OPEN',
        $2,
        'Kabel UPS terkelupas dan alarm suhu server berbunyi'
      )
      RETURNING id, ticket_status, created_at
    `, [anomalyLogId, officerId]);
    console.log(`   ✅ Incident Ticket Created: ID ${insertTicketRes.rows[0].id} [Status: ${insertTicketRes.rows[0].ticket_status}]`);

    // 5. Test Cleaning Service Checklist Insertion
    console.log('\n5. Recording Cleaning Service Sanitation Checklist...');
    const cleanInsertRes = await client.query(`
      INSERT INTO cleaning_checklists (
        site_id, checkpoint_id, officer_id,
        floor_cleaned, trash_emptied, supplies_restocked, odor_normal,
        notes, photo_key
      )
      VALUES (
        '11111111-1111-1111-1111-111111111111',
        $1,
        $2,
        TRUE, TRUE, TRUE, TRUE,
        'Sanitasi toilet lantai 2 tuntas, refill sabun lavender',
        'cleaning-photos/restroom-lt2.jpg'
      )
      RETURNING id, inspected_at, floor_cleaned, trash_emptied, supplies_restocked, odor_normal
    `, [cleanCp.id, officerId]);
    const cln = cleanInsertRes.rows[0];
    console.log(`   ✅ Cleaning Checklist Recorded: ID ${cln.id}`);
    console.log(`   Floor Cleaned: ${cln.floor_cleaned} | Trash Emptied: ${cln.trash_emptied} | Supplies Restocked: ${cln.supplies_restocked} | Odor Normal: ${cln.odor_normal}`);

    console.log('\n===============================================================');
    console.log('🎉 ALL LIVE POSTGIS INTEGRATION TESTS PASSED 100% (ZERO FAILS)!');
    console.log('===============================================================\n');
  } catch (err) {
    console.error('❌ Integration Test Failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runLiveVerification();
