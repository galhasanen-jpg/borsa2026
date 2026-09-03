const FINNHUB_KEY = 'd7nlvchr01qm3636vf50d7nlvchr01qm3636vf5g';

export async function GET() {
    try {
        const [currencyRes, goldRes, oilRes, sp500Res, tasiRes, egxRes, abuRes] = await Promise.all([
            fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' }),
            fetch('https://api.gold-api.com/price/XAU', { cache: 'no-store' }),
            fetch(`https://finnhub.io/api/v1/quote?symbol=USO&token=${FINNHUB_KEY}`, { cache: 'no-store' }),
            fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
            fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5ETASI.SR?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
            fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5ECASE30?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }),
            fetch(`https://finnhub.io/api/v1/quote?symbol=UAE&token=${FINNHUB_KEY}`, { cache: 'no-store' }),
        ]);

        const currencyData = await currencyRes.json();
        const goldData = await goldRes.json();
        const oilData = await oilRes.json();
        const sp500Data = await sp500Res.json();
        const tasiData = await tasiRes.json();
        const egxData = await egxRes.json();
        const abuData = await abuRes.json();

        const usdEgp = currencyData.rates.EGP;

        const egxPrice = egxData?.chart?.result?.[0]?.meta?.regularMarketPrice;
        const egxPrev = egxData?.chart?.result?.[0]?.meta?.chartPreviousClose;
        const egxChange = egxPrice && egxPrev ? (((egxPrice - egxPrev) / egxPrev) * 100).toFixed(2) : '0';

        const sp500Price = sp500Data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        const sp500Prev = sp500Data?.chart?.result?.[0]?.meta?.chartPreviousClose;
        const sp500Change = sp500Price && sp500Prev ? (((sp500Price - sp500Prev) / sp500Prev) * 100).toFixed(2) : '0';

        const tasiPrice = tasiData?.chart?.result?.[0]?.meta?.regularMarketPrice;
        const tasiPrev = tasiData?.chart?.result?.[0]?.meta?.chartPreviousClose;
        const tasiChange = tasiPrice && tasiPrev ? (((tasiPrice - tasiPrev) / tasiPrev) * 100).toFixed(2) : '0';

        return Response.json({
            indices: [
                {
                    name: 'EGX30', nameEn: 'EGX30',
                    price: egxPrice ? egxPrice.toLocaleString('en', { maximumFractionDigits: 0 }) : '52,719',
                    change: parseFloat(egxChange) >= 0 ? `+${egxChange}%` : `${egxChange}%`,
                    up: parseFloat(egxChange) >= 0,
                    flag: '🇪🇬'
                },
                {
                    name: 'S&P500', nameEn: 'S&P500',
                    price: sp500Price ? sp500Price.toLocaleString('en', { maximumFractionDigits: 0 }) : '5,355',
                    change: parseFloat(sp500Change) >= 0 ? `+${sp500Change}%` : `${sp500Change}%`,
                    up: parseFloat(sp500Change) >= 0,
                    flag: '🇺🇸'
                },
                {
                    name: 'تداول', nameEn: 'Tadawul',
                    price: tasiPrice ? tasiPrice.toLocaleString('en', { maximumFractionDigits: 0 }) : '11,169',
                    change: parseFloat(tasiChange) >= 0 ? `+${tasiChange}%` : `${tasiChange}%`,
                    up: parseFloat(tasiChange) >= 0,
                    flag: '🇸🇦'
                },
                {
                    name: 'أبوظبي', nameEn: 'ADX',
                    price: abuData.c ? (abuData.c * 500).toLocaleString('en', { maximumFractionDigits: 0 }) : '9,715',
                    change: abuData.dp ? (abuData.dp >= 0 ? `+${abuData.dp.toFixed(2)}%` : `${abuData.dp.toFixed(2)}%`) : '0%',
                    up: abuData.dp >= 0,
                    flag: '🇦🇪'
                },
                {
                    name: 'الذهب', nameEn: 'Gold',
                    price: goldData.price ? goldData.price.toLocaleString('en', { maximumFractionDigits: 0 }) : '4,694',
                    change: '+0.45%',
                    up: true,
                    flag: '🥇'
                },
                {
                    name: 'البترول', nameEn: 'Oil',
                    price: oilData.c ? oilData.c.toFixed(2) : '82.30',
                    change: oilData.dp ? (oilData.dp >= 0 ? `+${oilData.dp.toFixed(2)}%` : `${oilData.dp.toFixed(2)}%`) : '0%',
                    up: oilData.dp >= 0,
                    flag: '🛢️'
                },
            ],
            usdEgp: usdEgp?.toFixed(2) || '52.67',
        });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}