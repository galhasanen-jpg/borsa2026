'use client';

import { useState, useEffect } from 'react';
import StockChart from '../components/StockChart';
import StockAnalysis from '../components/StockAnalysis';

export default function StocksPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeSector, setActiveSector] = useState('الكل');
  const [sectors, setSectors] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [prices, setPrices] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [showWatchlistMenu, setShowWatchlistMenu] = useState<string>('');
  const [showCreateWatchlist, setShowCreateWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [watchlistMessage, setWatchlistMessage] = useState('');
  const [activeList, setActiveList] = useState<'all' | number>('all');
  const [watchlistStocks, setWatchlistStocks] = useState<any[]>([]);

  useEffect(() => {
    fetchSectors();
    fetchStocks();
    const stored = localStorage.getItem('follower');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      fetchWatchlists(userData.id);
    }
  }, []);

  async function fetchSectors() {
    const res = await fetch('/api/sectors');
    const data = await res.json();
    setSectors(data);
  }

  async function fetchStocks() {
    const res = await fetch('/api/stocks');
    const data = await res.json();
    setStocks(data);
    fetchPrices(data);
  }

  async function fetchPrices(stocksList: any[]) {
    const results: any = {};
    await Promise.all(
      stocksList.map(async (stock) => {
        try {
          const res = await fetch(`/api/stock?symbol=${stock.symbol}.CA`);
          const data = await res.json();
          results[stock.symbol] = data;
        } catch (e) {}
      })
    );
    setPrices(results);
    setLoading(false);
  }

  async function fetchWatchlists(followerId: number) {
    const res = await fetch(`/api/watchlists?follower_id=${followerId}`);
    const data = await res.json();
    setWatchlists(Array.isArray(data) ? data : []);
  }

  async function fetchWatchlistStocks(watchlistId: number) {
    const res = await fetch(`/api/watchlists?watchlist_id=${watchlistId}`);
    const data = await res.json();
    setWatchlistStocks(Array.isArray(data) ? data : []);
  }

  async function handleCreateWatchlist() {
    if (!newWatchlistName.trim() || !user) return;
    const res = await fetch('/api/watchlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        follower_id: user.id,
        name: newWatchlistName
      })
    });
    const data = await res.json();
    if (data.success) {
      setNewWatchlistName('');
      setShowCreateWatchlist(false);
      fetchWatchlists(user.id);
    }
  }

  async function handleAddToWatchlist(watchlistId: number, symbol: string, stockName: string) {
    const res = await fetch('/api/watchlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_stock',
        watchlist_id: watchlistId,
        symbol,
        stock_name: stockName
      })
    });
    const data = await res.json();
    if (data.success) {
      setWatchlistMessage(`✅ تم إضافة ${symbol} للقائمة`);
      setShowWatchlistMenu('');
      setTimeout(() => setWatchlistMessage(''), 3000);
      if (activeList !== 'all') fetchWatchlistStocks(activeList as number);
    }
  }

  async function handleRemoveFromWatchlist(stockId: number) {
    await fetch(`/api/watchlists?id=${stockId}&type=stock`, { method: 'DELETE' });
    if (activeList !== 'all') fetchWatchlistStocks(activeList as number);
  }

  async function handleDeleteWatchlist(watchlistId: number) {
    if (!confirm('هل أنت متأكد من حذف هذه القائمة؟')) return;
    await fetch(`/api/watchlists?id=${watchlistId}&type=watchlist`, { method: 'DELETE' });
    fetchWatchlists(user.id);
    if (activeList === watchlistId) setActiveList('all');
  }

  const displayedStocks = activeList === 'all'
    ? stocks.filter(s => {
        const matchSector = activeSector === 'الكل' ||
          (lang === 'ar' ? s.sector === activeSector : s.sector_en === activeSector);
        return matchSector;
      })
    : watchlistStocks.map(ws => ({
        symbol: ws.symbol,
        name: ws.stock_name_ar || ws.stock_name,
        name_en: ws.name_en,
        sector: ws.sector,
        sector_en: ws.sector_en,
        watchlist_stock_id: ws.id
      }));
      return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">

        {/* العنوان */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-orange-500 font-bold text-xl">
            {lang === 'ar' ? 'سوق الأسهم المصري' : 'Egyptian Stock Market'}
          </h1>
          <span className="text-gray-500 text-xs">{stocks.length} سهم</span>
        </div>

        {watchlistMessage && (
          <div className="bg-green-900 text-green-400 p-2 rounded-lg mb-3 text-sm">{watchlistMessage}</div>
        )}

        {/* القوائم */}
        {user && (
          <div className="flex gap-2 flex-wrap mb-4 items-center">
            <button
              onClick={() => setActiveList('all')}
              className={`px-3 py-1.5 text-xs rounded transition ${activeList === 'all' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              📊 كل الأسهم
            </button>
            {watchlists.map(wl => (
              <div key={wl.id} className="flex items-center gap-1">
                <button
                  onClick={() => { setActiveList(wl.id); fetchWatchlistStocks(wl.id); }}
                  className={`px-3 py-1.5 text-xs rounded transition ${activeList === wl.id ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                  ⭐ {wl.name} ({wl.stock_count})
                </button>
                <button
                  onClick={() => handleDeleteWatchlist(wl.id)}
                  className="text-gray-600 hover:text-red-400 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            {showCreateWatchlist ? (
              <div className="flex gap-2 items-center">
                <input
                  value={newWatchlistName}
                  onChange={e => setNewWatchlistName(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-xs w-32"
                  placeholder="اسم القائمة"
                  onKeyDown={e => e.key === 'Enter' && handleCreateWatchlist()}
                />
                <button onClick={handleCreateWatchlist} className="bg-orange-500 text-black px-2 py-1 rounded text-xs font-bold">إنشاء</button>
                <button onClick={() => setShowCreateWatchlist(false)} className="text-gray-500 text-xs">إلغاء</button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateWatchlist(true)}
                className="px-3 py-1.5 text-xs rounded bg-gray-800 text-gray-400 hover:text-orange-500 transition"
              >
                + قائمة جديدة
              </button>
            )}
          </div>
        )}

        {/* القطاعات - تظهر فقط عند عرض كل الأسهم */}
        {activeList === 'all' && (
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* جدول الأسهم */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h2 className="text-orange-500 font-bold text-sm">
                {activeList === 'all' ? 'الأسهم' : watchlists.find(w => w.id === activeList)?.name}
              </h2>
              <span className="text-gray-500 text-xs">{displayedStocks.length} سهم</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    <th className="px-4 py-2 text-right">الرمز</th>
                    <th className="px-4 py-2 text-right hidden md:table-cell">الشركة</th>
                    <th className="px-4 py-2 text-right">السعر</th>
                    <th className="px-4 py-2 text-right">التغيير</th>
                    <th className="px-4 py-2 text-right hidden md:table-cell">الحجم</th>
                    {user && <th className="px-4 py-2 text-right">قائمة</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedStocks.map((stock, i) => {
                    const data = prices[stock.symbol];
                    const changePercent = data ? parseFloat(data.changePercent) : 0;
                    const up = changePercent >= 0;
                    const isSelected = selectedStock?.symbol === stock.symbol;

                    return (
                      <tr
                        key={i}
                        onClick={() => setSelectedStock(stock)}
                        className={`border-b border-gray-800 hover:bg-gray-800 transition cursor-pointer ${isSelected ? 'bg-gray-800 border-r-2 border-r-orange-500' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <span className="text-orange-400 font-bold text-xs">{stock.symbol}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-white text-xs">{lang === 'ar' ? stock.name : stock.name_en}</p>
                          <p className="text-gray-500 text-xs">{lang === 'ar' ? stock.sector : stock.sector_en}</p>
                        </td>
                        <td className="px-4 py-3">
                          {loading ? <div className="h-4 bg-gray-800 rounded animate-pulse w-16"></div>
                            : <span className="text-white font-mono text-xs">{data?.price || 'N/A'} ج</span>}
                        </td>
                        <td className="px-4 py-3">
                          {loading ? <div className="h-4 bg-gray-800 rounded animate-pulse w-12"></div>
                            : <span className={`text-xs font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>
                                {up ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                              </span>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-gray-500 text-xs">{data?.volume || 'N/A'}</span>
                        </td>
                        {user && (
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            {activeList !== 'all' ? (
                              <button
                                onClick={() => handleRemoveFromWatchlist(stock.watchlist_stock_id)}
                                className="text-red-500 text-xs hover:text-red-400"
                              >
                                ✕
                              </button>
                            ) : (
                              <div className="relative">
                                <button
                                  onClick={() => setShowWatchlistMenu(showWatchlistMenu === stock.symbol ? '' : stock.symbol)}
                                  className="text-gray-500 text-xs hover:text-orange-500 transition"
                                >
                                  ⭐
                                </button>
                                {showWatchlistMenu === stock.symbol && (
                                  <div className="absolute left-0 top-6 bg-gray-800 border border-gray-700 rounded-lg p-2 z-50 min-w-36">
                                    {watchlists.length === 0 ? (
                                      <p className="text-gray-500 text-xs p-1">لا توجد قوائم</p>
                                    ) : (
                                      watchlists.map(wl => (
                                        <button
                                          key={wl.id}
                                          onClick={() => handleAddToWatchlist(wl.id, stock.symbol, stock.name)}
                                          className="block w-full text-right text-xs text-gray-300 hover:text-orange-500 px-2 py-1.5 hover:bg-gray-700 rounded transition"
                                        >
                                          ⭐ {wl.name}
                                        </button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* الرسم البياني */}
          <div className="lg:col-span-3 space-y-4">
            {selectedStock ? (
              <StockChart
                symbol={selectedStock.symbol}
                name={lang === 'ar' ? selectedStock.name : selectedStock.name_en}
                lang={lang}
              />
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                <p className="text-5xl mb-4">📈</p>
                <p className="text-gray-500 text-sm">اضغط على سهم لعرض الرسم البياني</p>
              </div>
            )}

            {selectedStock && prices[selectedStock.symbol] && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-orange-500 font-bold text-sm mb-3">بيانات السهم</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'السعر', value: `${prices[selectedStock.symbol]?.price} ج` },
                    { label: 'التغيير', value: `${prices[selectedStock.symbol]?.changePercent}%` },
                    { label: 'الحجم', value: prices[selectedStock.symbol]?.volume },
                    { label: 'القطاع', value: lang === 'ar' ? selectedStock.sector : selectedStock.sector_en },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-800 rounded p-2">
                      <p className="text-gray-500 text-xs">{item.label}</p>
                      <p className="text-white text-xs font-bold mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* التحليل المبسّط */}
            {selectedStock && (
              <StockAnalysis
                symbol={selectedStock.symbol}
                name={lang === 'ar' ? selectedStock.name : selectedStock.name_en}
                lang={lang}
                priceData={prices[selectedStock.symbol] || null}
              />
            )}
          </div>

        </div>
      </div>
    </main>
  );
}