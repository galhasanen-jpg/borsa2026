'use client';

import { useState, useEffect } from 'react';

type Ticker = { symbol: string; price: string; change: string; up: boolean };

export default function TickerBar() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetchTickers();
    const interval = setInterval(fetchTickers, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTickers() {
    // كل مصدر مستقل عن التاني: فشل واحد (شبكة، استجابة غير صالحة...) ما يمنعش عرض
    // باقي البيانات
    async function safeFetchJson(url: string) {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    }

    try {
      const [marketsData, pricesData, stocksData] = await Promise.all([
        safeFetchJson('/api/markets'),
        safeFetchJson('/api/stock-prices'),
        safeFetchJson('/api/stocks'),
      ]);

      const result: Ticker[] = [];

      const egx = marketsData?.indices?.find((idx: any) => idx.name === 'EGX30');
      if (egx) result.push({ symbol: 'EGX30', price: egx.price, change: egx.change, up: egx.up });

      // أسهم مؤشر EGX30 فعلياً كما حُدِّدت بلوحة الإدارة (تبويب الأسعار، عمود EGX30)
      const egx30Symbols = Array.isArray(stocksData)
        ? stocksData.filter((s: any) => s.is_egx30).map((s: any) => s.symbol)
        : [];

      if (Array.isArray(pricesData)) {
        for (const sym of egx30Symbols) {
          const p = pricesData.find((x: any) => x.symbol === sym);
          if (!p) continue;
          const change = parseFloat(p.change_percent);
          result.push({
            symbol: sym,
            price: parseFloat(p.price).toFixed(2),
            change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
            up: change >= 0,
          });
        }
      }

      if (marketsData?.usdEgp) {
        result.push({ symbol: 'USD/EGP', price: marketsData.usdEgp, change: '', up: true });
      }
      const gold = marketsData?.indices?.find((idx: any) => idx.name === 'الذهب');
      if (gold) result.push({ symbol: 'XAU', price: gold.price, change: gold.change, up: gold.up });
      const brent = marketsData?.indices?.find((idx: any) => idx.name === 'خام برنت');
      if (brent) result.push({ symbol: 'BRENT', price: brent.price, change: brent.change, up: brent.up });

      if (result.length > 0) setTickers(result);
    } catch (e) {}
  }

  const allTickers = [...tickers, ...tickers];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-black border-t border-gray-800 overflow-hidden">
      <div className="flex items-center">

        {/* Label ثابت */}
        <div className="bg-orange-500 text-black font-bold text-xs px-3 py-2 flex-shrink-0 whitespace-nowrap">
          LIVE
        </div>

        {/* الشريط المتحرك — بنفرض LTR هنا تحديداً بغض النظر عن اتجاه الصفحة (RTL)، لأن
            حساب transform/overflow لعنصر أعرض من حاويته بيتصرف بشكل مختلف وغير متوقع
            تحت RTL، وده كان بيخلي جزء كبير من الأسهم يترسم برّه نطاق الحركة الفعلي */}
        <div className="overflow-hidden flex-1" dir="ltr">
          {allTickers.length > 0 && (
            <div
              className="flex w-max"
              style={{ animation: 'ticker 40s linear infinite', animationPlayState: paused ? 'paused' : 'running' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
              {allTickers.map((ticker, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 border-r border-gray-800 flex-shrink-0 cursor-pointer hover:bg-gray-900 transition"
                >
                  <span className="text-gray-300 text-xs font-bold tracking-wider">{ticker.symbol}</span>
                  <span className="text-white text-xs font-mono">{ticker.price}</span>
                  {ticker.change && (
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${ticker.up ? 'text-green-400' : 'text-red-400'}`}>
                      {ticker.up ? '▲' : '▼'} {ticker.change}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
