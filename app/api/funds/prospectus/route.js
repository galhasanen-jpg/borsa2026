import { getConnection } from '../../../lib/db';
import { ensureFundsSchema } from '../../../lib/funds-schema';

// نشرة إصدار الصندوق — وثيقة إفصاح رسمية بطبيعتها عامة (زي بيانات الأسهم)، فمفيش
// داعي لحمايتها بحساب زي دليل المستثمر أو تقارير محلل AI
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return Response.json({ error: 'معرّف صندوق غير صالح' }, { status: 400 });
    }

    let client;
    try {
        client = await getConnection();
        await ensureFundsSchema(client);
        const result = await client.query(
            `SELECT prospectus_pdf, prospectus_filename FROM investment_funds WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0 || !result.rows[0].prospectus_pdf) {
            return Response.json({ error: 'لا توجد نشرة إصدار مرفوعة لهذا الصندوق' }, { status: 404 });
        }

        const row = result.rows[0];
        return new Response(row.prospectus_pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Cache-Control': 'public, max-age=3600',
                'Content-Disposition': `inline; filename="${row.prospectus_filename || 'prospectus.pdf'}"`,
            },
        });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
