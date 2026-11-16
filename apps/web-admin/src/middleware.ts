import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get('patrol_session')?.value?.trim();

  // A genuine JWT token has 3 segments separated by dots and is not a demo token
  const hasValidTokenFormat = !!(
    rawToken &&
    rawToken.split('.').length === 3 &&
    !rawToken.startsWith('demo_')
  );

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/login.php' ||
    pathname === '/register' ||
    pathname.startsWith('/validasi-patroli') ||
    pathname.startsWith('/field') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/socket.io') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.');

  // 1. Unauthenticated user trying to access protected route (e.g. '/dashboard' or '/absensi')
  if (!hasValidTokenFormat && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Allow /login and /register to render freely so users can authenticate with credentials
  // without premature or looping redirects.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets & api rewrites
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
