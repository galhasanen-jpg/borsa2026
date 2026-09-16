'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../components/LanguageProvider';

const TOTAL_PAGES = 24;

const L = {
  ar: {
    title: '📖 الدليل العملي للمستثمر الجديد',
    subtitle: 'كيف تحلل سهمًا في البورصة المصرية؟ — مذكرة تدريبية كاملة',
    back: '← العودة للمحللين',
    notice: '🔒 هذا المحتوى للقراءة داخل الموقع فقط، متاح لأصحاب الحسابات المسجّلة، وغير متاح كملف للتحميل أو النسخ.',
    loading: 'جاري تحميل الصفحات...',
    viewingAs: (who: string) => `معاينة خاصة بـ ${who}`,
    notLoggedIn: 'يجب تسجيل الدخول بحساب حقيقي لعرض هذا المحتوى',
    signIn: 'تسجيل الدخول',
  },
  en: {
    title: '📖 The New Investor\'s Practical Guide',
    subtitle: 'How to analyze a stock on the Egyptian Exchange? — full training memo',
    back: '← Back to Analysts',
    notice: '🔒 This content is for in-site reading only, available to registered account holders, and not available as a downloadable or copyable file.',
    loading: 'Loading pages...',
    viewingAs: (who: string) => `Private view for ${who}`,
    notLoggedIn: 'You must be signed in with a real account to view this content',
    signIn: 'Sign in',
  },
};

export default function InvestorGuidePage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [siteUser, setSiteUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [now] = useState(() => new Date());

  useEffect(() => {
    try {
      const stored = localStorage.getItem('siteUser');
      if (stored) setSiteUser(JSON.parse(stored));
    } catch (e) {}
    setLoaded(true);

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  if (!loaded) return null;

  const watermarkText = siteUser
    ? t.viewingAs(siteUser.email || siteUser.name)
    : t.viewingAs(lang === 'ar' ? 'مستخدم مسجّل' : 'a registered user');

  return (
    <main className="min-h-screen bg-gray-950 p-4" style={{ userSelect: 'none' }}>
      <div className="max-w-3xl mx-auto">

        <a href="/analysts" className="text-gray-500 text-sm hover:text-orange-500 transition mb-4 block">
          {t.back}
        </a>

        <div className="bg-gradient-to-l from-orange-950 to-gray-900 border border-orange-700 rounded-xl p-6 mb-4">
          <h1 className="text-orange-500 font-bold text-2xl mb-1">{t.title}</h1>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 mb-6 text-gray-500 text-xs text-center">
          {t.notice}
        </div>

        <div className="space-y-3">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(n => (
            <div key={n} className="relative bg-white rounded overflow-hidden">
              <img
                src={`/api/guide-pages?n=${n}`}
                alt={`${t.title} — ${n}/${TOTAL_PAGES}`}
                className="w-full block"
                draggable={false}
                loading="lazy"
                onDragStart={e => e.preventDefault()}
              />
              {/* علامة مائية متكررة تحمل هوية المشاهد — رادعة وليست منعاً مطلقاً */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
                style={{ opacity: 0.14 }}
              >
                <div
                  style={{
                    transform: 'rotate(-30deg)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '60px',
                    width: '200%',
                  }}
                >
                  {Array.from({ length: 9 }, (_, k) => (
                    <span key={k} className="text-black text-xs whitespace-nowrap font-bold">
                      {watermarkText} — {now.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
