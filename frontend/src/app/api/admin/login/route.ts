import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, buildAdminSessionValue, getAdminCredentials } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };
  const creds = getAdminCredentials();

  if (email !== creds.email || password !== creds.password) {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, buildAdminSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ success: true });
}
