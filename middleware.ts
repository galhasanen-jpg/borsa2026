import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME, GUEST_COOKIE_NAME } from './app/lib/session';

// الأقسام دي تتطلب حساب حقيقي مسجّل دخول (الدخول كزائر لا يكفي للوصول لها)
const PROTECTED_PATHS = ['/daily-briefing', '/dashboard', '/analysts'];
// صفحات إنشاء/تفعيل/دخول الحساب تبقى مفتوحة دائماً، وإلا يستحيل الوصول لها أصلاً
const PUBLIC_PATHS = ['/signin', '/signup', '/verify-email'];

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

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const userId = await verifySession(token);

  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected) {
    if (!userId) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('next', pathname);
      url.searchParams.set('locked', '1');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // باقي الصفحات: تتطلب إما تسجيل دخول حقيقي أو ضغط زر "الدخول كزائر" بصفحة تسجيل الدخول
  const isGuest = request.cookies.get(GUEST_COOKIE_NAME)?.value === '1';
  if (!userId && !isGuest) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
