'use client';

import { useState } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import LanguagePicker from '../components/LanguagePicker';

const L = {
  ar: {
    title: 'إنشاء حساب',
    subtitle: 'حساب بسيط لأي زائر — بدون اشتراك بمحلل',
    name: 'الاسم *',
    namePh: 'اسمك',
    email: 'البريد الإلكتروني *',
    emailPh: 'example@email.com',
    password: 'كلمة السر *',
    passwordPh: '6 أحرف على الأقل',
    confirmPassword: 'تأكيد كلمة السر *',
    confirmPasswordPh: 'أعد كتابة كلمة السر',
    submit: 'إنشاء الحساب',
    submitting: 'جاري الإنشاء...',
    haveAccount: 'لديك حساب؟',
    signIn: 'تسجيل الدخول',
    errFill: '❌ يرجى تعبئة كل الحقول',
    errMatch: '❌ كلمة السر غير متطابقة',
    emailSubject: 'كود تأكيد إيميلك في بورصة 2026',
    emailBody: (name: string, code: string) => `
      <div dir="rtl" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
        <h2 style="color: #f97316;">مرحباً ${name}!</h2>
        <p>شكراً لتسجيلك في بورصة 2026. أدخل الكود التالي لتأكيد بريدك الإلكتروني:</p>
        <h1 style="color: #f97316; font-size: 36px; letter-spacing: 8px; text-align: center; padding: 20px; background: #1a1a1a; border-radius: 8px;">${code}</h1>
        <p style="color: #999;">صالح لمدة 30 دقيقة. بعد التأكيد، سيُراجع طلبك من الإدارة قبل تفعيل حسابك.</p>
      </div>
    `,
  },
  en: {
    title: 'Create Account',
    subtitle: 'A simple account for any visitor — no analyst subscription needed',
    name: 'Name *',
    namePh: 'Your name',
    email: 'Email *',
    emailPh: 'example@email.com',
    password: 'Password *',
    passwordPh: 'At least 6 characters',
    confirmPassword: 'Confirm Password *',
    confirmPasswordPh: 'Re-enter your password',
    submit: 'Create Account',
    submitting: 'Creating...',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
    errFill: '❌ Please fill in all fields',
    errMatch: '❌ Passwords do not match',
    emailSubject: 'Your email verification code for Borsa 2026',
    emailBody: (name: string, code: string) => `
      <div dir="ltr" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
        <h2 style="color: #f97316;">Hi ${name}!</h2>
        <p>Thanks for signing up for Borsa 2026. Enter the following code to verify your email:</p>
        <h1 style="color: #f97316; font-size: 36px; letter-spacing: 8px; text-align: center; padding: 20px; background: #1a1a1a; border-radius: 8px;">${code}</h1>
        <p style="color: #999;">Valid for 30 minutes. After verifying, your request will be reviewed by the admin before your account is activated.</p>
      </div>
    `,
  },
};

export default function SignupPage() {
  const { lang } = useLanguage();
  const t = L[lang];
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setMessage(t.errFill);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage(t.errMatch);
      return;
    }

    setLoading(true);
    const res = await fetch('/api/site-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();

    if (data.success) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          subject: t.emailSubject,
          html: t.emailBody(data.name, data.code),
        })
      });
      setLoading(false);
      window.location.href = `/verify-email?id=${data.id}`;
    } else {
      setLoading(false);
      setMessage(`❌ ${data.error}`);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">

        <LanguagePicker />

        <div className="text-center mb-6">
          <h1 className="text-orange-500 font-bold text-2xl mb-1">{t.title}</h1>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </div>

        {message && (
          <div className="bg-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">{t.name}</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder={t.namePh}
            />
          </div>

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
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder={t.passwordPh}
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">{t.confirmPassword}</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder={t.confirmPasswordPh}
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-orange-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? t.submitting : t.submit}
          </button>

          <p className="text-center text-gray-500 text-sm">
            {t.haveAccount}{' '}
            <a href="/signin" className="text-orange-500 hover:text-orange-400">
              {t.signIn}
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}
