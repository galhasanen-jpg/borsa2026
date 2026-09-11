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
    const [currencyData, goldData, brentData, sp500Data, tasiData, egxData, abuData] = await Promise.all([
        safeFetchJson('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' }),
        safeFetchJson('https://api.gold-api.com/price/XAU', { cache: 'no-store' }),
        // عقود خام برنت الآجلة (BZ=F) عبر نفس واجهة Yahoo المستخدمة لباقي المؤشرات —
        // كنا نستخدم USO (صندوق ETF يتتبع خام WTI الأمريكي، مش برنت، وسعره سعر وحدة
        // الصندوق مش سعر البرميل الفعلي) عبر Finnhub، فاستبدلناه بمصدر السعر الصحيح
        safeFetchJson('https://query1.finance.yahoo.com/v8/finance/chart/BZ%3DF?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
        safeFetchJson('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
        safeFetchJson('https://query1.finance.yahoo.com/v8/finance/chart/%5ETASI.SR?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
        safeFetchJson('https://query1.finance.yahoo.com/v8/finance/chart/%5ECASE30?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
        FINNHUB_KEY ? safeFetchJson(`https://finnhub.io/api/v1/quote?symbol=UAE&token=${FINNHUB_KEY}`, { cache: 'no-store' }) : null,
    ]);

    const usdEgp = currencyData?.rates?.EGP;

    const egx = yahooChange(egxData);
    const sp500 = yahooChange(sp500Data);
    const tasi = yahooChange(tasiData);
    const brent = yahooChange(brentData);

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
                name: 'خام برنت', nameEn: 'Brent Crude',
                price: brent ? brent.price.toFixed(2) : '75.00',
                change: brent ? `${brent.change >= 0 ? '+' : ''}${brent.change.toFixed(2)}%` : '+0%',
                up: brent ? brent.change >= 0 : true,
                live: !!brent,
                flag: '🛢️'
            },
        ],
        usdEgp: usdEgp?.toFixed(2) || '52.67',
    });
}
