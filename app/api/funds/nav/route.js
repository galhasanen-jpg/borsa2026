import { getConnection } from '../../../lib/db';
import { isAdminRequest } from '../../../lib/admin-auth';
import { ensureFundsSchema } from '../../../lib/funds-schema';

// سجل "قيمة الوثيقة" (NAV) عبر الزمن لكل صندوق — بيتدخل نقطة نقطة يدوياً من الأدمن
// (تاريخ + قيمة + مصدر اختياري)، مفيش أي تقدير أو ملء تلقائي بين النقاط
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const fundId = searchParams.get('fund_id');
    if (!fundId) {
        return Response.json({ error: 'معرّف صندوق غير صالح' }, { status: 400 });
    }

    let client;
    try {
        client = await getConnection();
        await ensureFundsSchema(client);
        // to_char بدل ما نسيب pg يرجّع DATE كـ JS Date object (بيتحوّل لتاريخ+وقت ISO كامل
        // عند التحويل لـ JSON بدل تاريخ بسيط YYYY-MM-DD)
        const result = await client.query(
            `SELECT id, fund_id, to_char(nav_date, 'YYYY-MM-DD') as nav_date, value, source_note
            FROM fund_nav_history WHERE fund_id = $1 ORDER BY nav_date`,
            [fundId]
        );
        return Response.json(result.rows);
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function POST(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let client;
    try {
        const { fund_id, nav_date, value, source_note } = await request.json();
        if (!fund_id || !nav_date || value == null || value === '') {
            return Response.json({ error: 'الصندوق والتاريخ والقيمة حقول مطلوبة' }, { status: 400 });
        }
        if (isNaN(Number(value))) {
            return Response.json({ error: 'القيمة لازم تكون رقماً' }, { status: 400 });
        }

        client = await getConnection();
        await ensureFundsSchema(client);
        const result = await client.query(
            `INSERT INTO fund_nav_history (fund_id, nav_date, value, source_note)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (fund_id, nav_date) DO UPDATE SET value = EXCLUDED.value, source_note = EXCLUDED.source_note
            RETURNING id`,
            [fund_id, nav_date, Number(value), source_note?.trim() || null]
        );

        return Response.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request) {
    if (!isAdminRequest(request)) {
        return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return Response.json({ error: 'missing id' }, { status: 400 });
    }

    let client;
    try {
        client = await getConnection();
        await ensureFundsSchema(client);
        await client.query(`DELETE FROM fund_nav_history WHERE id = $1`, [id]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
