import { getConnection } from '../../lib/db';
import { mockPrices as mockData, generateMockData } from '../../lib/mock-prices';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get('symbol');
    const symbol = symbolParam?.replace('.CA', '');

    let client;
    try {
        // أولاً: جلب من Supabase
        client = await getConnection();
        const result = await client.query(
            `SELECT price, change_percent, volume FROM stock_prices WHERE symbol = $1`,
            [symbol]
        );

        if (result.rows.length > 0) {
            const row = result.rows[0];
            return Response.json({
                price: row.price,
                changePercent: row.change_percent,
                volume: row.volume
            });
        }
    } catch (err) {
        // تجاهل خطأ Supabase والانتقال للبيانات الاحتياطية
    } finally {
        if (client) client.release();
    }

    // ثانياً: جلب من Yahoo Finance
    try {
        const res = await fetch(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolParam}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
        );
        const data = await res.json();
        const quote = data.quoteResponse?.result?.[0];

        if (quote && quote.regularMarketPrice) {
            return Response.json({
                price: quote.regularMarketPrice?.toFixed(2),
                changePercent: quote.regularMarketChangePercent?.toFixed(2),
                volume: quote.regularMarketVolume?.toLocaleString(),
            });
        }
    } catch (err) {}

    // ثالثاً: البيانات الاحتياطية
    const mock = mockData[symbol] || generateMockData(symbol);
    return Response.json(mock);
}