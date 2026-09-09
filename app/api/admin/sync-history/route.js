import { getConnection } from '../../../lib/db';
import { fetchYahooHistory, fetchYahooQuote } from '../../../lib/yahoo';

// مزامنة يدوية بدفعات صغيرة (تُستدعى عدة مرات من لوحة الإدارة) لتعبئة stock_history
// و stock_prices ببيانات Yahoo الحقيقية لكل الأسهم دفعة واحدة، كحل مرحلي ريثما تتوفر
// واجهة رسمية من البورصة المصرية نفسها. الدفعات الصغيرة تتجنب حدود وقت تنفيذ السيرفرلس.
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

        const results = await Promise.all(symbols.map(async (symbol) => {
            const isin = isinMap[symbol] || null;
            let historyCount = 0;
            let gotQuote = false;

            const history = await fetchYahooHistory(symbol, '1y', isin);
            if (history && history.length > 0) {
                for (const row of history) {
                    await client.query(
                        `INSERT INTO stock_history (symbol, date, open, high, low, close, volume)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (symbol, date) DO UPDATE SET
                        open = $3, high = $4, low = $5, close = $6, volume = $7`,
                        [symbol, row.date, row.open, row.high, row.low, row.close, row.volume]
                    );
                }
                historyCount = history.length;
            }

            const quote = await fetchYahooQuote(symbol, isin);
            if (quote) {
                await client.query(
                    `INSERT INTO stock_prices (symbol, price, change_percent, volume, updated_at)
                    VALUES ($1, $2, $3, $4, NOW())
                    ON CONFLICT (symbol) DO UPDATE SET
                    price = $2, change_percent = $3, volume = $4, updated_at = NOW()`,
                    [symbol, quote.price, quote.changePercent, quote.volume]
                );
                gotQuote = true;
            }

            return { symbol, historyCount, gotQuote, success: historyCount > 0 || gotQuote };
        }));

        return Response.json({ results });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
