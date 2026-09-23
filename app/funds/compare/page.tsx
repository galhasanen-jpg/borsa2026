'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../../components/LanguageProvider';
import DataError from '../../components/DataError';
import FundValueChart, { FUND_COLORS } from '../../components/FundValueChart';

type Fund = {
  id: number;
  name: string;
  name_en: string | null;
  fund_type: string;
  manager_company: string | null;
  inception_date: string | null;
  currency: string;
  subscription_fee: string | null;
  redemption_fee: string | null;
  entry_days: string | null;
  exit_days: string | null;
  risk_level: string | null;
};

const L = {
  ar: {
    title: '⚖️ مقارنة الصناديق',
    back: '← العودة للصناديق',
    loading: 'جاري التحميل...',
    noSelection: 'لم يتم اختيار صناديق للمقارنة',
    field: 'البند',
    type: 'الطبيعة',
    manager: 'الشركة المديرة',
    inception: 'تاريخ الإنشاء',
    subscriptionFee: 'رسوم الاشتراك',
    redemptionFee: 'رسوم الاسترداد',
    entryDays: 'أيام الدخول',
    exitDays: 'أيام الخروج',
    riskLevel: 'مستوى المخاطر',
    noData: '—',
    valueChart: 'مقارنة قيمة الوثيقة',
    dateLocale: 'ar-EG',
  },
  en: {
    title: '⚖️ Compare Funds',
    back: '← Back to Funds',
    loading: 'Loading...',
    noSelection: 'No funds selected for comparison',
    field: 'Field',
    type: 'Type',
    manager: 'Manager',
    inception: 'Inception Date',
    subscriptionFee: 'Subscription Fee',
    redemptionFee: 'Redemption Fee',
    entryDays: 'Entry Days',
    exitDays: 'Exit Days',
    riskLevel: 'Risk Level',
    noData: '—',
    valueChart: 'Unit Value Comparison',
    dateLocale: 'en-US',
  },
};

export default function CompareFundsPage() {
  return (
    <Suspense fallback={null}>
      <CompareFundsInner />
    </Suspense>
  );
}

function CompareFundsInner() {
  const { lang } = useLanguage();
  const t = L[lang];
  const searchParams = useSearchParams();
  const ids = (searchParams.get('ids') || '').split(',').map(s => s.trim()).filter(Boolean);

  const [funds, setFunds] = useState<Fund[]>([]);
  const [navByFund, setNavByFund] = useState<Record<string, { nav_date: string; value: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ids.length) fetchAll();
    else setLoading(false);
  }, [ids.join(',')]);

  async function fetchAll() {
    setLoading(true);
    try {
      const results = await Promise.all(ids.map(async id => {
        const [fundRes, navRes] = await Promise.all([
          fetch(`/api/funds?id=${id}`),
          fetch(`/api/funds/nav?fund_id=${id}`),
        ]);
        const fund = await fundRes.json();
        const nav = await navRes.json();
        return { fund, nav: Array.isArray(nav) ? nav : [] };
      }));
      setFunds(results.map(r => r.fund).filter(f => f && !f.error));
      const navMap: Record<string, any[]> = {};
      results.forEach(r => { if (r.fund && !r.fund.error) navMap[r.fund.id] = r.nav; });
      setNavByFund(navMap);
      setError(false);
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  }

  const rows: { key: keyof Fund; label: string; format?: (f: Fund) => string }[] = [
    { key: 'fund_type', label: t.type },
    { key: 'risk_level', label: t.riskLevel },
    { key: 'manager_company', label: t.manager },
    { key: 'inception_date', label: t.inception, format: f => f.inception_date ? new Date(f.inception_date).toLocaleDateString(t.dateLocale) : t.noData },
    { key: 'subscription_fee', label: t.subscriptionFee },
    { key: 'redemption_fee', label: t.redemptionFee },
    { key: 'entry_days', label: t.entryDays },
    { key: 'exit_days', label: t.exitDays },
  ];

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-5xl mx-auto">

        <a href="/funds" className="text-gray-500 text-sm hover:text-orange-500 transition mb-4 block">
          {t.back}
        </a>

        <div className="bg-gradient-to-l from-orange-950 to-gray-900 border border-orange-700 rounded-xl p-6 mb-6">
          <h1 className="text-orange-500 font-bold text-2xl">{t.title}</h1>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm animate-pulse">{t.loading}</div>
        ) : error ? (
          <DataError onRetry={fetchAll} />
        ) : funds.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">⚖️</p>
            <p className="text-xl">{t.noSelection}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-gray-500 text-xs text-right px-3 py-2 whitespace-nowrap">{t.field}</th>
                    {funds.map((f, i) => (
                      <th key={f.id} className="text-right px-3 py-2 whitespace-nowrap" style={{ color: FUND_COLORS[i % FUND_COLORS.length] }}>
                        {f.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.key} className="border-t border-gray-800">
                      <td className="text-gray-500 text-xs px-3 py-2">{row.label}</td>
                      {funds.map(f => (
                        <td key={f.id} className="text-white px-3 py-2">
                          {row.format ? row.format(f) : ((f[row.key] as string) || t.noData)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-orange-500 font-bold text-sm mb-3">{t.valueChart}</h3>
              <FundValueChart
                currency={funds[0]?.currency}
                series={funds.map((f, i) => ({
                  id: `fund_${f.id}`,
                  label: f.name,
                  color: FUND_COLORS[i % FUND_COLORS.length],
                  data: (navByFund[f.id] || []).map(p => ({ date: p.nav_date, value: Number(p.value) })),
                }))}
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
