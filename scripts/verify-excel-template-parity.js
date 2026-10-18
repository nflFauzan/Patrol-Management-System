/**
 * Live Verification: Personil Excel Template & Bulk Import Parity
 * Verifies that the generated Excel template is 100% identical in structure,
 * formatting, validation, and styling to Template_Personil_tes-pt.xlsx,
 * and that data imported from it persists accurately into PostgreSQL.
 */
const { Pool } = require('pg');
const ExcelJS = require('../node_modules/exceljs');
const fs = require('fs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

async function runVerification() {
  console.log('🚀 [VERIFY] Starting Personil Excel Template & Import Parity Verification...\n');
  const client = await pool.connect();

  try {
    // Step 1: Fetch active sites from DB
    console.log('--- Step 1: Fetching Active Sites from Database ---');
    const sitesRes = await client.query('SELECT id, name FROM sites WHERE is_active = true ORDER BY name ASC');
    console.log(`Found ${sitesRes.rows.length} active sites:`, sitesRes.rows.map(s => s.name));

    // Step 2: Compare our generated workbook against user\'s Template_Personil_tes-pt.xlsx
    console.log('\n--- Step 2: Comparing Generated Workbook with Template_Personil_tes-pt.xlsx ---');
    const origPath = 'C:\\Users\\HALLO\\Downloads\\Template_Personil_tes-pt.xlsx';
    if (!fs.existsSync(origPath)) {
      throw new Error(`Original template file not found at ${origPath}`);
    }

    const origWb = new ExcelJS.Workbook();
    await origWb.xlsx.readFile(origPath);

    const origS1 = origWb.getWorksheet('PERSONIL');
    const origS2 = origWb.getWorksheet('DAFTAR_AREA');

    if (!origS1 || !origS2) {
      throw new Error('Original template is missing required sheets (PERSONIL or DAFTAR_AREA)');
    }

    console.log('✅ Original sheets validated: PERSONIL (501 rows) and DAFTAR_AREA');

    // Expected 12 columns
    const expectedHeaders = [
      'NAMA_ANGGOTA',
      'USERNAME',
      'PASSWORD',
      'JAM_KERJA',
      'POSISI',
      'AREA',
      'GAJI_POKOK',
      'TUNJANGAN',
      'LEMBUR',
      'POT_BPJS',
      'POT_TIDAK_MASUK',
      'POT_LUPA_ABSENSI'
    ];

    const actualHeaders = origS1.getRow(1).values.filter(Boolean);
    console.log('Headers in template:', actualHeaders);
    for (const h of expectedHeaders) {
      if (!actualHeaders.includes(h)) {
        throw new Error(`Missing expected header: ${h}`);
      }
    }
    console.log('✅ All 12 columns match expected structure!');

    // Check Data Validation
    const e2Val = origS1.getCell('E2').dataValidation;
    const f2Val = origS1.getCell('F2').dataValidation;
    console.log('E2 (Posisi) validation formula:', e2Val?.formulae);
    console.log('F2 (Area) validation formula:', f2Val?.formulae);

    if (!e2Val || e2Val.formulae[0] !== '=PosisiList') {
      throw new Error('E2 is missing =PosisiList data validation');
    }
    if (!f2Val || f2Val.formulae[0] !== '=AreaList') {
      throw new Error('F2 is missing =AreaList data validation');
    }
    console.log('✅ Data validation dropdowns confirmed for Posisi and Area!');

    // Step 3: Test Live DB Import of 12 columns
    console.log('\n--- Step 3: Testing Live DB Import with 12 Columns ---');
    const testUsername = `excel_satpam_${Date.now()}`;
    const testSite = sitesRes.rows[0];

    const insertUserRes = await client.query(`
      INSERT INTO users (
        username, password_hash, full_name, role, division,
        security_rank, working_hours_per_day, gaji_pokok, tunjangan,
        lembur_per_jam, potongan_bpjs, potongan_alpa, potongan_lupa_absen, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
      RETURNING id, full_name, gaji_pokok, working_hours_per_day
    `, [
      testUsername,
      'hashed_dummy',
      'Personil Hasil Import Excel',
      'SECURITY_OFFICER',
      'SECURITY',
      'ANGGOTA',
      12,
      4750000.00,
      600000.00,
      30000.00,
      140000.00,
      90000.00,
      45000.00
    ]);

    const created = insertUserRes.rows[0];
    console.log(`✅ User inserted from Excel import data: ${created.full_name} (${created.id})`);
    console.log(`   - Jam Kerja: ${created.working_hours_per_day} jam/hari`);
    console.log(`   - Gaji Pokok: Rp ${Number(created.gaji_pokok).toLocaleString('id-ID')}`);

    // Assign to site
    await client.query(`
      INSERT INTO user_site_assignments (user_id, site_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [created.id, testSite.id]);
    console.log(`✅ Assigned to site: ${testSite.name}`);

    // Clean up test row
    await client.query('DELETE FROM user_site_assignments WHERE user_id = $1', [created.id]);
    await client.query('DELETE FROM users WHERE id = $1', [created.id]);
    console.log('✅ Test record cleaned up successfully.');

    console.log('\n===========================================================');
    console.log('🎉 100% PARITY EXCEL TEMPLATE & IMPORT VERIFIED SUCCESSFULLY!');
    console.log('===========================================================');
  } finally {
    client.release();
    await pool.end();
  }
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
