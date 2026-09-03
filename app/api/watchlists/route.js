import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const followerId = searchParams.get('follower_id');
    const watchlistId = searchParams.get('watchlist_id');

    let client;
    try {
        client = await getConnection();

        // جلب أسهم قائمة معينة
        if (watchlistId) {
            const result = await client.query(
                `SELECT ws.*, s.name as stock_name_ar, s.name_en, sec.name as sector
                FROM watchlist_stocks ws
                LEFT JOIN stocks s ON ws.symbol = s.symbol
                LEFT JOIN sectors sec ON s.sector_id = sec.id
                WHERE ws.watchlist_id = $1
                ORDER BY ws.added_at DESC`,
                [watchlistId]
            );
            return Response.json(result.rows);
        }

        // جلب قوائم المتابع
        if (followerId) {
            const result = await client.query(
                `SELECT w.*, COUNT(ws.id) as stock_count
                FROM watchlists w
                LEFT JOIN watchlist_stocks ws ON w.id = ws.watchlist_id
                WHERE w.follower_id = $1
                GROUP BY w.id
                ORDER BY w.created_at ASC`,
                [followerId]
            );
            return Response.json(result.rows);
        }

        return Response.json([]);

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function POST(request) {
    let client;
    try {
        const { action, follower_id, watchlist_id, name, symbol, stock_name } = await request.json();

        client = await getConnection();

        // إنشاء قائمة جديدة
        if (action === 'create') {
            const result = await client.query(
                `INSERT INTO watchlists (follower_id, name)
                VALUES ($1, $2) RETURNING id`,
                [follower_id, name]
            );
            return Response.json({ success: true, id: result.rows[0].id });
        }

        // إضافة سهم للقائمة
        if (action === 'add_stock') {
            await client.query(
                `INSERT INTO watchlist_stocks (watchlist_id, symbol, stock_name)
                VALUES ($1, $2, $3)
                ON CONFLICT (watchlist_id, symbol) DO NOTHING`,
                [watchlist_id, symbol, stock_name || '']
            );
            return Response.json({ success: true });
        }

        return Response.json({ error: 'action required' }, { status: 400 });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    let client;
    try {
        client = await getConnection();

        if (type === 'watchlist') {
            await client.query(`DELETE FROM watchlists WHERE id = $1`, [id]);
        } else if (type === 'stock') {
            await client.query(`DELETE FROM watchlist_stocks WHERE id = $1`, [id]);
        }

        return Response.json({ success: true });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}