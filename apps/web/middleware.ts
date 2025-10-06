import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /dashboard, /login)
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login'];
  const isPublicPath =
    publicPaths.includes(path) ||
    path.startsWith('/_next/') ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/assets/');

  // Check if user is authenticated by looking for auth cookie
  const authCookie = request.cookies.get('auth-token');
  const isAuthenticated = !!authCookie?.value;

  // If trying to access protected route without auth, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page while authenticated, redirect to dashboard
  if (path === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
