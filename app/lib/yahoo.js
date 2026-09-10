// جلب بيانات حقيقية (تاريخية وسعر حالي) من Yahoo Finance — واجهة عامة بدون حاجة لمفتاح API،
// تُستخدم كحل مرحلي ريثما تتوفر واجهة رسمية من البورصة المصرية نفسها.
//
// نعتمد فقط على واجهة الرسم البياني (v8/finance/chart) لكل من التاريخ والسعر الحالي معاً
// (نستخرج السعر من حقل meta بنفس استجابة الرسم البياني). كنا نستخدم واجهة v7/finance/quote
// المنفصلة لجلب السعر الحالي فقط، لكنها أصبحت تتطلب مصادقة إضافية (crumb/cookie) من Yahoo
// وبدأت تفشل بصمت لأسهم كثيرة — كانت تنجح مزامنة البيانات التاريخية لسهم معيّن بينما يفشل
// سعره الحالي بدون أي إشارة خطأ واضحة. استخدام مصدر واحد موثوق للاثنين يمنع هذا التضارب.

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

// يجلب استجابة الرسم البياني لرمز Yahoo محدد، ويستخرج منها كلاً من التاريخ اليومي
// (من indicators.quote) والسعر الحالي (من meta) بنفس الطلب الواحد.
async function fetchChartForYahooSymbol(yahooSymbol, range) {
    try {
        const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=${range}&interval=1d`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
        );
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        if (!result) return null;

        const timestamps = result.timestamp;
        const quoteSeries = result.indicators?.quote?.[0];
        const meta = result.meta;

        let history = null;
        if (timestamps && quoteSeries) {
            history = [];
            for (let i = 0; i < timestamps.length; i++) {
                const close = quoteSeries.close?.[i];
                if (close == null) continue; // تجاهل الأيام بدون تداول (عطلات)

                history.push({
                    date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
                    open: parseFloat((quoteSeries.open?.[i] ?? close).toFixed(2)),
                    high: parseFloat((quoteSeries.high?.[i] ?? close).toFixed(2)),
                    low: parseFloat((quoteSeries.low?.[i] ?? close).toFixed(2)),
                    close: parseFloat(close.toFixed(2)),
                    volume: quoteSeries.volume?.[i] || 0,
                });
            }
            if (history.length === 0) history = null;
        }

        let quote = null;
        if (meta?.regularMarketPrice != null) {
            const price = meta.regularMarketPrice;
            const prevClose = meta.previousClose ?? meta.chartPreviousClose;
            const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
            const lastVolume = quoteSeries?.volume?.filter(v => v != null).slice(-1)[0];

            quote = {
                price: price.toFixed(2),
                changePercent: changePercent.toFixed(2),
                volume: (meta.regularMarketVolume ?? lastVolume ?? 0).toString(),
            };
        }

        return { history, quote };
    } catch (err) {
        return null;
    }
}

// symbol: الرمز المختصر عندنا. isin (اختياري): رمز ISIN المحفوظ لهذا السهم، يُجرَّب إذا فشل الرمز المختصر

export async function fetchYahooHistory(symbol, range = '1y', isin = null) {
    for (const yahooSymbol of candidateYahooSymbols(symbol, isin)) {
        const result = await fetchChartForYahooSymbol(yahooSymbol, range);
        if (result?.history) return result.history;
    }
    return null;
}

export async function fetchYahooQuote(symbol, isin = null) {
    for (const yahooSymbol of candidateYahooSymbols(symbol, isin)) {
        const result = await fetchChartForYahooSymbol(yahooSymbol, '5d');
        if (result?.quote) return result.quote;
    }
    return null;
}

// يجلب التاريخ والسعر الحالي معاً بطلب واحد فقط لكل رمز مرشّح (بدل طلبين منفصلين)،
// ويضمن أن يكونا من نفس الاستجابة فلا يتضارب نجاح أحدهما مع فشل الآخر
export async function fetchYahooChart(symbol, range = '1y', isin = null) {
    for (const yahooSymbol of candidateYahooSymbols(symbol, isin)) {
        const result = await fetchChartForYahooSymbol(yahooSymbol, range);
        if (result?.history || result?.quote) return result;
    }
    return { history: null, quote: null };
}
