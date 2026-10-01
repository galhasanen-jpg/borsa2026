'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import DataError from '../components/DataError';

const categories = [
  { id: 'egypt', label: '🇪🇬 مصر', labelEn: '🇪🇬 Egypt', query: 'اقتصاد مصر البنك المركزي الجنيه المصري' },
  { id: 'oil', label: '🛢️ البترول', labelEn: '🛢️ Oil', query: 'أسعار النفط البترول أوبك' },
  { id: 'gold', label: '🥇 الذهب', labelEn: '🥇 Gold', query: 'أسعار الذهب الفضة المعادن' },
  { id: 'dollar', label: '💵 الدولار', labelEn: '💵 Dollar', query: 'الدولار الفيدرالي أسعار الفائدة العملات' },
  { id: 'arab', label: '🌍 الأسواق العربية', labelEn: '🌍 Arab Markets', query: 'البورصة السعودية الإمارات الكويت الأسواق العربية' },
  { id: 'world', label: '🌐 الاقتصاد العالمي', labelEn: '🌐 World Economy', query: 'الاقتصاد العالمي التضخم الركود النمو الاقتصادي' },
  { id: 'metals', label: '📈 المعادن والبترول', labelEn: '📈 Metals & Oil', query: '' },
  { id: 'live', label: '📺 بث مباشر', labelEn: '📺 Live TV', query: '' },
];

type Channel = {
  id: string;
  name: string;
  nameEn: string;
  embedUrl: string;
};

// روابط بث حية دائمة (channel=) بدل فيديو ثابت — بتفضل شغالة مهما اتغير البث الفعلي،
// وكلها قنوات رسمية اتأكد من هوية معرّفها (channel id) عن طريق بحث مستقل قبل الإضافة.
// قناة الرياضة اتأجلت لحد ما نلاقي معرّف قناة رسمي واحد مؤكد بدل الاحتمالات المتضاربة اللي ظهرت في البحث.
const newsChannels: Channel[] = [
  { id: 'cnbc-arabia', name: 'CNBC عربية', nameEn: 'CNBC Arabia', embedUrl: 'https://www.youtube.com/embed/OLbqCS3OrPM?autoplay=1' },
  { id: 'france24-arabic', name: 'فرانس 24 عربي', nameEn: 'France 24 Arabic', embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCdTyuXgmJkG_O8_75eqej-w&autoplay=1' },
];

const sportsChannels: Channel[] = [];

const metalCharts = [
  { symbol: 'XAUUSD', name: 'الذهب / دولار', nameEn: 'Gold / USD', color: '#f59e0b' },
  { symbol: 'XAGUSD', name: 'الفضة / دولار', nameEn: 'Silver / USD', color: '#94a3b8' },
  { symbol: 'XPTUSD', name: 'البلاتين / دولار', nameEn: 'Platinum / USD', color: '#60a5fa' },
  { symbol: 'UKOIL', name: 'خام برنت', nameEn: 'Brent Crude', color: '#f97316' },
  { symbol: 'USOIL', name: 'خام نايمكس', nameEn: 'WTI Crude', color: '#84cc16' },
];

function TradingViewChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: '60',
      timezone: 'Africa/Cairo',
      theme: 'dark',
      style: '1',
      locale: 'ar',
      toolbar_bg: '#0a0a0a',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      backgroundColor: 'rgba(10, 10, 10, 1)',
      gridColor: 'rgba(255, 255, 255, 0.05)',
    });

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    container.style.height = '400px';
    container.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    container.appendChild(widgetDiv);
    container.appendChild(script);
    containerRef.current.appendChild(container);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol]);

  return <div ref={containerRef} style={{ height: '400px' }} />;
}

