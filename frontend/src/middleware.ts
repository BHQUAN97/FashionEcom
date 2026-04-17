import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware — bao ve admin routes (cosmetic redirect only)
 * Day chi la UI-level guard: redirect ve /admin-login neu chua co auth cookie.
 * Real authorization duoc thuc hien o backend (JWT verify + role check).
 * Cookie duoc set boi auth.store.ts khi login thanh cong.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phep truy cap trang login
  if (pathname === '/admin-login') {
    return NextResponse.next();
  }

  // Kiem tra auth cookie cho admin routes
  const token = request.cookies.get('fashionecom-auth-token')?.value;
  // Token phai ton tai va co do dai hop le (JWT toi thieu > 10 ky tu)
  const isValidToken = token && token.trim().length >= 10;
  if (pathname.startsWith('/admin') && !isValidToken) {
    const loginUrl = new URL('/admin-login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login'],
};
