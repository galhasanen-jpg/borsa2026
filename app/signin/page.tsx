'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../components/LanguageProvider';
import LanguagePicker from '../components/LanguagePicker';

const L = {
  ar: {
    title: 'تسجيل الدخول',
    subtitle: 'حساب الزوار العام — بورصة 2026',
    email: 'البريد الإلكتروني *',
    emailPh: 'example@email.com',
    password: 'كلمة السر *',
    passwordPh: 'كلمة السر',
    submit: 'تسجيل الدخول',
    submitting: 'جاري الدخول...',
    noAccount: 'ليس لديك حساب؟',
    signUp: 'أنشئ حساباً',
    errFill: '❌ يرجى إدخال الإيميل وكلمة السر',
    lockedSections: { '/daily-briefing': 'النشرة اليومية', '/dashboard': 'لوحة تحكم المتابع', '/analysts': 'بيانات المحللين' } as Record<string, string>,
    lockedGeneric: 'هذا القسم',
    lockedMessage: (section: string) => `🔒 ${section} متاحة فقط بعد تسجيل الدخول`,
  },
  en: {
    title: 'Sign In',
    subtitle: 'General visitor account — Borsa 2026',
    email: 'Email *',
    emailPh: 'example@email.com',
    password: 'Password *',
    passwordPh: 'Password',
    submit: 'Sign In',
    submitting: 'Signing in...',
    noAccount: "Don't have an account?",
    signUp: 'Create one',
    errFill: '❌ Please enter your email and password',
    lockedSections: { '/daily-briefing': 'Daily Briefing', '/dashboard': 'Follower Dashboard', '/analysts': 'Analysts data' } as Record<string, string>,
    lockedGeneric: 'This section',
    lockedMessage: (section: string) => `🔒 ${section} is available after signing in only`,
  },
};

function SigninForm() {
  const { lang } = useLanguage();
  const t = L[lang];
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const locked = searchParams.get('locked') === '1';
  const lockedSectionKey = Object.keys(t.lockedSections).find(p => next.startsWith(p));
  const lockedSection = lockedSectionKey ? t.lockedSections[lockedSectionKey] : t.lockedGeneric;

  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!form.email || !form.password) {
      setMessage(t.errFill);
      return;
    }

    setLoading(true);
    const res = await fetch('/api/site-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email: form.email, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem('siteUser', JSON.stringify(data.user));
      window.location.href = next;
    } else if (data.needEmailVerify) {
      window.location.href = `/verify-email?id=${data.id}`;
    } else {
      setMessage(`❌ ${data.error}`);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">

      <LanguagePicker />

      <div className="text-center mb-6">
        <h1 className="text-orange-500 font-bold text-2xl mb-1">{t.title}</h1>
        <p className="text-gray-500 text-sm">{t.subtitle}</p>
      </div>

      {locked && (
        <div className="bg-orange-900/40 border border-orange-800 text-orange-300 p-3 rounded-lg mb-4 text-sm">
          {t.lockedMessage(lockedSection)}
        </div>
      )}

      {message && (
        <div className="bg-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">{t.email}</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
            placeholder={t.emailPh}
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs mb-1 block">{t.password}</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
            placeholder={t.passwordPh}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-orange-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? t.submitting : t.submit}
        </button>

        <p className="text-center text-gray-500 text-sm">
          {t.noAccount}{' '}
          <a href="/signup" className="text-orange-500 hover:text-orange-400">
            {t.signUp}
          </a>
        </p>
      </div>

    </div>
  );
}

export default function SigninPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-gray-500">...</div>}>
        <SigninForm />
      </Suspense>
    </main>
  );
}
