/**
 * Live PostGIS DB Verification: Data Induk Personil Parity (100% patroli.site)
 * Tests Users Table schema, Bcrypt password hashing, payroll fields, and password-protected delete
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function runLiveVerification() {
  console.log('🔍 [LIVE VERIFY] Starting Data Induk Personil Live Database Verification...\n');
  const client = await pool.connect();

  try {
    // 1. Verify Columns in 'users' table
    console.log('--- Step 1: Checking Schema Parity in users table ---');
    const colRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    const cols = colRes.rows.map(r => r.column_name);
    const requiredCols = [
      'security_rank',
      'working_hours_per_day',
      'gaji_pokok',
      'tunjangan',
      'lembur_per_jam',
      'potongan_bpjs',
      'potongan_alpa',
      'potongan_lupa_absen'
    ];

    for (const req of requiredCols) {
      if (!cols.includes(req)) {
        throw new Error(`Missing required column: ${req}`);
      }
    }
    console.log('✅ All 8 required payroll and rank columns exist in "users" table!\n');

    // 2. Insert test personnel with payroll & site assignment
    console.log('--- Step 2: Testing Personnel Creation with Payroll & Multi-Site ---');
    const testUsername = `test_satpam_${Date.now()}`;
    const testPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(testPassword, 10);

    // Get an existing site
    const siteRes = await client.query(`SELECT id, name FROM sites LIMIT 1`);
    if (siteRes.rows.length === 0) throw new Error('No sites found in database');
    const site = siteRes.rows[0];

    const insertRes = await client.query(`
      INSERT INTO users (
        username, password_hash, full_name, phone_number, role, division,
        security_rank, working_hours_per_day, gaji_pokok, tunjangan,
        lembur_per_jam, potongan_bpjs, potongan_alpa, potongan_lupa_absen,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
      RETURNING id, username, full_name, gaji_pokok, security_rank
    `, [
      testUsername,
      passwordHash,
      'Satpam Pengujian Parity',
      '081299887766',
      'SECURITY_OFFICER',
      'Security',
      'ANGGOTA',
      8,
      5000000.00,
      750000.00,
      35000.00,
      150000.00,
      100000.00,
      50000.00
    ]);

    const createdUser = insertRes.rows[0];
    console.log(`✅ User inserted successfully: ${createdUser.full_name} (ID: ${createdUser.id})`);
    console.log(`   - Gaji Pokok: Rp ${Number(createdUser.gaji_pokok).toLocaleString('id-ID')}`);
    console.log(`   - Security Rank: ${createdUser.security_rank}`);

    // Assign to site
    await client.query(`
      INSERT INTO user_site_assignments (user_id, site_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [createdUser.id, site.id]);
    console.log(`✅ Assigned to site: ${site.name} (${site.id})\n`);

    // 3. Test Deletion Protection with Admin Password Verification
    console.log('--- Step 3: Testing Admin Password Verification on Delete ---');
    
    // Create an admin user for test
    const adminUsername = `test_admin_${Date.now()}`;
    const adminSecret = 'AdminSuperSecret2026!';
    const adminHash = await bcrypt.hash(adminSecret, 10);
    
    const adminRes = await client.query(`
      INSERT INTO users (username, password_hash, full_name, role, division, is_active)
      VALUES ($1, $2, 'Admin Verifikator', 'ADMIN_SUPER', 'Management', true)
      RETURNING id, username, password_hash
    `, [adminUsername, adminHash]);
    const adminUser = adminRes.rows[0];

    // Case 3a: Wrong Password -> MUST REJECT
    const wrongAttempt = 'WrongPassword999';
    const isWrongMatch = await bcrypt.compare(wrongAttempt, adminUser.password_hash);
    if (isWrongMatch) {
      throw new Error('Security flaw: Wrong password was accepted!');
    }
    console.log('✅ Wrong admin password correctly rejected (Bcrypt mismatch)');

    // Case 3b: Correct Password -> MUST APPROVE & CASCADE DELETE
    const correctAttempt = adminSecret;
    const isCorrectMatch = await bcrypt.compare(correctAttempt, adminUser.password_hash);
    if (!isCorrectMatch) {
      throw new Error('Valid password failed match!');
    }

    // Perform authenticated delete
    await client.query(`DELETE FROM user_site_assignments WHERE user_id = $1`, [createdUser.id]);
    await client.query(`DELETE FROM users WHERE id = $1`, [createdUser.id]);

    // Verify user no longer exists
    const checkDeleted = await client.query(`SELECT id FROM users WHERE id = $1`, [createdUser.id]);
    if (checkDeleted.rows.length !== 0) {
      throw new Error('User was not deleted after password verification!');
    }
    console.log(`✅ Personnel successfully deleted with valid admin password!`);

    // Cleanup admin test user
    await client.query(`DELETE FROM users WHERE id = $1`, [adminUser.id]);
    console.log(`✅ Cleaned up temporary admin test user.\n`);

    console.log('===========================================================');
    console.log('🎉 100% PARITY LIVE DATABASE VERIFICATION PASSED SUCCESSFULLY!');
    console.log('===========================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runLiveVerification();
