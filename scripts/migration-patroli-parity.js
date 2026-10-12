/**
 * Migration Script: 100% Parity with patroli.site
 * Adds missing financial, rank, asset_type columns and tables (chief_evaluations, staff_activities)
 */
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function runMigration() {
  console.log('🚀 Running patroli.site parity migration...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Users table extensions: Financials, Rank, Working hours
    console.log('- Updating users table columns...');
    await client.query(`
      ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS security_rank VARCHAR(50) DEFAULT 'ANGGOTA',
        ADD COLUMN IF NOT EXISTS working_hours_per_day INT DEFAULT 8,
        ADD COLUMN IF NOT EXISTS gaji_pokok NUMERIC(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tunjangan NUMERIC(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS lembur_per_jam NUMERIC(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS potongan_bpjs NUMERIC(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS potongan_alpa NUMERIC(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS potongan_lupa_absen NUMERIC(15,2) DEFAULT 0;
    `);

    // 2. Checkpoints table extensions: Asset type
    console.log('- Updating checkpoints table columns...');
    await client.query(`
      ALTER TABLE checkpoints 
        ADD COLUMN IF NOT EXISTS asset_type VARCHAR(100) DEFAULT 'General Asset';
    `);

    // 3. Chief Evaluations table
    console.log('- Creating chief_evaluations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS chief_evaluations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        chief_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        komandan_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        discipline_score INT DEFAULT 100,
        coordination_score INT DEFAULT 100,
        attendance_score INT DEFAULT 100,
        incident_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_chief_eval_site ON chief_evaluations(site_id);
    `);

    // 4. Staff Activity Logs table
    console.log('- Creating staff_activity_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS staff_activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'COMPLETED',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_staff_act_site ON staff_activity_logs(site_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration successfully executed!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
