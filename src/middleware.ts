import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'sta_staff_session';

/**
 * A quick gate for the staff area: requests without a session cookie are sent to
 * a sign-in page. The pages themselves verify the signature and the role.
 */
export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login/administrator';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
