'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!form.email || !form.password) {
      setMessage('❌ يرجى إدخال الإيميل وكلمة السر');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      localStorage.setItem('follower', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } else if (data.needActivation) {
      window.location.href = `/verify?id=${data.id}`;
    } else {
      setMessage(`❌ ${data.error}`);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">

        <div className="text-center mb-6">
          <h1 className="text-orange-500 font-bold text-2xl mb-1">تسجيل الدخول</h1>
          <p className="text-gray-500 text-sm">أهلاً بك في بورصة 2026</p>
        </div>

        {message && (
          <div className="bg-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">البريد الإلكتروني *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">كلمة السر *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="كلمة السر"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            ليس لديك حساب؟{' '}
            <a href="/register" className="text-orange-500 hover:text-orange-400">
              سجل الآن
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}