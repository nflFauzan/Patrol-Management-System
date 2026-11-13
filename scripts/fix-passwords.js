require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

const users = [
  { username: 'admin', pass: 'admin123' },
  { username: 'hendra.chief', pass: 'hendra123' },
  { username: 'satpamtest', pass: 'satpam123' },
  { username: 'buditest', pass: 'budi123' },
  { username: 'akmal', pass: 'akmal123' },
  { username: 'dedi.driver', pass: 'driver123' },
];

async function main() {
  console.log('Updating user password hashes in PostgreSQL...');
  for (const u of users) {
    const hash = await bcrypt.hash(u.pass, 10);
    const res = await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username', [
      hash,
      u.username,
    ]);
    if (res.rows.length > 0) {
      console.log(`✅ Updated password hash for ${u.username}`);
    } else {
      console.warn(`⚠️ User not found: ${u.username}`);
    }
  }
  console.log('All passwords successfully synchronized with Bcrypt!');
}

main()
  .catch(console.error)
  .finally(() => pool.end());
