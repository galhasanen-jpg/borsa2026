'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ترتيب ألوان ثابت للمقارنة بين عدة صناديق (لون واحد لكل صندوق طول وقت المقارنة،
// مش بيتغيّر حسب الترتيب) — البرتقالي هو لون العلامة التجارية للموقع، والباقي مختارة
// عشان تكون متمايزة بصرياً عن بعض
export const FUND_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#eab308'];

export type FundSeries = {
  id: string;
  label: string;
  color: string;
  data: { date: string; value: number }[];
};

export default function FundValueChart({ series, currency = 'EGP', emptyLabel }: { series: FundSeries[]; currency?: string; emptyLabel?: string }) {
  const hasData = series.some(s => s.data.length > 0);
  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
        {emptyLabel || 'لا توجد بيانات قيمة وثيقة مسجّلة بعد'}
      </div>
    );
  }

  const dateSet = new Set<string>();
  series.forEach(s => s.data.forEach(p => dateSet.add(p.date)));
  const dates = [...dateSet].sort();
  const merged = dates.map(date => {
    const row: Record<string, string | number> = { date };
    series.forEach(s => {
      const point = s.data.find(p => p.date === date);
      if (point) row[s.id] = point.value;
    });
    return row;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded p-3 text-xs">
          <p className="text-gray-400 mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
              {p.name}: {Number(p.value).toFixed(2)} {currency}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={['auto', 'auto']} width={55} />
          <Tooltip content={<CustomTooltip />} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {series.map(s => (
            <Line key={s.id} type="monotone" dataKey={s.id} name={s.label} stroke={s.color} strokeWidth={2} dot={false} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
