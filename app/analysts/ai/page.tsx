'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../components/LanguageProvider';
import DataError from '../../components/DataError';
import AiReportView from '../../components/AiReportView';
import { SkeletonCard } from '../../components/Skeleton';

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
    viewPdf: '📄 عرض PDF',
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
    viewPdf: '📄 View PDF',
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
    <main className="min-h-screen bg-[var(--bg-page)] p-4">
      <div className="max-w-3xl mx-auto">

        <a href="/analysts" className="text-[var(--text-secondary)] text-sm hover:text-[var(--accent-text)] transition mb-4 block">
          {t.back}
        </a>

        <div className="bg-gradient-to-l from-orange-950 to-gray-900 border border-orange-700 rounded-xl p-6 mb-6">
          <h1 className="text-[var(--accent-text)] font-bold text-2xl mb-1">{t.title}</h1>
          <p className="text-[var(--text-secondary)] text-sm">{t.subtitle}</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} lines={4} />)}
          </div>
        ) : error ? (
          <DataError onRetry={fetchReports} />
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-secondary)]">
            <p className="text-6xl mb-4">🤖</p>
            <p className="text-xl mb-2">{t.empty}</p>
            <p className="text-sm">{t.emptySub}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(r => (
              <div key={r.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
                <div className="flex justify-between items-start mb-3 gap-3 flex-wrap">
                  <h3 className="text-[var(--text-primary)] font-bold text-sm">{r.command}</h3>
                  <span className="text-[var(--text-secondary)] text-xs whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString(t.dateLocale)}
                  </span>
                </div>
                {expanded[r.id] ? (
                  <AiReportView report={r.report} />
                ) : (
                  <div className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap line-clamp-4" style={{ userSelect: 'none' }}>
                    {r.report}
                  </div>
                )}
                <div className="flex gap-4 mt-3">
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                    className="text-[var(--accent-text)] text-xs font-bold hover:text-orange-400 transition"
                  >
                    {expanded[r.id] ? t.collapse : t.expand}
                  </button>
                  <a
                    href={`/api/ai-analyst/pdf?id=${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-text)] text-xs font-bold hover:text-orange-400 transition"
                  >
                    {t.viewPdf}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
