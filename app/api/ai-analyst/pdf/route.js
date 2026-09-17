import { getConnection } from '../../../lib/db';
import { verifySession, SESSION_COOKIE_NAME } from '../../../lib/session';
import { isAdminRequest } from '../../../lib/admin-auth';
import { reportToPdfHtml } from '../../../lib/ai-report-html';
import { htmlToPdfBuffer } from '../../../lib/pdf-render';

// يولّد PDF فعلي لتقرير "محلل AI" — محمي بحساب حقيقي فقط (مش زائر)، ومختوم
// ببصمة (بريد المشاهد + وقت الفتح) لتتبع أي نسخة تُسرّب. مفيش منع تقني مطلق
// للتحميل من متصفح (أي عارض PDF فيه زر حفظ) — الحماية الفعلية هنا هي: لازم
// حساب موثّق للوصول، والعلامة المائية رادعة وتكشف مصدر أي نسخة متسرّبة.
export const maxDuration = 300;

export async function GET(request) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const userId = await verifySession(token);
    const isAdmin = isAdminRequest(request);

    if (!userId && !isAdmin) {
        return Response.json({ error: 'يجب تسجيل الدخول بحساب حقيقي لعرض هذا المحتوى' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    if (!id) {
        return Response.json({ error: 'معرّف تقرير غير صالح' }, { status: 400 });
    }

    let client;
    try {
        client = await getConnection();

        let viewerEmail = 'المشرف';
        if (userId) {
            const userResult = await client.query(`SELECT email FROM site_users WHERE id = $1`, [userId]);
            viewerEmail = userResult.rows[0]?.email || `user#${userId}`;
        }

        const reportResult = await client.query(
            `SELECT command, report, model, created_at FROM ai_analyst_reports WHERE id = $1`,
            [id]
        );
        if (reportResult.rows.length === 0) {
            return Response.json({ error: 'التقرير غير موجود' }, { status: 404 });
        }

        const row = reportResult.rows[0];
        const openedAt = new Date().toLocaleString('ar-EG');

        const html = reportToPdfHtml({
            command: row.command,
            report: row.report,
            createdAt: row.created_at,
            model: row.model,
            watermarkLines: [viewerEmail, openedAt],
        });

        const pdfBuffer = await htmlToPdfBuffer(html);

        // تنزيل فعلي (attachment) متاح للأدمن فقط — عرض المستخدمين العاديين يفضل inline
        // زي ما هو (محمي بحساب حقيقي + علامة مائية، بدون تنزيل صريح مباشر)
        const download = searchParams.get('download') === '1' && isAdmin;
        const disposition = download ? 'attachment' : 'inline';

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Cache-Control': 'private, no-store',
                'Content-Disposition': `${disposition}; filename="ai-report-${id}.pdf"`,
            },
        });
    } catch (err) {
        return Response.json({ error: `تعذّر توليد ملف PDF: ${err.message}` }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
