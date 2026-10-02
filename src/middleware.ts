import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'sta_staff_session';
const PARENT_SESSION_COOKIE = 'sta_parent_session';

/**
 * A quick gate for the two signed-in areas: the staff portal and the parents'
 * area. Requests without the right cookie are sent to the matching sign-in
 * page; the pages themselves verify the signature and the role.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/parents')) {
    const hasParentSession = Boolean(request.cookies.get(PARENT_SESSION_COOKIE)?.value);
    if (!hasParentSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/login/parent';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login/administrator';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/parents/:path*'],
};
