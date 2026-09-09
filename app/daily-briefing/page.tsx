'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';

type BriefingStock = {
  id: number;
  name: string;
  name_en?: string;
  symbol?: string | null;
  news: { title: string; link: string; source: string; date: string }[];
};

const L = {
  ar: {
    title: '🗞️ النشرة اليومية',
    subtitle: 'أخبار البورصة المصرية لأسهم مختارة — نفس اليوم أو اليوم السابق فقط',
    guestNote: 'هذه قائمة نموذجية للمعاينة. سجّل دخولك لإنشاء قائمتك الخاصة وتعديلها.',
    signIn: 'تسجيل الدخول',
    lastUpdate: 'آخر تحديث',
    refresh: 'تحديث',
    manage: 'إدارة قائمتي',
    hideManage: 'إخفاء الإدارة',
    addStock: '+ إضافة سهم',
    namePh: 'اسم الشركة (عربي) *',
    nameEnPh: 'الاسم بالإنجليزي (اختياري)',
    symbolPh: 'الرمز، مثال: ADIB.CA (اختياري)',
    add: 'إضافة',
    currentList: 'قائمتي الحالية',
    remove: 'حذف',
    loading: 'جاري تحميل النشرة...',
    noNews: 'لا توجد أخبار جديدة اليوم أو أمس لهذا السهم',
    emptyList: 'القائمة فارغة — أضف سهماً من قسم الإدارة',
  },
  en: {
    title: '🗞️ Daily Briefing',
    subtitle: 'EGX news for selected stocks — today or yesterday only',
    guestNote: 'This is a sample list for preview. Sign in to create and edit your own list.',
    signIn: 'Sign in',
    lastUpdate: 'Last update',
    refresh: 'Refresh',
    manage: 'Manage my list',
    hideManage: 'Hide management',
    addStock: '+ Add stock',
    namePh: 'Company name (Arabic) *',
    nameEnPh: 'English name (optional)',
    symbolPh: 'Symbol, e.g. ADIB.CA (optional)',
    add: 'Add',
    currentList: 'My current list',
    remove: 'Remove',
    loading: 'Loading briefing...',
    noNews: 'No news today or yesterday for this stock',
    emptyList: 'List is empty — add a stock from the management section',
  },
};

