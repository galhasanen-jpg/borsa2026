import { getConnection } from '../../lib/db';
import { guestPreviewStocks, getUserBriefingStocks } from '../../lib/briefing-stocks';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // زائر غير مسجّل دخول: يشوف قائمة افتراضية للمعاينة فقط، بدون قدرة حقيقية على التعديل
    if (!userId) {
        return Response.json(guestPreviewStocks());
    }

    let client;
    try {
        client = await getConnection();
        const rows = await getUserBriefingStocks(client, userId);
        return Response.json(rows);
    } catch (err) {
        return Response.json(guestPreviewStocks());
    } finally {
        if (client) client.release();
    }
}

export async function POST(request) {
    let client;
    try {
        const { user_id, name, name_en, symbol } = await request.json();
        if (!user_id) {
            return Response.json({ error: 'يجب تسجيل الدخول لإضافة سهم لقائمتك' }, { status: 401 });
        }
        if (!name || !name.trim()) {
            return Response.json({ error: 'name required' }, { status: 400 });
        }

        client = await getConnection();
        const result = await client.query(
            `INSERT INTO briefing_stocks (user_id, name, name_en, symbol)
            VALUES ($1, $2, $3, $4) RETURNING id, name, name_en, symbol`,
            [user_id, name.trim(), name_en?.trim() || null, symbol?.trim() || null]
        );

        return Response.json(result.rows[0]);

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (!userId) {
        return Response.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    let client;
    try {
        client = await getConnection();
        // نتأكد إن السهم يخص نفس المستخدم قبل الحذف حتى ما يقدر يحذف من قائمة غيره
        await client.query(`DELETE FROM briefing_stocks WHERE id = $1 AND user_id = $2`, [id, userId]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
