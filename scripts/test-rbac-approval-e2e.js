/**
 * End-to-End Scenario Verification for Dynamic RBAC and User Approval Workflow
 * Runs against live PostgreSQL 17 + PostGIS container
 */
require('dotenv').config();
const { Pool } = require('pg');
const { AuthService } = require('../apps/backend/dist/modules/auth/auth.service');
const { UsersService } = require('../apps/backend/dist/modules/users/users.service');
const { JwtService } = require('@nestjs/jwt');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'patrol_admin',
  password: process.env.DB_PASSWORD || 'patrol_secret_2026',
  database: process.env.DB_NAME || 'patrol_management',
});

// Real DatabaseService adapter for NestJS services
const dbService = {
  getPool: () => pool,
  query: async (text, params) => {
    const res = await pool.query(text, params);
    return res.rows;
  },
  queryOne: async (text, params) => {
    const res = await pool.query(text, params);
    return res.rows.length > 0 ? res.rows[0] : null;
  },
};

const jwtService = new JwtService({
  secret: process.env.JWT_SECRET || 'patrol_jwt_secret_dev_2026_change_in_production_min_32_chars!',
  signOptions: { expiresIn: '8h' },
});

const authService = new AuthService(dbService, jwtService);
const usersService = new UsersService(dbService);

