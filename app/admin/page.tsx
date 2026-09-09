'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';

const L = {
  ar: {
    title: '⚙️ لوحة الإدارة',
    updatedCount: (updated: number, total: number) => `${updated} سهم محدث من ${total}`,
    analytics: '📊 تحليلات الزوار',
    tabs: { prices: '💰 الأسعار', history: '📅 البيانات التاريخية', analysts: '👨‍💼 المحللون', followers: '👥 المتابعون', visitors: '🧑‍💻 حسابات الزوار' },

    // الأسعار
    editing: (symbol: string, name: string) => `تعديل: ${symbol} - ${name}`,
    price: 'السعر (جنيه)',
    changePercent: 'نسبة التغيير %',
    changePercentPh: '3.70 أو -1.50',
    volume: 'حجم التداول',
    save: 'حفظ',
    cancel: 'إلغاء',
    searchPh: 'ابحث بالاسم أو الرمز...',
    columns: { symbol: 'الرمز', name: 'الشركة', sector: 'القطاع', price: 'السعر', change: 'التغيير', updated: 'آخر تحديث' },
    actions: 'إجراءات',
    notSet: 'غير محدد',
    edit: 'تعديل',
    delete: 'حذف',
    savedPrice: (symbol: string) => `✅ تم حفظ بيانات ${symbol}`,
    confirmDeletePrice: (symbol: string) => `هل أنت متأكد من حذف بيانات ${symbol}؟`,

    // البيانات التاريخية
    manualEntry: '📝 إدخال يدوي',
    symbolLabel: 'رمز السهم',
    dateLabel: 'التاريخ',
    openPrice: 'سعر الافتتاح',
    highPrice: 'أعلى سعر',
    lowPrice: 'أدنى سعر',
    closePrice: 'سعر الإغلاق',
    errFillSymbolDate: '❌ يرجى إدخال رمز السهم والتاريخ',
    savedHistory: (symbol: string, date: string) => `✅ تم حفظ بيانات ${symbol} ليوم ${date}`,
    bulkImport: '📥 استيراد جماعي (CSV)',
    bulkFormat: 'الصيغة: رمز, تاريخ, افتتاح, أعلى, أدنى, إغلاق, حجم',
    import: 'استيراد',
    importResult: (success: number, errors: number) => `✅ تم استيراد ${success} سجل${errors > 0 ? ` • ❌ ${errors} خطأ` : ''}`,

    // مزامنة Yahoo
    yahooSyncTitle: '🔄 مزامنة تلقائية من Yahoo Finance',
    yahooSyncDesc: 'يجلب سنة كاملة من البيانات التاريخية الحقيقية والسعر الحالي لكل الأسهم من Yahoo Finance، ويحدّث بها الجداول مباشرة — حل مرحلي ريثما تتوفر واجهة رسمية من البورصة المصرية.',
    yahooSyncStart: '▶️ بدء المزامنة',
    yahooSyncRunning: (done: number, total: number) => `⏳ جاري المزامنة... (${done} من ${total})`,
    yahooSyncDone: (success: number, total: number) => `✅ اكتملت المزامنة: ${success} من ${total} سهم تم تحديثه بنجاح`,
    yahooSyncFailedList: 'الأسهم التي لم تتحدث (غير مدرجة في Yahoo على الأغلب):',

    // المحللون
    pendingRequests: (n: number) => `⏳ طلبات تسجيل معلقة (${n})`,
    approve: '✅ قبول',
    reject: '❌ رفض',
    activeAnalysts: (n: number) => `👨‍💼 المحللون النشطون (${n})`,
    clickToManage: 'اضغط لإدارة التوصيات',
    recsOf: (name: string, n: number) => `توصيات ${name} (${n})`,
    addRec: '+ إضافة توصية',
    chooseStock: 'اختر السهم *',
    chooseStockPh: '-- اختر السهم --',
    lastPrice: 'آخر سعر:',
    recType: 'نوع التوصية',
    entryPrice: 'سعر الدخول *',
    targetPrice: 'السعر المستهدف',
    stopLoss: 'وقف الخسارة',
    duration: 'المدة',
    durationOptions: { short: 'قصير الأجل', medium: 'متوسط الأجل', long: 'طويل الأجل' },
    recDescription: 'وصف التوصية',
    saveRec: 'حفظ التوصية',
    errChooseStockEntry: '❌ يرجى اختيار السهم وإدخال سعر الدخول',
    recAdded: '✅ تم إضافة التوصية بنجاح',
    recStatusUpdated: '✅ تم تحديث حالة التوصية',
    confirmDeleteRec: 'هل أنت متأكد من حذف هذه التوصية؟',
    promptClosePrice: 'أدخل سعر الإغلاق:',
    entryShort: 'دخول:',
    targetShort: 'هدف:',
    stopShort: 'وقف:',
    analystApproved: '✅ تم قبول المحلل',
    confirmRejectAnalyst: 'هل أنت متأكد من رفض هذا المحلل؟',
    analystRejected: '✅ تم رفض المحلل',

    // المتابعون
    followerAnalyst: 'المحلل:',
    approveAndSendCode: '✅ قبول وإرسال كود',
    activeFollowers: (n: number) => `👥 المتابعون النشطون (${n})`,
    noActiveFollowers: 'لا يوجد متابعون نشطون حتى الآن',
    followerApproved: '✅ تم قبول المتابع وإرسال كود التفعيل على إيميله',
    confirmRejectFollower: 'هل أنت متأكد من رفض هذا المتابع؟',
    followerRejected: '✅ تم رفض المتابع',
    planLabels: { premium: 'متميز', basic: 'أساسي', free: 'مجاني' } as Record<string, string>,
    statusLabels: { open: 'مفتوحة', success: '✅ ناجحة', failed: '❌ خاسرة' } as Record<string, string>,

    // حسابات الزوار
    pendingAccounts: (n: number) => `⏳ حسابات بانتظار الموافقة (${n})`,
    allAccounts: (n: number) => `🧑‍💻 كل الحسابات (${n})`,
    noAccountsYet: 'لا توجد حسابات مفعّلة أو مرفوضة بعد',
    accountApproved: '✅ تم قبول الحساب وإشعار صاحبه بالإيميل',
    confirmRejectAccount: 'هل أنت متأكد من رفض هذا الحساب؟',
    accountRejected: '✅ تم رفض الحساب',
    confirmDeleteAccount: 'هل أنت متأكد من حذف هذا الحساب نهائياً؟',
    activeStatus: 'مفعّل',
    rejectedStatus: 'مرفوض',

    // إيميلات (تبقى بالعربي دائماً بغض النظر عن لغة واجهة الإدارة، لأن المستلم قد لا يستخدم نفس اللغة)
    accountApprovedEmail: (name: string) => ({
      subject: 'تم تفعيل حسابك في بورصة 2026',
      html: `
        <div dir="rtl" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
          <h2 style="color: #f97316;">مرحباً ${name}!</h2>
          <p>تمت الموافقة على حسابك في بورصة 2026. تقدر الآن تسجل الدخول بإيميلك وكلمة السر اللي اخترتها.</p>
          <a href="https://borsa2026cd.vercel.app/signin" style="background: #f97316; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 12px;">تسجيل الدخول</a>
        </div>
      `
    }),
    followerActivationEmail: (name: string, code: string) => ({
      subject: 'تفعيل حسابك في بورصة 2026',
      html: `
        <div dir="rtl" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
          <h2 style="color: #f97316;">مرحباً ${name}!</h2>
          <p>تم قبول طلب تسجيلك في بورصة 2026</p>
          <p>كود التفعيل الخاص بك:</p>
          <h1 style="color: #f97316; font-size: 36px; letter-spacing: 8px; text-align: center; padding: 20px; background: #1a1a1a; border-radius: 8px;">${code}</h1>
          <p style="color: #999;">هذا الكود للاستخدام مرة واحدة فقط</p>
          <a href="http://localhost:3000/verify" style="background: #f97316; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">تفعيل الحساب</a>
        </div>
      `
    }),
    dateLocale: 'ar-EG',
  },
  en: {
    title: '⚙️ Admin Dashboard',
    updatedCount: (updated: number, total: number) => `${updated} of ${total} stocks updated`,
    analytics: '📊 Visitor Analytics',
    tabs: { prices: '💰 Prices', history: '📅 Historical Data', analysts: '👨‍💼 Analysts', followers: '👥 Followers', visitors: '🧑‍💻 Visitor Accounts' },

    editing: (symbol: string, name: string) => `Editing: ${symbol} - ${name}`,
    price: 'Price (EGP)',
    changePercent: 'Change %',
    changePercentPh: '3.70 or -1.50',
    volume: 'Trading Volume',
    save: 'Save',
    cancel: 'Cancel',
    searchPh: 'Search by name or symbol...',
    columns: { symbol: 'Symbol', name: 'Company', sector: 'Sector', price: 'Price', change: 'Change', updated: 'Last Updated' },
    actions: 'Actions',
    notSet: 'Not set',
    edit: 'Edit',
    delete: 'Delete',
    savedPrice: (symbol: string) => `✅ Saved data for ${symbol}`,
    confirmDeletePrice: (symbol: string) => `Are you sure you want to delete ${symbol}'s data?`,

    manualEntry: '📝 Manual Entry',
    symbolLabel: 'Stock Symbol',
    dateLabel: 'Date',
    openPrice: 'Open Price',
    highPrice: 'High Price',
    lowPrice: 'Low Price',
    closePrice: 'Close Price',
    errFillSymbolDate: '❌ Please enter the stock symbol and date',
    savedHistory: (symbol: string, date: string) => `✅ Saved data for ${symbol} on ${date}`,
    bulkImport: '📥 Bulk Import (CSV)',
    bulkFormat: 'Format: symbol, date, open, high, low, close, volume',
    import: 'Import',
    importResult: (success: number, errors: number) => `✅ Imported ${success} record(s)${errors > 0 ? ` • ❌ ${errors} error(s)` : ''}`,

    yahooSyncTitle: '🔄 Auto-Sync from Yahoo Finance',
    yahooSyncDesc: "Pulls a full year of real historical data and the current price for every stock from Yahoo Finance and updates the tables directly — an interim solution until an official EGX API is available.",
    yahooSyncStart: '▶️ Start Sync',
    yahooSyncRunning: (done: number, total: number) => `⏳ Syncing... (${done} of ${total})`,
    yahooSyncDone: (success: number, total: number) => `✅ Sync complete: ${success} of ${total} stocks updated successfully`,
    yahooSyncFailedList: 'Stocks that did not update (likely not listed on Yahoo):',

    pendingRequests: (n: number) => `⏳ Pending Registration Requests (${n})`,
    approve: '✅ Approve',
    reject: '❌ Reject',
    activeAnalysts: (n: number) => `👨‍💼 Active Analysts (${n})`,
    clickToManage: 'Click to manage recommendations',
    recsOf: (name: string, n: number) => `${name}'s Recommendations (${n})`,
    addRec: '+ Add Recommendation',
    chooseStock: 'Choose a Stock *',
    chooseStockPh: '-- Choose a Stock --',
    lastPrice: 'Last price:',
    recType: 'Recommendation Type',
    entryPrice: 'Entry Price *',
    targetPrice: 'Target Price',
    stopLoss: 'Stop-Loss',
    duration: 'Duration',
    durationOptions: { short: 'Short-term', medium: 'Medium-term', long: 'Long-term' },
    recDescription: 'Recommendation Description',
    saveRec: 'Save Recommendation',
    errChooseStockEntry: '❌ Please choose a stock and enter the entry price',
    recAdded: '✅ Recommendation added successfully',
    recStatusUpdated: '✅ Recommendation status updated',
    confirmDeleteRec: 'Are you sure you want to delete this recommendation?',
    promptClosePrice: 'Enter the closing price:',
    entryShort: 'Entry:',
    targetShort: 'Target:',
    stopShort: 'Stop:',
    analystApproved: '✅ Analyst approved',
    confirmRejectAnalyst: 'Are you sure you want to reject this analyst?',
    analystRejected: '✅ Analyst rejected',

    followerAnalyst: 'Analyst:',
    approveAndSendCode: '✅ Approve & Send Code',
    activeFollowers: (n: number) => `👥 Active Followers (${n})`,
    noActiveFollowers: 'No active followers yet',
    followerApproved: "✅ Follower approved and activation code emailed",
    confirmRejectFollower: 'Are you sure you want to reject this follower?',
    followerRejected: '✅ Follower rejected',
    planLabels: { premium: 'Premium', basic: 'Basic', free: 'Free' } as Record<string, string>,
    statusLabels: { open: 'Open', success: '✅ Successful', failed: '❌ Failed' } as Record<string, string>,

    pendingAccounts: (n: number) => `⏳ Accounts Awaiting Approval (${n})`,
    allAccounts: (n: number) => `🧑‍💻 All Accounts (${n})`,
    noAccountsYet: 'No activated or rejected accounts yet',
    accountApproved: '✅ Account approved and owner notified by email',
    confirmRejectAccount: 'Are you sure you want to reject this account?',
    accountRejected: '✅ Account rejected',
    confirmDeleteAccount: 'Are you sure you want to permanently delete this account?',
    activeStatus: 'Active',
    rejectedStatus: 'Rejected',

    accountApprovedEmail: (name: string) => ({
      subject: 'تم تفعيل حسابك في بورصة 2026',
      html: `
        <div dir="rtl" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
          <h2 style="color: #f97316;">مرحباً ${name}!</h2>
          <p>تمت الموافقة على حسابك في بورصة 2026. تقدر الآن تسجل الدخول بإيميلك وكلمة السر اللي اخترتها.</p>
          <a href="https://borsa2026cd.vercel.app/signin" style="background: #f97316; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 12px;">تسجيل الدخول</a>
        </div>
      `
    }),
    followerActivationEmail: (name: string, code: string) => ({
      subject: 'تفعيل حسابك في بورصة 2026',
      html: `
        <div dir="rtl" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
          <h2 style="color: #f97316;">مرحباً ${name}!</h2>
          <p>تم قبول طلب تسجيلك في بورصة 2026</p>
          <p>كود التفعيل الخاص بك:</p>
          <h1 style="color: #f97316; font-size: 36px; letter-spacing: 8px; text-align: center; padding: 20px; background: #1a1a1a; border-radius: 8px;">${code}</h1>
          <p style="color: #999;">هذا الكود للاستخدام مرة واحدة فقط</p>
          <a href="http://localhost:3000/verify" style="background: #f97316; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">تفعيل الحساب</a>
        </div>
      `
    }),
    dateLocale: 'en-US',
  },
};

