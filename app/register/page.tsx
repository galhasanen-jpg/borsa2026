'use client';

import { useState, useEffect } from 'react';

export default function RegisterPage() {
  const [analysts, setAnalysts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    analyst_id: '',
    plan: 'free',
  });

  useEffect(() => {
    fetchAnalysts();
  }, []);

  async function fetchAnalysts() {
    const res = await fetch('/api/analysts');
    const data = await res.json();
    setAnalysts(Array.isArray(data) ? data : []);
  }

  async function handleRegister() {
    if (!form.name || !form.email || !form.whatsapp || !form.password || !form.analyst_id) {
      setMessage('❌ يرجى إدخال جميع الحقول المطلوبة');
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        password: form.password,
        analyst_id: parseInt(form.analyst_id),
        plan: form.plan
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

  const plans = [
    { value: 'free', label: 'مجاني', description: 'عرض التوصيات فقط', color: 'gray' },
    { value: 'basic', label: 'أساسي', description: 'الجروب + ملاحظات للمحلل', color: 'blue' },
    { value: 'premium', label: 'متميز', description: 'كل المميزات + إشعارات فورية', color: 'orange' },
  ];
  if (success) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-green-700 rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-6xl mb-4">✅</p>
          <h2 className="text-white font-bold text-xl mb-2">تم إرسال طلب التسجيل!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            سيتم مراجعة طلبك من المحلل ثم إدارة الموقع.
            عند الموافقة ستصلك رسالة على إيميلك تحتوي على كود التفعيل.
          </p>
          <a href="/" className="bg-orange-500 text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition">
            العودة للرئيسية
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-lg w-full">

        {/* العنوان */}
        <div className="text-center mb-6">
          <h1 className="text-orange-500 font-bold text-2xl mb-1">تسجيل متابع جديد</h1>
          <p className="text-gray-500 text-sm">انضم لجروب المحلل المفضل لديك</p>
        </div>

        {message && (
          <div className="bg-red-900 text-red-400 p-3 rounded-lg mb-4 text-sm">{message}</div>
        )}

        <div className="space-y-4">

          {/* الاسم */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">الاسم الكامل *</label>
            <input
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="اسمك الكامل"
            />
          </div>

          {/* الإيميل */}
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

          {/* واتساب */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">رقم الواتساب *</label>
            <input
              value={form.whatsapp}
              onChange={e => setForm({...form, whatsapp: e.target.value})}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="201XXXXXXXXX"
            />
          </div>

          {/* كلمة السر */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">كلمة السر *</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
              placeholder="6 أحرف على الأقل"
            />
          </div>

          {/* تأكيد كلمة السر */}
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

          {/* اختيار المحلل */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">اختر المحلل *</label>
            <select
              value={form.analyst_id}
              onChange={e => setForm({...form, analyst_id: e.target.value})}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
            >
              <option value="">-- اختر المحلل --</option>
              {analysts.map((analyst, i) => (
                <option key={i} value={analyst.id}>
                  {analyst.name} - {analyst.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* اختيار الخطة */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">اختر الخطة *</label>
            <div className="grid grid-cols-3 gap-2">
              {plans.map(plan => (
                <div
                  key={plan.value}
                  onClick={() => setForm({...form, plan: plan.value})}
                  className={`p-3 rounded-lg border cursor-pointer transition text-center ${
                    form.plan === plan.value
                      ? 'border-orange-500 bg-orange-500 bg-opacity-10'
                      : 'border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <p className={`font-bold text-sm ${form.plan === plan.value ? 'text-orange-500' : 'text-white'}`}>
                    {plan.label}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* زر التسجيل */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-orange-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال طلب التسجيل'}
          </button>

          {/* رابط تسجيل الدخول */}
          <p className="text-center text-gray-500 text-sm">
            لديك حساب بالفعل؟{' '}
            <a href="/login" className="text-orange-500 hover:text-orange-400">
              تسجيل الدخول
            </a>
          </p>

        </div>
      </div>
    </main>
  );
}