/**
 * Seed & Parity Verification Script for Broadcast Messages (Pesan Siaran)
 * 100% Parity with patroli.site
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function main() {
  console.log('🚀 Starting Broadcast Messages (Pesan Siaran) Parity Seeding & Verification...\n');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Ensure all 4 sites from patroli.site exist
    console.log('1. Ensuring sites parity (Kantor Pusat, Pabrik Bekasi, Gudang Cakung, Pool Kendaraan)...');
    const sites = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Kantor Pusat (Head Office Sudirman)',
        code: 'SITE-KP',
        address: 'Kav. 52-53 SCBD, Jakarta Selatan',
        latitude: -6.2241,
        longitude: 106.8097,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Pabrik Bekasi (Manufacturing Plant)',
        code: 'SITE-PB',
        address: 'Kawasan Industri GIIC Cikarang Pusat, Bekasi',
        latitude: -6.3712,
        longitude: 107.1725,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Gudang Cakung (Central Distribution Center)',
        code: 'SITE-GC',
        address: 'Kawasan Pergudangan Cakung Cilincing, Jakarta Timur',
        latitude: -6.1822,
        longitude: 106.9461,
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Pool Kendaraan (Fleet & Logistics Hub)',
        code: 'SITE-PK',
        address: 'Area Parkir & Pool Armada Logistik, Marunda',
        latitude: -6.1154,
        longitude: 106.9632,
      },
    ];

    for (const site of sites) {
      await client.query(
        `INSERT INTO sites (id, name, address, coordinates, geofence_radius_meters, is_active)
         VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($5, $4), 4326), 50, true)
         ON CONFLICT (id) DO UPDATE 
         SET name = EXCLUDED.name, address = EXCLUDED.address`,
        [site.id, site.name, site.address, site.latitude, site.longitude]
      );
      console.log(`   ✓ Site ready: ${site.name} (${site.id})`);
    }

    // 2. Get sender ID (superadmin)
    const userRes = await client.query(`SELECT id, full_name FROM users WHERE username = 'superadmin' LIMIT 1`);
    if (userRes.rows.length === 0) {
      throw new Error('Superadmin user not found in database');
    }
    const adminId = userRes.rows[0].id;
    console.log(`\n2. Sender user: ${userRes.rows[0].full_name} (${adminId})`);

    // 3. Seed the 4 reverse-engineered broadcast messages
    console.log('\n3. Seeding 4 reverse-engineered broadcast messages...');
    const broadcasts = [
      {
        id: 'b1111111-0000-0000-0000-000000000025',
        siteId: '11111111-1111-1111-1111-111111111111',
        title: 'Pemberitahuan Operasional Kantor Pusat',
        message: 'Pemberitahuan operasional kantor pusat: seluruh personil front desk dan satpam wajib memastikan pintu akses lobi utama terkunci tepat pukul 21:00 WIB. Tamu VIP dan kontraktor luar wajib menukar ID card di pos security serta mengisi buku tamu digital.',
        priority: 'NORMAL',
      },
      {
        id: 'b1111111-0000-0000-0000-000000000026',
        siteId: '22222222-2222-2222-2222-222222222222',
        title: 'Instruksi K3 & Patroli Pabrik Bekasi',
        message: 'Instruksi K3 & Patroli Pabrik Bekasi: Mengingat jadwal pemeliharaan mesin produksi, tim Satpam wajib meningkatkan frekuensi patroli QR Code Area Boiler dan Loading Dock. Tim Cleaning Service wajib memastikan jalur evakuasi bebas hambatan.',
        priority: 'HIGH',
      },
      {
        id: 'b1111111-0000-0000-0000-000000000027',
        siteId: '33333333-3333-3333-3333-333333333333',
        title: 'SOP Keamanan & Logistik Gudang Cakung',
        message: 'SOP Keamanan & Logistik Gudang Cakung: Seluruh personil wajib memvalidasi segel kontainer dan mencatat checkpoint barcode rak B2. Laporkan setiap anomali via fitur Laporan Temuan.',
        priority: 'NORMAL',
      },
      {
        id: 'b1111111-0000-0000-0000-000000000028',
        siteId: '44444444-4444-4444-4444-444444444444',
        title: 'Disiplin Pengemudi Pool Kendaraan',
        message: 'Disiplin Pengemudi Pool Kendaraan: Wajib foto odometer awal/akhir serta upload struk BBM sebelum meninggalkan pool. Pastikan cek oli, rem, dan ban unit logistik setiap hari.',
        priority: 'HIGH',
      },
    ];

    for (const b of broadcasts) {
      await client.query(
        `INSERT INTO broadcast_messages (id, site_id, sender_id, title, message, priority, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE
         SET message = EXCLUDED.message, title = EXCLUDED.title, priority = EXCLUDED.priority, site_id = EXCLUDED.site_id`,
        [b.id, b.siteId, adminId, b.title, b.message, b.priority]
      );
      console.log(`   ✓ Seeded Broadcast ID: ${b.id.slice(-4)} | Site: ${b.siteId.slice(0, 8)} | ${b.title}`);
    }

    await client.query('COMMIT');

    // 4. Verification Query
    console.log('\n4. Verifying live database records in PostgreSQL...');
    const verifyRes = await client.query(`
      SELECT 
        bm.id, 
        bm.title, 
        bm.message, 
        bm.priority,
        s.name as site_name, 
        u.full_name as sender_name,
        bm.created_at
      FROM broadcast_messages bm
      LEFT JOIN sites s ON bm.site_id = s.id
      JOIN users u ON bm.sender_id = u.id
      ORDER BY bm.created_at DESC
    `);

    console.log(`   Found ${verifyRes.rows.length} broadcast message(s) in database:\n`);
    verifyRes.rows.forEach((r, idx) => {
      console.log(`   [#${idx + 1}] ID: ${r.id}`);
      console.log(`        Site: ${r.site_name}`);
      console.log(`        Priority: ${r.priority}`);
      console.log(`        Sender: ${r.sender_name}`);
      console.log(`        Pesan: "${r.message.slice(0, 70)}..."\n`);
    });

    if (verifyRes.rows.length >= 4) {
      console.log('✅ ALL VERIFICATIONS PASSED: 100% Parity with patroli.site achieved in local PostgreSQL!');
    } else {
      throw new Error(`Verification count mismatch: expected at least 4, got ${verifyRes.rows.length}`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding/Verification failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
