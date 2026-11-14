import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_STUDENT = ['/dashboard', '/student'];
const PROTECTED_COMPANY = ['/employer', '/company'];
const PROTECTED_COLLEGE = ['/college/dashboard'];
const PROTECTED_ADMIN = ['/admin'];
const PROTECTED_ANY = ['/interviews'];
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('truehire_token')?.value;
  const role = request.cookies.get('truehire_role')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedStudent = PROTECTED_STUDENT.some(p => pathname.startsWith(p));
  const isProtectedCompany = PROTECTED_COMPANY.some(p => pathname.startsWith(p));
  const isProtectedCollege = PROTECTED_COLLEGE.some(p => pathname.startsWith(p));
  const isProtectedAdmin = PROTECTED_ADMIN.some(p => pathname.startsWith(p));
  const isProtectedAny = PROTECTED_ANY.some(p => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some(p => pathname.startsWith(p));

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && token) {
    if (role === 'COMPANY') return NextResponse.redirect(new URL('/employer/dashboard', request.url));
    if (role === 'COLLEGE') return NextResponse.redirect(new URL('/college/dashboard', request.url));
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect student routes
  if (isProtectedStudent && (!token || role !== 'STUDENT')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect company routes
  if (isProtectedCompany && (!token || role !== 'COMPANY')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect college routes
  if (isProtectedCollege && (!token || role !== 'COLLEGE')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect admin routes
  if (isProtectedAdmin && (!token || role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect any authenticated routes
  if (isProtectedAny && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
