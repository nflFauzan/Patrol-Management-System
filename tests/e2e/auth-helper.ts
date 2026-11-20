import { BrowserContext, Page, request } from '@playwright/test';

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

let cachedAdminToken = '';
let cachedAdminUser: any = null;
let cachedFieldToken = '';
let cachedFieldUser: any = null;

export async function getAdminToken() {
  if (cachedAdminToken) return { token: cachedAdminToken, user: cachedAdminUser };
  try {
    const req = await request.newContext();
    const res = await req.post('http://127.0.0.1:3000/api/v1/auth/login', {
      data: { username: 'admin', password: 'admin123' },
    });
    if (res.ok()) {
      const data = await res.json();
      cachedAdminToken = data.token;
      cachedAdminUser = data.user;
      return { token: cachedAdminToken, user: cachedAdminUser };
    }
  } catch {}
  return { token: AUTH_TOKEN, user: ADMIN_USER };
}

export async function getFieldToken() {
  if (cachedFieldToken) return { token: cachedFieldToken, user: cachedFieldUser };
  try {
    const req = await request.newContext();
    const res = await req.post('http://127.0.0.1:3000/api/v1/auth/login', {
      data: { username: 'satpamtest', password: 'satpam123' },
    });
    if (res.ok()) {
      const data = await res.json();
      cachedFieldToken = data.token;
      cachedFieldUser = data.user;
      return { token: cachedFieldToken, user: cachedFieldUser };
    }
  } catch {}
  return { token: AUTH_TOKEN, user: FIELD_USER };
}

export async function authenticateAsAdmin(context: BrowserContext, page: Page) {
  const { token, user } = await getAdminToken();
  await context.addCookies([
    { name: 'patrol_session', value: token, domain: 'localhost', path: '/' },
  ]);
  await page.addInitScript(
    ({ u, t }) => {
      window.localStorage.setItem('patrol_auth_token', t);
      window.localStorage.setItem('patrol_user', JSON.stringify(u));
    },
    { u: user, t: token },
  );
}

export async function authenticateAsField(context: BrowserContext, page: Page) {
  const { token, user } = await getFieldToken();
  await context.addCookies([
    { name: 'patrol_session', value: token, domain: 'localhost', path: '/' },
  ]);
  await page.addInitScript(
    ({ u, t }) => {
      window.localStorage.setItem('patrol_auth_token', t);
      window.localStorage.setItem('patrol_user', JSON.stringify(u));
    },
    { u: user, t: token },
  );
}
