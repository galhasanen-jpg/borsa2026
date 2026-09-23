'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import DataError from '../components/DataError';
import { RISK_LEVELS } from '../lib/funds-schema';

type Fund = {
  id: number;
  name: string;
  name_en: string | null;
  fund_type: string;
  manager_company: string | null;
  inception_date: string | null;
  currency: string;
  risk_level: string | null;
};

const L = {
  ar: {
    title: '💼 صناديق الاستثمار',
    subtitle: 'بيانات موثّقة يدوياً من الأدمن مع ذكر المصدر — لا تخمين ولا أرقام تلقائية',
    loading: 'جاري التحميل...',
    empty: 'لا توجد صناديق مضافة حتى الآن',
    noMatch: 'لا توجد صناديق تطابق الفلاتر المختارة',
    type: 'الطبيعة',
    manager: 'الشركة المديرة',
    since: 'تأسس',
    view: 'عرض التفاصيل',
    compareLabel: 'اختر للمقارنة',
    compareBar: (n: number) => `تم اختيار ${n} صندوق للمقارنة`,
    compareBtn: 'قارن الآن',
    compareMax: 'الحد الأقصى 4 صناديق للمقارنة',
    dateLocale: 'ar-EG',
    all: 'الكل',
    riskLabel: 'المخاطر',
    riskUnset: 'غير محدد',
    filterByType: 'تصفية حسب الطبيعة',
    filterByRisk: 'تصفية حسب مستوى المخاطر',
  },
  en: {
    title: '💼 Investment Funds',
    subtitle: 'Manually verified data with cited sources — no guessing, no auto-generated numbers',
    loading: 'Loading...',
    empty: 'No funds added yet',
    noMatch: 'No funds match the selected filters',
    type: 'Type',
    manager: 'Manager',
    since: 'Since',
    view: 'View details',
    compareLabel: 'Select to compare',
    compareBar: (n: number) => `${n} fund(s) selected for comparison`,
    compareBtn: 'Compare now',
    compareMax: 'Maximum 4 funds for comparison',
    dateLocale: 'en-US',
    all: 'All',
    riskLabel: 'Risk',
    riskUnset: 'Not set',
    filterByType: 'Filter by type',
    filterByRisk: 'Filter by risk level',
  },
};

const MAX_COMPARE = 4;

const RISK_COLORS: Record<string, string> = {
  'منخفضة': 'text-green-400 border-green-700',
  'متوسطة': 'text-yellow-400 border-yellow-700',
  'مرتفعة': 'text-red-400 border-red-700',
};

export default function FundsPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [activeType, setActiveType] = useState(t.all);
  const [activeRisk, setActiveRisk] = useState(t.all);

  useEffect(() => {
    fetchFunds();
  }, []);

  // إعادة ضبط الفلاتر لو اللغة اتغيّرت (عشان "الكل"/"All" تفضل متزامنة مع اللغة الحالية)
  useEffect(() => {
    setActiveType(t.all);
    setActiveRisk(t.all);
  }, [lang]);

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

  const fundTypes = useMemo(() => {
    const set = new Set(funds.map(f => f.fund_type).filter(Boolean));
    return [...set].sort();
  }, [funds]);

  const filteredFunds = useMemo(() => {
    return funds.filter(f => {
      if (activeType !== t.all && f.fund_type !== activeType) return false;
      if (activeRisk !== t.all) {
        if (activeRisk === t.riskUnset) { if (f.risk_level) return false; }
        else if (f.risk_level !== activeRisk) return false;
      }
      return true;
    });
  }, [funds, activeType, activeRisk, t]);

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-5xl mx-auto">

        <div className="bg-gradient-to-l from-orange-950 to-gray-900 border border-orange-700 rounded-xl p-6 mb-6">
          <h1 className="text-orange-500 font-bold text-2xl mb-1">{t.title}</h1>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        {!loading && !error && funds.length > 0 && (
          <div className="mb-4 space-y-2">
            <div>
              <p className="text-gray-500 text-xs mb-1">{t.filterByType}</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setActiveType(t.all)}
                  className={`px-3 py-1.5 text-xs rounded transition ${activeType === t.all ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                  {t.all}
                </button>
                {fundTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-3 py-1.5 text-xs rounded transition ${activeType === type ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">{t.filterByRisk}</p>
              <div className="flex gap-2 flex-wrap">
                {[t.all, ...RISK_LEVELS, t.riskUnset].map(risk => (
                  <button
                    key={risk}
                    onClick={() => setActiveRisk(risk)}
                    className={`px-3 py-1.5 text-xs rounded transition ${activeRisk === risk ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm animate-pulse">{t.loading}</div>
        ) : error ? (
          <DataError onRetry={fetchFunds} />
        ) : funds.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">💼</p>
            <p className="text-xl">{t.empty}</p>
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">{t.noMatch}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 pb-24">
            {filteredFunds.map(f => (
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
                {f.risk_level && (
                  <span className={`inline-block text-xs font-bold border rounded px-2 py-0.5 mb-3 ${RISK_COLORS[f.risk_level] || 'text-gray-400 border-gray-700'}`}>
                    {t.riskLabel}: {f.risk_level}
                  </span>
                )}
                <div>
                  <a href={`/funds/${f.id}`} className="text-orange-500 text-xs font-bold hover:text-orange-400 transition">
                    {t.view} ←
                  </a>
                </div>
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
