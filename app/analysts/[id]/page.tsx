'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../components/LanguageProvider';

const L = {
  ar: {
    loading: 'جاري التحميل...',
    notFound: 'المحلل غير موجود',
    back: '← العودة للمحللين',
    whatsapp: '💬 واتساب',
    telegram: '✈️ تيليجرام',
    totalRecs: 'إجمالي التوصيات',
    successfulRecs: 'توصيات ناجحة',
    openRecs: 'توصيات مفتوحة',
    successRate: 'نسبة النجاح',
    tabRecs: '📊 التوصيات',
    tabComments: '💬 ملاحظات الأعضاء',
    tabPending: '⏳ طلبات المتابعة',
    filters: { all: 'الكل', open: 'مفتوحة', success: 'ناجحة', failed: 'خاسرة' },
    noRecs: 'لا توجد توصيات حتى الآن',
    entryPrice: 'سعر الدخول',
    target: 'الهدف',
    stopLoss: 'وقف الخسارة',
    reachedTarget: 'تم الوصول للهدف عند',
    returnLabel: 'العائد',
    addComment: '💬 أضف ملاحظتك',
    yourName: 'اسمك *',
    yourNamePh: 'اسمك',
    subscriptionType: 'نوع الاشتراك',
    basicOption: 'أساسي - ملاحظة خاصة للمحلل فقط',
    premiumOption: 'متميز - ملاحظة عامة للأعضاء',
    commentLabel: 'الملاحظة *',
    commentPh: 'اكتب ملاحظتك هنا...',
    sendComment: 'إرسال الملاحظة',
    noComments: 'لا توجد ملاحظات عامة حتى الآن',
    premiumBadge: 'متميز',
    analystLabel: '👨‍💼 المحلل',
    replyNamePh: 'اسمك',
    replyPh: 'اكتب رداً...',
    reply: 'رد',
    noPending: 'لا توجد طلبات متابعة معلقة',
    approve: '✅ قبول',
    reject: '❌ رفض',
    confirmReject: 'هل أنت متأكد من رفض هذا الطلب؟',
    errFillComment: '❌ يرجى إدخال الاسم والملاحظة',
    approveSuccess: '✅ تم قبول الطلب وإرساله للإدارة',
    commentSuccess: '✅ تم إرسال ملاحظتك بنجاح',
    statusLabels: { open: 'مفتوحة', success: '✅ ناجحة', failed: '❌ خاسرة', cancelled: 'ملغاة' } as Record<string, string>,
    typeLabels: { 'شراء': 'شراء', 'بيع': 'بيع', 'احتفاظ': 'احتفاظ' } as Record<string, string>,
    planLabels: { premium: 'متميز', basic: 'أساسي', free: 'مجاني' } as Record<string, string>,
    dateLocale: 'ar-EG',
    currency: 'ج',
  },
  en: {
    loading: 'Loading...',
    notFound: 'Analyst not found',
    back: '← Back to Analysts',
    whatsapp: '💬 WhatsApp',
    telegram: '✈️ Telegram',
    totalRecs: 'Total Recommendations',
    successfulRecs: 'Successful',
    openRecs: 'Open',
    successRate: 'Success Rate',
    tabRecs: '📊 Recommendations',
    tabComments: '💬 Member Comments',
    tabPending: '⏳ Follower Requests',
    filters: { all: 'All', open: 'Open', success: 'Successful', failed: 'Failed' },
    noRecs: 'No recommendations yet',
    entryPrice: 'Entry Price',
    target: 'Target',
    stopLoss: 'Stop-Loss',
    reachedTarget: 'Target reached at',
    returnLabel: 'Return',
    addComment: '💬 Add Your Comment',
    yourName: 'Your Name *',
    yourNamePh: 'Your name',
    subscriptionType: 'Subscription Type',
    basicOption: 'Basic - private note to the analyst only',
    premiumOption: 'Premium - public comment for all members',
    commentLabel: 'Comment *',
    commentPh: 'Write your comment here...',
    sendComment: 'Send Comment',
    noComments: 'No public comments yet',
    premiumBadge: 'Premium',
    analystLabel: '👨‍💼 Analyst',
    replyNamePh: 'Your name',
    replyPh: 'Write a reply...',
    reply: 'Reply',
    noPending: 'No pending follower requests',
    approve: '✅ Approve',
    reject: '❌ Reject',
    confirmReject: 'Are you sure you want to reject this request?',
    errFillComment: '❌ Please enter your name and comment',
    approveSuccess: '✅ Request approved and sent to admin',
    commentSuccess: '✅ Your comment has been sent successfully',
    statusLabels: { open: 'Open', success: '✅ Successful', failed: '❌ Failed', cancelled: 'Cancelled' } as Record<string, string>,
    typeLabels: { 'شراء': 'Buy', 'بيع': 'Sell', 'احتفاظ': 'Hold' } as Record<string, string>,
    planLabels: { premium: 'Premium', basic: 'Basic', free: 'Free' } as Record<string, string>,
    dateLocale: 'en-US',
    currency: 'EGP',
  },
};

