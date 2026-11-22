const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function run() {
  console.log('Applying operational schema enhancements (012)...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. driver_trip_logs enhancements
    await client.query(`
      ALTER TABLE driver_trip_logs 
      ADD COLUMN IF NOT EXISTS photo_key_start TEXT,
      ADD COLUMN IF NOT EXISTS photo_key_end TEXT,
      ADD COLUMN IF NOT EXISTS start_coordinates GEOMETRY(Point, 4326),
      ADD COLUMN IF NOT EXISTS end_coordinates GEOMETRY(Point, 4326);
    `);

    // 2. cleaning_checklists 6 sub-checklists enhancements
    await client.query(`
      ALTER TABLE cleaning_checklists 
      ADD COLUMN IF NOT EXISTS soap_restocked BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS mirror_cleaned BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS tissue_restocked BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS odor_freshened BOOLEAN DEFAULT TRUE;
    `);

    // 3. staff_activity_logs photo enhancement
    await client.query(`
      ALTER TABLE staff_activity_logs 
      ADD COLUMN IF NOT EXISTS photo_key TEXT;
    `);

    await client.query('COMMIT');
    console.log('✅ Schema enhancements successfully applied!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

