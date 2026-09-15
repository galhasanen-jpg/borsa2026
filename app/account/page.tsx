'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';

const L = {
  ar: {
    title: '👤 حسابي',
    notLoggedIn: 'يجب تسجيل الدخول لعرض هذه الصفحة',
    signIn: 'تسجيل الدخول',
    nameLabel: 'الاسم',
    emailLabel: 'البريد الإلكتروني',
    changePassword: '🔒 تغيير كلمة السر',
    currentPassword: 'كلمة السر الحالية *',
    currentPasswordPh: 'كلمة السر الحالية',
    newPassword: 'كلمة السر الجديدة *',
    newPasswordPh: '6 أحرف على الأقل',
    confirmPassword: 'تأكيد كلمة السر الجديدة *',
    confirmPasswordPh: 'أعد كتابة كلمة السر الجديدة',
    submit: 'حفظ كلمة السر الجديدة',
    submitting: 'جاري الحفظ...',
    errFill: '❌ يرجى تعبئة جميع الحقول',
    errMatch: '❌ كلمة السر الجديدة غير متطابقة',
    success: '✅ تم تغيير كلمة السر بنجاح',
  },
  en: {
    title: '👤 My Account',
    notLoggedIn: 'You must be signed in to view this page',
    signIn: 'Sign in',
    nameLabel: 'Name',
    emailLabel: 'Email',
    changePassword: '🔒 Change Password',
    currentPassword: 'Current Password *',
    currentPasswordPh: 'Current password',
    newPassword: 'New Password *',
    newPasswordPh: 'At least 6 characters',
    confirmPassword: 'Confirm New Password *',
    confirmPasswordPh: 'Re-enter the new password',
    submit: 'Save New Password',
    submitting: 'Saving...',
    errFill: '❌ Please fill in all fields',
    errMatch: '❌ New passwords do not match',
    success: '✅ Password changed successfully',
  },
};

export default function AccountPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [siteUser, setSiteUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('siteUser');
      if (stored) setSiteUser(JSON.parse(stored));
    } catch (e) {}
    setLoaded(true);
  }, []);

  async function handleChangePassword() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage(t.errFill);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage(t.errMatch);
      return;
    }

    setLoading(true);
    const res = await fetch('/api/site-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'change_password',
        id: siteUser.id,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setMessage(t.success);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage(`❌ ${data.error}`);
    }
  }

  if (!loaded) return null;

  if (!siteUser) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{t.notLoggedIn}</p>
          <a href="/signin" className="bg-orange-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition">
            {t.signIn}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-md mx-auto">

        <h1 className="text-orange-500 font-bold text-xl mb-6">{t.title}</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-gray-500 text-xs mb-1">{t.nameLabel}</p>
          <p className="text-white text-sm mb-4">{siteUser.name}</p>
          <p className="text-gray-500 text-xs mb-1">{t.emailLabel}</p>
          <p className="text-white text-sm">{siteUser.email}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-bold text-sm mb-4">{t.changePassword}</h2>

          {message && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${message.startsWith('✅') ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">{t.currentPassword}</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
                placeholder={t.currentPasswordPh}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">{t.newPassword}</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={e => setForm({ ...form, newPassword: e.target.value })}
                className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
                placeholder={t.newPasswordPh}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">{t.confirmPassword}</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
                placeholder={t.confirmPasswordPh}
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-orange-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? t.submitting : t.submit}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
