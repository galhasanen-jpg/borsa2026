'use client';

import { useState, useEffect } from 'react';

type PriceData = { price?: string; changePercent?: string; volume?: string } | null;

const L = {
  ar: {
    title: '🧠 التحليل المبسّط',
    loading: 'جاري تحليل السهم...',
    insufficient: 'لا توجد بيانات كافية لتحليل هذا السهم حالياً',
    summaryLabel: 'الخلاصة',
    positive: 'إيجابي',
    neutral: 'محايد',
    negative: 'سلبي',
    limitedNote: 'ℹ️ يعتمد التحليل على بيانات اليوم فقط لعدم توفّر تاريخ سعري كافٍ لهذا السهم',

    today: 'تغيّر اليوم',
    todayUp: 'ارتفع سعر السهم اليوم',
    todayDown: 'انخفض سعر السهم اليوم',
    todayFlat: 'لم يتغيّر سعر السهم اليوم تقريباً',

    trend: 'الاتجاه العام',
    trendUp: 'صاعد 📈',
    trendDown: 'هابط 📉',
    trendSide: 'مستقر ➡️',
    trendUpDesc: 'السعر أعلى من متوسطه خلال الفترة، أي أنه يميل للصعود',
    trendDownDesc: 'السعر أقل من متوسطه خلال الفترة، أي أنه يميل للهبوط',
    trendSideDesc: 'السعر يتحرك حول متوسطه بدون اتجاه واضح',

    perf: 'الأداء خلال 3 أشهر',
    perfUp: 'ارتفع السهم خلال الأشهر الثلاثة الماضية',
    perfDown: 'انخفض السهم خلال الأشهر الثلاثة الماضية',

    range: 'موقع السعر ضمن نطاقه',
    rangeHigh: 'السعر قريب من أعلى مستوى له خلال الفترة',
    rangeLow: 'السعر قريب من أدنى مستوى له خلال الفترة',
    rangeMid: 'السعر في منتصف نطاق تداوله خلال الفترة',
    low: 'الأدنى',
    high: 'الأعلى',

    risk: 'مستوى المخاطرة',
    riskLow: 'منخفضة',
    riskMid: 'متوسطة',
    riskHigh: 'عالية',
    riskDesc: 'يعكس مدى تذبذب سعر السهم؛ كلما زاد التذبذب زادت المخاطرة',

    volume: 'نشاط التداول اليوم',
    volHigh: 'مرتفع',
    volNormal: 'طبيعي',
    volLow: 'منخفض',
    volHighDesc: 'التداول أعلى من المعتاد، مما يدل على اهتمام كبير بالسهم',
    volNormalDesc: 'حجم التداول قريب من متوسطه المعتاد',
    volLowDesc: 'حجم التداول أقل من المعتاد، اهتمام محدود بالسهم',

    fair: 'القيمة العادلة (تقدير المحللين)',
    fairUnder: 'السعر الحالي أقل من القيمة العادلة بنسبة',
    fairOver: 'السعر الحالي أعلى من القيمة العادلة بنسبة',
    fairEqual: 'السعر الحالي قريب من القيمة العادلة المقدّرة',
    analystRec: 'توصية المحللين:',
    fairValueLabel: 'القيمة العادلة:',
    pound: 'ج',

    disclaimer: '⚠️ هذا تحليل آلي مبسّط لأغراض تعليمية فقط، وليس توصية بالشراء أو البيع. اتخذ قرارك بنفسك أو استشر مختصاً.',
  },
  en: {
    title: '🧠 Simple Analysis',
    loading: 'Analyzing stock...',
    insufficient: 'Not enough data to analyze this stock right now',
    summaryLabel: 'Summary',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
    limitedNote: 'ℹ️ Analysis is based on today only — not enough price history is available for this stock',

    today: "Today's Change",
    todayUp: 'The stock rose today',
    todayDown: 'The stock fell today',
    todayFlat: 'The stock barely changed today',

    trend: 'Overall Trend',
    trendUp: 'Rising 📈',
    trendDown: 'Falling 📉',
    trendSide: 'Stable ➡️',
    trendUpDesc: 'Price is above its average for the period, so it tends to rise',
    trendDownDesc: 'Price is below its average for the period, so it tends to fall',
    trendSideDesc: 'Price moves around its average with no clear direction',

    perf: 'Performance over 3 months',
    perfUp: 'The stock rose over the past three months',
    perfDown: 'The stock fell over the past three months',

    range: 'Price position in its range',
    rangeHigh: 'Price is near its highest level for the period',
    rangeLow: 'Price is near its lowest level for the period',
    rangeMid: 'Price is in the middle of its trading range',
    low: 'Low',
    high: 'High',

    risk: 'Risk Level',
    riskLow: 'Low',
    riskMid: 'Medium',
    riskHigh: 'High',
    riskDesc: 'Reflects how much the price swings; more swings means more risk',

    volume: "Today's trading activity",
    volHigh: 'High',
    volNormal: 'Normal',
    volLow: 'Low',
    volHighDesc: 'Trading is above usual, showing strong interest in the stock',
    volNormalDesc: 'Trading volume is close to its usual average',
    volLowDesc: 'Trading is below usual, limited interest in the stock',

    fair: 'Fair Value (analysts estimate)',
    fairUnder: 'Current price is below fair value by',
    fairOver: 'Current price is above fair value by',
    fairEqual: 'Current price is close to the estimated fair value',
    analystRec: 'Analyst recommendation:',
    fairValueLabel: 'Fair value:',
    pound: 'EGP',

    disclaimer: '⚠️ This is a simplified automated analysis for educational purposes only — not a buy or sell recommendation. Make your own decision or consult a professional.',
  },
};

