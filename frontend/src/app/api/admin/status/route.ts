import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return NextResponse.json({ authenticated: isValidAdminSession(session) });
}
