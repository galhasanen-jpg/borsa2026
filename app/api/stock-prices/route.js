import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    let client;
    try {
        client = await getConnection();

        if (symbol) {
            const result = await client.query(
                `SELECT symbol, price, change_percent, volume, updated_at
                FROM stock_prices WHERE symbol = $1`,
                [symbol]
            );
            if (result.rows.length > 0) {
                return Response.json(result.rows[0]);
            }
            return Response.json({ error: 'not found' }, { status: 404 });
        }

        const result = await client.query(
            `SELECT symbol, price, change_percent, volume, updated_at
            FROM stock_prices ORDER BY symbol`
        );
        return Response.json(result.rows);

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function POST(request) {
    let client;
    try {
        const { symbol, price, change_percent, volume } = await request.json();
        const today = new Date().toISOString().split('T')[0];

        const volumeStr = (volume || '0').toString().replace(/,/g, '').replace(/[^0-9]/g, '');
        const volumeNum = parseInt(volumeStr) || 0;

        client = await getConnection();

        // 1. حفظ السعر الحالي
        await client.query(
            `INSERT INTO stock_prices (symbol, price, change_percent, volume, updated_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (symbol) DO UPDATE SET
            price = $2, change_percent = $3, volume = $4, updated_at = NOW()`,
            [symbol, price, change_percent, volume]
        );

        // 2. تسجيل السعر اللحظي
        await client.query(
            `INSERT INTO stock_ticks (symbol, price, volume, recorded_at)
            VALUES ($1, $2, $3, NOW())`,
            [symbol, price, volumeNum]
        );

        // 3. تحديث البيانات التاريخية اليومية
        await client.query(
            `INSERT INTO stock_history (symbol, date, open, high, low, close, volume)
            VALUES ($1, $2, $3, $3, $3, $3, $4)
            ON CONFLICT (symbol, date) DO UPDATE SET
            close = $3,
            high = GREATEST(stock_history.high, $3),
            low = LEAST(stock_history.low, $3),
            volume = $4`,
            [symbol, today, price, volumeNum]
        );

        return Response.json({ success: true });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    let client;
    try {
        client = await getConnection();
        await client.query(`DELETE FROM stock_prices WHERE symbol = $1`, [symbol]);
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}