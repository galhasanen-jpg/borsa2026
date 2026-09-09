// جلب بيانات حقيقية (تاريخية وسعر حالي) من Yahoo Finance — واجهة عامة بدون حاجة لمفتاح API،
// تُستخدم كحل مرحلي ريثما تتوفر واجهة رسمية من البورصة المصرية نفسها.

// بعض الأسهم مدرجة على Yahoo برمز ISIN (مثل EGS...) بدل الرمز المختصر المعتاد.
// كل ما نتأكد من رمز صحيح لسهم فشلت مزامنته، نضيفه هنا.
const YAHOO_SYMBOL_OVERRIDES = {
    'QNBE': 'EGS60081C014.CA',
};

// قائمة الرموز المرشّحة نجربها على Yahoo بالترتيب: استثناء معروف، ثم الرمز المختصر + .CA،
// ثم رمز الـ ISIN المحفوظ لهذا السهم (إن وُجد) + .CA كحل أخير
function candidateYahooSymbols(symbol, isin) {
    const candidates = [];
    if (YAHOO_SYMBOL_OVERRIDES[symbol]) candidates.push(YAHOO_SYMBOL_OVERRIDES[symbol]);
    candidates.push(symbol.includes('.') ? symbol : `${symbol}.CA`);
    if (isin) candidates.push(isin.includes('.') ? isin : `${isin}.CA`);
    return candidates;
}

async function fetchHistoryForYahooSymbol(yahooSymbol, range) {
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

        return history.length > 0 ? history : null;
    } catch (err) {
        return null;
    }
}

async function fetchQuoteForYahooSymbol(yahooSymbol) {
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

// symbol: الرمز المختصر عندنا. isin (اختياري): رمز ISIN المحفوظ لهذا السهم، يُجرَّب إذا فشل الرمز المختصر
export async function fetchYahooHistory(symbol, range = '1y', isin = null) {
    for (const yahooSymbol of candidateYahooSymbols(symbol, isin)) {
        const history = await fetchHistoryForYahooSymbol(yahooSymbol, range);
        if (history) return history;
    }
    return null;
}

export async function fetchYahooQuote(symbol, isin = null) {
    for (const yahooSymbol of candidateYahooSymbols(symbol, isin)) {
        const quote = await fetchQuoteForYahooSymbol(yahooSymbol);
        if (quote) return quote;
    }
    return null;
}
