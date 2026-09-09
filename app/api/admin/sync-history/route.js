import { getConnection } from '../../../lib/db';
import { syncStockFromYahoo } from '../../../lib/sync-stock';

// مزامنة يدوية بدفعات صغيرة (تُستدعى عدة مرات من لوحة الإدارة) لتعبئة stock_history
// و stock_prices ببيانات Yahoo الحقيقية لكل الأسهم دفعة واحدة، كحل مرحلي ريثما تتوفر
// واجهة رسمية من البورصة المصرية نفسها. الدفعات الصغيرة تتجنب حدود وقت تنفيذ السيرفرلس.
// هناك أيضاً مزامنة تلقائية يومية (راجع /api/cron/sync-history) — هذا المسار للمزامنة
// الفورية اليدوية وقت الحاجة بين مرة وأخرى.
export async function POST(request) {
    let client;
    try {
        const { symbols } = await request.json();
        if (!Array.isArray(symbols) || symbols.length === 0) {
            return Response.json({ error: 'symbols required' }, { status: 400 });
        }

        client = await getConnection();

        // رمز ISIN المحفوظ لكل سهم بالدفعة (إن وُجد)، يُجرَّب كبديل لو الرمز المختصر غير مدرج على Yahoo
        const isinResult = await client.query(
            `SELECT symbol, isin FROM stocks WHERE symbol = ANY($1)`,
            [symbols]
        );
        const isinMap = Object.fromEntries(isinResult.rows.map(r => [r.symbol, r.isin]));

        const results = await Promise.all(
            symbols.map(symbol => syncStockFromYahoo(client, symbol, isinMap[symbol] || null))
        );

        return Response.json({ results });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
