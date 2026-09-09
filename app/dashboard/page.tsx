'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';

const L = {
  ar: {
    loading: 'جاري التحميل...',
    title: '👤 لوحة تحكم المتابع',
    welcome: 'أهلاً',
    logout: 'تسجيل الخروج',
    followedAnalyst: 'المحلل المتابَع',
    viewPage: 'عرض الصفحة ←',
    tabRecs: '📊 التوصيات',
    tabComments: '💬 الملاحظات',
    tabPlan: '💎 خطتي',
    filters: { all: 'الكل', open: 'مفتوحة', success: 'ناجحة', failed: 'خاسرة' } as Record<string, string>,
    noRecs: 'لا توجد توصيات حتى الآن',
    entryPrice: 'سعر الدخول',
    target: 'الهدف',
    stopLoss: 'وقف الخسارة',
    reachedTarget: 'تم الوصول للهدف عند',
    returnLabel: 'العائد',
    addPublicComment: '💬 أضف ملاحظة عامة',
    sendToAnalyst: '💬 أرسل ملاحظة للمحلل',
    needsUpgrade: 'يتطلب الخطة الأساسية أو المتميزة',
    upgradePlan: 'ترقية الخطة',
    commentPh: 'اكتب ملاحظتك هنا...',
    send: 'إرسال',
    premiumOnly: 'ملاحظات الأعضاء متاحة للخطة المتميزة فقط',
    upgradePremium: 'ترقية للمتميز',
    noComments: 'لا توجد ملاحظات حتى الآن',
    currentPlan: 'خطتك الحالية',
    currentPlanBadge: 'خطتك الحالية',
    defaultPlan: 'الخطة الافتراضية',
    upgradeToThis: 'ترقية لهذه الخطة',
    errNoComment: '❌ يرجى كتابة ملاحظتك',
    commentSent: '✅ تم إرسال ملاحظتك',
    upgradeSuccess: '✅ تم ترقية خطتك بنجاح',
    confirmUpgrade: (planLabel: string) => `هل تريد الترقية إلى الخطة ${planLabel}؟`,
    statusLabels: { open: 'مفتوحة', success: '✅ ناجحة', failed: '❌ خاسرة' } as Record<string, string>,
    planLabels: { free: 'مجاني', basic: 'أساسي', premium: 'متميز' } as Record<string, string>,
    dateLocale: 'ar-EG',
    currency: 'ج',
    plans: [
      { value: 'free', label: 'مجاني', description: 'عرض التوصيات فقط', features: ['عرض التوصيات', 'بدون تفاعل'], color: 'gray' },
      { value: 'basic', label: 'أساسي', description: 'للمتابعين الجادين', features: ['عرض التوصيات', 'ملاحظات للمحلل', 'الانضمام للجروب'], color: 'blue' },
      { value: 'premium', label: 'متميز', description: 'للمستثمرين المحترفين', features: ['كل مميزات الأساسي', 'ملاحظات عامة للأعضاء', 'تنبيهات فورية', 'تفاعل مع الأعضاء'], color: 'orange' },
    ],
  },
  en: {
    loading: 'Loading...',
    title: '👤 Follower Dashboard',
    welcome: 'Hi',
    logout: 'Log Out',
    followedAnalyst: 'Followed Analyst',
    viewPage: 'View Page →',
    tabRecs: '📊 Recommendations',
    tabComments: '💬 Comments',
    tabPlan: '💎 My Plan',
    filters: { all: 'All', open: 'Open', success: 'Successful', failed: 'Failed' } as Record<string, string>,
    noRecs: 'No recommendations yet',
    entryPrice: 'Entry Price',
    target: 'Target',
    stopLoss: 'Stop-Loss',
    reachedTarget: 'Target reached at',
    returnLabel: 'Return',
    addPublicComment: '💬 Add a Public Comment',
    sendToAnalyst: '💬 Send a Note to the Analyst',
    needsUpgrade: 'Requires the Basic or Premium plan',
    upgradePlan: 'Upgrade Plan',
    commentPh: 'Write your comment here...',
    send: 'Send',
    premiumOnly: 'Member comments are available on the Premium plan only',
    upgradePremium: 'Upgrade to Premium',
    noComments: 'No comments yet',
    currentPlan: 'Your Current Plan',
    currentPlanBadge: 'Current Plan',
    defaultPlan: 'Default Plan',
    upgradeToThis: 'Upgrade to This Plan',
    errNoComment: '❌ Please write your comment',
    commentSent: '✅ Your comment has been sent',
    upgradeSuccess: '✅ Your plan has been upgraded successfully',
    confirmUpgrade: (planLabel: string) => `Do you want to upgrade to the ${planLabel} plan?`,
    statusLabels: { open: 'Open', success: '✅ Successful', failed: '❌ Failed' } as Record<string, string>,
    planLabels: { free: 'Free', basic: 'Basic', premium: 'Premium' } as Record<string, string>,
    dateLocale: 'en-US',
    currency: 'EGP',
    plans: [
      { value: 'free', label: 'Free', description: 'Recommendations only', features: ['View recommendations', 'No interaction'], color: 'gray' },
      { value: 'basic', label: 'Basic', description: 'For serious followers', features: ['View recommendations', 'Notes to the analyst', 'Join the group'], color: 'blue' },
      { value: 'premium', label: 'Premium', description: 'For professional investors', features: ['Everything in Basic', 'Public comments for members', 'Instant alerts', 'Interact with members'], color: 'orange' },
    ],
  },
};

