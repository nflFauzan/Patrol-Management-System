/**
 * Database connectivity & PostGIS verification script
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
  console.log('Testing PostgreSQL & PostGIS connection...');
  try {
    const res = await pool.query(`
      SELECT 
        version(),
        PostGIS_Version(),
        (SELECT COUNT(*) FROM sites) as sites_count,
        (SELECT COUNT(*) FROM checkpoints) as checkpoints_count,
        (SELECT COUNT(*) FROM users) as users_count
    `);
    
    console.log('✅ Connection Successful!');
    console.log(`- Database: ${res.rows[0].version.split(',')[0]}`);
    console.log(`- PostGIS: ${res.rows[0].postgis_version}`);
    console.log(`- Seeded Sites: ${res.rows[0].sites_count}`);
    console.log(`- Seeded Checkpoints: ${res.rows[0].checkpoints_count}`);
    console.log(`- Seeded Users: ${res.rows[0].users_count}`);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
}

main();
