'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Cell
} from 'recharts';
import { SkeletonLine } from './Skeleton';

const periods = [
  { label: 'اليوم', labelEn: 'Today', value: 'today', type: 'ticks' },
  { label: '3 أيام', labelEn: '3D', value: '3d', type: 'ticks' },
  { label: '1 أسبوع', labelEn: '1W', value: '1w', type: 'ticks' },
  { label: '1 شهر', labelEn: '1M', value: '1m', type: 'history' },
  { label: '3 أشهر', labelEn: '3M', value: '3m', type: 'history' },
  { label: '6 أشهر', labelEn: '6M', value: '6m', type: 'history' },
  { label: '1 سنة', labelEn: '1Y', value: '1y', type: 'history' },
];

export default function StockChart({ symbol, name, lang }: { symbol: string, name: string, lang: 'ar' | 'en' }) {
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'bar' | 'candlestick'>('area');

  useEffect(() => {
    fetchData();
  }, [symbol, period]);

  async function fetchData() {
    setLoading(true);
    try {
      const periodObj = periods.find(p => p.value === period);
      let url = '';

      if (periodObj?.type === 'ticks') {
        url = `/api/stock-ticks?symbol=${symbol}&period=${period}`;
        const res = await fetch(url);
        const ticks = await res.json();

        if (ticks.length > 0) {
          setData(ticks.map((t: any) => ({
            date: new Date(t.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            close: t.price,
            volume: t.volume,
          })));
        } else {
          // بيانات احتياطية إذا لا يوجد ticks
          const histRes = await fetch(`/api/stock-history?symbol=${symbol}&period=1w`);
          const hist = await histRes.json();
          setData(hist.map((h: any) => ({ date: h.date, close: h.close, high: h.high, low: h.low, open: h.open, volume: h.volume })));
        }
      } else {
        url = `/api/stock-history?symbol=${symbol}&period=${period}`;
        const res = await fetch(url);
        const history = await res.json();
        setData(history.map((h: any) => ({
          date: h.date,
          close: h.close,
          high: h.high,
          low: h.low,
          open: h.open,
          volume: h.volume,
        })));
      }
    } catch (e) {}
    setLoading(false);
  }

  if (!symbol) return null;

  const firstPrice = parseFloat(data[0]?.close) || 0;
const lastPrice = parseFloat(data[data.length - 1]?.close) || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(2) : '0';
  const isUp = priceChange >= 0;

  const hasOHLC = data.length > 0 && data.every(d => d.open != null && d.high != null && d.low != null);
  const candleData = data.map(d => {
    const open = parseFloat(d.open), close = parseFloat(d.close), high = parseFloat(d.high), low = parseFloat(d.low);
    return { ...d, wickRange: [low, high], bodyRange: [Math.min(open, close), Math.max(open, close)], up: close >= open };
  });

  useEffect(() => {
    if (chartType === 'candlestick' && !hasOHLC) setChartType('area');
  }, [hasOHLC, chartType]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0]?.payload;
      if (!p) return null;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded p-3 text-xs">
          <p className="text-gray-400 mb-1">{label}</p>
          {p.open != null && <p className="text-gray-300">فتح: {parseFloat(p.open).toFixed(2)} ج</p>}
          <p className="text-white font-bold">إغلاق: {parseFloat(p.close).toFixed(2)} ج</p>
          {p.high != null && <p className="text-green-400">أعلى: {parseFloat(p.high).toFixed(2)} ج</p>}
          {p.low != null && <p className="text-red-400">أدنى: {parseFloat(p.low).toFixed(2)} ج</p>}
          {p.volume != null && (
            <p className="text-gray-400">حجم: {parseInt(p.volume).toLocaleString()}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">

      {/* العنوان */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-bold text-sm">{symbol}</h3>
          <p className="text-gray-400 text-xs">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold">{lastPrice.toFixed(2)} ج</p>
          <p className={`text-xs font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '▲' : '▼'} {Math.abs(parseFloat(priceChangePercent))}%
          </p>
        </div>
      </div>

      {/* أزرار الفترة */}
      <div className="flex gap-1 flex-wrap mb-4">
        {periods.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-2 py-1 text-xs rounded transition ${
              period === p.value
                ? 'bg-orange-500 text-black font-bold'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? p.label : p.labelEn}
          </button>
        ))}
        <div className="mr-auto flex gap-1">
          <button
            onClick={() => setChartType('area')}
            className={`px-2 py-1 text-xs rounded transition ${chartType === 'area' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            📈
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-2 py-1 text-xs rounded transition ${chartType === 'bar' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            📊
          </button>
          <button
            onClick={() => hasOHLC && setChartType('candlestick')}
            disabled={!hasOHLC}
            title={!hasOHLC ? (lang === 'ar' ? 'الشموع اليابانية تحتاج بيانات فتح/أعلى/أدنى — متاحة من فترة شهر فأكثر' : 'Candlesticks need open/high/low data — available from 1M periods and up') : undefined}
            className={`px-2 py-1 rounded transition ${chartType === 'candlestick' ? 'bg-gray-700 text-white' : hasOHLC ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-not-allowed'}`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" className="inline-block align-middle">
              <line x1="4" y1="1" x2="4" y2="15" stroke="currentColor" strokeWidth="1" />
              <rect x="2.5" y="5" width="3" height="6" fill="#22c55e" />
              <line x1="12" y1="2" x2="12" y2="14" stroke="currentColor" strokeWidth="1" />
              <rect x="10.5" y="4" width="3" height="5" fill="#ef4444" />
            </svg>
          </button>
        </div>
      </div>

      {/* الرسم البياني */}
      {loading ? (
        <div className="h-48 flex items-end gap-2 px-2 pb-2">
          {Array(12).fill(0).map((_, i) => (
            <SkeletonLine key={i} className="flex-1" style={{ height: `${30 + ((i * 37) % 60)}%` }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          {lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(val) => val.length > 5 ? val.slice(5) : val} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={['auto', 'auto']} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="close" stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth={2} fill="url(#colorClose)" />
              </AreaChart>
            ) : chartType === 'candlestick' ? (
              <ComposedChart data={candleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(val) => val.length > 5 ? val.slice(5) : val} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={['auto', 'auto']} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="wickRange" barSize={1} isAnimationActive={false}>
                  {candleData.map((d, i) => (
                    <Cell key={`wick-${i}`} fill={d.up ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
                <Bar dataKey="bodyRange" barSize={6} isAnimationActive={false}>
                  {candleData.map((d, i) => (
                    <Cell key={`body-${i}`} fill={d.up ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </ComposedChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(val) => val.length > 5 ? val.slice(5) : val} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={['auto', 'auto']} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="close" fill={isUp ? '#22c55e' : '#ef4444'} radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}