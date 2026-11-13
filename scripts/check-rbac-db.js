/**
 * Verification script for RBAC tables and User Approval fields
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

async function main() {
  console.log('Verifying RBAC tables and columns in PostgreSQL...');
  try {
    const rolesRes = await pool.query('SELECT COUNT(*) as count FROM roles');
    const permsRes = await pool.query('SELECT COUNT(*) as count FROM permissions');
    const rolePermsRes = await pool.query('SELECT COUNT(*) as count FROM role_permissions');
    const userRolesRes = await pool.query('SELECT COUNT(*) as count FROM user_roles');

    const columnsRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND column_name IN ('is_approved', 'approved_by', 'approved_at', 'rejection_reason', 'failed_login_attempts', 'locked_until')
    `);

    console.log('✅ RBAC Verification Successful!');
    console.log(`- Roles Count: ${rolesRes.rows[0].count}`);
    console.log(`- Permissions Count: ${permsRes.rows[0].count}`);
    console.log(`- Role-Permissions Mappings: ${rolePermsRes.rows[0].count}`);
    console.log(`- User-Roles Mappings: ${userRolesRes.rows[0].count}`);
    console.log(`- Users Extended Columns: ${columnsRes.rows.map(r => r.column_name).join(', ')}`);

    if (parseInt(rolesRes.rows[0].count, 10) < 7 || parseInt(permsRes.rows[0].count, 10) < 13 || columnsRes.rows.length < 6) {
      throw new Error('Incomplete RBAC database setup!');
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ RBAC Verification Failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main();
