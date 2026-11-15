import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get('patrol_session')?.value?.trim();
  const isAuthenticated = !!(rawToken && rawToken.length > 20);

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
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already authenticated user trying to access /login or /register -> redirect to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/login.php' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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

