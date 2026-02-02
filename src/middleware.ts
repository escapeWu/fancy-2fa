import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from './i18n/config';

function getLocale(request: NextRequest): string {
  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, i18n.locales, i18n.defaultLocale);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // Redirect to the same path with locale
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    );
  }

  // Auth check
  const authCookie = request.cookies.get('auth_session');
  const isAuth = authCookie?.value === 'authenticated';

  // Extract locale from path
  const locale = pathname.split('/')[1];

  // Protect dashboard routes
  if (pathname.includes('/dashboard')) {
    if (!isAuth) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // Allow shared code pages without authentication (handled by /s/ route)
  if (pathname.includes('/s/')) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from login page
  if (pathname.includes('/login')) {
    if (isAuth) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
