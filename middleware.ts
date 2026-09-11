import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from './app/lib/session';

// الموقع مفتوح لأي زائر بدون تسجيل، ما عدا الأقسام دي اللي تتطلب حساب مفعّل:
// النشرة اليومية، لوحة تحكم المتابع، وصفحات المحللين.
const PROTECTED_PATHS = ['/daily-briefing', '/dashboard', '/analysts'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // لوحة الإدارة لها حماية منفصلة بكلمة سر (Basic Auth) عبر ADMIN_PASSWORD
  if (pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization');
    const expected = process.env.ADMIN_PASSWORD;

    if (auth) {
      const [, encoded] = auth.split(' ');
      const [, password] = Buffer.from(encoded, 'base64').toString().split(':');
      if (expected && password === expected) {
        return NextResponse.next();
      }
    }

    return new NextResponse('يجب تسجيل الدخول للوصول للوحة التحكم', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    });
  }

  // باقي الموقع مفتوح لأي زائر بدون تسجيل، ما عدا الأقسام المحمية دي
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const userId = await verifySession(token);

  if (!userId) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('next', pathname);
    url.searchParams.set('locked', '1');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
