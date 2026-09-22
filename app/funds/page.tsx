'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import DataError from '../components/DataError';

type Fund = {
  id: number;
  name: string;
  name_en: string | null;
  fund_type: string;
  manager_company: string | null;
  inception_date: string | null;
  currency: string;
};

const L = {
  ar: {
    title: '💼 صناديق الاستثمار',
    subtitle: 'بيانات موثّقة يدوياً من الأدمن مع ذكر المصدر — لا تخمين ولا أرقام تلقائية',
    loading: 'جاري التحميل...',
    empty: 'لا توجد صناديق مضافة حتى الآن',
    type: 'الطبيعة',
    manager: 'الشركة المديرة',
    since: 'تأسس',
    view: 'عرض التفاصيل',
    compareLabel: 'اختر للمقارنة',
    compareBar: (n: number) => `تم اختيار ${n} صندوق للمقارنة`,
    compareBtn: 'قارن الآن',
    compareMax: 'الحد الأقصى 4 صناديق للمقارنة',
    dateLocale: 'ar-EG',
  },
  en: {
    title: '💼 Investment Funds',
    subtitle: 'Manually verified data with cited sources — no guessing, no auto-generated numbers',
    loading: 'Loading...',
    empty: 'No funds added yet',
    type: 'Type',
    manager: 'Manager',
    since: 'Since',
    view: 'View details',
    compareLabel: 'Select to compare',
    compareBar: (n: number) => `${n} fund(s) selected for comparison`,
    compareBtn: 'Compare now',
    compareMax: 'Maximum 4 funds for comparison',
    dateLocale: 'en-US',
  },
};

const MAX_COMPARE = 4;

export default function FundsPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    fetchFunds();
  }, []);

  async function fetchFunds() {
    setLoading(true);
    try {
      const res = await fetch('/api/funds');
      const data = await res.json();
      setFunds(Array.isArray(data) ? data : []);
      setError(false);
    } catch (e) {
      setFunds([]);
      setError(true);
    }
    setLoading(false);
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-5xl mx-auto">

        <div className="bg-gradient-to-l from-orange-950 to-gray-900 border border-orange-700 rounded-xl p-6 mb-6">
          <h1 className="text-orange-500 font-bold text-2xl mb-1">{t.title}</h1>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm animate-pulse">{t.loading}</div>
        ) : error ? (
          <DataError onRetry={fetchFunds} />
        ) : funds.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">💼</p>
            <p className="text-xl">{t.empty}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 pb-24">
            {funds.map(f => (
              <div key={f.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div>
                    <h3 className="text-white font-bold text-base">{f.name}</h3>
                    {f.name_en && <p className="text-gray-500 text-xs">{f.name_en}</p>}
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selected.includes(f.id)}
                      onChange={() => toggleSelect(f.id)}
                      disabled={!selected.includes(f.id) && selected.length >= MAX_COMPARE}
                    />
                    {t.compareLabel}
                  </label>
                </div>
                <div className="text-xs text-gray-400 space-y-1 mb-3">
                  <p><span className="text-gray-500">{t.type}:</span> {f.fund_type}</p>
                  {f.manager_company && <p><span className="text-gray-500">{t.manager}:</span> {f.manager_company}</p>}
                  {f.inception_date && <p><span className="text-gray-500">{t.since}:</span> {new Date(f.inception_date).toLocaleDateString(t.dateLocale)}</p>}
                </div>
                <a href={`/funds/${f.id}`} className="text-orange-500 text-xs font-bold hover:text-orange-400 transition">
                  {t.view} ←
                </a>
              </div>
            ))}
          </div>
        )}

        {selected.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-orange-700 p-4 flex items-center justify-between gap-4 flex-wrap z-40">
            <p className="text-gray-300 text-sm">
              {t.compareBar(selected.length)}
              {selected.length >= MAX_COMPARE && <span className="text-gray-500"> — {t.compareMax}</span>}
            </p>
            <a
              href={`/funds/compare?ids=${selected.join(',')}`}
              className={`px-5 py-2 rounded text-sm font-bold transition ${selected.length >= 2 ? 'bg-orange-500 text-black hover:bg-orange-600' : 'bg-gray-700 text-gray-500 pointer-events-none'}`}
            >
              {t.compareBtn}
            </a>
          </div>
        )}

      </div>
    </main>
  );
}
