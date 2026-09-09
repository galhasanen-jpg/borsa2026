// جلب بيانات حقيقية (تاريخية وسعر حالي) من Yahoo Finance — واجهة عامة بدون حاجة لمفتاح API،
// تُستخدم كحل مرحلي ريثما تتوفر واجهة رسمية من البورصة المصرية نفسها.

export async function fetchYahooHistory(symbol, range = '1y') {
    const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.CA`;

    try {
        const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${range}&interval=1d`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
        );
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        const timestamps = result?.timestamp;
        const quote = result?.indicators?.quote?.[0];

        if (!timestamps || !quote) return null;

        const history = [];
        for (let i = 0; i < timestamps.length; i++) {
            const close = quote.close?.[i];
            if (close == null) continue; // تجاهل الأيام بدون تداول (عطلات)

            history.push({
                date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                open: parseFloat((quote.open?.[i] ?? close).toFixed(2)),
                high: parseFloat((quote.high?.[i] ?? close).toFixed(2)),
                low: parseFloat((quote.low?.[i] ?? close).toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: quote.volume?.[i] || 0,
            });
        }

        return history;
    } catch (err) {
        return null;
    }
}

export async function fetchYahooQuote(symbol) {
    const yahooSymbol = symbol.includes('.') ? symbol : `${symbol}.CA`;

    try {
        const res = await fetch(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
        );
        const data = await res.json();
        const quote = data?.quoteResponse?.result?.[0];

        if (!quote || !quote.regularMarketPrice) return null;

        return {
            price: quote.regularMarketPrice.toFixed(2),
            changePercent: quote.regularMarketChangePercent?.toFixed(2) || '0',
            volume: quote.regularMarketVolume?.toString() || '0',
        };
    } catch (err) {
        return null;
    }
}
