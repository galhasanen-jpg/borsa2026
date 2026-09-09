'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './components/LanguageProvider';

const stocksData = [
  { symbol: 'COMI.CA', name: 'البنك التجاري الدولي', nameEn: 'CIB' },
  { symbol: 'SWDY.CA', name: 'السويدي إلكتريك', nameEn: 'Swedy Electric' },
  { symbol: 'TMGH.CA', name: 'طلعت مصطفى', nameEn: 'TMG' },
  { symbol: 'ETEL.CA', name: 'المصرية للاتصالات', nameEn: 'Telecom Egypt' },
  { symbol: 'EAST.CA', name: 'الشرقية للدخان', nameEn: 'Eastern Tobacco' },
  { symbol: 'EFIH.CA', name: 'إي فاينانس', nameEn: 'E-Finance' },
  { symbol: 'FWRY.CA', name: 'فوري', nameEn: 'Fawry' },
  { symbol: 'MFPC.CA', name: 'موبكو', nameEn: 'MOPCO' },
];

const NEWS_QUERY = 'البورصة المصرية اقتصاد مصر';

// وقت نسبي حقيقي محسوب من تاريخ نشر الخبر الفعلي، بدل نص ثابت لا يتغير أبداً
function timeAgo(rawDate: string, lang: 'ar' | 'en') {
  const diffMin = Math.max(0, Math.floor((Date.now() - new Date(rawDate).getTime()) / 60000));
  if (diffMin < 1) return lang === 'ar' ? 'الآن' : 'Just now';
  if (diffMin < 60) return lang === 'ar' ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return lang === 'ar' ? `منذ ${diffHr} ساعة` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return lang === 'ar' ? `منذ ${diffDay} يوم` : `${diffDay}d ago`;
}

export default function Home() {
  const { lang } = useLanguage();
  const [indices, setIndices] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetchMarkets();
    fetchStocks();
    fetchNews();
    const interval = setInterval(() => {
      fetchMarkets();
      fetchStocks();
      fetchNews();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMarkets() {
    try {
      const res = await fetch('/api/markets');
      const data = await res.json();
      if (data.indices) setIndices(data.indices);
    } catch (e) {}
  }

  async function fetchNews() {
    try {
      const res = await fetch(`/api/global-news?query=${encodeURIComponent(NEWS_QUERY)}`);
      const data = await res.json();
      setNews(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (e) {}
  }

  async function fetchStocks() {
    try {
      const results = await Promise.all(
        stocksData.map(async (stock) => {
          const res = await fetch(`/api/stock?symbol=${stock.symbol}`);
          const data = await res.json();
          return {
            ...stock,
            price: data.price || 'N/A',
            change: data.changePercent ? `${parseFloat(data.changePercent) >= 0 ? '+' : ''}${data.changePercent}%` : 'N/A',
            up: data.changePercent ? parseFloat(data.changePercent) >= 0 : true,
            volume: data.volume || 'N/A',
          };
        })
      );
      setStocks(results);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">

        {/* بطاقات المؤشرات */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {indices.length > 0 ? indices.map((index, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-orange-500 transition cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg">{index.flag}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${index.up ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                  {index.change}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{lang === 'ar' ? index.name : index.nameEn}</p>
              <p className="text-white font-bold text-lg mt-1">{index.price}</p>
              <p className={`text-xs mt-1 ${index.up ? 'text-green-400' : 'text-red-400'}`}>
                {index.up ? '▲ ارتفاع' : '▼ انخفاض'}
              </p>
            </div>
          )) : (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-gray-800 rounded mb-2"></div>
                <div className="h-6 bg-gray-800 rounded"></div>
              </div>
            ))
          )}
        </div>

        {/* تحديث تلقائي */}
        <div className="flex justify-end mb-3">
          <span className="text-xs text-gray-600">
            {lang === 'ar' ? '⏱ يتحدث كل دقيقة - البيانات متأخرة 15 دقيقة' : '⏱ Updates every minute - 15 min delay'}
          </span>
        </div>

        {/* القسم الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* جدول الأسهم */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h2 className="text-orange-500 font-bold text-sm">
                {lang === 'ar' ? 'أبرز الأسهم' : 'Top Stocks'}
              </h2>
              <a href="/stocks" className="text-xs text-gray-500 hover:text-orange-500 transition">
                {lang === 'ar' ? 'عرض الكل ←' : 'View All →'}
              </a>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs">
                  <th className="px-4 py-2 text-right">{lang === 'ar' ? 'السهم' : 'Stock'}</th>
                  <th className="px-4 py-2 text-right">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                  <th className="px-4 py-2 text-right">{lang === 'ar' ? 'التغيير' : 'Change'}</th>
                  <th className="px-4 py-2 text-right hidden md:table-cell">{lang === 'ar' ? 'الحجم' : 'Volume'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse w-12"></div></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-800 rounded animate-pulse w-16"></div></td>
                    </tr>
                  ))
                ) : (
                  stocks.map((stock, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800 transition cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="text-orange-400 font-bold text-xs">{stock.symbol.replace('.CA', '')}</p>
                        <p className="text-gray-500 text-xs">{lang === 'ar' ? stock.name : stock.nameEn}</p>
                      </td>
                      <td className="px-4 py-3 text-white font-mono text-xs">{stock.price} ج</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${stock.up ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.up ? '▲' : '▼'} {stock.change}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{stock.volume}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* الأخبار */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="text-orange-500 font-bold text-sm">
                {lang === 'ar' ? 'آخر الأخبار' : 'Latest News'}
              </h2>
            </div>
            <div className="divide-y divide-gray-800">
              {news.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="h-3 bg-gray-800 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-800 rounded animate-pulse w-1/2"></div>
                  </div>
                ))
              ) : (
                news.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 hover:bg-gray-800 transition cursor-pointer"
                  >
                    <p className="text-white text-xs leading-relaxed">
                      {item.title}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-orange-500 text-xs">{item.source}</span>
                      <span className="text-gray-500 text-xs">{timeAgo(item.rawDate, lang)}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}