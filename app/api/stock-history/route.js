import { getConnection } from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const period = searchParams.get('period') || '1m'; // 1w, 1m, 3m, 6m, 1y

    if (!symbol) {
        return Response.json({ error: 'symbol required' }, { status: 400 });
    }

    let client;
    try {
        client = await getConnection();

        // تحديد الفترة الزمنية
        let dateFilter;
        switch (period) {
            case '1w': dateFilter = "NOW() - INTERVAL '7 days'"; break;
            case '1m': dateFilter = "NOW() - INTERVAL '1 month'"; break;
            case '3m': dateFilter = "NOW() - INTERVAL '3 months'"; break;
            case '6m': dateFilter = "NOW() - INTERVAL '6 months'"; break;
            case '1y': dateFilter = "NOW() - INTERVAL '1 year'"; break;
            default: dateFilter = "NOW() - INTERVAL '1 month'";
        }

        const result = await client.query(
            `SELECT date, open, high, low, close, volume
            FROM stock_history
            WHERE symbol = $1 AND date >= ${dateFilter}
            ORDER BY date ASC`,
            [symbol]
        );

        // إذا لا توجد بيانات حقيقية، نولد بيانات احتياطية
        if (result.rows.length === 0) {
            return Response.json(generateMockHistory(symbol, period));
        }

        return Response.json(result.rows);

    } catch (err) {
        return Response.json(generateMockHistory(symbol, period));
    } finally {
        if (client) client.release();
    }
}

export async function POST(request) {
    let client;
    try {
        const { symbol, date, open, high, low, close, volume } = await request.json();

        client = await getConnection();
        await client.query(
            `INSERT INTO stock_history (symbol, date, open, high, low, close, volume)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (symbol, date) DO UPDATE SET
            open = $3, high = $4, low = $5, close = $6, volume = $7`,
            [symbol, date, open, high, low, close, volume]
        );

        return Response.json({ success: true });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

function generateMockHistory(symbol, period) {
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = 10 + (seed % 200);

    let days;
    switch (period) {
        case '1w': days = 7; break;
        case '1m': days = 30; break;
        case '3m': days = 90; break;
        case '6m': days = 180; break;
        case '1y': days = 365; break;
        default: days = 30;
    }

    const history = [];
    let price = basePrice;
    const today = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // تجاهل الجمعة والسبت
        if (date.getDay() === 5 || date.getDay() === 6) continue;

        const change = (Math.random() - 0.48) * (price * 0.03);
        price = Math.max(price + change, basePrice * 0.5);

        const open = parseFloat(price.toFixed(2));
        const close = parseFloat((price + (Math.random() - 0.5) * price * 0.02).toFixed(2));
        const high = parseFloat((Math.max(open, close) + Math.random() * price * 0.01).toFixed(2));
        const low = parseFloat((Math.min(open, close) - Math.random() * price * 0.01).toFixed(2));
        const volume = Math.floor(100000 + Math.random() * 2000000);

        history.push({
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume
        });
    }

    return history;
}