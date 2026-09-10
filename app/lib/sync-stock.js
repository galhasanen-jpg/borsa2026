import { fetchYahooChart } from './yahoo';

// يزامن سهماً واحداً: يجلب سنة من البيانات التاريخية والسعر الحالي من Yahoo بطلب واحد
// (فحص chart لكل رمز مرشّح، فيضمن أن التاريخ والسعر من نفس الاستجابة) ويكتبها بقاعدة
// البيانات. تُستخدم من زر المزامنة اليدوي بلوحة الإدارة ومن المزامنة اليومية التلقائية
// (Cron) على حد سواء، لتفادي تكرار نفس المنطق.
export async function syncStockFromYahoo(client, symbol, isin) {
    const { history, quote } = await fetchYahooChart(symbol, '1y', isin);

    let historyCount = 0;
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

    let gotQuote = false;
    if (quote) {
        await client.query(
            `INSERT INTO stock_prices (symbol, price, change_percent, volume, updated_at, quote_time)
            VALUES ($1, $2, $3, $4, NOW(), $5)
            ON CONFLICT (symbol) DO UPDATE SET
            price = $2, change_percent = $3, volume = $4, updated_at = NOW(), quote_time = $5`,
            [symbol, quote.price, quote.changePercent, quote.volume, quote.quoteTime]
        );
        gotQuote = true;
    }

    return { symbol, historyCount, gotQuote, success: historyCount > 0 || gotQuote };
}
