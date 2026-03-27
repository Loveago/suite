import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, buildAdminSessionValue, getAdminAccountByIdentifier } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { identifier, email, username, password } = body as {
    identifier?: string;
    email?: string;
    username?: string;
    password?: string;
  };
  const account = getAdminAccountByIdentifier(identifier || username || email);

  if (!account || password !== account.password) {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, buildAdminSessionValue(account), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({
    success: true,
    session: {
      id: account.id,
      username: account.username,
      role: account.role,
      propertySlug: account.propertySlug,
      displayName: account.displayName,
    },
  });
}
