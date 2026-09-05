'use client';

import { useState, useEffect, useRef } from 'react';

export default function StockNewsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [stocks, setStocks] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [activeSector, setActiveSector] = useState('الكل');
  const [activeTab, setActiveTab] = useState<'news' | 'fairvalue'>('news');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [search, setSearch] = useState('');
  const [fairValues, setFairValues] = useState<any[]>([]);
  const [fairNewsValues, setFairNewsValues] = useState<any[]>([]);
  const [loadingFV, setLoadingFV] = useState(false);
  const [showAddFV, setShowAddFV] = useState(false);
  const [fvForm, setFvForm] = useState({ analyst: '', analysis_date: '', fair_value: '', recommendation: 'شراء', notes: '' });
  const [fvMessage, setFvMessage] = useState('');

  useEffect(() => {
    fetchStocks();
    fetchSectors();
  }, []);

  async function fetchStocks() {
    const res = await fetch('/api/stocks');
    const data = await res.json();
    setStocks(data);
  }

  async function fetchSectors() {
    const res = await fetch('/api/sectors');
    const data = await res.json();
    setSectors(data);
  }

  useEffect(() => {
    if (selectedStock && !loadingNews && window.innerWidth < 1024) {
      const timer = setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' }), 50);
      return () => clearTimeout(timer);
    }
  }, [selectedStock, loadingNews]);

  async function fetchNews(stock: any) {
    setSelectedStock(stock);
    setLoadingNews(true);
    setNews([]);
    fetchFairValues(stock.symbol, stock.name);
    try {
      const res = await fetch(`/api/stock-news?symbol=${stock.symbol}&name=${encodeURIComponent(stock.name)}`);
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (e) {}
    setLoadingNews(false);
  }

  async function fetchFairValues(symbol: string, name: string) {
    setLoadingFV(true);
    setFairValues([]);
    setFairNewsValues([]);
    try {
      // جلب من قاعدة البيانات
      const res1 = await fetch(`/api/fair-values?symbol=${symbol}`);
      const data1 = await res1.json();
      setFairValues(Array.isArray(data1) ? data1 : []);

      // جلب من الأخبار
      const res2 = await fetch(`/api/fair-values?symbol=${symbol}&name=${encodeURIComponent(name)}&mode=news`);
      const data2 = await res2.json();
      setFairNewsValues(Array.isArray(data2) ? data2 : []);
    } catch (e) {}
    setLoadingFV(false);
  }

  async function handleAddFV() {
    if (!selectedStock || !fvForm.analyst || !fvForm.analysis_date || !fvForm.fair_value) {
      setFvMessage('❌ يرجى إدخال جميع الحقول المطلوبة');
      return;
    }
    const res = await fetch('/api/fair-values', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: selectedStock.symbol,
        analyst: fvForm.analyst,
        analysis_date: fvForm.analysis_date,
        fair_value: parseFloat(fvForm.fair_value),
        recommendation: fvForm.recommendation,
        notes: fvForm.notes
      })
    });
    const data = await res.json();
    if (data.success) {
      setFvMessage('✅ تم إضافة التحليل بنجاح');
      setFvForm({ analyst: '', analysis_date: '', fair_value: '', recommendation: 'شراء', notes: '' });
      setShowAddFV(false);
      fetchFairValues(selectedStock.symbol, selectedStock.name);
      setTimeout(() => setFvMessage(''), 3000);
    }
  }

  async function handleDeleteFV(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا التحليل؟')) return;
    await fetch(`/api/fair-values?id=${id}`, { method: 'DELETE' });
    fetchFairValues(selectedStock.symbol, selectedStock.name);
  }

  function getRecommendationStyle(rec: string) {
    switch (rec) {
      case 'شراء': return 'bg-green-900 text-green-400';
      case 'بيع': return 'bg-red-900 text-red-400';
      case 'احتفاظ': return 'bg-yellow-900 text-yellow-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  }

  const filteredStocks = stocks.filter(s => {
    const matchSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.name_en.toLowerCase().includes(search.toLowerCase());
    const matchSector = activeSector === 'الكل' ||
      (lang === 'ar' ? s.sector === activeSector : s.sector_en === activeSector);
    return matchSearch && matchSector;
  });

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-orange-500 font-bold text-xl">
            {lang === 'ar' ? '📰 أخبار الأسهم' : '📰 Stock News'}
          </h1>
        </div>

        {/* القطاعات */}
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setActiveSector('الكل')}
            className={`px-3 py-1.5 text-xs rounded transition ${activeSector === 'الكل' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {lang === 'ar' ? 'الكل' : 'All'}
          </button>
          {sectors.map((sector, i) => (
            <button
              key={i}
              onClick={() => setActiveSector(lang === 'ar' ? sector.name : sector.name_en)}
              className={`px-3 py-1.5 text-xs rounded transition ${
                activeSector === (lang === 'ar' ? sector.name : sector.name_en)
                  ? 'bg-orange-500 text-black font-bold'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? sector.name : sector.name_en}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* قائمة الأسهم */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-800">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث عن سهم...' : 'Search stock...'}
                className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-xs"
              />
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              {filteredStocks.map((stock, i) => (
                <div
                  key={i}
                  onClick={() => fetchNews(stock)}
                  className={`flex justify-between items-center px-3 py-3 cursor-pointer border-b border-gray-800 hover:bg-gray-800 transition ${
                    selectedStock?.symbol === stock.symbol ? 'bg-gray-800 border-r-2 border-r-orange-500' : ''
                  }`}
                >
                  <div>
                    <p className="text-orange-400 font-bold text-xs">{stock.symbol}</p>
                    <p className="text-white text-xs mt-0.5">{lang === 'ar' ? stock.name : stock.name_en}</p>
                    <p className="text-gray-500 text-xs">{lang === 'ar' ? stock.sector : stock.sector_en}</p>
                  </div>
                  <span className="text-gray-600 text-xs">←</span>
                </div>
              ))}
            </div>
          </div>

          {/* المحتوى */}
          <div ref={contentRef} className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">

            {!selectedStock && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <p className="text-4xl mb-3">📰</p>
                  <p className="text-sm">{lang === 'ar' ? 'اختر سهماً للعرض' : 'Select a stock to view'}</p>
                </div>
              </div>
            )}

            {selectedStock && (
              <>
                {/* عنوان السهم */}
                <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-orange-500 font-bold text-sm">{selectedStock.symbol}</h2>
                    <p className="text-gray-400 text-xs">{lang === 'ar' ? selectedStock.name : selectedStock.name_en}</p>
                  </div>
                </div>

                {/* التبويبات */}
                <div className="flex border-b border-gray-800">
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`px-4 py-2 text-sm transition ${activeTab === 'news' ? 'text-orange-500 border-b-2 border-orange-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    📰 الأخبار
                  </button>
                  <button
                    onClick={() => setActiveTab('fairvalue')}
                    className={`px-4 py-2 text-sm transition ${activeTab === 'fairvalue' ? 'text-orange-500 border-b-2 border-orange-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    📊 القيمة العادلة
                    {(fairValues.length + fairNewsValues.length) > 0 && (
                      <span className="mr-1 bg-orange-500 text-black text-xs px-1.5 py-0.5 rounded-full">
                        {fairValues.length + fairNewsValues.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* تبويب الأخبار */}
                {activeTab === 'news' && (
                  <>
                    {loadingNews ? (
                      <div className="flex items-center justify-center h-48">
                        <p className="text-gray-500 text-sm animate-pulse">جاري تحميل الأخبار...</p>
                      </div>
                    ) : news.length === 0 ? (
                      <div className="flex items-center justify-center h-48 text-gray-500">
                        <div className="text-center">
                          <p className="text-3xl mb-2">😕</p>
                          <p className="text-sm">لا توجد أخبار حالياً</p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-800 overflow-y-auto" style={{ maxHeight: '520px' }}>
                        {news.map((item, i) => (
                          <div
                            key={i}
                            onClick={() => window.open(item.link, '_blank')}
                            className="px-4 py-4 hover:bg-gray-800 transition cursor-pointer"
                          >
                            <p className="text-white text-sm leading-relaxed mb-2 hover:text-orange-400 transition">
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
                  </>
                )}

                {/* تبويب القيمة العادلة */}
                {activeTab === 'fairvalue' && (
                  <div className="p-4 overflow-y-auto" style={{ maxHeight: '520px' }}>

                    {fvMessage && (
                      <div className="bg-green-900 text-green-400 p-3 rounded-lg mb-4 text-sm">{fvMessage}</div>
                    )}

                    {/* زر إضافة يدوي */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold text-sm">تحليلات القيمة العادلة</h3>
                      <button
                        onClick={() => setShowAddFV(!showAddFV)}
                        className="bg-orange-500 text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600 transition"
                      >
                        {showAddFV ? 'إلغاء' : '+ إضافة يدوي'}
                      </button>
                    </div>

                    {/* نموذج إضافة يدوي */}
                    {showAddFV && (
                      <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                        <h4 className="text-orange-500 font-bold text-xs mb-3">إضافة تحليل يدوي</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">اسم شركة التحليل *</label>
                            <input
                              value={fvForm.analyst}
                              onChange={e => setFvForm({...fvForm, analyst: e.target.value})}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"
                              placeholder="مثال: EFG Hermes"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">تاريخ التحليل *</label>
                            <input
                              type="date"
                              value={fvForm.analysis_date}
                              onChange={e => setFvForm({...fvForm, analysis_date: e.target.value})}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">القيمة العادلة (جنيه) *</label>
                            <input
                              value={fvForm.fair_value}
                              onChange={e => setFvForm({...fvForm, fair_value: e.target.value})}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"
                              placeholder="150.00"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs mb-1 block">التوصية *</label>
                            <select
                              value={fvForm.recommendation}
                              onChange={e => setFvForm({...fvForm, recommendation: e.target.value})}
                              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"
                            >
                              <option value="شراء">شراء</option>
                              <option value="احتفاظ">احتفاظ</option>
                              <option value="بيع">بيع</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-gray-400 text-xs mb-1 block">ملاحظات</label>
                          <textarea
                            value={fvForm.notes}
                            onChange={e => setFvForm({...fvForm, notes: e.target.value})}
                            rows={2}
                            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"
                            placeholder="أي ملاحظات إضافية..."
                          />
                        </div>
                        <button
                          onClick={handleAddFV}
                          className="bg-orange-500 text-black px-4 py-2 rounded text-xs font-bold hover:bg-orange-600 transition"
                        >
                          حفظ التحليل
                        </button>
                      </div>
                    )}

                    {loadingFV ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm animate-pulse">جاري التحميل...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">

                        {/* التحليلات المحفوظة يدوياً */}
                        {fairValues.length > 0 && (
                          <div>
                            <p className="text-gray-500 text-xs mb-2 font-bold">📌 تحليلات محفوظة</p>
                            <div className="space-y-3">
                              {fairValues.map((fv, i) => (
                                <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <p className="text-white font-bold text-sm">{fv.analyst}</p>
                                      <p className="text-gray-500 text-xs mt-0.5">
                                        {new Date(fv.analysis_date).toLocaleDateString('ar-EG')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-bold px-2 py-1 rounded ${getRecommendationStyle(fv.recommendation)}`}>
                                        {fv.recommendation}
                                      </span>
                                      <button
                                        onClick={() => handleDeleteFV(fv.id)}
                                        className="text-red-500 hover:text-red-400 text-xs"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                  <div className="bg-gray-900 rounded p-2 text-center">
                                    <p className="text-gray-500 text-xs mb-1">القيمة العادلة</p>
                                    <p className="text-orange-500 font-bold text-lg">{fv.fair_value} ج</p>
                                  </div>
                                  {fv.notes && (
                                    <p className="text-gray-400 text-xs mt-3 border-t border-gray-700 pt-2">{fv.notes}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* التحليلات من الأخبار */}
                        {fairNewsValues.length > 0 && (
                          <div>
                            <p className="text-gray-500 text-xs mb-2 font-bold">📡 من أخبار التحليل</p>
                            <div className="space-y-3">
                              {fairNewsValues.map((item, i) => (
                                <div
                                  key={i}
                                  onClick={() => window.open(item.link, '_blank')}
                                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 cursor-pointer hover:border-orange-500 transition"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-orange-500 text-xs font-bold">{item.source}</span>
                                    <span className="text-gray-500 text-xs">{item.date}</span>
                                  </div>
                                  <p className="text-white text-sm leading-relaxed mb-3">{item.title}</p>
                                  <div className="flex gap-3">
                                    {item.fairValue && (
                                      <div className="bg-gray-900 rounded p-2 flex-1 text-center">
                                        <p className="text-gray-500 text-xs mb-1">القيمة العادلة</p>
                                        <p className="text-orange-500 font-bold">{item.fairValue} ج</p>
                                      </div>
                                    )}
                                    {item.recommendation && (
                                      <div className={`rounded p-2 flex-1 text-center ${getRecommendationStyle(item.recommendation)}`}>
                                        <p className="text-xs mb-1 opacity-70">التوصية</p>
                                        <p className="font-bold text-sm">{item.recommendation}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* لا توجد بيانات */}
                        {fairValues.length === 0 && fairNewsValues.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-3xl mb-2">📊</p>
                            <p className="text-sm">لا توجد تحليلات لهذا السهم</p>
                            <p className="text-xs mt-1">اضغط على إضافة يدوي لإضافة تحليل</p>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )}

              </>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}