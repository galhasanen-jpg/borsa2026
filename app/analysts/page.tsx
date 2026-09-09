'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';

const L = {
  ar: {
    title: '👨‍💼 المحللون',
    subtitle: 'توصيات وتحليلات من خبراء البورصة المصرية',
    cancel: 'إلغاء',
    registerBtn: '+ سجل كمحلل',
    errFill: '❌ يرجى إدخال الاسم والتخصص والوصف',
    successMsg: '✅ تم إرسال طلب التسجيل! سيتم مراجعته من الإدارة',
    formTitle: '📝 طلب تسجيل محلل جديد',
    nameAr: 'الاسم بالعربية *',
    namePh: 'اسم المحلل',
    nameEn: 'الاسم بالإنجليزية',
    nameEnPh: 'Analyst Name',
    specialization: 'التخصص *',
    specializationPh: 'مثال: تحليل فني، تحليل أساسي',
    whatsappLink: 'رابط واتساب',
    telegramLink: 'رابط تيليجرام',
    bio: 'نبذة عن المحلل *',
    bioPh: 'اكتب نبذة مختصرة عن خبرتك...',
    submit: 'إرسال طلب التسجيل',
    empty: 'لا يوجد محللون حتى الآن',
    emptySub: 'كن أول محلل مسجل!',
    recCount: 'توصية',
    successful: 'ناجحة',
    successRate: 'نجاح',
    view: 'عرض ←',
  },
  en: {
    title: '👨‍💼 Analysts',
    subtitle: 'Recommendations and analysis from EGX experts',
    cancel: 'Cancel',
    registerBtn: '+ Register as Analyst',
    errFill: '❌ Please enter your name, specialization and bio',
    successMsg: '✅ Registration request sent! It will be reviewed by the admin',
    formTitle: '📝 New Analyst Registration Request',
    nameAr: 'Name (Arabic) *',
    namePh: 'Analyst name',
    nameEn: 'Name (English)',
    nameEnPh: 'Analyst Name',
    specialization: 'Specialization *',
    specializationPh: 'e.g. Technical Analysis, Fundamental Analysis',
    whatsappLink: 'WhatsApp Link',
    telegramLink: 'Telegram Link',
    bio: 'Bio *',
    bioPh: 'Write a short bio about your experience...',
    submit: 'Submit Registration',
    empty: 'No analysts yet',
    emptySub: 'Be the first registered analyst!',
    recCount: 'recs',
    successful: 'successful',
    successRate: 'success',
    view: 'View →',
  },
};

export default function AnalystsPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [analysts, setAnalysts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    name_en: '',
    bio: '',
    specialization: '',
    whatsapp_link: '',
    telegram_link: '',
  });

  useEffect(() => {
    fetchAnalysts();
  }, []);

  async function fetchAnalysts() {
    try {
      const res = await fetch('/api/analysts');
      const data = await res.json();
      setAnalysts(Array.isArray(data) ? data : []);
    } catch (e) {}
    setLoading(false);
  }

  async function handleRegister() {
    if (!form.name || !form.bio || !form.specialization) {
      setMessage(t.errFill);
      return;
    }
    const res = await fetch('/api/analysts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.success) {
      setMessage(t.successMsg);
      setShowRegister(false);
      setForm({ name: '', name_en: '', bio: '', specialization: '', whatsapp_link: '', telegram_link: '' });
      setTimeout(() => setMessage(''), 5000);
    }
  }

  function getSuccessRate(analyst: any) {
    const total = parseInt(analyst.total_recommendations) || 0;
    const successful = parseInt(analyst.successful) || 0;
    if (total === 0) return 0;
    return Math.round((successful / total) * 100);
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">

        {/* العنوان */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-orange-500 font-bold text-2xl">{t.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={() => setShowRegister(!showRegister)}
            className="bg-orange-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition"
          >
            {showRegister ? t.cancel : t.registerBtn}
          </button>
        </div>

        {message && (
          <div className="bg-green-900 text-green-400 p-4 rounded-lg mb-6 text-sm">{message}</div>
        )}

        {/* نموذج التسجيل */}
        {showRegister && (
          <div className="bg-gray-900 border border-orange-500 rounded-xl p-6 mb-8">
            <h2 className="text-orange-500 font-bold text-lg mb-4">{t.formTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">{t.nameAr}</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder={t.namePh} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">{t.nameEn}</label>
                <input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder={t.nameEnPh} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">{t.specialization}</label>
                <input value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder={t.specializationPh} />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">{t.whatsappLink}</label>
                <input value={form.whatsapp_link} onChange={e => setForm({...form, whatsapp_link: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="https://wa.me/..." />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">{t.telegramLink}</label>
                <input value={form.telegram_link} onChange={e => setForm({...form, telegram_link: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="https://t.me/..." />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-1 block">{t.bio}</label>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder={t.bioPh} />
            </div>
            <button onClick={handleRegister} className="bg-orange-500 text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition">
              {t.submit}
            </button>
          </div>
        )}

        {/* قائمة المحللين */}
        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : analysts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-6xl mb-4">👨‍💼</p>
            <p className="text-xl mb-2">{t.empty}</p>
            <p className="text-sm">{t.emptySub}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analysts.map((analyst, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500 transition flex items-center gap-4">

                {/* الرقم المتسلسل */}
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>

                {/* بيانات المحلل */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-sm">{lang === 'ar' ? analyst.name : (analyst.name_en || analyst.name)}</h3>
                    <span className="text-orange-500 text-xs">{analyst.specialization}</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-1">{lang === 'ar' ? analyst.bio : (analyst.bio_en || analyst.bio)}</p>
                </div>

                {/* الإحصائيات */}
                <div className="hidden md:flex gap-3">
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{analyst.total_recommendations || 0}</p>
                    <p className="text-gray-500 text-xs">{t.recCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 font-bold text-sm">{analyst.successful || 0}</p>
                    <p className="text-gray-500 text-xs">{t.successful}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-orange-500 font-bold text-sm">{getSuccessRate(analyst)}%</p>
                    <p className="text-gray-500 text-xs">{t.successRate}</p>
                  </div>
                </div>

                {/* زر عرض الصفحة */}
                <a
                  href={`/analysts/${analyst.id}`}
                  className="text-orange-500 text-xs hover:text-orange-400 transition whitespace-nowrap flex-shrink-0"
                >
                  {t.view}
                </a>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
