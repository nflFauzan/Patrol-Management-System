/**
 * Remote Database Migration & Seeding Script for Supabase / Production PostgreSQL
 * Usage: node scripts/deploy-supabase-db.js "<DATABASE_URL>"
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL is required as an argument or in environment variables.');
  console.error('Usage: node scripts/deploy-supabase-db.js "postgresql://postgres.[REF]:[PASS]@[HOST]:5432/postgres?sslmode=require"');
  process.exit(1);
}

const cleanUrl = databaseUrl.replace(/([?&])sslmode=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

const client = new Client({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
});

async function runSqlFile(filePath, label) {
  console.log(`\n⏳ Running: ${label} (${filePath})...`);
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  const sql = fs.readFileSync(fullPath, 'utf8');
  await client.query(sql);
  console.log(`✅ Completed: ${label}`);
}

async function main() {
  console.log('🚀 Connecting to production PostgreSQL database...');
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // 1. Enable PostGIS & UUID extensions
    console.log('\n⏳ Initializing PostGIS & UUID extensions...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query('CREATE EXTENSION IF NOT EXISTS "postgis";');
    const versionRes = await client.query('SELECT version(), PostGIS_Full_Version();');
    console.log(`✅ PostgreSQL: ${versionRes.rows[0].version.split(',')[0]}`);
    console.log(`✅ PostGIS: ${versionRes.rows[0].postgis_full_version.split('\n')[0]}`);

    // 2. Schema
    await runSqlFile('docker/init-db/01_init_schema.sql', 'Core Schema (01_init_schema.sql)');

    // 3. Seed data
    await runSqlFile('docker/init-db/02_seed_data.sql', 'Berdikari Maju Selaras Seed Data (02_seed_data.sql)');

    // 4. Migrations
    await runSqlFile('apps/backend/src/database/migrations/010_rbac_and_approval.sql', 'RBAC & Approval Migration (010)');
    await runSqlFile('apps/backend/src/database/migrations/011_add_portal_permissions_and_requested_role.sql', 'Portal Permissions Migration (011)');

    // 5. Verification
    console.log('\n📊 Verifying Seeded Records:');
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM company_profile) as company_count,
        (SELECT COUNT(*) FROM sites) as sites_count,
        (SELECT COUNT(*) FROM checkpoints) as checkpoints_count,
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM roles) as roles_count,
        (SELECT COUNT(*) FROM permissions) as permissions_count
    `);
    const r = counts.rows[0];
    console.log(`- Company Profile  : ${r.company_count}`);
    console.log(`- Sites            : ${r.sites_count}`);
    console.log(`- Checkpoints      : ${r.checkpoints_count}`);
    console.log(`- Users            : ${r.users_count}`);
    console.log(`- Roles            : ${r.roles_count}`);
    console.log(`- Permissions      : ${r.permissions_count}`);

    const companyRes = await client.query('SELECT company_name, address FROM company_profile LIMIT 1;');
    if (companyRes.rows.length > 0) {
      console.log(`\n🏢 Active Company : ${companyRes.rows[0].company_name}`);
      console.log(`📍 Address        : ${companyRes.rows[0].address}`);
    }

    console.log('\n🎉 Database initialization and verification completed successfully!');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Database Deployment Failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.where) console.error('Where:', err.where);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

main();