export default function AdminPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [activeTab, setActiveTab] = useState<'prices' | 'history' | 'analysts' | 'followers' | 'visitors'>('prices');

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
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ done: 0, total: 0 });
  const [syncFailed, setSyncFailed] = useState<string[]>([]);
  const [syncSuccessCount, setSyncSuccessCount] = useState(0);

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

  // بيانات حسابات الزوار العامة
  const [activeSiteUsers, setActiveSiteUsers] = useState<any[]>([]);
  const [pendingSiteUsers, setPendingSiteUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchStocks();
    fetchPrices();
    fetchAnalysts();
    fetchFollowers();
    fetchSiteUsers();
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

  async function fetchSiteUsers() {
    const res = await fetch('/api/site-users');
    const data = await res.json();
    const all = Array.isArray(data) ? data : [];
    setActiveSiteUsers(all.filter((u: any) => u.status === 'active' || u.status === 'rejected'));
    // pending_email = لسا ما أكد إيميله، ما نعرضه للإدارة إلا بعد ما يوصل pending_admin
    setPendingSiteUsers(all.filter((u: any) => u.status === 'pending_admin'));
  }

  async function handleApproveSiteUser(id: number, email: string, name: string) {
    const res = await fetch('/api/site-users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'approve' })
    });
    const data = await res.json();
    if (data.success) {
      const mail = t.accountApprovedEmail(name);
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject: mail.subject, html: mail.html })
      });
      setMessage(t.accountApproved);
      fetchSiteUsers();
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleRejectSiteUser(id: number) {
    if (!confirm(t.confirmRejectAccount)) return;
    await fetch('/api/site-users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reject' })
    });
    setMessage(t.accountRejected);
    fetchSiteUsers();
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleDeleteSiteUser(id: number) {
    if (!confirm(t.confirmDeleteAccount)) return;
    await fetch(`/api/site-users?id=${id}`, { method: 'DELETE' });
    fetchSiteUsers();
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
      setMessage(t.savedPrice(editStock.symbol));
      setEditStock(null);
      fetchPrices();
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleDelete(symbol: string) {
    if (!confirm(t.confirmDeletePrice(symbol))) return;
    await fetch(`/api/stock-prices?symbol=${symbol}`, { method: 'DELETE' });
    fetchPrices();
  }

  async function handleSaveHistory() {
    if (!historySymbol || !historyDate) {
      setMessage(t.errFillSymbolDate);
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
      setMessage(t.savedHistory(historySymbol, historyDate));
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
    setMessage(t.importResult(success, errors));
    setBulkHistory('');
    setTimeout(() => setMessage(''), 5000);
  }

  async function handleYahooSync() {
    if (stocks.length === 0 || syncing) return;
    setSyncing(true);
    setSyncFailed([]);
    setSyncSuccessCount(0);
    setSyncProgress({ done: 0, total: stocks.length });

    const BATCH_SIZE = 5;
    let successCount = 0;
    const failed: string[] = [];

    for (let i = 0; i < stocks.length; i += BATCH_SIZE) {
      const batch = stocks.slice(i, i + BATCH_SIZE).map(s => s.symbol);
      try {
        const res = await fetch('/api/admin/sync-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: batch })
        });
        const data = await res.json();
        for (const r of data.results || []) {
          if (r.success) successCount++;
          else failed.push(r.symbol);
        }
      } catch (e) {
        failed.push(...batch);
      }
      setSyncProgress({ done: Math.min(i + BATCH_SIZE, stocks.length), total: stocks.length });
    }

    setSyncSuccessCount(successCount);
    setSyncFailed(failed);
    setSyncing(false);
    fetchPrices();
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
    setMessage(t.analystApproved);
    fetchAnalysts();
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleRejectAnalyst(id: number) {
    if (!confirm(t.confirmRejectAnalyst)) return;
    await fetch(`/api/analysts?id=${id}`, { method: 'DELETE' });
    setMessage(t.analystRejected);
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
      const mail = t.followerActivationEmail(name, data.code);
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject: mail.subject, html: mail.html })
      });
      setMessage(t.followerApproved);
      fetchFollowers();
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleRejectFollower(id: number) {
    if (!confirm(t.confirmRejectFollower)) return;
    await fetch(`/api/followers?id=${id}`, { method: 'DELETE' });
    setMessage(t.followerRejected);
    fetchFollowers();
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleAddRec() {
    if (!selectedAnalyst || !recForm.symbol || !recForm.entry_price) {
      setMessage(t.errChooseStockEntry);
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
      setMessage(t.recAdded);
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
    setMessage(t.recStatusUpdated);
    fetchRecommendations(selectedAnalyst.id);
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleDeleteRec(id: number) {
    if (!confirm(t.confirmDeleteRec)) return;
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
    { label: t.columns.symbol, key: 'symbol' },
    { label: t.columns.name, key: 'name' },
    { label: t.columns.sector, key: 'sector' },
    { label: t.columns.price, key: 'price' },
    { label: t.columns.change, key: 'change' },
    { label: t.columns.updated, key: 'updated' },
  ];
  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-orange-500 font-bold text-xl">{t.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs">{t.updatedCount(prices.length, stocks.length)}</span>
            <a
              href="https://vercel.com/galhasanen-jpgs-projects/borsa2026cd/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-700 hover:text-orange-500 transition"
            >
              {t.analytics}
            </a>
          </div>
        </div>

        {message && (
          <div className="bg-green-900 text-green-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        {/* التبويبات */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveTab('prices')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'prices' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{t.tabs.prices}</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'history' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{t.tabs.history}</button>
          <button onClick={() => setActiveTab('analysts')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'analysts' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t.tabs.analysts}
            {pendingAnalysts.length > 0 && <span className="mr-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingAnalysts.length}</span>}
          </button>
          <button onClick={() => setActiveTab('followers')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'followers' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t.tabs.followers}
            {pendingFollowers.length > 0 && <span className="mr-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingFollowers.length}</span>}
          </button>
          <button onClick={() => setActiveTab('visitors')} className={`px-4 py-2 text-sm rounded transition ${activeTab === 'visitors' ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t.tabs.visitors}
            {pendingSiteUsers.length > 0 && <span className="mr-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingSiteUsers.length}</span>}
          </button>
        </div>

        {/* تبويب الأسعار */}
        {activeTab === 'prices' && (
          <>
            {editStock && (
              <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 mb-6">
                <h2 className="text-orange-500 font-bold mb-4">{t.editing(editStock.symbol, editStock.name)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div><label className="text-gray-400 text-xs mb-1 block">{t.price}</label><input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="126.00" /></div>
                  <div><label className="text-gray-400 text-xs mb-1 block">{t.changePercent}</label><input value={formData.change_percent} onChange={e => setFormData({...formData, change_percent: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder={t.changePercentPh} /></div>
                  <div><label className="text-gray-400 text-xs mb-1 block">{t.volume}</label><input value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="1,234,567" /></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} className="bg-orange-500 text-black px-6 py-2 rounded font-bold text-sm hover:bg-orange-600">{t.save}</button>
                  <button onClick={() => setEditStock(null)} className="bg-gray-700 text-white px-6 py-2 rounded text-sm hover:bg-gray-600">{t.cancel}</button>
                </div>
              </div>
            )}
            <div className="mb-4"><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPh} className="bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 w-full md:w-96 text-sm" /></div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    {columns.map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)} className="px-4 py-3 text-right cursor-pointer hover:text-orange-500 transition select-none">
                        {col.label} {sortBy === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">{t.actions}</th>
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
                        <td className="px-4 py-3">{price ? <span className="text-white font-mono text-xs">{price.price} ج</span> : <span className="text-gray-600 text-xs">{t.notSet}</span>}</td>
                        <td className="px-4 py-3">{price ? <span className={`text-xs font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>{up ? '▲' : '▼'} {Math.abs(parseFloat(price.change_percent))}%</span> : <span className="text-gray-600 text-xs">-</span>}</td>
                        <td className="px-4 py-3">{price ? <span className="text-gray-500 text-xs">{new Date(price.updated_at).toLocaleString(t.dateLocale)}</span> : <span className="text-gray-600 text-xs">-</span>}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(stock)} className="bg-orange-500 text-black px-2 py-1 rounded text-xs hover:bg-orange-600">{t.edit}</button>
                            {price && <button onClick={() => handleDelete(stock.symbol)} className="bg-red-900 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-800">{t.delete}</button>}
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
            <div className="bg-gray-900 border border-orange-900 rounded-lg p-6">
              <h2 className="text-orange-500 font-bold mb-2">{t.yahooSyncTitle}</h2>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed">{t.yahooSyncDesc}</p>
              <button
                onClick={handleYahooSync}
                disabled={syncing || stocks.length === 0}
                className="bg-orange-500 text-black px-6 py-2 rounded font-bold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? t.yahooSyncRunning(syncProgress.done, syncProgress.total) : t.yahooSyncStart}
              </button>

              {syncing && (
                <div className="mt-4 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange-500 h-2 transition-all"
                    style={{ width: `${syncProgress.total > 0 ? (syncProgress.done / syncProgress.total) * 100 : 0}%` }}
                  />
                </div>
              )}

              {!syncing && syncProgress.total > 0 && (
                <div className="mt-4">
                  <p className="text-green-400 text-sm font-bold">{t.yahooSyncDone(syncSuccessCount, syncProgress.total)}</p>
                  {syncFailed.length > 0 && (
                    <p className="text-gray-500 text-xs mt-2">{t.yahooSyncFailedList} {syncFailed.join(', ')}</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-orange-500 font-bold mb-4">{t.manualEntry}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><label className="text-gray-400 text-xs mb-1 block">{t.symbolLabel}</label><input value={historySymbol} onChange={e => setHistorySymbol(e.target.value)} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="COMI" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">{t.dateLabel}</label><input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">{t.openPrice}</label><input value={historyForm.open} onChange={e => setHistoryForm({...historyForm, open: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="125.00" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">{t.highPrice}</label><input value={historyForm.high} onChange={e => setHistoryForm({...historyForm, high: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="128.00" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">{t.lowPrice}</label><input value={historyForm.low} onChange={e => setHistoryForm({...historyForm, low: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="123.00" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">{t.closePrice}</label><input value={historyForm.close} onChange={e => setHistoryForm({...historyForm, close: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="126.00" /></div>
                <div><label className="text-gray-400 text-xs mb-1 block">{t.volume}</label><input value={historyForm.volume} onChange={e => setHistoryForm({...historyForm, volume: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder="1234567" /></div>
              </div>
              <button onClick={handleSaveHistory} className="bg-orange-500 text-black px-6 py-2 rounded font-bold text-sm hover:bg-orange-600">{t.save}</button>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-orange-500 font-bold mb-2">{t.bulkImport}</h2>
              <p className="text-gray-500 text-xs mb-4">{t.bulkFormat}</p>
              <textarea value={bulkHistory} onChange={e => setBulkHistory(e.target.value)} rows={6} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm font-mono mb-4" placeholder="COMI, 2024-01-15, 120.00, 125.00, 119.00, 123.00, 1500000" />
              <button onClick={handleBulkImport} className="bg-orange-500 text-black px-6 py-2 rounded font-bold text-sm hover:bg-orange-600">{t.import}</button>
            </div>
          </div>
        )}
        {/* تبويب المحللين */}
        {activeTab === 'analysts' && (
          <div className="space-y-6">
            {pendingAnalysts.length > 0 && (
              <div className="bg-gray-900 border border-red-800 rounded-lg p-4">
                <h2 className="text-red-400 font-bold mb-4">{t.pendingRequests(pendingAnalysts.length)}</h2>
                <div className="space-y-3">
                  {pendingAnalysts.map((analyst, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold text-sm">{analyst.name}</p>
                        <p className="text-orange-500 text-xs">{analyst.specialization}</p>
                        <p className="text-gray-400 text-xs mt-1">{analyst.bio}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveAnalyst(analyst.id)} className="bg-green-900 text-green-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-800">{t.approve}</button>
                        <button onClick={() => handleRejectAnalyst(analyst.id)} className="bg-red-900 text-red-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-800">{t.reject}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-orange-500 font-bold mb-4">{t.activeAnalysts(analysts.length)}</h2>
              <div className="space-y-3">
                {analysts.map((analyst, i) => (
                  <div key={i} className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition ${selectedAnalyst?.id === analyst.id ? 'border border-orange-500' : ''}`}
                    onClick={() => { setSelectedAnalyst(analyst); fetchRecommendations(analyst.id); setShowAddRec(false); }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{analyst.name}</p>
                        <p className="text-orange-500 text-xs">{analyst.specialization}</p>
                      </div>
                      <span className="text-gray-500 text-xs">{t.clickToManage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedAnalyst && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-orange-500 font-bold">{t.recsOf(selectedAnalyst.name, recommendations.length)}</h2>
                  <button onClick={() => setShowAddRec(!showAddRec)} className="bg-orange-500 text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600">
                    {showAddRec ? t.cancel : t.addRec}
                  </button>
                </div>

                {showAddRec && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div className="md:col-span-3">
                        <label className="text-gray-400 text-xs mb-1 block">{t.chooseStock}</label>
                        <select value={recForm.symbol} onChange={e => { const s = stocks.find(s => s.symbol === e.target.value); setRecForm({...recForm, symbol: e.target.value, stock_name: s?.name || ''}); }} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs">
                          <option value="">{t.chooseStockPh}</option>
                          {stocks.map((stock, i) => { const price = getPrice(stock.symbol); return <option key={i} value={stock.symbol}>{stock.symbol} - {stock.name} {price ? `| ${price.price} ج` : ''}</option>; })}
                        </select>
                        {recForm.symbol && (
                          <div className="mt-1 flex items-center gap-3 bg-gray-900 rounded p-2">
                            <span className="text-orange-400 font-bold text-xs">{recForm.symbol}</span>
                            <span className="text-white text-xs">{recForm.stock_name}</span>
                            {getPrice(recForm.symbol) && <><span className="text-gray-500 text-xs">|</span><span className="text-gray-400 text-xs">{t.lastPrice}</span><span className="text-orange-500 font-bold text-xs">{getPrice(recForm.symbol)?.price} ج</span></>}
                          </div>
                        )}
                      </div>
                      <div><label className="text-gray-400 text-xs mb-1 block">{t.recType}</label><select value={recForm.type} onChange={e => setRecForm({...recForm, type: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"><option value="شراء">شراء</option><option value="بيع">بيع</option><option value="احتفاظ">احتفاظ</option></select></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">{t.entryPrice}</label><input value={recForm.entry_price} onChange={e => setRecForm({...recForm, entry_price: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs" placeholder="120.00" /></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">{t.targetPrice}</label><input value={recForm.target_price} onChange={e => setRecForm({...recForm, target_price: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs" placeholder="145.00" /></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">{t.stopLoss}</label><input value={recForm.stop_loss} onChange={e => setRecForm({...recForm, stop_loss: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs" placeholder="110.00" /></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">{t.duration}</label><select value={recForm.duration} onChange={e => setRecForm({...recForm, duration: e.target.value})} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs"><option value="short">{t.durationOptions.short}</option><option value="medium">{t.durationOptions.medium}</option><option value="long">{t.durationOptions.long}</option></select></div>
                    </div>
                    <div className="mb-3"><label className="text-gray-400 text-xs mb-1 block">{t.recDescription}</label><textarea value={recForm.description} onChange={e => setRecForm({...recForm, description: e.target.value})} rows={2} className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full text-xs" /></div>
                    <button onClick={handleAddRec} className="bg-orange-500 text-black px-4 py-2 rounded text-xs font-bold hover:bg-orange-600">{t.saveRec}</button>
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
                              {t.statusLabels[rec.status] || rec.status}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs">{t.entryShort} {rec.entry_price} ج{rec.target_price && ` • ${t.targetShort} ${rec.target_price} ج`}{rec.stop_loss && ` • ${t.stopShort} ${rec.stop_loss} ج`}</p>
                        </div>
                        <div className="flex gap-1">
                          {rec.status === 'open' && (
                            <>
                              <button onClick={() => { const p = prompt(t.promptClosePrice); if (p) handleUpdateRecStatus(rec.id, 'success', p); }} className="bg-green-900 text-green-400 px-2 py-1 rounded text-xs hover:bg-green-800">✅</button>
                              <button onClick={() => { const p = prompt(t.promptClosePrice); if (p) handleUpdateRecStatus(rec.id, 'failed', p); }} className="bg-red-900 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-800">❌</button>
                            </>
                          )}
                          <button onClick={() => handleDeleteRec(rec.id)} className="bg-gray-700 text-gray-400 px-2 py-1 rounded text-xs hover:bg-gray-600">{t.delete}</button>
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
                <h2 className="text-red-400 font-bold mb-4">{t.pendingRequests(pendingFollowers.length)}</h2>
                <div className="space-y-3">
                  {pendingFollowers.map((follower, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-bold text-sm">{follower.name}</p>
                          <p className="text-gray-400 text-xs mt-1">📧 {follower.email}</p>
                          <p className="text-gray-400 text-xs">📱 {follower.whatsapp}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-orange-500 text-xs">{t.followerAnalyst} {follower.analyst_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${follower.plan === 'premium' ? 'bg-orange-900 text-orange-400' : follower.plan === 'basic' ? 'bg-blue-900 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                              {t.planLabels[follower.plan] || follower.plan}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleAdminApprove(follower.id, follower.email, follower.name)}
                            className="bg-green-900 text-green-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-800"
                          >
                            {t.approveAndSendCode}
                          </button>
                          <button
                            onClick={() => handleRejectFollower(follower.id)}
                            className="bg-red-900 text-red-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-800"
                          >
                            {t.reject}
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
              <h2 className="text-orange-500 font-bold mb-4">{t.activeFollowers(followers.length)}</h2>
              {followers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">{t.noActiveFollowers}</p>
              ) : (
                <div className="space-y-2">
                  {followers.map((follower, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{follower.name}</p>
                        <p className="text-gray-400 text-xs">📧 {follower.email} • 📱 {follower.whatsapp}</p>
                        <p className="text-orange-500 text-xs">{t.followerAnalyst} {follower.analyst_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${follower.plan === 'premium' ? 'bg-orange-900 text-orange-400' : follower.plan === 'basic' ? 'bg-blue-900 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                          {t.planLabels[follower.plan] || follower.plan}
                        </span>
                        <button onClick={() => handleRejectFollower(follower.id)} className="bg-red-900 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-800">{t.delete}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* تبويب حسابات الزوار */}
        {activeTab === 'visitors' && (
          <div className="space-y-6">

            {/* طلبات معلقة (أكدوا إيميلهم وينتظرون الموافقة) */}
            {pendingSiteUsers.length > 0 && (
              <div className="bg-gray-900 border border-red-800 rounded-lg p-4">
                <h2 className="text-red-400 font-bold mb-4">{t.pendingAccounts(pendingSiteUsers.length)}</h2>
                <div className="space-y-3">
                  {pendingSiteUsers.map((user, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-bold text-sm">{user.name}</p>
                          <p className="text-gray-400 text-xs mt-1">📧 {user.email}</p>
                          <p className="text-gray-500 text-xs mt-1">{new Date(user.created_at).toLocaleString(t.dateLocale)}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApproveSiteUser(user.id, user.email, user.name)}
                            className="bg-green-900 text-green-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-800"
                          >
                            {t.approve}
                          </button>
                          <button
                            onClick={() => handleRejectSiteUser(user.id)}
                            className="bg-red-900 text-red-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-800"
                          >
                            {t.reject}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الحسابات المفعّلة أو المرفوضة */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="text-orange-500 font-bold mb-4">{t.allAccounts(activeSiteUsers.length)}</h2>
              {activeSiteUsers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">{t.noAccountsYet}</p>
              ) : (
                <div className="space-y-2">
                  {activeSiteUsers.map((user, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{user.name}</p>
                        <p className="text-gray-400 text-xs">📧 {user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${user.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                          {user.status === 'active' ? t.activeStatus : t.rejectedStatus}
                        </span>
                        <button onClick={() => handleDeleteSiteUser(user.id)} className="bg-red-900 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-800">{t.delete}</button>
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
