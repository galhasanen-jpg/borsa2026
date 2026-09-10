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

            // وقت السعر نفسه كما يراه Yahoo (قد يكون أقدم من وقت مزامنتنا نحن إذا كانت
            // بيانات ياهو لهذا السهم متأخرة أصلاً — نعرضه بشكل منفصل عن "آخر تحديث"
            // لتمييز "متى زامنّا" عن "السعر يعود فعلياً لمتى")
            const quoteTime = meta.regularMarketTime
                ? new Date(meta.regularMarketTime * 1000).toISOString()
                : null;

            quote = {
                price: price.toFixed(2),
                changePercent: changePercent.toFixed(2),
                volume: (meta.regularMarketVolume ?? lastVolume ?? 0).toString(),
                quoteTime,
            };
        }

        return { history, quote };
    } catch (err) {
        return null;
    }
}

// symbol: الرمز المختصر عندنا. isin (اختياري): رمز ISIN المحفوظ لهذا السهم، يُجرَّب أيضاً كمرشح.
//
// بعض الأسهم لها أكثر من قيد على Yahoo (رمز مختصر + رمز ISIN)، وأحدهما قد يكون قيداً
// قديماً متجمداً منذ إجراء على السهم (توزيع أسهم مجانية، تجزئة) بينما الآخر هو المتداول
// فعلياً. رمز كهذا يرجع استجابة "صالحة" شكلياً (فيها سعر) فلا يكفي إيقاف البحث عند أول
// رمز ناجح — لازم نجرب كل المرشحين ونختار الأحدث زمنياً (بحسب meta.regularMarketTime).
async function fetchFreshestChart(symbol, range, isin) {
    const candidates = candidateYahooSymbols(symbol, isin);
    let best = null;
    let bestTime = -Infinity;

    for (const yahooSymbol of candidates) {
        const result = await fetchChartForYahooSymbol(yahooSymbol, range);
        if (!result || (!result.history && !result.quote)) continue;

        const time = result.quote?.quoteTime ? new Date(result.quote.quoteTime).getTime() : -1;
        if (!best || time > bestTime) {
            best = result;
            bestTime = time;
        }
    }

    return best || { history: null, quote: null };
}

export async function fetchYahooHistory(symbol, range = '1y', isin = null) {
    const { history } = await fetchFreshestChart(symbol, range, isin);
    return history;
}

export async function fetchYahooQuote(symbol, isin = null) {
    const { quote } = await fetchFreshestChart(symbol, '5d', isin);
    return quote;
}

// يجلب التاريخ والسعر الحالي معاً، مقارناً كل الرموز المرشّحة واختيار الأحدث،
// ويضمن أن التاريخ والسعر المُرجَعان من نفس الاستجابة فلا يتضارب نجاح أحدهما مع فشل الآخر
export async function fetchYahooChart(symbol, range = '1y', isin = null) {
    return fetchFreshestChart(symbol, range, isin);
}
