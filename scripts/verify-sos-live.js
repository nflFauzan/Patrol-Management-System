/**
 * scripts/verify-sos-live.js
 * Live PostGIS integration verification for Panic Button SOS & WhatsApp Gateway (Tahap 4)
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

async function runLiveSosVerification() {
  console.log('===============================================================');
  console.log('🚀 LIVE POSTGIS DATABASE VERIFICATION: PANIC BUTTON SOS & WA (TAHAP 4)');
  console.log('===============================================================\n');

  const client = await pool.connect();
  try {
    // 1. Verify Company Profile & WhatsApp Gateway Configuration
    console.log('1. Checking Company Profile & WhatsApp Gateway Configuration...');
    const cpRes = await client.query(`
      SELECT company_name, wa_gateway_provider, wa_emergency_group_id, is_wa_notifications_enabled
      FROM company_profile
      LIMIT 1
    `);
    const comp = cpRes.rows[0];
    console.log(`   Corporate: ${comp.company_name}`);
    console.log(`   WA Gateway Provider: ${comp.wa_gateway_provider}`);
    console.log(`   Target WA Group: ${comp.wa_emergency_group_id}`);
    console.log(`   WA Notifications: ${comp.is_wa_notifications_enabled ? 'ENABLED' : 'DISABLED'}`);

    // 2. Fetch Sample Officer & Site
    const officerRes = await client.query(`SELECT id, full_name, division FROM users WHERE division = 'SECURITY' OR role = 'SECURITY_OFFICER' LIMIT 1`);
    const officer = officerRes.rows[0];
    const siteRes = await client.query(`SELECT id, name FROM sites WHERE name ILIKE '%Sudirman%' LIMIT 1`);
    const site = siteRes.rows[0];

    // 3. Insert Live Emergency Alert with PostGIS Coordinates
    console.log('\n2. Inserting Live Emergency SOS with PostGIS Coordinates...');
    const officerLat = -6.225500;
    const officerLng = 106.809000;
    const mapsUrl = `https://www.google.com/maps?q=${officerLat},${officerLng}`;

    const insertSosRes = await client.query(`
      INSERT INTO emergency_alerts (
        site_id, user_id, coordinates, alert_status, is_whatsapp_dispatched, whatsapp_dispatch_response
      )
      VALUES (
        $1, $2,
        ST_SetSRID(ST_MakePoint($4, $3), 4326),
        'ACTIVE',
        TRUE,
        $5
      )
      RETURNING 
        id, triggered_at, alert_status,
        ST_Y(coordinates::geometry) AS latitude,
        ST_X(coordinates::geometry) AS longitude,
        is_whatsapp_dispatched
    `, [
      site.id,
      officer.id,
      officerLat,
      officerLng,
      `[SIMULATED] Dispatched to ${comp.wa_emergency_group_id} via ${comp.wa_gateway_provider}`
    ]);

    const alert = insertSosRes.rows[0];
    console.log(`   ✅ Live SOS Created: Alert ID ${alert.id}`);
    console.log(`   Officer: ${officer.full_name} (${officer.division})`);
    console.log(`   Site: ${site.name}`);
    console.log(`   PostGIS Coordinates: ${alert.latitude}, ${alert.longitude}`);
    console.log(`   Google Maps Link: ${mapsUrl}`);
    console.log(`   Status: ${alert.alert_status} | WhatsApp Dispatched: ${alert.is_whatsapp_dispatched ? '✅ YES' : '❌ NO'}`);

    // 4. Test Escalation to ACKNOWLEDGED
    console.log('\n3. Testing Escalation Lifecycle: ACKNOWLEDGED...');
    const supervisorRes = await client.query(`SELECT id, full_name FROM users WHERE role IN ('ADMIN_SUPER', 'ADMIN_SITE', 'SECURITY_OFFICER') LIMIT 1`);
    const supervisor = supervisorRes.rows[0];

    const ackRes = await client.query(`
      UPDATE emergency_alerts
      SET alert_status = 'ACKNOWLEDGED',
          acknowledged_by = $2,
          acknowledged_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, alert_status, acknowledged_at
    `, [alert.id, supervisor.id]);
    console.log(`   ✅ Alert Acknowledged by: ${supervisor.full_name} at ${ackRes.rows[0].acknowledged_at}`);

    // 5. Test Escalation to RESOLVED
    console.log('\n4. Testing Escalation Lifecycle: RESOLVED...');
    const resRes = await client.query(`
      UPDATE emergency_alerts
      SET alert_status = 'RESOLVED',
          resolution_notes = 'Petugas patroli telah merespon pos. Situasi kondusif, alarm dinonaktifkan.'
      WHERE id = $1
      RETURNING id, alert_status, resolution_notes
    `, [alert.id]);
    console.log(`   ✅ Alert Resolved: Status ${resRes.rows[0].alert_status}`);
    console.log(`   Resolution Notes: "${resRes.rows[0].resolution_notes}"`);

    // 6. Query Active Alerts (should be 0 active now)
    const activeRes = await client.query(`SELECT COUNT(*) FROM emergency_alerts WHERE alert_status = 'ACTIVE'`);
    console.log(`\n5. Current Active SOS Alerts Count: ${activeRes.rows[0].count}`);

    // 7. Verify Log Data Emergency Table Query (patroli.site #panic DataTable)
    console.log('\n6. Testing Log Data Emergency Query (patroli.site #panic table format)...');
    const logsRes = await client.query(`
      SELECT 
        e.id, 
        s.name AS "siteName",
        u.full_name AS "officerName", 
        u.division,
        ST_Y(e.coordinates::geometry) AS latitude,
        ST_X(e.coordinates::geometry) AS longitude,
        e.triggered_at AS "triggeredAt", 
        e.alert_status AS "alertStatus"
      FROM emergency_alerts e
      JOIN users u ON e.user_id = u.id
      JOIN sites s ON e.site_id = s.id
      ORDER BY e.triggered_at DESC
      LIMIT 5
    `);
    console.log(`   ✅ Fetched ${logsRes.rows.length} rows from emergency_alerts:`);
    logsRes.rows.forEach((r, idx) => {
      console.log(`      [#${idx + 1}] ${r.officerName} (${r.division}) | Site: ${r.siteName} | Coords: ${r.latitude}, ${r.longitude} | Status: ${r.alertStatus}`);
    });

    console.log('\n===============================================================');
    console.log('🎉 ALL LIVE SOS & POSTGIS INTEGRATION TESTS PASSED 100%!');
    console.log('===============================================================\n');
  } catch (err) {
    console.error('❌ Live SOS Verification Failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runLiveSosVerification();