function toNum(v: any): number {
  const n = parseFloat(String(v ?? '').replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export default function StockAnalysis({
  symbol,
  name,
  lang,
  priceData,
}: {
  symbol: string;
  name: string;
  lang: 'ar' | 'en';
  priceData: PriceData;
}) {
  const [history, setHistory] = useState<any[]>([]);
  const [fairValues, setFairValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = L[lang];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [histRes, fvRes] = await Promise.all([
          fetch(`/api/stock-history?symbol=${symbol}&period=3m`),
          fetch(`/api/fair-values?symbol=${symbol}`),
        ]);
        const hist = await histRes.json();
        const fv = await fvRes.json();
        if (!cancelled) {
          setHistory(Array.isArray(hist) ? hist : []);
          setFairValues(Array.isArray(fv) ? fv : []);
        }
      } catch (e) {
        if (!cancelled) {
          setHistory([]);
          setFairValues([]);
        }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [symbol]);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-orange-500 font-bold text-sm mb-3">{t.title}</h3>
        <p className="text-gray-500 text-sm animate-pulse text-center py-6">{t.loading}</p>
      </div>
    );
  }

  const closes = history.map((h) => toNum(h.close)).filter((n) => n > 0);
  const hasHistory = closes.length >= 5;

  const todayChange = priceData?.changePercent ? toNum(priceData.changePercent) : null;

  // أحدث تقدير للقيمة العادلة
  const fv = fairValues.length > 0 ? fairValues[0] : null;
  const fairValue = fv ? toNum(fv.fair_value) : 0;

  // لا يوجد أي شيء نعرضه إطلاقاً
  if (!hasHistory && todayChange === null && !(fv && fairValue > 0)) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-orange-500 font-bold text-sm mb-3">{t.title}</h3>
        <p className="text-gray-500 text-sm text-center py-6">{t.insufficient}</p>
      </div>
    );
  }

  // === الحسابات ===
  const currentPrice = priceData?.price ? toNum(priceData.price) : (closes[closes.length - 1] || 0);

  // إشارات التاريخ (فقط عند توفّر تاريخ كافٍ)
  let periodChange = 0;
  let trend: 'up' | 'down' | 'side' = 'side';
  let high = 0, low = 0, pricePosition = 50;
  let risk: 'low' | 'mid' | 'high' = 'mid';
  let volSignal: 'high' | 'normal' | 'low' | null = null;

  if (hasHistory) {
    const firstPrice = closes[0];
    periodChange = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice) * 100 : 0;

    const sma = avg(closes);
    high = Math.max(...closes);
    low = Math.min(...closes);
    const range = high - low;
    pricePosition = range > 0 ? ((currentPrice - low) / range) * 100 : 50;

    if (currentPrice > sma * 1.015) trend = 'up';
    else if (currentPrice < sma * 0.985) trend = 'down';
    else trend = 'side';

    const dailyMoves: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      if (closes[i - 1] > 0) dailyMoves.push(Math.abs((closes[i] - closes[i - 1]) / closes[i - 1]) * 100);
    }
    const volatility = avg(dailyMoves);
    if (volatility < 1.2) risk = 'low';
    else if (volatility < 2.8) risk = 'mid';
    else risk = 'high';

    const histVolumes = history.map((h) => toNum(h.volume)).filter((n) => n > 0);
    const avgVol = avg(histVolumes);
    const todayVol = priceData?.volume ? toNum(priceData.volume) : 0;
    if (todayVol > 0 && avgVol > 0) {
      if (todayVol > avgVol * 1.3) volSignal = 'high';
      else if (todayVol < avgVol * 0.7) volSignal = 'low';
      else volSignal = 'normal';
    }
  }

  const fairGap = fairValue > 0 && currentPrice > 0 ? ((fairValue - currentPrice) / currentPrice) * 100 : null;

  // === التقييم العام (نقاط) ===
  let score = 0;
  if (hasHistory) {
    if (trend === 'up') score += 1;
    if (trend === 'down') score -= 1;
    if (periodChange > 3) score += 1;
    if (periodChange < -3) score -= 1;
  } else if (todayChange !== null) {
    if (todayChange > 2) score += 1;
    if (todayChange < -2) score -= 1;
  }
  if (fairGap !== null && fairGap > 5) score += 1;
  if (fairGap !== null && fairGap < -5) score -= 1;

  const verdict = score >= 2 ? 'positive' : score <= -2 ? 'negative' : 'neutral';
  const verdictStyle =
    verdict === 'positive'
      ? 'bg-green-900 bg-opacity-40 border-green-700 text-green-400'
      : verdict === 'negative'
      ? 'bg-red-900 bg-opacity-40 border-red-700 text-red-400'
      : 'bg-yellow-900 bg-opacity-30 border-yellow-700 text-yellow-400';
  const verdictLabel = verdict === 'positive' ? t.positive : verdict === 'negative' ? t.negative : t.neutral;

  // === نص القيمة العادلة ===
  let fairText = '';
  if (fairGap !== null) {
    if (fairGap > 2) fairText = ` ${t.fairUnder} ${fairGap.toFixed(1)}%.`;
    else if (fairGap < -2) fairText = ` ${t.fairOver} ${Math.abs(fairGap).toFixed(1)}%.`;
    else fairText = ` ${t.fairEqual}.`;
  }

  // === الخلاصة بلغة بسيطة ===
  let summary = '';
  if (hasHistory) {
    const trendText = trend === 'up' ? t.trendUpDesc : trend === 'down' ? t.trendDownDesc : t.trendSideDesc;
    const perfText = periodChange >= 0
      ? `${t.perfUp} (+${periodChange.toFixed(1)}%)`
      : `${t.perfDown} (${periodChange.toFixed(1)}%)`;
    summary = `${trendText}. ${perfText}.${fairText}`;
  } else {
    const todayText = todayChange === null
      ? ''
      : todayChange > 0.2
      ? `${t.todayUp} (+${todayChange.toFixed(2)}%)`
      : todayChange < -0.2
      ? `${t.todayDown} (${todayChange.toFixed(2)}%)`
      : t.todayFlat;
    summary = `${todayText}.${fairText}`.trim();
  }

  const todayColor = todayChange === null ? 'text-gray-300' : todayChange >= 0 ? 'text-green-400' : 'text-red-400';
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-300';
  const perfColor = periodChange >= 0 ? 'text-green-400' : 'text-red-400';

  // بطاقة معلومة موحّدة الشكل
  const Metric = ({
    icon,
    label,
    value,
    valueColor,
    desc,
  }: {
    icon: string;
    label: string;
    value: string;
    valueColor?: string;
    desc: string;
  }) => (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <p className="text-gray-400 text-xs">{label}</p>
      </div>
      <p className={`font-bold text-sm ${valueColor || 'text-white'}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">

      {/* العنوان + التقييم العام */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-orange-500 font-bold text-sm">{t.title}</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${verdictStyle}`}>
          {verdictLabel}
        </span>
      </div>

      {/* الخلاصة */}
      <div className="bg-gray-800 bg-opacity-50 border-r-2 border-orange-500 rounded-lg p-3 mb-4">
        <p className="text-orange-400 text-xs font-bold mb-1">{t.summaryLabel}</p>
        <p className="text-gray-200 text-xs leading-relaxed">{summary}</p>
      </div>

      {/* البطاقات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* تغيّر اليوم - متاح دائماً */}
        {todayChange !== null && (
          <Metric
            icon="📅"
            label={t.today}
            value={`${todayChange >= 0 ? '+' : ''}${todayChange.toFixed(2)}%`}
            valueColor={todayColor}
            desc={todayChange > 0.2 ? t.todayUp : todayChange < -0.2 ? t.todayDown : t.todayFlat}
          />
        )}

        {hasHistory && (
          <>
            <Metric
              icon="🧭"
              label={t.trend}
              value={trend === 'up' ? t.trendUp : trend === 'down' ? t.trendDown : t.trendSide}
              valueColor={trendColor}
              desc={trend === 'up' ? t.trendUpDesc : trend === 'down' ? t.trendDownDesc : t.trendSideDesc}
            />

            <Metric
              icon="📊"
              label={t.perf}
              value={`${periodChange >= 0 ? '+' : ''}${periodChange.toFixed(1)}%`}
              valueColor={perfColor}
              desc={periodChange >= 0 ? t.perfUp : t.perfDown}
            />

            {/* موقع السعر ضمن النطاق مع شريط */}
            <div className="bg-gray-800 rounded-lg p-3 sm:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🎯</span>
                <p className="text-gray-400 text-xs">{t.range}</p>
              </div>
              <div dir="ltr" className="mt-1">
                <div className="relative h-2 bg-gray-700 rounded-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-orange-500 border-2 border-gray-900"
                    style={{ left: `${Math.max(0, Math.min(100, pricePosition))}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-xs">
                  <span className="text-gray-500">{t.low} {low.toFixed(2)}</span>
                  <span className="text-gray-500">{t.high} {high.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                {pricePosition > 70 ? t.rangeHigh : pricePosition < 30 ? t.rangeLow : t.rangeMid}
              </p>
            </div>

            <Metric
              icon="⚖️"
              label={t.risk}
              value={risk === 'low' ? t.riskLow : risk === 'mid' ? t.riskMid : t.riskHigh}
              valueColor={risk === 'low' ? 'text-green-400' : risk === 'mid' ? 'text-yellow-400' : 'text-red-400'}
              desc={t.riskDesc}
            />

            {volSignal && (
              <Metric
                icon="🔥"
                label={t.volume}
                value={volSignal === 'high' ? t.volHigh : volSignal === 'low' ? t.volLow : t.volNormal}
                valueColor={volSignal === 'high' ? 'text-orange-400' : 'text-gray-300'}
                desc={volSignal === 'high' ? t.volHighDesc : volSignal === 'low' ? t.volLowDesc : t.volNormalDesc}
              />
            )}
          </>
        )}

        {/* القيمة العادلة */}
        {fv && fairValue > 0 && (
          <div className="bg-gray-800 rounded-lg p-3 sm:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">💎</span>
              <p className="text-gray-400 text-xs">{t.fair}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="text-white text-sm font-bold">
                {t.fairValueLabel} {fairValue.toFixed(2)} {t.pound}
              </p>
              {fairGap !== null && (
                <p className={`text-sm font-bold ${fairGap >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {fairGap >= 0 ? '▲' : '▼'} {Math.abs(fairGap).toFixed(1)}%
                </p>
              )}
            </div>
            {fv.recommendation && (
              <p className="text-gray-400 text-xs mt-1">
                {t.analystRec} <span className="text-orange-400 font-bold">{fv.recommendation}</span>
                {fv.analyst ? ` — ${fv.analyst}` : ''}
              </p>
            )}
            {fairGap !== null && (
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                {fairGap > 2 ? `${t.fairUnder} ${fairGap.toFixed(1)}%` : fairGap < -2 ? `${t.fairOver} ${Math.abs(fairGap).toFixed(1)}%` : t.fairEqual}
              </p>
            )}
          </div>
        )}

      </div>

      {/* ملاحظة عند ندرة التاريخ */}
      {!hasHistory && (
        <p className="text-gray-600 text-xs mt-3 leading-relaxed">{t.limitedNote}</p>
      )}

      {/* تنبيه */}
      <p className="text-gray-600 text-xs mt-4 leading-relaxed border-t border-gray-800 pt-3">
        {t.disclaimer}
      </p>

    </div>
  );
}
