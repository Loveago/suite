import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from './src/lib/admin-auth';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (isValidAdminSession(session)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/admincp', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
