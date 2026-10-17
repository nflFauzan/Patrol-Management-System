const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function main() {
  const client = await pool.connect();
  try {
    const siteRes = await client.query('SELECT id FROM sites LIMIT 1');
    const siteId = siteRes.rows[0].id;

    const res1 = await client.query('SELECT id FROM checkpoints WHERE qr_code_token = $1', ['1012']);
    if (res1.rows.length === 0) {
      await client.query(
        `INSERT INTO checkpoints (id, site_id, qr_code_token, category, name, location_detail, task_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'c1111111-1111-1111-1111-111111111012',
          siteId,
          '1012',
          'Security',
          'POS GERBANG UTAMA',
          'GERBANG UTAMA DEPAN',
          'PEMERIKSAAN AKSES MASUK TAMU'
        ]
      );
      console.log('Seeded checkpoint 1012 (Security)');
    } else {
      console.log('Checkpoint 1012 already exists');
    }

    const res2 = await client.query('SELECT id FROM checkpoints WHERE qr_code_token = $1', ['1025']);
    if (res2.rows.length === 0) {
      await client.query(
        `INSERT INTO checkpoints (id, site_id, qr_code_token, category, name, location_detail, task_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'c1111111-1111-1111-1111-111111111025',
          siteId,
          '1025',
          'Cleaning Service',
          'TOILET',
          'LOBBY',
          'BERSIHKAN KLOSET'
        ]
      );
      console.log('Seeded checkpoint 1025 (Cleaning Service)');
    } else {
      console.log('Checkpoint 1025 already exists');
    }

    console.log('✅ Parity checkpoints ready in PostgreSQL!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
