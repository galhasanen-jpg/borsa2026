import fs from 'fs';
import path from 'path';
import { verifySession, SESSION_COOKIE_NAME } from '../../lib/session';

// يخدم صور صفحات "الدليل العملي للمستثمر الجديد" — محمية بحساب حقيقي فقط (مش زائر).
// الصور مخزّنة خارج مجلد public عمداً، فمفيش رابط مباشر ليها غير من هنا، وبعد التحقق من الجلسة.
export const TOTAL_GUIDE_PAGES = 24;

const PAGES_DIR = path.join(process.cwd(), 'app', 'lib', 'investor-guide-pages');

export async function GET(request) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = await verifySession(token);

    if (!userId) {
        return Response.json({ error: 'يجب تسجيل الدخول بحساب حقيقي لعرض هذا المحتوى' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const n = parseInt(searchParams.get('n'));

    if (!n || n < 1 || n > TOTAL_GUIDE_PAGES) {
        return Response.json({ error: 'رقم صفحة غير صالح' }, { status: 400 });
    }

    const filePath = path.join(PAGES_DIR, `page-${String(n).padStart(2, '0')}.jpg`);

    try {
        const data = fs.readFileSync(filePath);
        return new Response(data, {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                // لا نخزّن مؤقتاً بشكل قابل للمشاركة، ونمنع أي عرض كمرفق قابل للحفظ
                'Cache-Control': 'private, no-store',
                'Content-Disposition': 'inline',
            },
        });
    } catch (err) {
        return Response.json({ error: 'الصفحة غير موجودة' }, { status: 404 });
    }
}
