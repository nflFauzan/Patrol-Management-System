const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function main() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  try {
    // 1. Ensure DANDAN KOMANDAN exists
    let komandanRes = await client.query(`SELECT id, full_name FROM users WHERE username = 'komandantest' OR full_name ILIKE '%DANDAN KOMANDAN%' LIMIT 1`);
    let komandanId;
    if (komandanRes.rows.length === 0) {
      console.log('Inserting DANDAN KOMANDAN user...');
      const insRes = await client.query(`
        INSERT INTO users (
          id, username, password_hash, full_name, phone_number, role, division, nik
        ) VALUES (
          uuid_generate_v4(), 'komandantest', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'DANDAN KOMANDAN', '081234567890', 'DANRU', 'Security', 'NIK-KOM-001'
        ) RETURNING id, full_name
      `);
      komandanId = insRes.rows[0].id;
    } else {
      komandanId = komandanRes.rows[0].id;
    }
    console.log('Komandan ID:', komandanId);

    // 2. Ensure Chief user exists
    const chiefRes = await client.query(`SELECT id FROM users WHERE role = 'CHIEF_SECURITY' OR username = 'chiefsec' LIMIT 1`);
    const chiefId = chiefRes.rows[0].id;
    console.log('Chief ID:', chiefId);

    // 3. Get Site ID
    const siteRes = await client.query(`SELECT id, name FROM sites LIMIT 1`);
    const siteId = siteRes.rows[0].id;
    console.log('Site ID:', siteId, siteRes.rows[0].name);

    // 4. Clean existing evaluations or insert fresh
    await client.query(`DELETE FROM chief_evaluations WHERE komandan_id = $1`, [komandanId]);

    console.log('Seeding Chief Evaluation...');
    const evalRes = await client.query(`
      INSERT INTO chief_evaluations (
        site_id, chief_id, komandan_id, discipline_score, coordination_score, attendance_score, incident_notes, created_at
      ) VALUES (
        $1, $2, $3, 95, 90, 100, 'Tidak ada kejadian menonjol atau insiden keamanan. Evaluasi pengawasan apel dan serah terima regu berjalan tertib dan sesuai SOP. Personil sigap.', '2026-10-18 21:11:40'
      ) RETURNING id
    `, [siteId, chiefId, komandanId]);

    const seededId = evalRes.rows[0].id;
    console.log('Seeded Chief Evaluation ID:', seededId);

    // 5. Verify query exactly as backend runs
    const verifySql = `
      SELECT 
        ce.id, ce.site_id as "siteId", s.name as "siteName",
        ce.chief_id as "chiefId", u_chief.full_name as "chiefName",
        ce.komandan_id as "komandanId", u_kom.full_name as "namaKomandan",
        'Komandan Regu' as "komandanPosition",
        'Laporan Komandan' as "komandanRole",
        CASE 
          WHEN ce.discipline_score >= 80 THEN 'Baik'
          WHEN ce.discipline_score >= 60 THEN 'Cukup'
          ELSE 'Kurang'
        END as "kedisiplinan",
        CASE 
          WHEN ce.coordination_score >= 80 THEN 'Baik'
          WHEN ce.coordination_score >= 60 THEN 'Cukup'
          ELSE 'Kurang'
        END as "koordinasi",
        CASE 
          WHEN ce.attendance_score >= 80 THEN 'Lengkap'
          ELSE 'Kurang'
        END as "kehadiran",
        'Lengkap' as "reguHadir",
        '0' as "reguIzin",
        CASE 
          WHEN ce.incident_notes IS NULL OR TRIM(ce.incident_notes) = '' OR LOWER(ce.incident_notes) LIKE '%tidak ada%' THEN 'Tidak Ada'
          ELSE 'Ada'
        END as "insiden",
        COALESCE(ce.incident_notes, 'Tidak ada kejadian menonjol atau insiden keamanan.') as "detailInsiden",
        COALESCE(ce.incident_notes, 'Evaluasi pengawasan apel dan serah terima regu berjalan tertib dan sesuai SOP. Personil sigap.') as "catatan",
        'Selesai' as "statusLaporan",
        to_char(ce.created_at, 'YYYY-MM-DD HH24:MI:SS') as "tanggalLapor"
      FROM chief_evaluations ce
      JOIN sites s ON ce.site_id = s.id
      JOIN users u_chief ON ce.chief_id = u_chief.id
      JOIN users u_kom ON ce.komandan_id = u_kom.id
      WHERE ce.id = $1
    `;
    const checkRes = await client.query(verifySql, [seededId]);
    console.log('✅ Verification Record Query Result:');
    console.log(JSON.stringify(checkRes.rows[0], null, 2));

    console.log('Database live verification successful!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
