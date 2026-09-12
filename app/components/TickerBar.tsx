'use client';

import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';

type Ticker = { symbol: string; price: string; change: string; up: boolean };

// سرعة ثابتة بالبكسل/الثانية — عدد الأسهم بيتغيّر (حسب تحديد EGX30 من لوحة الإدارة)
// فلازم نحسب السرعة من عرض المحتوى الفعلي، مش مدة CSS ثابتة، عشان تفضل ثابتة دايماً
const PIXELS_PER_SECOND = 45;

export default function TickerBar() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [paused, setPaused] = useState(false);
  // عدد مرات تكرار قائمة الأسهم الحقيقية داخل "الوحدة" الواحدة، بعرض كافٍ يغطي
  // عرض الشاشة بمحتوى فعلي كامل (مش مساحة فاضية) عشان محدش يشوف فراغ وقت المرور
  const [repeatCount, setRepeatCount] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastLayoutKeyRef = useRef('');

  // بنحرّك الشريط بـ requestAnimationFrame يدوياً بدل CSS animation: بنتحكم في
  // موضع التمرير مباشرة (transform على الـ DOM) من غير ما نعتمد على "مدة" حركة
  // CSS طويلة (فوق 100 ثانية أحياناً) ممكن تتصرف بشكل غريب في بعض المتصفحات، وده
  // كمان بيمنع أي إعادة تشغيل للحركة لما الـ React state يتغيّر (تحديث سعر كل دقيقة)
  const unitWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const lastFrameTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    function tick(now: number) {
      const unitWidth = unitWidthRef.current;
      if (lastFrameTimeRef.current == null) lastFrameTimeRef.current = now;
      const dt = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (!pausedRef.current && unitWidth > 0) {
        offsetRef.current = (offsetRef.current + (PIXELS_PER_SECOND * dt) / 1000) % unitWidth;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    }
    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  useEffect(() => {
    fetchTickers();
    const interval = setInterval(fetchTickers, 60000);
    return () => clearInterval(interval);
  }, []);

  const recomputeLayout = useCallback(() => {
    if (!containerRef.current || !unitRef.current || tickers.length === 0) return;
    const containerWidth = containerRef.current.clientWidth;

    // عرض نسخة واحدة فقط من قائمة الأسهم الحقيقية (بغض النظر عن عدد التكرارات الحالي)
    const currentRepeat = Math.max(1, Math.round(unitRef.current.children.length / tickers.length));
    const naturalWidth = unitRef.current.scrollWidth / currentRepeat;
    if (naturalWidth <= 0) return;

    // كم مرة نكرر القائمة الحقيقية عشان "الوحدة" تملأ عرض الشاشة بمحتوى فعلي كامل
    const neededRepeat = Math.max(1, Math.ceil(containerWidth / naturalWidth));
    setRepeatCount(neededRepeat);

    // ننتظر فريم واحد عشان الـ DOM يطبّق عدد التكرار الجديد قبل قياس عرض الوحدة الفعلي
    requestAnimationFrame(() => {
      if (!unitRef.current) return;
      const w = unitRef.current.scrollWidth;
      if (w > 0) {
        // لو عرض الوحدة اتغيّر، نصحّح موضع التمرير الحالي نسبياً بدل ما نرجعه للصفر
        // (يمنع أي قفزة مفاجئة محسوسة لو عدد الأسهم اتغيّر أثناء التشغيل)
        if (unitWidthRef.current > 0) {
          offsetRef.current = (offsetRef.current % w + w) % w;
        }
        unitWidthRef.current = w;
      }
    });
  }, [tickers]);

  useEffect(() => {
    // نعيد الحساب فقط لما تتغيّر مجموعة الرموز نفسها (إضافة/حذف سهم من EGX30) —
    // مش عند كل تحديث سعر كل دقيقة
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
    // كل مصدر مستقل عن التاني: فشل واحد (شبكة، استجابة غير صالحة...) ما يمنعش عرض
    // باقي البيانات، بدل ما يفشل الكل مع بعض ويفضل الشريط فاضي لحد نجاح الثلاثة معاً
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

  // "وحدة" = قائمة الأسهم مكرّرة repeatCount مرة (محتوى حقيقي بالكامل، بلا أي فراغ)
  // بعرض كافٍ يغطي عرض الشاشة. نعرض وحدتين متطابقتين وراء بعض للحركة المتصلة بلا فجوة
  function renderUnit(unitKey: string, ref?: RefObject<HTMLDivElement | null>) {
    const items = [];
    for (let r = 0; r < repeatCount; r++) {
      for (let i = 0; i < tickers.length; i++) {
        items.push(renderTicker(tickers[i], `${unitKey}-${r}-${i}`));
      }
    }
    return (
      <div ref={ref} className="flex flex-shrink-0">
        {items}
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
              ref={trackRef}
              className="flex w-max will-change-transform"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
              {renderUnit('a', unitRef)}
              {renderUnit('b')}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
