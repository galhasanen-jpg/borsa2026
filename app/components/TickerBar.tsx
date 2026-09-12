'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type Ticker = { symbol: string; price: string; change: string; up: boolean };

// سرعة ثابتة بالبكسل/الثانية بدل مدة ثابتة بالثواني — عدد الأسهم بالشريط بيتغيّر
// (حسب تحديد EGX30 من لوحة الإدارة)، فلو المدة ثابتة والمحتوى اختلف طوله، تتغيّر
// السرعة الفعلية الظاهرة. بنحسب المدة ديناميكياً من عرض المحتوى الفعلي عشان السرعة تفضل ثابتة دايماً.
const PIXELS_PER_SECOND = 45;

export default function TickerBar() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [paused, setPaused] = useState(false);
  const [singleWidth, setSingleWidth] = useState(0);
  const [repeatCount, setRepeatCount] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const singleSetRef = useRef<HTMLDivElement>(null);
  const lastLayoutKeyRef = useRef('');

  useEffect(() => {
    fetchTickers();
    const interval = setInterval(fetchTickers, 60000);
    return () => clearInterval(interval);
  }, []);

  // نحسب عرض نسخة واحدة من الأسهم، وعدد النسخ المطلوبة عشان يفضل فيه محتوى كافٍ
  // يملأ عرض الشاشة طول وقت الحركة — من غير كده، لو الأسهم قليلة أو الشاشة عريضة،
  // بيظهر فراغ فاضي في نهاية كل دورة قبل ما الحركة ترجع تبدأ من الأول
  const recomputeLayout = useCallback(() => {
    if (!singleSetRef.current || !containerRef.current) return;
    const w = singleSetRef.current.scrollWidth;
    if (w <= 0) return;
    setSingleWidth(w);
    const containerWidth = containerRef.current.clientWidth;
    setRepeatCount(Math.max(2, Math.ceil(containerWidth / w) + 1));
  }, []);

  useEffect(() => {
    // نعيد حساب التخطيط (وبالتالي حركة CSS تبدأ من جديد) فقط لما تتغيّر مجموعة الرموز
    // نفسها (إضافة/حذف سهم من EGX30) — مش عند كل تحديث سعر كل دقيقة. لو كنا بنعيد
    // الحساب مع كل تحديث سعر، الحركة كانت بتنقطع وترجع تبدأ من الصفر كل 60 ثانية،
    // وده كان بيظهر بالظبط كفجوة/قفزة متكررة رغم إصلاح مشكلة نقطة الالتفاف نفسها
    const layoutKey = tickers.map(t => t.symbol).join(',');
    if (layoutKey !== lastLayoutKeyRef.current) {
      lastLayoutKeyRef.current = layoutKey;
      recomputeLayout();
    }
  }, [tickers, recomputeLayout]);

  useEffect(() => {
    window.addEventListener('resize', recomputeLayout);
    return () => window.removeEventListener('resize', recomputeLayout);
  }, [recomputeLayout]);

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
      const brent = marketsData.indices?.find((idx: any) => idx.name === 'خام برنت');
      if (brent) result.push({ symbol: 'BRENT', price: brent.price, change: brent.change, up: brent.up });

      if (result.length > 0) setTickers(result);
    } catch (e) {}
  }

  const duration = singleWidth > 0 ? singleWidth / PIXELS_PER_SECOND : 100;

  function renderTicker(ticker: Ticker, key: string) {
    return (
      <div
        key={key}
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
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-black border-t border-gray-800 overflow-hidden">
      <div className="flex items-center">

        {/* Label ثابت */}
        <div className="bg-orange-500 text-black font-bold text-xs px-3 py-2 flex-shrink-0 whitespace-nowrap">
          LIVE
        </div>

        {/* الشريط المتحرك */}
        <div ref={containerRef} className="overflow-hidden flex-1">
          {tickers.length > 0 && (
            <div
              className="flex w-max"
              style={{ animation: `ticker ${duration}s linear infinite`, animationPlayState: paused ? 'paused' : 'running' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
              {Array.from({ length: repeatCount }).map((_, copyIndex) => (
                <div key={copyIndex} ref={copyIndex === 0 ? singleSetRef : undefined} className="flex">
                  {tickers.map((ticker, i) => renderTicker(ticker, `${copyIndex}-${i}`))}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${singleWidth}px); }
        }
      `}</style>
    </div>
  );
}