export default function DashboardPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [user, setUser] = useState<any>(null);
  const [analyst, setAnalyst] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recs' | 'comments' | 'plan'>('recs');
  const [commentForm, setCommentForm] = useState({ content: '' });
  const [message, setMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem('follower');
    if (!stored) {
      window.location.href = '/login';
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);
    fetchAnalyst(userData.analyst_id);
    fetchRecommendations(userData.analyst_id);
    fetchComments(userData.analyst_id, userData.plan);
    setLoading(false);
  }, []);

  async function fetchAnalyst(analystId: number) {
    try {
      const res = await fetch(`/api/analysts?id=${analystId}`);
      const data = await res.json();
      setAnalyst(data);
    } catch (e) {}
  }

  async function fetchRecommendations(analystId: number) {
    try {
      const res = await fetch(`/api/recommendations?analyst_id=${analystId}&approved=true`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (e) {}
  }

  async function fetchComments(analystId: number, plan: string) {
    try {
      const url = plan === 'premium'
        ? `/api/group-comments?analyst_id=${analystId}&is_public=true`
        : `/api/group-comments?analyst_id=${analystId}&is_public=false`;
      const res = await fetch(url);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {}
  }

  async function handleAddComment() {
    if (!commentForm.content) {
      setMessage(t.errNoComment);
      return;
    }
    const res = await fetch('/api/group-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analyst_id: user.analyst_id,
        user_name: user.name,
        content: commentForm.content,
        plan: user.plan,
        is_public: user.plan === 'premium'
      })
    });
    const data = await res.json();
    if (data.success) {
      setMessage(t.commentSent);
      setCommentForm({ content: '' });
      fetchComments(user.analyst_id, user.plan);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleUpgradePlan(newPlan: string) {
    if (!confirm(t.confirmUpgrade(getPlanLabel(newPlan)))) return;
    const res = await fetch('/api/followers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        action: 'upgrade_plan',
        plan: newPlan
      })
    });
    const data = await res.json();
    if (data.success) {
      const updatedUser = { ...user, plan: newPlan };
      setUser(updatedUser);
      localStorage.setItem('follower', JSON.stringify(updatedUser));
      setMessage(t.upgradeSuccess);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  function handleLogout() {
    localStorage.removeItem('follower');
    window.location.href = '/login';
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case 'open': return 'bg-blue-900 text-blue-400';
      case 'success': return 'bg-green-900 text-green-400';
      case 'failed': return 'bg-red-900 text-red-400';
      default: return 'bg-gray-700 text-gray-400';
    }
  }

  function getStatusLabel(status: string) {
    return t.statusLabels[status] || status;
  }

  function getPlanLabel(plan: string) {
    return t.planLabels[plan] || plan;
  }

  function getPlanStyle(plan: string) {
    switch (plan) {
      case 'free': return 'bg-gray-700 text-gray-400';
      case 'basic': return 'bg-blue-900 text-blue-400';
      case 'premium': return 'bg-orange-900 text-orange-400';
      default: return 'bg-gray-700 text-gray-400';
    }
  }

  const filteredRecs = filterStatus === 'all'
    ? recommendations
    : recommendations.filter(r => r.status === filterStatus);

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">{t.loading}</p>
    </main>
  );
  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-5xl mx-auto">

        {/* العنوان */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-orange-500 font-bold text-xl">{t.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{t.welcome} {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-800 text-gray-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-700 hover:text-white transition"
          >
            {t.logout}
          </button>
        </div>

        {message && (
          <div className="bg-green-900 text-green-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        {/* بطاقة المحلل */}
        {analyst && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-xs mb-1">{t.followedAnalyst}</p>
              <p className="text-white font-bold text-lg">{lang === 'ar' ? analyst.name : (analyst.name_en || analyst.name)}</p>
              <p className="text-orange-500 text-xs">{analyst.specialization}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getPlanStyle(user?.plan)}`}>
                {getPlanLabel(user?.plan)}
              </span>
              <a
                href={`/analysts/${user?.analyst_id}`}
                className="text-orange-500 text-xs hover:text-orange-400 transition"
              >
                {t.viewPage}
              </a>
            </div>
          </div>
        )}

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
            {t.tabComments}
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 text-sm transition ${activeTab === 'plan' ? 'text-orange-500 border-b-2 border-orange-500 font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            {t.tabPlan}
          </button>
        </div>

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
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${rec.type === 'شراء' ? 'bg-green-900 text-green-400' : rec.type === 'بيع' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'}`}>{rec.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(rec.status)}`}>{getStatusLabel(rec.status)}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{rec.stock_name}</p>
                      </div>
                      <span className="text-gray-500 text-xs">{new Date(rec.created_at).toLocaleDateString(t.dateLocale)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
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
            {/* نموذج إضافة ملاحظة */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <h3 className="text-white font-bold text-sm mb-3">
                {user?.plan === 'premium' ? t.addPublicComment : t.sendToAnalyst}
              </h3>
              {user?.plan === 'free' ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">{t.needsUpgrade}</p>
                  <button onClick={() => setActiveTab('plan')} className="bg-orange-500 text-black px-4 py-2 rounded text-sm font-bold">{t.upgradePlan}</button>
                </div>
              ) : (
                <>
                  <textarea
                    value={commentForm.content}
                    onChange={e => setCommentForm({...commentForm, content: e.target.value})}
                    rows={3}
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm mb-3"
                    placeholder={t.commentPh}
                  />
                  <button onClick={handleAddComment} className="bg-orange-500 text-black px-4 py-2 rounded text-sm font-bold hover:bg-orange-600 transition">{t.send}</button>
                </>
              )}
            </div>

            {/* قائمة الملاحظات */}
            {user?.plan !== 'premium' ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-3xl mb-2">🔒</p>
                <p className="text-sm">{t.premiumOnly}</p>
                <button onClick={() => setActiveTab('plan')} className="mt-3 bg-orange-500 text-black px-4 py-2 rounded text-sm font-bold">{t.upgradePremium}</button>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-3xl mb-2">💬</p>
                <p>{t.noComments}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-xs">{comment.user_name[0]}</div>
                      <div>
                        <p className="text-white text-sm font-bold">{comment.user_name}</p>
                        <p className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString(t.dateLocale)}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* الخطة */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm mb-2">{t.currentPlan}</p>
              <span className={`text-xl font-bold px-4 py-2 rounded-lg ${getPlanStyle(user?.plan)}`}>
                {getPlanLabel(user?.plan)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {t.plans.map(plan => (
                <div
                  key={plan.value}
                  className={`bg-gray-900 border rounded-xl p-5 ${user?.plan === plan.value ? 'border-orange-500' : 'border-gray-800'}`}
                >
                  <h3 className={`font-bold text-lg mb-1 ${plan.color === 'orange' ? 'text-orange-500' : plan.color === 'blue' ? 'text-blue-400' : 'text-gray-400'}`}>
                    {plan.label}
                  </h3>
                  <p className="text-gray-500 text-xs mb-4">{plan.description}</p>
                  <ul className="space-y-1 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-gray-300 text-xs flex items-center gap-2">
                        <span className="text-green-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {user?.plan === plan.value ? (
                    <div className="w-full bg-orange-500 text-black py-2 rounded-lg font-bold text-sm text-center">{t.currentPlanBadge}</div>
                  ) : (
                    <button
                      onClick={() => handleUpgradePlan(plan.value)}
                      disabled={
                        (plan.value === 'free') ||
                        (plan.value === 'basic' && user?.plan === 'premium')
                      }
                      className="w-full bg-gray-700 text-white py-2 rounded-lg text-sm hover:bg-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {plan.value === 'free' ? t.defaultPlan : t.upgradeToThis}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
