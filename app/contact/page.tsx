'use client';

import { useState } from 'react';
import { useLanguage } from '../components/LanguageProvider';

// البريد الذي تصل إليه رسائل النموذج
const CONTACT_EMAIL = 'g.alhasanen@gmail.com';

const t = {
  ar: {
    title: '📞 اتصل بنا',
    subtitle: 'عندك سؤال أو اقتراح أو ملاحظة؟ يسعدنا تواصلك معنا في أي وقت',
    cards: [
      { icon: '📧', title: 'البريد الإلكتروني', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
      { icon: '💬', title: 'واتساب', value: 'تواصل معنا عبر واتساب', href: 'https://wa.me/' },
    ],
    formTitle: '✍️ أرسل لنا رسالة',
    success: '✅ تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت',
    nameLabel: 'الاسم *',
    namePlaceholder: 'اكتب اسمك',
    emailLabel: 'البريد الإلكتروني *',
    subjectLabel: 'الموضوع',
    subjectPlaceholder: 'موضوع الرسالة',
    messageLabel: 'الرسالة *',
    messagePlaceholder: 'اكتب رسالتك هنا...',
    send: 'إرسال الرسالة ←',
    sending: 'جاري الإرسال...',
    note: 'نحرص على الرد على جميع الرسائل خلال 24 ساعة عمل',
    errorFallback: 'حدث خطأ ما، حاول مرة أخرى',
    errorFailed: 'فشل إرسال الرسالة',
    emailSubjectPrefix: 'اتصل بنا: ',
    emailSubjectFrom: 'رسالة جديدة من ',
    mailHeading: 'رسالة جديدة من نموذج اتصل بنا',
    mailName: 'الاسم:',
    mailEmail: 'البريد:',
    mailSubject: 'الموضوع:',
    mailNoSubject: 'بدون موضوع',
  },
  en: {
    title: '📞 Contact Us',
    subtitle: "Have a question, suggestion, or feedback? We'd love to hear from you anytime",
    cards: [
      { icon: '📧', title: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
      { icon: '💬', title: 'WhatsApp', value: 'Reach us on WhatsApp', href: 'https://wa.me/' },
    ],
    formTitle: '✍️ Send us a message',
    success: "✅ Your message has been sent successfully! We'll get back to you soon",
    nameLabel: 'Name *',
    namePlaceholder: 'Enter your name',
    emailLabel: 'Email *',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'Message subject',
    messageLabel: 'Message *',
    messagePlaceholder: 'Write your message here...',
    send: 'Send Message →',
    sending: 'Sending...',
    note: 'We aim to respond to all messages within 24 business hours',
    errorFallback: 'Something went wrong, please try again',
    errorFailed: 'Failed to send the message',
    emailSubjectPrefix: 'Contact: ',
    emailSubjectFrom: 'New message from ',
    mailHeading: 'New message from the Contact Us form',
    mailName: 'Name:',
    mailEmail: 'Email:',
    mailSubject: 'Subject:',
    mailNoSubject: 'No subject',
  },
};

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function ContactPage() {
  const { lang } = useLanguage();
  const tr = t[lang];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus('sending');
    setErrorMsg('');

    const html = `
      <div style="font-family: Arial, sans-serif; direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; text-align: ${lang === 'ar' ? 'right' : 'left'};">
        <h2 style="color:#f97316;">${tr.mailHeading}</h2>
        <p><strong>${tr.mailName}</strong> ${name}</p>
        <p><strong>${tr.mailEmail}</strong> ${email}</p>
        <p><strong>${tr.mailSubject}</strong> ${subject || tr.mailNoSubject}</p>
        <hr style="border-color:#e5e7eb;" />
        <p style="white-space: pre-line;">${message}</p>
      </div>
    `;

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: CONTACT_EMAIL,
          subject: subject ? `${tr.emailSubjectPrefix}${subject}` : `${tr.emailSubjectFrom}${name}`,
          html,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || tr.errorFailed);
      }

      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || tr.errorFallback);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">

        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-orange-500 font-bold text-3xl mb-2">{tr.title}</h1>
          <p className="text-gray-500 text-sm">{tr.subtitle}</p>
        </div>

        {/* بطاقات وسائل التواصل */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {tr.cards.map((card, i) => (
            <a
              key={i}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-orange-500 transition"
            >
              <div className="text-3xl mb-2">{card.icon}</div>
              <h3 className="text-white font-bold text-sm mb-1">{card.title}</h3>
              <p className="text-gray-500 text-xs">{card.value}</p>
            </a>
          ))}
        </div>

        {/* نموذج الاتصال */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-orange-500 font-bold text-lg mb-5">{tr.formTitle}</h2>

          {status === 'success' && (
            <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-400 rounded-lg p-4 mb-5 text-sm text-center">
              {tr.success}
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 rounded-lg p-4 mb-5 text-sm text-center">
              ❌ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-2">{tr.nameLabel}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={tr.namePlaceholder}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-2">{tr.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  dir="ltr"
                  className={`w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-2">{tr.subjectLabel}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={tr.subjectPlaceholder}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-2">{tr.messageLabel}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder={tr.messagePlaceholder}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-orange-500 text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? tr.sending : tr.send}
            </button>
          </form>
        </div>

        {/* ملاحظة أسفل النموذج */}
        <p className="text-center text-gray-600 text-xs mt-6">{tr.note}</p>

      </div>
    </main>
  );
}
