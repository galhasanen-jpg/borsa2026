import { getConnection } from '../../lib/db';
import { getMockPrice } from '../../lib/mock-prices';

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

        // إذا لا توجد بيانات حقيقية، نولد بيانات احتياطية مرتبطة بالسعر الحالي الفعلي
        if (result.rows.length === 0) {
            const anchor = await getAnchorPrice(client, symbol);
            return Response.json(generateMockHistory(symbol, period, anchor));
        }

        return Response.json(result.rows);

    } catch (err) {
        return Response.json(generateMockHistory(symbol, period, getMockPrice(symbol)));
    } finally {
        if (client) client.release();
    }
}

// السعر الذي ترسو عليه آخر نقطة في البيانات الاحتياطية، حتى يتطابق الرسم البياني
// مع السعر الحالي المعروض فعلياً للسهم بدل سعر عشوائي منفصل عنه.
async function getAnchorPrice(client, symbol) {
    try {
        const result = await client.query(
            `SELECT price FROM stock_prices WHERE symbol = $1`,
            [symbol.replace('.CA', '')]
        );
        const price = result.rows[0] ? parseFloat(result.rows[0].price) : NaN;
        if (!isNaN(price) && price > 0) return price;
    } catch (err) {}
    return getMockPrice(symbol);
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

// مولّد أرقام عشوائية بذرته ثابتة، حتى لا يتغيّر شكل الرسم البياني الاحتياطي في كل تحميل للصفحة
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hashSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return h;
}

function generateMockHistory(symbol, period, anchorPrice) {
    let days;
    switch (period) {
        case '1w': days = 7; break;
        case '1m': days = 30; break;
        case '3m': days = 90; break;
        case '6m': days = 180; break;
        case '1y': days = 365; break;
        default: days = 30;
    }

    const today = new Date();
    const dates = [];
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // تجاهل الجمعة والسبت
        if (date.getDay() === 5 || date.getDay() === 6) continue;
        dates.push(date);
    }

    // نسير بالسعر إلى الوراء ابتداءً من السعر الحالي الحقيقي، فتنتهي البيانات التاريخية
    // بالضبط عند نفس السعر المعروض فعلياً للسهم بدل قيمة عشوائية منفصلة عنه
    const rand = mulberry32(hashSeed(symbol + ':' + period));
    const closes = new Array(dates.length);
    closes[dates.length - 1] = anchorPrice;
    for (let i = dates.length - 2; i >= 0; i--) {
        const dailyMove = (rand() - 0.5) * 0.03; // تذبذب يومي واقعي حول 1.5%
        closes[i] = Math.max(closes[i + 1] / (1 + dailyMove), anchorPrice * 0.3);
    }

    const volRand = mulberry32(hashSeed(symbol + ':volume'));
    const volumeBase = 100000 + Math.floor(volRand() * 2000000);

    return dates.map((date, i) => {
        const close = parseFloat(closes[i].toFixed(2));
        const open = parseFloat((i > 0 ? closes[i - 1] : close).toFixed(2));
        const high = parseFloat((Math.max(open, close) * (1 + rand() * 0.008)).toFixed(2));
        const low = parseFloat((Math.min(open, close) * (1 - rand() * 0.008)).toFixed(2));
        const volume = Math.floor(volumeBase * (0.5 + rand()));

        return {
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume
        };
    });
}