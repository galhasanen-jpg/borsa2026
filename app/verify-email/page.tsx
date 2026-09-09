'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleVerify() {
    if (!code) {
      setMessage('❌ يرجى إدخال الكود');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/site-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_email', id: parseInt(id || '0'), code: code.trim() }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSuccess(true);
    } else {
      setMessage(`❌ ${data.error}`);
    }
  }

  async function handleResend() {
    setResending(true);
    const res = await fetch('/api/site-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resend_code', id: parseInt(id || '0') }),
    });
    const data = await res.json();

    if (data.success) {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          subject: 'كود تأكيد إيميلك في بورصة 2026',
          html: `
            <div dir="rtl" style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff;">
              <h2 style="color: #f97316;">مرحباً ${data.name}!</h2>
              <p>كود التأكيد الجديد الخاص بك:</p>
              <h1 style="color: #f97316; font-size: 36px; letter-spacing: 8px; text-align: center; padding: 20px; background: #1a1a1a; border-radius: 8px;">${data.code}</h1>
              <p style="color: #999;">صالح لمدة 30 دقيقة.</p>
            </div>
          `
        })
      });
      setMessage('✅ تم إرسال كود جديد على إيميلك');
    } else {
      setMessage(`❌ ${data.error}`);
    }
    setResending(false);
  }

  if (success) {
    return (
      <div className="bg-gray-900 border border-green-700 rounded-xl p-8 max-w-md w-full text-center">
        <p className="text-6xl mb-4">✅</p>
        <h2 className="text-white font-bold text-xl mb-2">تم تأكيد إيميلك!</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          طلبك الآن قيد المراجعة من إدارة الموقع. بمجرد الموافقة تقدر تسجل الدخول ببريدك وكلمة السر.
        </p>
        <a href="/signin" className="bg-orange-500 text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition">
          الذهاب لتسجيل الدخول ←
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <p className="text-4xl mb-2">📧</p>
        <h1 className="text-orange-500 font-bold text-xl mb-1">تأكيد الإيميل</h1>
        <p className="text-gray-500 text-sm">أدخل الكود المرسل على بريدك الإلكتروني</p>
      </div>

      {message && (
        <div className="bg-gray-800 text-gray-200 p-3 rounded-lg mb-4 text-sm">{message}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">كود التأكيد *</label>
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm text-center font-bold tracking-widest"
            placeholder="123456"
            maxLength={6}
          />
        </div>
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-orange-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? 'جاري التأكيد...' : 'تأكيد'}
        </button>
        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full text-gray-500 hover:text-orange-500 text-xs transition disabled:opacity-50"
        >
          {resending ? 'جاري الإرسال...' : 'إعادة إرسال الكود'}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-gray-500">جاري التحميل...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
