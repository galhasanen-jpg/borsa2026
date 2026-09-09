'use client';

import { useState } from 'react';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setMessage('❌ يرجى تعبئة كل الحقول');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage('❌ كلمة السر غير متطابقة');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/site-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem('siteUser', JSON.stringify(data.user));
      window.location.href = '/daily-briefing';
    } else {
      setMessage(`❌ ${data.error}`);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">

        <div className="text-center mb-6">
          <h1 className="text-orange-500 font-bold text-2xl mb-1">إنشاء حساب</h1>
          <p className="text-gray-500 text-sm">حساب بسيط لأي زائر — بدون اشتراك بمحلل</p>
        </div>

        {message && (
          <div className="bg-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">الاسم *</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="اسمك"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">البريد الإلكتروني *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">كلمة السر *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="6 أحرف على الأقل"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">تأكيد كلمة السر *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="أعد كتابة كلمة السر"
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-orange-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            لديك حساب؟{' '}
            <a href="/signin" className="text-orange-500 hover:text-orange-400">
              تسجيل الدخول
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}