async function runE2E() {
  console.log('================================================================');
  console.log('🚀 RUNNING END-TO-END SCENARIO: DYNAMIC RBAC & APPROVAL WORKFLOW');
  console.log('================================================================');

  const testUsername = 'calon.e2e.satpam';
  const testNik = '3201999988887777';
  const testPassword = 'Password123!';

  try {
    // -------------------------------------------------------------
    // Step 0: Teardown any leftover test data
    // -------------------------------------------------------------
    console.log('\n[Step 0] Cleaning up any prior test records for:', testUsername);
    const existing = await dbService.queryOne('SELECT id FROM users WHERE username = $1 OR nik = $2', [testUsername, testNik]);
    if (existing) {
      await dbService.query('DELETE FROM user_roles WHERE user_id = $1', [existing.id]);
      await dbService.query('DELETE FROM user_site_assignments WHERE user_id = $1', [existing.id]);
      await dbService.query('DELETE FROM users WHERE id = $1', [existing.id]);
      console.log('Cleaned up previous test user:', existing.id);
    }

    // -------------------------------------------------------------
    // Step 1: Candidate Self-Registration
    // -------------------------------------------------------------
    console.log('\n[Step 1] Testing Candidate Self-Registration (/auth/register)...');
    const regResult = await authService.register({
      fullName: 'Budi Calon E2E Satpam',
      nik: testNik,
      username: testUsername,
      email: 'calon.satpam@e2e-enterprise.id',
      phone: '081299990000',
      divisionInterest: 'SECURITY',
      password: testPassword,
      passwordConfirm: testPassword,
    });

    console.log('✅ Registration successful! Created candidate ID:', regResult.id);
    if (regResult.isApproved !== false || regResult.isActive !== false) {
      throw new Error(`Expected isApproved=false and isActive=false, got: isApproved=${regResult.isApproved}, isActive=${regResult.isActive}`);
    }

    // -------------------------------------------------------------
    // Step 2: Login Before Approval (Must Fail with HTTP 403)
    // -------------------------------------------------------------
    console.log('\n[Step 2] Testing Login Before Approval (Expect HTTP 403 Forbidden)...');
    let approvalBlocked = false;
    try {
      await authService.login({ username: testUsername, password: testPassword });
    } catch (err) {
      if (err.status === 403 && (err.message.includes('persetujuan') || err.message.includes('verifikasi') || err.message.includes('antrean'))) {
        approvalBlocked = true;
        console.log('✅ Correctly blocked unapproved login with 403:', err.message);
      } else {
        throw new Error(`Unexpected error during unapproved login: ${err.message} (status: ${err.status})`);
      }
    }
    if (!approvalBlocked) {
      throw new Error('FAILED: Unapproved user was allowed to log in!');
    }

    // -------------------------------------------------------------
    // Step 3: Account Lockout after 5 Failed Password Attempts
    // -------------------------------------------------------------
    console.log('\n[Step 3] Testing Account Lockout Protection (5 Failed Attempts)...');
    for (let i = 1; i <= 4; i++) {
      try {
        await authService.login({ username: testUsername, password: 'wrong-password' });
      } catch (err) {
        console.log(`- Attempt ${i} rejected with status ${err.status}`);
      }
    }

    // 5th failed attempt should trigger lockout
    let lockoutTriggered = false;
    try {
      await authService.login({ username: testUsername, password: 'wrong-password' });
    } catch (err) {
      if (err.status === 423 && err.message.includes('terkunci')) {
        lockoutTriggered = true;
        console.log('✅ Correctly triggered Account Lockout with 423:', err.message);
      } else {
        console.warn(`Attempt 5 returned status ${err.status}: ${err.message}`);
        if (err.status === 423) lockoutTriggered = true;
      }
    }
    if (!lockoutTriggered) {
      throw new Error('FAILED: Lockout protection did not engage after 5 failed attempts!');
    }

    // -------------------------------------------------------------
    // Step 4: Administrator Approval Queue Inspection
    // -------------------------------------------------------------
    console.log('\n[Step 4] Testing Admin Approval Queue Query (/users/approval-queue)...');
    const queue = await usersService.getApprovalQueue();
    const candidateInQueue = queue.find((u) => u.username === testUsername);
    if (!candidateInQueue) {
      throw new Error('FAILED: Registered candidate not found in approval queue!');
    }
    console.log('✅ Candidate successfully found in queue:', candidateInQueue.fullName, `(NIK: ${candidateInQueue.nik})`);

    // -------------------------------------------------------------
    // Step 5: Administrator Approves Candidate
    // -------------------------------------------------------------
    console.log('\n[Step 5] Testing Admin Approval Action (/users/:id/approve)...');
    const adminUser = await dbService.queryOne("SELECT id FROM users WHERE role IN ('ADMIN_SUPER', 'SUPER_ADMIN') LIMIT 1");
    const adminId = adminUser ? adminUser.id : '00000000-0000-0000-0000-000000000001';

    const secRole = await dbService.queryOne("SELECT id, code FROM roles WHERE code = 'SECURITY_OFFICER'");
    const primarySite = await dbService.queryOne('SELECT id, name FROM sites LIMIT 1');

    const approveResult = await usersService.approveUser(
      candidateInQueue.id,
      {
        roleId: secRole.id,
        division: 'SECURITY',
        siteId: primarySite.id,
        securityRank: 'ANGGOTA',
        gajiPokok: 4800000,
        tunjangan: 600000,
      },
      adminId
    );

    console.log('✅ Candidate successfully approved:', approveResult.username);
    if (approveResult.isApproved !== true || approveResult.isActive !== true) {
      throw new Error('FAILED: Candidate is not approved and active after approval!');
    }

    // Verify user_roles mapping
    const assignedRoles = await dbService.query(
      'SELECT r.code FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
      [candidateInQueue.id]
    );
    console.log('Assigned roles in DB:', assignedRoles.map((r) => r.code));
    if (!assignedRoles.some((r) => r.code === 'SECURITY_OFFICER')) {
      throw new Error('FAILED: Role SECURITY_OFFICER was not assigned in user_roles!');
    }

    // -------------------------------------------------------------
    // Step 6: Candidate Login After Approval (Success with Permissions)
    // -------------------------------------------------------------
    console.log('\n[Step 6] Testing Candidate Login After Approval (/auth/login)...');
    const loginResult = await authService.login({ username: testUsername, password: testPassword });

    console.log('✅ Candidate login successful!');
    console.log('- User ID:', loginResult.user.id);
    console.log('- Role:', loginResult.user.role);
    console.log('- Division:', loginResult.user.division);
    console.log('- Token length:', loginResult.token.length);
    console.log('- Permissions count:', loginResult.user.permissions ? loginResult.user.permissions.length : 0);
    console.log('- Resolved Permissions:', loginResult.user.permissions);

    if (!loginResult.token || !loginResult.user.permissions || loginResult.user.permissions.length === 0) {
      throw new Error('FAILED: Candidate login did not return JWT token or granular permissions!');
    }

    const expectedPerms = ['PATROL:VALIDATE', 'SOS:RESOLVE'];
    for (const p of expectedPerms) {
      if (!loginResult.user.permissions.includes(p)) {
        throw new Error(`FAILED: Expected permission ${p} missing from resolved permissions!`);
      }
    }
    console.log('✅ All security officer role permissions verified:', expectedPerms.join(', '));

    // -------------------------------------------------------------
    // Step 7: Teardown Test Records
    // -------------------------------------------------------------
    console.log('\n[Step 7] Cleaning up test records...');
    await dbService.query('DELETE FROM user_roles WHERE user_id = $1', [candidateInQueue.id]);
    await dbService.query('DELETE FROM user_site_assignments WHERE user_id = $1', [candidateInQueue.id]);
    await dbService.query('DELETE FROM users WHERE id = $1', [candidateInQueue.id]);
    console.log('✅ Cleaned up test user successfully.');

    console.log('\n================================================================');
    console.log('🎉 ALL 7 E2E INTEGRATION & SCENARIO TESTS PASSED (100% GREEN)');
    console.log('================================================================');

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E VERIFICATION FAILED:', err);
    await pool.end();
    process.exit(1);
  }
}

runE2E();
