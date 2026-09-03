import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const period = searchParams.get('period') || 'today';

    if (!symbol) {
        return Response.json({ error: 'symbol required' }, { status: 400 });
    }

    let client;
    try {
        client = await getConnection();

        let dateFilter;
        switch (period) {
            case 'today':
                dateFilter = "recorded_at >= CURRENT_DATE";
                break;
            case '3d':
                dateFilter = "recorded_at >= NOW() - INTERVAL '3 days'";
                break;
            case '1w':
                dateFilter = "recorded_at >= NOW() - INTERVAL '7 days'";
                break;
            default:
                dateFilter = "recorded_at >= CURRENT_DATE";
        }

        const result = await client.query(
            `SELECT price, volume, recorded_at
            FROM stock_ticks
            WHERE symbol = $1 AND ${dateFilter}
            ORDER BY recorded_at ASC`,
            [symbol]
        );

        return Response.json(result.rows.map(r => ({
            price: parseFloat(r.price),
            volume: r.volume,
            time: r.recorded_at
        })));

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}