export default function DailyBriefingPage() {
  const { lang, toggle } = useLanguage();
  const [siteUser, setSiteUser] = useState<any>(null);
  const [stocks, setStocks] = useState<BriefingStock[]>([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [showManage, setShowManage] = useState(false);
  const [manageList, setManageList] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', name_en: '', symbol: '' });
  const [message, setMessage] = useState('');
  const t = L[lang];

  useEffect(() => {
    let user: any = null;
    try {
      const stored = localStorage.getItem('siteUser');
      if (stored) user = JSON.parse(stored);
    } catch (e) {}
    setSiteUser(user);
    fetchBriefing(user?.id);
    fetchManageList(user?.id);
  }, []);

  async function fetchBriefing(userId?: number) {
    setLoading(true);
    try {
      const url = userId ? `/api/daily-briefing?user_id=${userId}` : '/api/daily-briefing';
      const res = await fetch(url);
      const data = await res.json();
      setStocks(Array.isArray(data.stocks) ? data.stocks : []);
      setDate(data.date || '');
    } catch (e) {
      setStocks([]);
    }
    setLoading(false);
  }

  async function fetchManageList(userId?: number) {
    if (!userId) {
      setManageList([]);
      return;
    }
    try {
      const res = await fetch(`/api/briefing-stocks?user_id=${userId}`);
      const data = await res.json();
      setManageList(Array.isArray(data) ? data : []);
    } catch (e) {}
  }

  async function handleAdd() {
    if (!siteUser) return;
    if (!form.name.trim()) {
      setMessage(lang === 'ar' ? '❌ اسم الشركة مطلوب' : '❌ Company name is required');
      return;
    }
    const res = await fetch('/api/briefing-stocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: siteUser.id, name: form.name, name_en: form.name_en, symbol: form.symbol }),
    });
    const data = await res.json();
    if (!data.error) {
      setForm({ name: '', name_en: '', symbol: '' });
      setMessage(lang === 'ar' ? '✅ تمت الإضافة' : '✅ Added');
      fetchManageList(siteUser.id);
      fetchBriefing(siteUser.id);
      setTimeout(() => setMessage(''), 2500);
    } else {
      setMessage('❌ ' + data.error);
    }
  }

  async function handleRemove(id: number) {
    if (!siteUser) return;
    if (!confirm(lang === 'ar' ? 'هل تريد حذف هذا السهم من القائمة؟' : 'Remove this stock from the list?')) return;
    await fetch(`/api/briefing-stocks?id=${id}&user_id=${siteUser.id}`, { method: 'DELETE' });
    fetchManageList(siteUser.id);
    fetchBriefing(siteUser.id);
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
          <div>
            <h1 className="text-orange-500 font-bold text-xl">{t.title}</h1>
            <p className="text-gray-500 text-xs mt-1">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="text-xs border border-gray-700 px-3 py-1.5 rounded hover:border-orange-500 hover:text-orange-500 transition text-gray-400"
            >
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>
            <button
              onClick={() => fetchBriefing(siteUser?.id)}
              className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded text-xs hover:bg-gray-700 transition"
            >
              🔄 {t.refresh}
            </button>
          </div>
        </div>

        {date && (
          <p className="text-gray-600 text-xs mb-4">{t.lastUpdate}: {date}</p>
        )}

        {/* تنبيه للزوار غير المسجلين */}
        {!siteUser && (
          <div className="bg-gray-900 border border-orange-900 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-2">
            <p className="text-gray-300 text-xs">{t.guestNote}</p>
            <a
              href="/signin"
              className="bg-orange-500 text-black px-4 py-1.5 rounded text-xs font-bold hover:bg-orange-600 transition whitespace-nowrap"
            >
              {t.signIn}
            </a>
          </div>
        )}

        {/* قسم الإدارة - للمستخدمين المسجّلين فقط */}
        {siteUser && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
            <button
              onClick={() => setShowManage(!showManage)}
              className="text-orange-500 text-sm font-bold"
            >
              {showManage ? `▲ ${t.hideManage}` : `▼ ${t.manage}`}
            </button>

            {showManage && (
              <div className="mt-4">
                {message && (
                  <div className="bg-gray-800 text-gray-200 p-2 rounded mb-3 text-xs">{message}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={t.namePh}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-xs"
                  />
                  <input
                    value={form.name_en}
                    onChange={e => setForm({ ...form, name_en: e.target.value })}
                    placeholder={t.nameEnPh}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-xs"
                  />
                  <input
                    value={form.symbol}
                    onChange={e => setForm({ ...form, symbol: e.target.value })}
                    placeholder={t.symbolPh}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-xs"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  className="bg-orange-500 text-black px-4 py-2 rounded text-xs font-bold hover:bg-orange-600 transition mb-4"
                >
                  {t.addStock}
                </button>

                <p className="text-gray-500 text-xs font-bold mb-2">{t.currentList}</p>
                <div className="space-y-2">
                  {manageList.map(s => (
                    <div key={s.id} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
                      <div>
                        <span className="text-white text-xs font-bold">{lang === 'ar' ? s.name : (s.name_en || s.name)}</span>
                        {s.symbol && <span className="text-orange-400 text-xs mr-2">{s.symbol}</span>}
                      </div>
                      <button
                        onClick={() => handleRemove(s.id)}
                        className="text-red-500 hover:text-red-400 text-xs"
                      >
                        ✕ {t.remove}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* النشرة */}
        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm animate-pulse">{t.loading}</div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">{t.emptyList}</div>
        ) : (
          <div className="space-y-4">
            {stocks.map(stock => (
              <div key={stock.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold text-sm">{lang === 'ar' ? stock.name : (stock.name_en || stock.name)}</h2>
                  </div>
                  {stock.symbol && (
                    <span className="text-orange-500 text-xs font-bold">{stock.symbol}</span>
                  )}
                </div>

                {stock.news.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-600 text-xs">{t.noNews}</div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {stock.news.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => window.open(item.link, '_blank')}
                        className="px-4 py-3 hover:bg-gray-800 transition cursor-pointer"
                      >
                        <p className="text-white text-sm leading-relaxed mb-1.5 hover:text-orange-400 transition">
                          {item.title}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-500 text-xs font-bold">{item.source}</span>
                          <span className="text-gray-500 text-xs">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
