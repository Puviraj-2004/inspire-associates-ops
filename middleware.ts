// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import type { TokenPayload } from '@/lib/auth';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'Test@JWT#2026_MangoMoon_7xQ9!'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session_token')?.value;

  const isAuthPage = pathname.startsWith('/login');
  const isAdminRoute = pathname.startsWith('/admin');
  const isStaffRoute = pathname.startsWith('/staff');

  let session: TokenPayload | null = null;

  if (token) {
    try {
      // Note: token FIRST, SECRET_KEY SECOND
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as TokenPayload;
    } catch {
      session = null;
    }
  }

  // 1. If not logged in and accessing protected pages -> Redirect to Login
  if (!session && (isAdminRoute || isStaffRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If logged in and visiting /login -> Redirect to dashboard
  if (session && isAuthPage) {
    const target = session.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 3. Role-based Route Protection
  if (session && isAdminRoute && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/staff/dashboard', request.url));
  }

  if (session && isStaffRoute && session.role !== 'STAFF') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};