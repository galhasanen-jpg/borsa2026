import { getConnection } from '../../lib/db';
import { mockPrices as mockData, generateMockData } from '../../lib/mock-prices';
import { fetchYahooQuote } from '../../lib/yahoo';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get('symbol');
    const symbol = symbolParam?.replace('.CA', '');

    let client;
    try {
        // أولاً: جلب من Supabase
        client = await getConnection();
        const result = await client.query(
            `SELECT price, change_percent, volume, updated_at FROM stock_prices WHERE symbol = $1`,
            [symbol]
        );

        if (result.rows.length > 0) {
            const row = result.rows[0];
            return Response.json({
                price: row.price,
                changePercent: row.change_percent,
                volume: row.volume,
                updatedAt: row.updated_at
            });
        }
    } catch (err) {
        // تجاهل خطأ Supabase والانتقال للبيانات الاحتياطية
    } finally {
        if (client) client.release();
    }

    // ثانياً: جلب من Yahoo Finance (عبر واجهة الرسم البياني، أوثق من واجهة quote
    // المباشرة التي باتت تتطلب مصادقة إضافية من Yahoo وتفشل بصمت لأسهم كثيرة)
    try {
        const quote = await fetchYahooQuote(symbol);
        if (quote) {
            return Response.json(quote);
        }
    } catch (err) {}

    // ثالثاً: البيانات الاحتياطية
    const mock = mockData[symbol] || generateMockData(symbol);
    return Response.json(mock);
}