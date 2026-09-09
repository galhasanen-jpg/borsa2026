import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from './app/lib/session';

// الصفحات المطلوبة لإنشاء/تفعيل الحساب نفسه تبقى متاحة بدون جلسة، وإلا يستحيل على أي زائر يدخل الموقع أصلاً
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

  // صفحات إنشاء/تفعيل الحساب تبقى مفتوحة دائماً
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // باقي صفحات الموقع (كلها) تتطلب حساب زائر مفعّل وموافق عليه إدارياً
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const userId = await verifySession(token);

  if (!userId) {
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
