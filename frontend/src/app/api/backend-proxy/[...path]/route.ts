import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const runtime = 'nodejs';

type NodeRequestInit = RequestInit & {
  duplex?: 'half';
};

const buildTargetUrl = (path: string[], request: NextRequest) => {
  const normalizedBase = BACKEND_API_BASE.endsWith('/') ? BACKEND_API_BASE.slice(0, -1) : BACKEND_API_BASE;
  const target = new URL(`${normalizedBase}/${path.join('/')}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });
  return target;
};

const forwardRequest = async (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => {
  const { path } = await context.params;
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionValue) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  }

  const targetUrl = buildTargetUrl(path, request);
  const contentType = request.headers.get('content-type');
  const contentLength = request.headers.get('content-length');
  const headers = new Headers();

  if (contentType) {
    headers.set('content-type', contentType);
  }

  if (contentLength) {
    headers.set('content-length', contentLength);
  }

  headers.set('cookie', `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionValue)}`);

  const init: NodeRequestInit = {
    method: request.method,
    headers,
  };

  if (METHODS_WITH_BODY.has(request.method)) {
    init.body = request.body;
    init.duplex = 'half';
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(targetUrl, init);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to reach backend service',
        details: error instanceof Error ? error.message : 'Unknown proxy error',
      },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();
  const upstreamContentType = upstreamResponse.headers.get('content-type');

  if (upstreamContentType) {
    responseHeaders.set('content-type', upstreamContentType);
  }

  return new NextResponse(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
};

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
