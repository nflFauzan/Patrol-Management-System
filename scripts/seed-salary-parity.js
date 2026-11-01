const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function seedSalaryParity() {
  console.log('Seeding salary data into local PostgreSQL database...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Satpam / Security Anggota (Andi Rahman / Ahmad Fauzi)
    await client.query(`
      UPDATE users 
      SET gaji_pokok = 5200000, 
          tunjangan = 450000, 
          lembur_per_jam = 45000, 
          potongan_bpjs = 210000, 
          potongan_alpa = 130000, 
          potongan_lupa_absen = 50000
      WHERE full_name ILIKE '%Ahmad Fauzi%' OR full_name ILIKE '%Andi Rahman%' OR role = 'PETUGAS' AND division = 'Security'
    `);

    // 2. Komandan Security (Budi Santoso / Suharto / DANDAN)
    await client.query(`
      UPDATE users 
      SET gaji_pokok = 5800000, 
          tunjangan = 750000, 
          lembur_per_jam = 50000, 
          potongan_bpjs = 240000, 
          potongan_alpa = 150000, 
          potongan_lupa_absen = 50000
      WHERE full_name ILIKE '%Suharto%' OR full_name ILIKE '%DANDAN%' OR role = 'DANRU'
    `);

    // 3. Cleaning Service (Siti Rahayu / Siti Rahma)
    await client.query(`
      UPDATE users 
      SET gaji_pokok = 4900000, 
          tunjangan = 350000, 
          lembur_per_jam = 40000, 
          potongan_bpjs = 195000, 
          potongan_alpa = 120000, 
          potongan_lupa_absen = 50000
      WHERE full_name ILIKE '%Siti%' OR division ILIKE '%Cleaning%'
    `);

    // 4. Driver Logistik (Rudi Hartono / Budi Santoso Driver)
    await client.query(`
      UPDATE users 
      SET gaji_pokok = 5100000, 
          tunjangan = 600000, 
          lembur_per_jam = 50000, 
          potongan_bpjs = 205000, 
          potongan_alpa = 125000, 
          potongan_lupa_absen = 50000
      WHERE full_name ILIKE '%Driver%' OR full_name ILIKE '%Rudi%' OR division ILIKE '%Driver%'
    `);

    // 5. Staf Operasional / Management (Hendra Gunawan / Bambang Suryo / Dewi)
    await client.query(`
      UPDATE users 
      SET gaji_pokok = 5500000, 
          tunjangan = 500000, 
          lembur_per_jam = 45000, 
          potongan_bpjs = 220000, 
          potongan_alpa = 140000, 
          potongan_lupa_absen = 50000
      WHERE full_name ILIKE '%Bambang Suryo%' OR full_name ILIKE '%Dewi%' OR full_name ILIKE '%Hendra%' OR division = 'Management' OR division = 'STAFF'
    `);

    await client.query('COMMIT');
    console.log('✅ Salary parity successfully seeded into local database!');

    const res = await client.query('SELECT full_name, division, gaji_pokok, tunjangan, potongan_bpjs, potongan_alpa, potongan_lupa_absen FROM users ORDER BY full_name ASC');
    console.table(res.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedSalaryParity();

