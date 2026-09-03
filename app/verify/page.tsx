'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [form, setForm] = useState({ code: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleVerify() {
    if (!form.code || !form.password || !form.confirmPassword) {
      setMessage('❌ يرجى إدخال جميع الحقول');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage('❌ كلمة السر غير متطابقة');
      return;
    }
    if (form.password.length < 6) {
      setMessage('❌ كلمة السر يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/followers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parseInt(id || '0'),
        action: 'activate',
        activation_code: form.code.toUpperCase(),
        password: form.password
      })
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSuccess(true);
    } else {
      setMessage(`❌ ${data.error}`);
    }
  }

  if (success) {
    return (
      <div className="bg-gray-900 border border-green-700 rounded-xl p-8 max-w-md w-full text-center">
        <p className="text-6xl mb-4">🎉</p>
        <h2 className="text-white font-bold text-xl mb-2">تم تفعيل حسابك!</h2>
        <p className="text-gray-400 text-sm mb-6">يمكنك الآن تسجيل الدخول</p>
        <a href="/login" className="bg-orange-500 text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition">
          تسجيل الدخول ←
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <p className="text-4xl mb-2">📧</p>
        <h1 className="text-orange-500 font-bold text-xl mb-1">تفعيل الحساب</h1>
        <p className="text-gray-500 text-sm">أدخل الكود المرسل على إيميلك</p>
      </div>

      {message && (
        <div className="bg-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">كود التفعيل *</label>
          <input
            value={form.code}
            onChange={e => setForm({...form, code: e.target.value})}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm text-center font-bold tracking-widest"
            placeholder="XXXXXX"
            maxLength={6}
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">كلمة السر الجديدة *</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
            placeholder="6 أحرف على الأقل"
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">تأكيد كلمة السر *</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm({...form, confirmPassword: e.target.value})}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
            placeholder="أعد كتابة كلمة السر"
          />
        </div>
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-orange-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? 'جاري التفعيل...' : 'تفعيل الحساب'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-gray-500">جاري التحميل...</div>}>
        <VerifyContent />
      </Suspense>
    </main>
  );
}