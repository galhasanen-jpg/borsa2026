const FINNHUB_KEY = process.env.FINNHUB_KEY;

// كل مصدر يُجلب بشكل مستقل، حتى فشل مصدر واحد (شبكة، رمز غير صحيح...) ما يمنع باقي
// المؤشرات من الرجوع ببياناتها الحقيقية. نرجع أيضاً "live" لكل مؤشر ليتضح هل هو
// بيانات فعلية أو قيمة احتياطية ثابتة.
async function safeFetchJson(url, options) {
    try {
        const res = await fetch(url, options);
        return await res.json();
    } catch (err) {
        return null;
    }
}

function yahooChange(data) {
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    const prev = data?.chart?.result?.[0]?.meta?.chartPreviousClose;
    if (!price || !prev) return null;
    const change = ((price - prev) / prev) * 100;
    return { price, change };
}

export async function GET() {
    const [currencyData, goldData, oilData, sp500Data, tasiData, egxData, abuData] = await Promise.all([
        safeFetchJson('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' }),
        safeFetchJson('https://api.gold-api.com/price/XAU', { cache: 'no-store' }),
        FINNHUB_KEY ? safeFetchJson(`https://finnhub.io/api/v1/quote?symbol=USO&token=${FINNHUB_KEY}`, { cache: 'no-store' }) : null,
        safeFetchJson('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
        safeFetchJson('https://query1.finance.yahoo.com/v8/finance/chart/%5ETASI.SR?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
        safeFetchJson('https://query1.finance.yahoo.com/v8/finance/chart/%5ECASE30?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
        FINNHUB_KEY ? safeFetchJson(`https://finnhub.io/api/v1/quote?symbol=UAE&token=${FINNHUB_KEY}`, { cache: 'no-store' }) : null,
    ]);

    const usdEgp = currencyData?.rates?.EGP;

    const egx = yahooChange(egxData);
    const sp500 = yahooChange(sp500Data);
    const tasi = yahooChange(tasiData);

    return Response.json({
        indices: [
            {
                name: 'EGX30', nameEn: 'EGX30',
                price: egx ? egx.price.toLocaleString('en', { maximumFractionDigits: 0 }) : '52,719',
                change: egx ? `${egx.change >= 0 ? '+' : ''}${egx.change.toFixed(2)}%` : '+0.57%',
                up: egx ? egx.change >= 0 : true,
                live: !!egx,
                flag: '🇪🇬'
            },
            {
                name: 'S&P500', nameEn: 'S&P500',
                price: sp500 ? sp500.price.toLocaleString('en', { maximumFractionDigits: 0 }) : '5,355',
                change: sp500 ? `${sp500.change >= 0 ? '+' : ''}${sp500.change.toFixed(2)}%` : '+0%',
                up: sp500 ? sp500.change >= 0 : true,
                live: !!sp500,
                flag: '🇺🇸'
            },
            {
                name: 'تداول', nameEn: 'Tadawul',
                price: tasi ? tasi.price.toLocaleString('en', { maximumFractionDigits: 0 }) : '11,169',
                change: tasi ? `${tasi.change >= 0 ? '+' : ''}${tasi.change.toFixed(2)}%` : '+0%',
                up: tasi ? tasi.change >= 0 : true,
                live: !!tasi,
                flag: '🇸🇦'
            },
            {
                name: 'أبوظبي', nameEn: 'ADX',
                price: abuData?.c ? (abuData.c * 500).toLocaleString('en', { maximumFractionDigits: 0 }) : '9,715',
                change: abuData?.dp != null ? `${abuData.dp >= 0 ? '+' : ''}${abuData.dp.toFixed(2)}%` : '+0%',
                up: abuData?.dp != null ? abuData.dp >= 0 : true,
                live: !!abuData?.c,
                flag: '🇦🇪'
            },
            {
                name: 'الذهب', nameEn: 'Gold',
                price: goldData?.price ? goldData.price.toLocaleString('en', { maximumFractionDigits: 0 }) : '4,694',
                change: '+0.45%',
                up: true,
                live: !!goldData?.price,
                flag: '🥇'
            },
            {
                name: 'البترول', nameEn: 'Oil',
                price: oilData?.c ? oilData.c.toFixed(2) : '82.30',
                change: oilData?.dp != null ? `${oilData.dp >= 0 ? '+' : ''}${oilData.dp.toFixed(2)}%` : '+0%',
                up: oilData?.dp != null ? oilData.dp >= 0 : true,
                live: !!oilData?.c,
                flag: '🛢️'
            },
        ],
        usdEgp: usdEgp?.toFixed(2) || '52.67',
    });
}
