'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'prices' | 'history' | 'analysts' | 'followers'>('prices');

  // بيانات الأسعار
  const [stocks, setStocks] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'sector' | 'price' | 'change' | 'updated'>('symbol');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editStock, setEditStock] = useState<any>(null);
  const [formData, setFormData] = useState({ price: '', change_percent: '', volume: '' });
  const [message, setMessage] = useState('');

  // بيانات تاريخية
  const [historySymbol, setHistorySymbol] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [historyForm, setHistoryForm] = useState({ open: '', high: '', low: '', close: '', volume: '' });
  const [bulkHistory, setBulkHistory] = useState('');

  // بيانات المحللين
  const [analysts, setAnalysts] = useState<any[]>([]);
  const [pendingAnalysts, setPendingAnalysts] = useState<any[]>([]);
  const [selectedAnalyst, setSelectedAnalyst] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showAddRec, setShowAddRec] = useState(false);
  const [recForm, setRecForm] = useState({
    symbol: '', stock_name: '', type: 'شراء',
    entry_price: '', target_price: '', stop_loss: '',
    duration: 'medium', description: '',
  });

  // بيانات المتابعين
  const [followers, setFollowers] = useState<any[]>([]);
  const [pendingFollowers, setPendingFollowers] = useState<any[]>([]);

  useEffect(() => {
    fetchStocks();
    fetchPrices();
    fetchAnalysts();
    fetchFollowers();
  }, []);

  async function fetchStocks() {
    const res = await fetch('/api/stocks');
    const data = await res.json();
    setStocks(data);
  }

  async function fetchPrices() {
    const res = await fetch('/api/stock-prices');
    const data = await res.json();
    setPrices(Array.isArray(data) ? data : []);
  }

  async function fetchAnalysts() {
    const res = await fetch('/api/analysts');
    const data = await res.json();
    const all = Array.isArray(data) ? data : [];
    setAnalysts(all.filter((a: any) => a.status === 'active'));
    setPendingAnalysts(all.filter((a: any) => a.status === 'pending'));
  }

  async function fetchRecommendations(analystId: number) {
    const res = await fetch(`/api/recommendations?analyst_id=${analystId}`);
    const data = await res.json();
    setRecommendations(Array.isArray(data) ? data : []);
  }

  async function fetchFollowers() {
    const res = await fetch('/api/followers');
    const data = await res.json();
    const all = Array.isArray(data) ? data : [];
    setFollowers(all.filter((f: any) => f.status === 'active'));
    setPendingFollowers(all.filter((f: any) => f.status === 'pending' || f.status === 'approved'));
  }

  function getPrice(symbol: string) {
    return prices.find(p => p.symbol === symbol);
  }

  function handleEdit(stock: any) {
    const price = getPrice(stock.symbol);
    setEditStock(stock);
    setFormData({
      price: price?.price || '',
      change_percent: price?.change_percent || '',
      volume: price?.volume || ''
    });
  }

  async function handleSave() {
    if (!editStock) return;
    const res = await fetch('/api/stock-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: editStock.symbol,
        price: parseFloat(formData.price),
        change_percent: parseFloat(formData.change_percent),
        volume: formData.volume
      })
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`✅ تم حفظ بيانات ${editStock.symbol}`);
      setEditStock(null);
      fetchPrices();
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleDelete(symbol: string) {
    if (!confirm(`هل أنت متأكد من حذف بيانات ${symbol}؟`)) return;
    await fetch(`/api/stock-prices?symbol=${symbol}`, { method: 'DELETE' });
    fetchPrices();
  }

  async function handleSaveHistory() {
    if (!historySymbol || !historyDate) {
      setMessage('❌ يرجى إدخال رمز السهم والتاريخ');
      return;
    }
    const res = await fetch('/api/stock-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: historySymbol.toUpperCase(),
        date: historyDate,
        open: parseFloat(historyForm.open),
        high: parseFloat(historyForm.high),
        low: parseFloat(historyForm.low),
        close: parseFloat(historyForm.close),
        volume: parseInt(historyForm.volume.replace(/,/g, ''))
      })
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`✅ تم حفظ بيانات ${historySymbol} ليوم ${historyDate}`);
      setHistoryForm({ open: '', high: '', low: '', close: '', volume: '' });
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleBulkImport() {
    if (!bulkHistory.trim()) return;
    const lines = bulkHistory.trim().split('\n');
    let success = 0;
    let errors = 0;
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 6) { errors++; continue; }
      const [symbol, date, open, high, low, close, volume] = parts;
      const res = await fetch('/api/stock-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(), date,
          open: parseFloat(open), high: parseFloat(high),
          low: parseFloat(low), close: parseFloat(close),
          volume: parseInt((volume || '0').replace(/,/g, ''))
        })
      });
      const data = await res.json();
      if (data.success) success++;
      else errors++;
    }
    setMessage(`✅ تم استيراد ${success} سجل${errors > 0 ? ` • ❌ ${errors} خطأ` : ''}`);
    setBulkHistory('');
    setTimeout(() => setMessage(''), 5000);
  }

  async function handleApproveAnalyst(id: number) {
    const analyst = pendingAnalysts.find(a => a.id === id);
    await fetch('/api/analysts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id, status: 'active',
        name: analyst?.name, bio: analyst?.bio,
        specialization: analyst?.specialization,
        avatar_url: analyst?.avatar_url || '',
        whatsapp_link: analyst?.whatsapp_link || '',
        telegram_link: analyst?.telegram_link || ''
      })
    });
    setMessage('✅ تم قبول المحلل');
    fetchAnalysts();
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleRejectAnalyst(id: number) {
    if (!confirm('هل أنت متأكد من رفض هذا المحلل؟')) return;
    await fetch(`/api/analysts?id=${id}`, { method: 'DELETE' });
    setMessage('✅ تم رفض المحلل');
    fetchAnalysts();
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleAdminApprove(id: number, email: string, name: string) {
    const res = await fetch('/api/followers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'admin_approve' })
    });
    const data = await res.json();
    if (data.success) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'تفعيل حسابك في بورصة 2026',
          html: `
            <div dir="rtl" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
              <h2 style="color: #f97316;">مرحباً ${name}!</h2>
              <p>تم قبول طلب تسجيلك في بورصة 2026</p>
              <p>كود التفعيل الخاص بك:</p>
              <h1 style="color: #f97316; font-size: 36px; letter-spacing: 8px; text-align: center; padding: 20px; background: #1a1a1a; border-radius: 8px;">${data.code}</h1>
              <p style="color: #999;">هذا الكود للاستخدام مرة واحدة فقط</p>
              <a href="http://localhost:3000/verify" style="background: #f97316; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">تفعيل الحساب</a>
            </div>
          `
        })
      });
      setMessage('✅ تم قبول المتابع وإرسال كود التفعيل على إيميله');
      fetchFollowers();
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleRejectFollower(id: number) {
    if (!confirm('هل أنت متأكد من رفض هذا المتابع؟')) return;
    await fetch(`/api/followers?id=${id}`, { method: 'DELETE' });
    setMessage('✅ تم رفض المتابع');
    fetchFollowers();
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleAddRec() {
    if (!selectedAnalyst || !recForm.symbol || !recForm.entry_price) {
      setMessage('❌ يرجى اختيار السهم وإدخال سعر الدخول');
      return;
    }
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analyst_id: selectedAnalyst.id,
        symbol: recForm.symbol, stock_name: recForm.stock_name,
        type: recForm.type, entry_price: parseFloat(recForm.entry_price),
        target_price: recForm.target_price ? parseFloat(recForm.target_price) : null,
        stop_loss: recForm.stop_loss ? parseFloat(recForm.stop_loss) : null,
        duration: recForm.duration, description: recForm.description, approved: true
      })
    });
    const data = await res.json();
    if (data.success) {
      setMessage('✅ تم إضافة التوصية بنجاح');
      setShowAddRec(false);
      setRecForm({ symbol: '', stock_name: '', type: 'شراء', entry_price: '', target_price: '', stop_loss: '', duration: 'medium', description: '' });
      fetchRecommendations(selectedAnalyst.id);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleUpdateRecStatus(id: number, status: string, resultPrice?: string) {
    await fetch('/api/recommendations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, result_price: resultPrice ? parseFloat(resultPrice) : null, approved: true })
    });
    setMessage('✅ تم تحديث حالة التوصية');
    fetchRecommendations(selectedAnalyst.id);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleDeleteRec(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذه التوصية؟')) return;
    await fetch(`/api/recommendations?id=${id}`, { method: 'DELETE' });
    fetchRecommendations(selectedAnalyst.id);
  }

  function handleSort(key: any) {
    if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  }

  const filteredStocks = stocks
    .filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.includes(search) ||
      s.name_en.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const priceA = getPrice(a.symbol);
      const priceB = getPrice(b.symbol);
      let valA: any, valB: any;
      switch (sortBy) {
        case 'symbol': valA = a.symbol; valB = b.symbol; break;
        case 'sector': valA = a.sector; valB = b.sector; break;
        case 'price': valA = parseFloat(priceA?.price || '0'); valB = parseFloat(priceB?.price || '0'); break;
        case 'change': valA = parseFloat(priceA?.change_percent || '0'); valB = parseFloat(priceB?.change_percent || '0'); break;
        case 'updated': valA = priceA?.updated_at || ''; valB = priceB?.updated_at || ''; break;
        default: valA = a.symbol; valB = b.symbol;
      }
      if (sortDir === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  const columns = [
    { label: 'الرمز', key: 'symbol' },
    { label: 'الشركة', key: 'name' },
    { label: 'القطاع', key: 'sector' },
    { label: 'السعر', key: 'price' },
    { label: 'التغيير', key: 'change' },
    { label: 'آخر تحديث', key: 'updated' },
  ];
  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-orange-500 font-bold text-xl">⚙️ لوحة الإدارة</h1>
          <span className="text-gray-500 text-xs">{prices.length} سهم محدث من {stocks.length}</span>
        </div>

        {message && (
          <div className="bg-green-900 text-green-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        {/* التبويبات */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveTab('prices')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'prices' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>💰 الأسعار</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'history' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>📅 البيانات التاريخية</button>
          <button onClick={() => setActiveTab('analysts')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'analysts' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            👨‍💼 المحللون
            {pendingAnalysts.length > 0 && <span className="mr-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingAnalysts.length}</span>}
          </button>
          <button onClick={() => setActiveTab('followers')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'followers' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            👥 المتابعون
            {pendingFollowers.length > 0 && <span className="mr-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingFollowers.length}</span>}
          </button>
        </div>

        {/* تبويب الأسعار */}
        {activeTab === 'prices' && (
          <>
            {editStock && (
              <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 mb-6">
                <h2 className="text-orange-500 font-bold mb-4">تعديل: {editStock.symbol} - {editStock.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div><label className="text-gray-400 text-xs mb-1 block">السعر (جنيه)</label><input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="126.00" /></div>
                  <div><label className="text-gray-400 text-xs mb-1 block">نسبة التغيير %</label><input value={formData.change_percent} onChange={e => setFormData({...formData, change_percent: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="3.70 أو -1.50" /></div>
                  <div><label className="text-gray-400 text-xs mb-1 block">حجم التداول</label><input value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="1,234,567" /></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} className="bg-orange-500 text-black px-6 py-2 rounded font-bold text-sm hover:bg-orange-600">حفظ</button>
                  <button onClick={() => setEditStock(null)} className="bg-gray-700 text-white px-6 py-2 rounded text-sm hover:bg-gray-600">إلغاء</button>
                </div>
              </div>
            )}
            <div className="mb-4"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الرمز..." className="bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 w-full md:w-96 text-sm" /></div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    {columns.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)} className="px-4 py-3 text-right cursor-pointer hover:text-orange-500 transition select-none">
                        {col.label} {sortBy === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock, i) => {
                    const price = getPrice(stock.symbol);
                    const up = price ? parseFloat(price.change_percent) >= 0 : true;
                    return (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800 transition">
                        <td className="px-4 py-3"><span className="text-orange-400 font-bold text-xs">{stock.symbol}</span></td>
                        <td className="px-4 py-3"><p className="text-white text-xs">{stock.name}</p><p className="text-gray-500 text-xs">{stock.name_en}</p></td>
                        <td className="px-4 py-3"><span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{stock.sector}</span></td>
                        <td className="px-4 py-3">{price ? <span className="text-white font-mono text-xs">{price.price} ج</span> : <span className="text-gray-600 text-xs">غير محدد</span>}</td>
                        <td className="px-4 py-3">{price ? <span className={`text-xs font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>{up ? '▲' : '▼'} {Math.abs(parseFloat(price.change_percent))}%</span> : <span className="text-gray-600 text-xs">-</span>}</td>
                        <td className="px-4 py-3">{price ? <span className="text-gray-500 text-xs">{new Date(price.updated_at).toLocaleString('ar-EG')}</span> : <span className="text-gray-600 text-xs">-</span>}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(stock)} className="bg-orange-500 text-black px-2 py-1 rounded text-xs hover:bg-orange-600">تعديل</button>
                            {price && <button onClick={() => handleDelete(stock.symbol)} className="bg-red-900 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-800">حذف</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* تبويب البيانات التاريخية */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-orange-500 font-bold mb-4">📝 إدخال يدوي</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><label className="text-gray-400 text-xs mb-1 block">رمز السهم</label><input value={historySymbol} onChange={e => setHistorySymbol(e.target.value)} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="COMI" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">التاريخ</label><input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">سعر الافتتاح</label><input value={historyForm.open} onChange={e => setHistoryForm({...historyForm, open: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="125.00" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">أعلى سعر</label><input value={historyForm.high} onChange={e => setHistoryForm({...historyForm, high: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="128.00" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">أدنى سعر</label><input value={historyForm.low} onChange={e => setHistoryForm({...historyForm, low: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="123.00" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">سعر الإغلاق</label><input value={historyForm.close} onChange={e => setHistoryForm({...historyForm, close: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="126.00" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">حجم التداول</label><input value={historyForm.volume} onChange={e => setHistoryForm({...historyForm, volume: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="1234567" /></div>
              </div>
              <button onClick={handleSaveHistory} className="bg-orange-500 text-black px-6 py-2 rounded font-bold text-sm hover:bg-orange-600">حفظ</button>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-orange-500 font-bold mb-2">📥 استيراد جماعي (CSV)</h2>
              <p className="text-gray-500 text-xs mb-4">الصيغة: رمز, تاريخ, افتتاح, أعلى, أدنى, إغلاق, حجم</p>
              <textarea value={bulkHistory} onChange={e => setBulkHistory(e.target.value)} rows={6} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm font-mono mb-4" placeholder="COMI, 2024-01-15, 120.00, 125.00, 119.00, 123.00, 1500000" />
              <button onClick={handleBulkImport} className="bg-orange-500 text-black px-6 py-2 rounded font-bold text-sm hover:bg-orange-600">استيراد</button>
            </div>
          </div>
        )}
        {/* تبويب المحللين */}
        {activeTab === 'analysts' && (
          <div className="space-y-6">
            {pendingAnalysts.length > 0 && (
              <div className="bg-gray-900 border border-red-800 rounded-lg p-4">
                <h2 className="text-red-400 font-bold mb-4">⏳ طلبات تسجيل معلقة ({pendingAnalysts.length})</h2>
                <div className="space-y-3">
                  {pendingAnalysts.map((analyst, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold text-sm">{analyst.name}</p>
                        <p className="text-orange-500 text-xs">{analyst.specialization}</p>
                        <p className="text-gray-400 text-xs mt-1">{analyst.bio}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveAnalyst(analyst.id)} className="bg-green-900 text-green-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-800">✅ قبول</button>
                        <button onClick={() => handleRejectAnalyst(analyst.id)} className="bg-red-900 text-red-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-800">❌ رفض</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-orange-500 font-bold mb-4">👨‍💼 المحللون النشطون ({analysts.length})</h2>
              <div className="space-y-3">
                {analysts.map((analyst, i) => (
                  <div key={i} className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition ${selectedAnalyst?.id === analyst.id ? 'border border-orange-500' : ''}`}
                    onClick={() => { setSelectedAnalyst(analyst); fetchRecommendations(analyst.id); setShowAddRec(false); }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{analyst.name}</p>
                        <p className="text-orange-500 text-xs">{analyst.specialization}</p>
                      </div>
                      <span className="text-gray-500 text-xs">اضغط لإدارة التوصيات</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedAnalyst && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-orange-500 font-bold">توصيات {selectedAnalyst.name} ({recommendations.length})</h2>
                  <button onClick={() => setShowAddRec(!showAddRec)} className="bg-orange-500 text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600">
                    {showAddRec ? 'إلغاء' : '+ إضافة توصية'}
                  </button>
                </div>

                {showAddRec && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div className="md:col-span-3">
                        <label className="text-gray-400 text-xs mb-1 block">اختر السهم *</label>
                        <select value={recForm.symbol} onChange={e => { const s = stocks.find(s => s.symbol === e.target.value); setRecForm({...recForm, symbol: e.target.value, stock_name: s?.name || ''}); }} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs">
                          <option value="">-- اختر السهم --</option>
                          {stocks.map((stock, i) => { const price = getPrice(stock.symbol); return <option key={i} value={stock.symbol}>{stock.symbol} - {stock.name} {price ? `| ${price.price} ج` : ''}</option>; })}
                        </select>
                        {recForm.symbol && (
                          <div className="mt-1 flex items-center gap-3 bg-gray-900 rounded p-2">
                            <span className="text-orange-400 font-bold text-xs">{recForm.symbol}</span>
                            <span className="text-white text-xs">{recForm.stock_name}</span>
                            {getPrice(recForm.symbol) && <><span className="text-gray-500 text-xs">|</span><span className="text-gray-400 text-xs">آخر سعر:</span><span className="text-orange-500 font-bold text-xs">{getPrice(recForm.symbol)?.price} ج</span></>}
                          </div>
                        )}
                      </div>
                      <div><label className="text-gray-400 text-xs mb-1 block">نوع التوصية</label><select value={recForm.type} onChange={e => setRecForm({...recForm, type: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"><option value="شراء">شراء</option><option value="بيع">بيع</option><option value="احتفاظ">احتفاظ</option></select></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">سعر الدخول *</label><input value={recForm.entry_price} onChange={e => setRecForm({...recForm, entry_price: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs" placeholder="120.00" /></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">السعر المستهدف</label><input value={recForm.target_price} onChange={e => setRecForm({...recForm, target_price: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs" placeholder="145.00" /></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">وقف الخسارة</label><input value={recForm.stop_loss} onChange={e => setRecForm({...recForm, stop_loss: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs" placeholder="110.00" /></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">المدة</label><select value={recForm.duration} onChange={e => setRecForm({...recForm, duration: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"><option value="short">قصير الأجل</option><option value="medium">متوسط الأجل</option><option value="long">طويل الأجل</option></select></div>
                    </div>
                    <div className="mb-3"><label className="text-gray-400 text-xs mb-1 block">وصف التوصية</label><textarea value={recForm.description} onChange={e => setRecForm({...recForm, description: e.target.value})} rows={2} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs" /></div>
                    <button onClick={handleAddRec} className="bg-orange-500 text-black px-4 py-2 rounded text-xs font-bold hover:bg-orange-600">حفظ التوصية</button>
                  </div>
                )}

                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-orange-400 font-bold text-sm">{rec.symbol}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${rec.type === 'شراء' ? 'bg-green-900 text-green-400' : rec.type === 'بيع' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'}`}>{rec.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${rec.status === 'open' ? 'bg-blue-900 text-blue-400' : rec.status === 'success' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                              {rec.status === 'open' ? 'مفتوحة' : rec.status === 'success' ? '✅ ناجحة' : '❌ خاسرة'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">دخول: {rec.entry_price} ج{rec.target_price && ` • هدف: ${rec.target_price} ج`}{rec.stop_loss && ` • وقف: ${rec.stop_loss} ج`}</p>
                        </div>
                        <div className="flex gap-1">
                          {rec.status === 'open' && (
                            <>
                              <button onClick={() => { const p = prompt('أدخل سعر الإغلاق:'); if (p) handleUpdateRecStatus(rec.id, 'success', p); }} className="bg-green-900 text-green-400 px-2 py-1 rounded text-xs hover:bg-green-800">✅</button>
                              <button onClick={() => { const p = prompt('أدخل سعر الإغلاق:'); if (p) handleUpdateRecStatus(rec.id, 'failed', p); }} className="bg-red-900 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-800">❌</button>
                            </>
                          )}
                          <button onClick={() => handleDeleteRec(rec.id)} className="bg-gray-700 text-gray-400 px-2 py-1 rounded text-xs hover:bg-gray-600">حذف</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* تبويب المتابعين */}
        {activeTab === 'followers' && (
          <div className="space-y-6">

            {/* طلبات معلقة */}
            {pendingFollowers.length > 0 && (
              <div className="bg-gray-900 border border-red-800 rounded-lg p-4">
                <h2 className="text-red-400 font-bold mb-4">⏳ طلبات تسجيل معلقة ({pendingFollowers.length})</h2>
                <div className="space-y-3">
                  {pendingFollowers.map((follower, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-bold text-sm">{follower.name}</p>
                          <p className="text-gray-400 text-xs mt-1">📧 {follower.email}</p>
                          <p className="text-gray-400 text-xs">📱 {follower.whatsapp}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-orange-500 text-xs">المحلل: {follower.analyst_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${follower.plan === 'premium' ? 'bg-orange-900 text-orange-400' : follower.plan === 'basic' ? 'bg-blue-900 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                              {follower.plan === 'premium' ? 'متميز' : follower.plan === 'basic' ? 'أساسي' : 'مجاني'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleAdminApprove(follower.id, follower.email, follower.name)}
                            className="bg-green-900 text-green-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-800"
                          >
                            ✅ قبول وإرسال كود
                          </button>
                          <button
                            onClick={() => handleRejectFollower(follower.id)}
                            className="bg-red-900 text-red-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-800"
                          >
                            ❌ رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* المتابعون النشطون */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-orange-500 font-bold mb-4">👥 المتابعون النشطون ({followers.length})</h2>
              {followers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">لا يوجد متابعون نشطون حتى الآن</p>
              ) : (
                <div className="space-y-2">
                  {followers.map((follower, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{follower.name}</p>
                        <p className="text-gray-400 text-xs">📧 {follower.email} • 📱 {follower.whatsapp}</p>
                        <p className="text-orange-500 text-xs">المحلل: {follower.analyst_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${follower.plan === 'premium' ? 'bg-orange-900 text-orange-400' : follower.plan === 'basic' ? 'bg-blue-900 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                          {follower.plan === 'premium' ? 'متميز' : follower.plan === 'basic' ? 'أساسي' : 'مجاني'}
                        </span>
                        <button onClick={() => handleRejectFollower(follower.id)} className="bg-red-900 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-800">حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}