export default function GlobalNewsPage() {
  const { lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allNews, setAllNews] = useState<any>({});
  const [newsErrors, setNewsErrors] = useState<any>({});
  const [activeMetalChart, setActiveMetalChart] = useState(metalCharts[0]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const activeChannel = [...newsChannels, ...sportsChannels].find(c => c.id === activeChannelId) || null;

  useEffect(() => {
    fetchAllNews();
  }, []);

  // الانتقال من تبويب البث المباشر لأي تبويب تاني في الموقع بيوقف القناة المفتوحة
  useEffect(() => {
    if (activeCategory.id !== 'live') setActiveChannelId(null);
  }, [activeCategory]);

  function toggleChannel(id: string) {
    setActiveChannelId(prev => (prev === id ? null : id));
  }

  async function fetchAllNews() {
    for (const cat of categories.filter(c => c.query)) {
      fetchCategoryNews(cat);
    }
  }

  async function fetchCategoryNews(cat: any) {
    try {
      const query = encodeURIComponent(cat.query);
      const res = await fetch(`/api/global-news?query=${query}`);
      const data = await res.json();
      setAllNews((prev: any) => ({ ...prev, [cat.id]: data }));
      setNewsErrors((prev: any) => ({ ...prev, [cat.id]: false }));
    } catch (e) {
      setNewsErrors((prev: any) => ({ ...prev, [cat.id]: true }));
    }
  }

  useEffect(() => {
    if (activeCategory.id === 'metals' || activeCategory.id === 'live') return;
    if (allNews[activeCategory.id]) {
      setNews(allNews[activeCategory.id]);
      setLoading(false);
    } else if (newsErrors[activeCategory.id]) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [activeCategory, allNews, newsErrors]);

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">

        {/* العنوان */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-orange-500 font-bold text-xl">
            🌐 {lang === 'ar' ? 'الأخبار العالمية' : 'Global News'}
          </h1>
          <span className="text-gray-400 text-xs">
            {lang === 'ar' ? 'أخبار تؤثر على الاقتصاد المصري' : 'News affecting Egyptian economy'}
          </span>
        </div>

        {/* الفئات */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm rounded-lg transition font-medium ${
                activeCategory.id === cat.id
                  ? 'bg-orange-500 text-black font-bold'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {lang === 'ar' ? cat.label : cat.labelEn}
              {allNews[cat.id] && cat.id !== 'metals' && cat.id !== 'live' && (
                <span className="mr-2 text-xs opacity-70">({allNews[cat.id].length})</span>
              )}
            </button>
          ))}
        </div>

        {/* بث مباشر - قوائم قنوات قابلة للاختيار */}
        {activeCategory.id === 'live' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeChannel ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></span>
                <h2 className="text-white font-bold text-sm">
                  {activeChannel
                    ? `${lang === 'ar' ? 'بث مباشر' : 'Live'} - ${lang === 'ar' ? activeChannel.name : activeChannel.nameEn}`
                    : (lang === 'ar' ? 'اختر قناة من القائمة تحت للمشاهدة' : 'Pick a channel below to watch')}
                </h2>
              </div>
              {activeChannel && (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    key={activeChannel.id}
                    className="absolute top-0 left-0 w-full h-full"
                    src={activeChannel.embedUrl}
                    title={activeChannel.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* قوائم القنوات */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-orange-500 font-bold text-sm mb-2">
                {lang === 'ar' ? '📰 قنوات إخبارية' : '📰 News Channels'}
              </h3>
              <div className="flex gap-2 flex-wrap mb-4">
                {newsChannels.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`px-3 py-2 text-sm rounded-lg transition font-medium ${
                      activeChannelId === ch.id
                        ? 'bg-orange-500 text-black font-bold'
                        : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {activeChannelId === ch.id && '● '}
                    {lang === 'ar' ? ch.name : ch.nameEn}
                  </button>
                ))}
              </div>

              <h3 className="text-orange-500 font-bold text-sm mb-2">
                {lang === 'ar' ? '⚽ قنوات رياضية' : '⚽ Sports Channels'}
              </h3>
              {sportsChannels.length === 0 ? (
                <p className="text-gray-400 text-xs">
                  {lang === 'ar' ? 'لا توجد قنوات رياضية موثّقة متاحة حالياً' : 'No verified sports channels available yet'}
                </p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {sportsChannels.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`px-3 py-2 text-sm rounded-lg transition font-medium ${
                        activeChannelId === ch.id
                          ? 'bg-orange-500 text-black font-bold'
                          : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {activeChannelId === ch.id && '● '}
                      {lang === 'ar' ? ch.name : ch.nameEn}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* أخبار اقتصادية */}
            <h3 className="text-orange-500 font-bold text-sm mt-4">آخر الأخبار الاقتصادية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allNews['egypt'] && allNews['egypt'].map((item: any, i: number) => (
                <div
                  key={i}
                  onClick={() => window.open(item.link, '_blank')}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-orange-500 transition cursor-pointer"
                >
                  <p className="text-white text-sm leading-relaxed mb-3 hover:text-orange-400 transition line-clamp-3">
                    {item.title}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-500 text-xs font-bold">{item.source}</span>
                    <span className="text-gray-400 text-xs">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* رسم بياني المعادن والبترول */}
        {activeCategory.id === 'metals' && (
          <div>
            <div className="flex gap-3 mb-4 flex-wrap">
              {metalCharts.map(metal => (
                <button
                  key={metal.symbol}
                  onClick={() => setActiveMetalChart(metal)}
                  className={`px-4 py-2 text-sm rounded-lg transition flex items-center gap-2 ${
                    activeMetalChart.symbol === metal.symbol
                      ? 'bg-gray-700 text-white font-bold border border-gray-500'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metal.color }} />
                  {lang === 'ar' ? metal.name : metal.nameEn}
                </button>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeMetalChart.color }} />
                <h2 className="text-white font-bold text-sm">
                  {lang === 'ar' ? activeMetalChart.name : activeMetalChart.nameEn}
                </h2>
                <span className="text-gray-400 text-xs mr-2">بيانات لحظية من TradingView</span>
              </div>
              <TradingViewChart symbol={activeMetalChart.symbol} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allNews['gold'] ? allNews['gold'].map((item: any, i: number) => (
                <div
                  key={i}
                  onClick={() => window.open(item.link, '_blank')}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-orange-500 transition cursor-pointer"
                >
                  <p className="text-white text-sm leading-relaxed mb-3 hover:text-orange-400 transition line-clamp-3">
                    {item.title}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-500 text-xs font-bold">{item.source}</span>
                    <span className="text-gray-400 text-xs">{item.date}</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-8 text-gray-400 animate-pulse">
                  جاري تحميل أخبار المعادن...
                </div>
              )}
            </div>
          </div>
        )}

        {/* الأخبار العادية */}
        {activeCategory.id !== 'metals' && activeCategory.id !== 'live' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsErrors[activeCategory.id] && !allNews[activeCategory.id] ? (
              <div className="col-span-3">
                <DataError onRetry={() => fetchCategoryNews(activeCategory)} />
              </div>
            ) : loading || !allNews[activeCategory.id] ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))
            ) : news.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">😕</p>
                <p>لا توجد أخبار حالياً</p>
              </div>
            ) : (
              news.map((item, i) => (
                <div
                  key={i}
                  onClick={() => window.open(item.link, '_blank')}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-orange-500 transition cursor-pointer"
                >
                  <p className="text-white text-sm leading-relaxed mb-3 hover:text-orange-400 transition line-clamp-3">
                    {item.title}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-500 text-xs font-bold">{item.source}</span>
                    <span className="text-gray-400 text-xs">{item.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  );
}