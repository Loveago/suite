import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = getAdminSession(sessionValue);

  return NextResponse.json({ authenticated: Boolean(session), session });
}
