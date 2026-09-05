import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
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

export const config = {
  matcher: '/admin/:path*',
};
