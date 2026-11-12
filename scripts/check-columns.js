const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function main() {
  const tables = ['chief_evaluations', 'staff_activity_logs', 'shift_handovers'];
  for (const t of tables) {
    const res = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position",
      [t]
    );
    console.log(`\nTable ${t}:`);
    res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
  }
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

