'use client';

import { useState, useEffect } from 'react';

type Ticker = { symbol: string; price: string; change: string; up: boolean };

export default function TickerBar() {
  const [tickers, setTickers] = useState<Ticker[]>([]);

  useEffect(() => {
    fetchTickers();
    const interval = setInterval(fetchTickers, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTickers() {
    try {
      const [marketsRes, pricesRes, stocksRes] = await Promise.all([
        fetch('/api/markets'),
        fetch('/api/stock-prices'),
        fetch('/api/stocks'),
      ]);
      const marketsData = await marketsRes.json();
      const pricesData = await pricesRes.json();
      const stocksData = await stocksRes.json();

      const result: Ticker[] = [];

      const egx = marketsData.indices?.find((idx: any) => idx.name === 'EGX30');
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

      if (marketsData.usdEgp) {
        result.push({ symbol: 'USD/EGP', price: marketsData.usdEgp, change: '', up: true });
      }
      const gold = marketsData.indices?.find((idx: any) => idx.name === 'الذهب');
      if (gold) result.push({ symbol: 'XAU', price: gold.price, change: gold.change, up: gold.up });
      const oil = marketsData.indices?.find((idx: any) => idx.name === 'البترول');
      if (oil) result.push({ symbol: 'OIL', price: oil.price, change: oil.change, up: oil.up });

      if (result.length > 0) setTickers(result);
    } catch (e) {}
  }

  const allTickers = [...tickers, ...tickers];

  return (
    <div className="bg-black border-b border-gray-800 overflow-hidden">
      <div className="flex items-center">

        {/* Label ثابت */}
        <div className="bg-orange-500 text-black font-bold text-xs px-3 py-2 flex-shrink-0 whitespace-nowrap">
          LIVE
        </div>

        {/* الشريط المتحرك */}
        <div className="overflow-hidden flex-1">
          {allTickers.length > 0 && (
            <div
              className="flex w-max"
              style={{ animation: 'ticker 35s linear infinite' }}
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