export default function AnalystPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const params = useParams();
  const id = params.id;

  const [analyst, setAnalyst] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recs' | 'comments' | 'pending'>('recs');
  const [commentForm, setCommentForm] = useState({ user_name: '', content: '', plan: 'basic' });
  const [replyForm, setReplyForm] = useState<any>({});
  const [message, setMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pendingFollowers, setPendingFollowers] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyst();
    fetchRecommendations();
    fetchComments();
    fetchPendingFollowers();
  }, [id]);

  async function fetchAnalyst() {
    try {
      const res = await fetch(`/api/analysts?id=${id}`);
      const data = await res.json();
      setAnalyst(data);
    } catch (e) {}
    setLoading(false);
  }

  async function fetchRecommendations() {
    try {
      const res = await fetch(`/api/recommendations?analyst_id=${id}&approved=true`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (e) {}
  }

  async function fetchComments() {
    try {
      const res = await fetch(`/api/group-comments?analyst_id=${id}&is_public=true`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {}
  }

  async function fetchPendingFollowers() {
    try {
      const res = await fetch(`/api/followers?analyst_id=${id}&status=pending`);
      const data = await res.json();
      setPendingFollowers(Array.isArray(data) ? data : []);
    } catch (e) {}
  }

  async function handleAnalystApprove(followerId: number) {
    const res = await fetch('/api/followers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: followerId, action: 'analyst_approve' })
    });
    const data = await res.json();
    if (data.success) {
      setMessage(t.approveSuccess);
      fetchPendingFollowers();
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleAddComment() {
    if (!commentForm.user_name || !commentForm.content) {
      setMessage(t.errFillComment);
      return;
    }
    const res = await fetch('/api/group-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analyst_id: id,
        user_name: commentForm.user_name,
        content: commentForm.content,
        plan: commentForm.plan,
        is_public: commentForm.plan === 'premium'
      })
    });
    const data = await res.json();
    if (data.success) {
      setMessage(t.commentSuccess);
      setCommentForm({ user_name: '', content: '', plan: 'basic' });
      fetchComments();
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleAddReply(commentId: number) {
    const reply = replyForm[commentId];
    if (!reply?.user_name || !reply?.content) return;
    const res = await fetch('/api/comment-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment_id: commentId,
        user_name: reply.user_name,
        content: reply.content,
        is_analyst: false
      })
    });
    const data = await res.json();
    if (data.success) {
      setReplyForm((prev: any) => ({ ...prev, [commentId]: { user_name: '', content: '' } }));
      fetchComments();
    }
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case 'open': return 'bg-blue-900 text-blue-400';
      case 'success': return 'bg-green-900 text-green-400';
      case 'failed': return 'bg-red-900 text-red-400';
      case 'cancelled': return 'bg-gray-700 text-gray-400';
      default: return 'bg-gray-700 text-gray-400';
    }
  }

  function getStatusLabel(status: string) {
    return t.statusLabels[status] || status;
  }

  function getTypeStyle(type: string) {
    switch (type) {
      case 'شراء': return 'bg-green-900 text-green-400';
      case 'بيع': return 'bg-red-900 text-red-400';
      case 'احتفاظ': return 'bg-yellow-900 text-yellow-400';
      default: return 'bg-gray-700 text-gray-400';
    }
  }

  function getTypeLabel(type: string) {
    return t.typeLabels[type] || type;
  }

  function getPlanLabel(plan: string) {
    return t.planLabels[plan] || plan;
  }

  function getSuccessRate() {
    const total = recommendations.filter(r => r.status !== 'open' && r.status !== 'cancelled').length;
    const successful = recommendations.filter(r => r.status === 'success').length;
    if (total === 0) return 0;
    return Math.round((successful / total) * 100);
  }

  const filteredRecs = filterStatus === 'all'
    ? recommendations
    : recommendations.filter(r => r.status === filterStatus);
    if (loading) return (
    <main className="min-h-screen bg-gray-950 p-4 flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">{t.loading}</p>
    </main>
  );

  if (!analyst) return (
    <main className="min-h-screen bg-gray-950 p-4 flex items-center justify-center">
      <p className="text-gray-500">{t.notFound}</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-5xl mx-auto">

        <a href="/analysts" className="text-gray-500 text-sm hover:text-orange-500 transition mb-4 block">
          {t.back}
        </a>

        {/* بيانات المحلل */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-white font-bold text-2xl mb-1">{lang === 'ar' ? analyst.name : (analyst.name_en || analyst.name)}</h1>
              <p className="text-orange-500 text-sm mb-2">{analyst.specialization}</p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xl">{lang === 'ar' ? analyst.bio : (analyst.bio_en || analyst.bio)}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {analyst.whatsapp_link && (
                <a href={analyst.whatsapp_link} target="_blank" className="bg-green-900 text-green-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-800 transition">
                  {t.whatsapp}
                </a>
              )}
              {analyst.telegram_link && (
                <a href={analyst.telegram_link} target="_blank" className="bg-blue-900 text-blue-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition">
                  {t.telegram}
                </a>
              )}
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-white font-bold text-xl">{recommendations.length}</p>
              <p className="text-gray-500 text-xs">{t.totalRecs}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-green-400 font-bold text-xl">{recommendations.filter(r => r.status === 'success').length}</p>
              <p className="text-gray-500 text-xs">{t.successfulRecs}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-blue-400 font-bold text-xl">{recommendations.filter(r => r.status === 'open').length}</p>
              <p className="text-gray-500 text-xs">{t.openRecs}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-orange-500 font-bold text-xl">{getSuccessRate()}%</p>
              <p className="text-gray-500 text-xs">{t.successRate}</p>
            </div>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('recs')}
            className={`px-4 py-2 text-sm transition ${activeTab === 'recs' ? 'text-orange-500 border-b-2 border-orange-500 font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            {t.tabRecs} ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 text-sm transition ${activeTab === 'comments' ? 'text-orange-500 border-b-2 border-orange-500 font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            {t.tabComments} ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm transition ${activeTab === 'pending' ? 'text-orange-500 border-b-2 border-orange-500 font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            {t.tabPending}
            {pendingFollowers.length > 0 && (
              <span className="mr-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingFollowers.length}</span>
            )}
          </button>
        </div>

        {message && (
          <div className="bg-green-900 text-green-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}
        {/* التوصيات */}
        {activeTab === 'recs' && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'open', 'success', 'failed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 text-xs rounded transition ${filterStatus === s ? 'bg-orange-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                  {t.filters[s]}
                  {' '}({s === 'all' ? recommendations.length : recommendations.filter(r => r.status === s).length})
                </button>
              ))}
            </div>

            {filteredRecs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">📊</p>
                <p>{t.noRecs}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecs.map((rec, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-orange-400 font-bold text-lg">{rec.symbol}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${getTypeStyle(rec.type)}`}>{getTypeLabel(rec.type)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(rec.status)}`}>{getStatusLabel(rec.status)}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{rec.stock_name}</p>
                      </div>
                      <span className="text-gray-500 text-xs">{new Date(rec.created_at).toLocaleDateString(t.dateLocale)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-800 rounded p-2 text-center">
                        <p className="text-gray-500 text-xs mb-1">{t.entryPrice}</p>
                        <p className="text-white font-bold text-sm">{rec.entry_price} {t.currency}</p>
                      </div>
                      <div className="bg-gray-800 rounded p-2 text-center">
                        <p className="text-gray-500 text-xs mb-1">{t.target}</p>
                        <p className="text-green-400 font-bold text-sm">{rec.target_price ? `${rec.target_price} ${t.currency}` : '-'}</p>
                      </div>
                      <div className="bg-gray-800 rounded p-2 text-center">
                        <p className="text-gray-500 text-xs mb-1">{t.stopLoss}</p>
                        <p className="text-red-400 font-bold text-sm">{rec.stop_loss ? `${rec.stop_loss} ${t.currency}` : '-'}</p>
                      </div>
                    </div>
                    {rec.description && (
                      <p className="text-gray-400 text-xs leading-relaxed border-t border-gray-800 pt-3">{rec.description}</p>
                    )}
                    {rec.status === 'success' && rec.result_price && (
                      <div className="mt-3 bg-green-900 bg-opacity-30 rounded p-2 text-center">
                        <p className="text-green-400 text-xs">
                          ✅ {t.reachedTarget} {rec.result_price} {t.currency}
                          {' • '}
                          {t.returnLabel}: {((rec.result_price - rec.entry_price) / rec.entry_price * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* الملاحظات */}
        {activeTab === 'comments' && (
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <h3 className="text-white font-bold text-sm mb-3">{t.addComment}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">{t.yourName}</label>
                  <input value={commentForm.user_name} onChange={e => setCommentForm({...commentForm, user_name: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder={t.yourNamePh} />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">{t.subscriptionType}</label>
                  <select value={commentForm.plan} onChange={e => setCommentForm({...commentForm, plan: e.target.value})} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm">
                    <option value="basic">{t.basicOption}</option>
                    <option value="premium">{t.premiumOption}</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-gray-400 text-xs mb-1 block">{t.commentLabel}</label>
                <textarea value={commentForm.content} onChange={e => setCommentForm({...commentForm, content: e.target.value})} rows={3} className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm" placeholder={t.commentPh} />
              </div>
              <button onClick={handleAddComment} className="bg-orange-500 text-black px-4 py-2 rounded text-sm font-bold hover:bg-orange-600 transition">{t.sendComment}</button>
            </div>

            {comments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">💬</p>
                <p>{t.noComments}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-sm">{comment.user_name[0]}</div>
                        <div>
                          <p className="text-white text-sm font-bold">{comment.user_name}</p>
                          <p className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString(t.dateLocale)}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-900 text-blue-400 px-2 py-0.5 rounded">{t.premiumBadge}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{comment.content}</p>
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="border-t border-gray-800 pt-3 space-y-2">
                        {comment.replies.map((reply: any, j: number) => (
                          <div key={j} className={`p-2 rounded text-xs ${reply.is_analyst ? 'bg-orange-900 bg-opacity-30 border border-orange-800' : 'bg-gray-800'}`}>
                            <div className="flex justify-between mb-1">
                              <span className={`font-bold ${reply.is_analyst ? 'text-orange-400' : 'text-gray-300'}`}>{reply.is_analyst ? t.analystLabel : reply.user_name}</span>
                              <span className="text-gray-500">{new Date(reply.created_at).toLocaleDateString(t.dateLocale)}</span>
                            </div>
                            <p className="text-gray-300">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-gray-800 pt-3 mt-3">
                      <div className="flex gap-2">
                        <input value={replyForm[comment.id]?.user_name || ''} onChange={e => setReplyForm((prev: any) => ({...prev, [comment.id]: {...prev[comment.id], user_name: e.target.value}}))} className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-xs w-24 flex-shrink-0" placeholder={t.replyNamePh} />
                        <input value={replyForm[comment.id]?.content || ''} onChange={e => setReplyForm((prev: any) => ({...prev, [comment.id]: {...prev[comment.id], content: e.target.value}}))} className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-xs flex-1" placeholder={t.replyPh} />
                        <button onClick={() => handleAddReply(comment.id)} className="bg-orange-500 text-black px-3 py-1 rounded text-xs font-bold hover:bg-orange-600 transition flex-shrink-0">{t.reply}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* طلبات المتابعة */}
        {activeTab === 'pending' && (
          <div>
            {pendingFollowers.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">👥</p>
                <p>{t.noPending}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFollowers.map((follower, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold text-sm">{follower.name}</p>
                        <p className="text-gray-400 text-xs mt-1">📧 {follower.email}</p>
                        <p className="text-gray-400 text-xs">📱 {follower.whatsapp}</p>
                        <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                          follower.plan === 'premium' ? 'bg-orange-900 text-orange-400' :
                          follower.plan === 'basic' ? 'bg-blue-900 text-blue-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {getPlanLabel(follower.plan)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAnalystApprove(follower.id)} className="bg-green-900 text-green-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-green-800">{t.approve}</button>
                        <button
                          onClick={async () => {
                            if (!confirm(t.confirmReject)) return;
                            await fetch(`/api/followers?id=${follower.id}`, { method: 'DELETE' });
                            fetchPendingFollowers();
                          }}
                          className="bg-red-900 text-red-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-800"
                        >
                          {t.reject}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
