import { BrowserContext, Page } from '@playwright/test';

export const ADMIN_USER = {
  id: 'a0000000-0000-0000-0000-000000000001',
  username: 'admin',
  email: 'admin@mahakarya-ops.co.id',
  fullName: 'Administrator Utama',
  phone: '0812-1111-2222',
  role: 'ADMIN_SUPER',
  division: 'STAFF',
  securityRank: 'ANGGOTA',
  siteId: '11111111-1111-1111-1111-111111111111',
  isActive: true,
};

export const FIELD_USER = {
  id: 'a0000000-0000-0000-0000-000000000003',
  username: 'satpamtest',
  email: 'satpamtest@mahakarya-ops.co.id',
  fullName: 'Ahmad Fauzi',
  phone: '0812-3333-4444',
  role: 'SECURITY_OFFICER',
  division: 'SECURITY',
  securityRank: 'KOMANDAN',
  siteId: '11111111-1111-1111-1111-111111111111',
  isActive: true,
};

export const AUTH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFETUlOX1NVUEVSIiwiZGl2aXNpb24iOiJTVEFGRiIsImlhdCI6MTc5NDU5MjI1NiwiZXhwIjoxNzk0Njc4NjU2fQ.aKNpBM7qY8MgEXwCL-Qi2K9EfwqVeMU_JCdqObS9y2M';

export async function authenticateAsAdmin(context: BrowserContext, page: Page) {
  await context.addCookies([
    { name: 'patrol_session', value: AUTH_TOKEN, domain: 'localhost', path: '/' },
  ]);
  await page.addInitScript(
    ({ user, token }) => {
      window.localStorage.setItem('patrol_auth_token', token);
      window.localStorage.setItem('patrol_user', JSON.stringify(user));
    },
    { user: ADMIN_USER, token: AUTH_TOKEN },
  );
}

export async function authenticateAsField(context: BrowserContext, page: Page) {
  await context.addCookies([
    { name: 'patrol_session', value: AUTH_TOKEN, domain: 'localhost', path: '/' },
  ]);
  await page.addInitScript(
    ({ user, token }) => {
      window.localStorage.setItem('patrol_auth_token', token);
      window.localStorage.setItem('patrol_user', JSON.stringify(user));
    },
    { user: FIELD_USER, token: AUTH_TOKEN },
  );
}
