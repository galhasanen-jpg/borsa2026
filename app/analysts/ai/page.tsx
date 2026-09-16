'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../components/LanguageProvider';
import DataError from '../../components/DataError';
import AiReportView from '../../components/AiReportView';

type Report = {
  id: number;
  command: string;
  report: string;
  model: string;
  created_at: string;
};

const L = {
  ar: {
    title: '🤖 محلل AI',
    subtitle: 'تحليل استثماري بالذكاء الاصطناعي لأسهم البورصة المصرية — قيد المعاينة الداخلية حالياً',
    back: '← العودة للمحللين',
    loading: 'جاري التحميل...',
    empty: 'لا توجد تقارير منشورة حتى الآن',
    emptySub: 'سيتم نشر أول تحليل هنا قريباً',
    expand: 'عرض التقرير كاملاً',
    collapse: 'إخفاء',
    dateLocale: 'ar-EG',
  },
  en: {
    title: '🤖 AI Analyst',
    subtitle: 'AI-powered investment analysis for EGX stocks — currently in internal preview',
    back: '← Back to Analysts',
    loading: 'Loading...',
    empty: 'No reports published yet',
    emptySub: 'The first analysis will appear here soon',
    expand: 'View full report',
    collapse: 'Collapse',
    dateLocale: 'en-US',
  },
};

export default function AiAnalystPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-analyst/reports');
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
      setError(false);
    } catch (e) {
      setReports([]);
      setError(true);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">

        <a href="/analysts" className="text-gray-500 text-sm hover:text-orange-500 transition mb-4 block">
          {t.back}
        </a>

        <div className="bg-gradient-to-l from-orange-950 to-gray-900 border border-orange-700 rounded-xl p-6 mb-6">
          <h1 className="text-orange-500 font-bold text-2xl mb-1">{t.title}</h1>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm animate-pulse">{t.loading}</div>
        ) : error ? (
          <DataError onRetry={fetchReports} />
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">🤖</p>
            <p className="text-xl mb-2">{t.empty}</p>
            <p className="text-sm">{t.emptySub}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(r => (
              <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-3 gap-3 flex-wrap">
                  <h3 className="text-white font-bold text-sm">{r.command}</h3>
                  <span className="text-gray-500 text-xs whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString(t.dateLocale)}
                  </span>
                </div>
                {expanded[r.id] ? (
                  <AiReportView report={r.report} />
                ) : (
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4" style={{ userSelect: 'none' }}>
                    {r.report}
                  </div>
                )}
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                  className="text-orange-500 text-xs font-bold mt-3 hover:text-orange-400 transition"
                >
                  {expanded[r.id] ? t.collapse : t.expand}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
