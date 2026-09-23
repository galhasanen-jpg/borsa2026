'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../components/LanguageProvider';
import DataError from '../../components/DataError';
import FundValueChart from '../../components/FundValueChart';

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
  source_note: string | null;
  has_prospectus: boolean;
  risk_level: string | null;
};

type NavPoint = { id: number; nav_date: string; value: string };

const L = {
  ar: {
    back: '← العودة للصناديق',
    loading: 'جاري التحميل...',
    notFound: 'الصندوق غير موجود',
    type: 'طبيعة الصندوق',
    manager: 'الشركة المديرة',
    inception: 'تاريخ الإنشاء',
    subscriptionFee: 'رسوم الاشتراك / الإيداع',
    redemptionFee: 'رسوم الاسترداد / السحب',
    entryDays: 'أيام الدخول',
    exitDays: 'أيام الخروج',
    riskLevel: 'مستوى المخاطر',
    source: 'مصدر المعلومات',
    noData: '— غير متوفر —',
    prospectus: '📄 نشرة إصدار الصندوق (PDF)',
    noProspectus: 'لم يتم رفع نشرة إصدار لهذا الصندوق بعد',
    valueChart: 'قيمة الوثيقة منذ الإنشاء',
    dateLocale: 'ar-EG',
  },
  en: {
    back: '← Back to Funds',
    loading: 'Loading...',
    notFound: 'Fund not found',
    type: 'Fund Type',
    manager: 'Manager',
    inception: 'Inception Date',
    subscriptionFee: 'Subscription Fee',
    redemptionFee: 'Redemption Fee',
    entryDays: 'Entry Days',
    exitDays: 'Exit Days',
    riskLevel: 'Risk Level',
    source: 'Information Source',
    noData: '— Not available —',
    prospectus: '📄 Fund Prospectus (PDF)',
    noProspectus: 'No prospectus uploaded for this fund yet',
    valueChart: 'Unit Value Since Inception',
    dateLocale: 'en-US',
  },
};

export default function FundDetailPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const params = useParams();
  const id = params?.id as string;

  const [fund, setFund] = useState<Fund | null>(null);
  const [navHistory, setNavHistory] = useState<NavPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [fundRes, navRes] = await Promise.all([
        fetch(`/api/funds?id=${id}`),
        fetch(`/api/funds/nav?fund_id=${id}`),
      ]);
      if (!fundRes.ok) throw new Error('not found');
      const fundData = await fundRes.json();
      const navData = await navRes.json();
      setFund(fundData);
      setNavHistory(Array.isArray(navData) ? navData : []);
      setError(false);
    } catch (e) {
      setFund(null);
      setError(true);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-3xl mx-auto">

        <a href="/funds" className="text-gray-500 text-sm hover:text-orange-500 transition mb-4 block">
          {t.back}
        </a>

        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm animate-pulse">{t.loading}</div>
        ) : error || !fund ? (
          <DataError onRetry={fetchAll} />
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-l from-orange-950 to-gray-900 border border-orange-700 rounded-xl p-6">
              <h1 className="text-orange-500 font-bold text-2xl mb-1">{fund.name}</h1>
              {fund.name_en && <p className="text-gray-400 text-sm">{fund.name_en}</p>}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 grid sm:grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs mb-1">{t.type}</p><p className="text-white">{fund.fund_type}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">{t.manager}</p><p className="text-white">{fund.manager_company || t.noData}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">{t.inception}</p><p className="text-white">{fund.inception_date ? new Date(fund.inception_date).toLocaleDateString(t.dateLocale) : t.noData}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">{t.subscriptionFee}</p><p className="text-white">{fund.subscription_fee || t.noData}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">{t.redemptionFee}</p><p className="text-white">{fund.redemption_fee || t.noData}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">{t.entryDays}</p><p className="text-white">{fund.entry_days || t.noData}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">{t.exitDays}</p><p className="text-white">{fund.exit_days || t.noData}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">{t.riskLevel}</p><p className="text-white">{fund.risk_level || t.noData}</p></div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-orange-500 font-bold text-sm mb-3">{t.valueChart}</h3>
              <FundValueChart
                currency={fund.currency}
                series={[{
                  id: 'nav',
                  label: fund.name,
                  color: '#f97316',
                  data: navHistory.map(p => ({ date: p.nav_date, value: Number(p.value) })),
                }]}
              />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              {fund.has_prospectus ? (
                <a
                  href={`/api/funds/prospectus?id=${fund.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 text-sm font-bold hover:text-orange-400 transition"
                >
                  {t.prospectus}
                </a>
              ) : (
                <p className="text-gray-500 text-sm">{t.noProspectus}</p>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-500 text-xs mb-1">{t.source}</p>
              <p className="text-gray-300 text-sm">{fund.source_note || t.noData}</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
