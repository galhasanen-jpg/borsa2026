'use client';

import { useState } from 'react';

const followerGuide = [
  {
    title: 'تصفح صفحات المحللين',
    icon: '👁️',
    steps: [
      'اذهب لصفحة المحللون من القائمة العلوية',
      'ستجد قائمة بكل المحللين المعتمدين مع إحصائياتهم',
      'اضغط على زر عرض الصفحة لأي محلل لرؤية توصياته',
      'يمكنك فلترة التوصيات حسب الحالة (مفتوحة، ناجحة، خاسرة)',
    ]
  },
  {
    title: 'كيف تقرأ التوصية',
    icon: '📊',
    steps: [
      'سعر الدخول: هو السعر المناسب لشراء أو بيع السهم',
      'السعر المستهدف: هو السعر المتوقع وصول السهم إليه (هدف الربح)',
      'وقف الخسارة: هو السعر الذي يجب الخروج عنده لتفادي خسائر أكبر',
      'نوع التوصية: شراء أو بيع أو احتفاظ',
      'المدة: قصير الأجل (أيام) أو متوسط (أسابيع) أو طويل (أشهر)',
    ]
  },
  {
    title: 'الانضمام للجروب',
    icon: '💬',
    steps: [
      'ادخل على صفحة المحلل الذي تريد متابعته',
      'ستجد أزرار واتساب وتيليجرام في أعلى الصفحة',
      'اضغط على الزر المناسب للانضمام لجروب المحلل',
      'الخطة المجانية: تسمح بمشاهدة التوصيات فقط',
      'الخطة الأساسية: تسمح بإرسال ملاحظات للمحلل',
      'الخطة المتميزة: تسمح برؤية ملاحظات الأعضاء والتفاعل معها',
    ]
  },
  {
    title: 'كيف تكتب ملاحظة',
    icon: '✍️',
    steps: [
      'ادخل على صفحة المحلل',
      'اضغط على تبويب ملاحظات الأعضاء',
      'اكتب اسمك وملاحظتك في النموذج',
      'اختر نوع الاشتراك (أساسي أو متميز)',
      'الملاحظات الأساسية تصل للمحلل فقط',
      'الملاحظات المتميزة تظهر لجميع الأعضاء المتميزين',
    ]
  },
  {
    title: 'الفرق بين الخطط',
    icon: '💰',
    steps: [
      'مجاني: عرض التوصيات فقط بدون تفاعل',
      'أساسي: الانضمام للجروب + إرسال ملاحظات للمحلل',
      'متميز: كل مميزات الأساسي + رؤية ملاحظات الأعضاء + تنبيهات فورية',
    ]
  },
];

const analystGuide = [
  {
    title: 'كيف تسجل كمحلل',
    icon: '📝',
    steps: [
      'اذهب لصفحة المحللون من القائمة العلوية',
      'اضغط على زر سجل كمحلل في أعلى الصفحة',
      'أدخل اسمك وتخصصك ونبذة عنك',
      'أضف روابط جروب واتساب وتيليجرام',
      'اضغط إرسال طلب التسجيل',
      'سيتم مراجعة طلبك من الإدارة وإعلامك بالنتيجة',
    ]
  },
  {
    title: 'كيف تضيف توصية',
    icon: '➕',
    steps: [
      'بعد قبول طلبك ستتواصل معك الإدارة',
      'يمكن للإدارة إضافة توصياتك من لوحة التحكم',
      'كل توصية تحتوي على: السهم، نوع التوصية، سعر الدخول، الهدف، وقف الخسارة',
      'يمكن إضافة وصف تفصيلي للتوصية',
      'التوصية تظهر فور إضافتها على صفحتك',
    ]
  },
  {
    title: 'متابعة نتائج التوصيات',
    icon: '📈',
    steps: [
      'ادخل على صفحتك لمتابعة كل توصياتك',
      'يمكن فلترة التوصيات حسب الحالة',
      'عند الوصول للهدف تُحدَّث التوصية إلى ناجحة',
      'نسبة النجاح تحسب تلقائياً وتظهر على صفحتك',
      'المتابعون يرون إحصائياتك بشكل مباشر',
    ]
  },
  {
    title: 'إدارة جروبك',
    icon: '👥',
    steps: [
      'أنشئ جروب واتساب أو تيليجرام خاص بك',
      'أضف رابط الجروب عند التسجيل',
      'يمكن إنشاء أكثر من جروب لخطط مختلفة',
      'الجروب المجاني: للتوصيات العامة',
      'الجروب المدفوع: للتوصيات المتميزة والتفاعل المباشر',
    ]
  },
];

const glossary = [
  { term: 'سعر الدخول', definition: 'هو السعر الذي يُنصح بشراء أو بيع السهم عنده، وهو نقطة البداية للتوصية' },
  { term: 'السعر المستهدف', definition: 'هو السعر المتوقع وصول السهم إليه، وعنده يتم أخذ الربح وإغلاق الصفقة' },
  { term: 'وقف الخسارة', definition: 'هو سعر محدد يتم عنده الخروج من الصفقة لتفادي خسائر أكبر، ويجب الالتزام به' },
  { term: 'التحليل الفني', definition: 'دراسة الرسوم البيانية والأنماط السعرية للتنبؤ بحركة السهم مستقبلاً' },
  { term: 'التحليل الأساسي', definition: 'دراسة القوائم المالية للشركة وأرباحها ومركزها المالي لتقييم قيمتها الحقيقية' },
  { term: 'القيمة العادلة', definition: 'هي القيمة الحقيقية المقدرة للسهم بناءً على التحليل، وتستخدم لمعرفة إذا كان السهم رخيصاً أو غالياً' },
  { term: 'EGX30', definition: 'مؤشر يضم أكبر 30 شركة في البورصة المصرية من حيث السيولة والقيمة السوقية' },
  { term: 'حجم التداول', definition: 'عدد الأسهم التي تم تداولها خلال جلسة التداول، وهو مؤشر على مدى الاهتمام بالسهم' },
  { term: 'السيولة', definition: 'مدى سهولة شراء وبيع السهم دون التأثير الكبير على سعره' },
  { term: 'التوزيعات النقدية', definition: 'جزء من أرباح الشركة يوزع على المساهمين نقداً أو أسهماً مجانية' },
  { term: 'الاكتتاب', definition: 'عرض شركة جديدة أسهمها للبيع في البورصة لأول مرة' },
  { term: 'مكرر الربحية P/E', definition: 'نسبة سعر السهم إلى ربحيته، تستخدم لمقارنة تقييم الأسهم المختلفة' },
];
export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<'follower' | 'analyst' | 'glossary'>('follower');

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">

        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-orange-500 font-bold text-3xl mb-2">📖 دليل الاستخدام</h1>
          <p className="text-gray-500 text-sm">كل ما تحتاج معرفته للاستفادة من منصة بورصة 2026</p>
        </div>

        {/* التبويبات */}
        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('follower')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'follower' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            👤 للمتابع
          </button>
          <button
            onClick={() => setActiveTab('analyst')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'analyst' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            👨‍💼 للمحلل
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'glossary' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            📚 مصطلحات البورصة
          </button>
        </div>

        {/* دليل المتابع */}
        {activeTab === 'follower' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-orange-500 border-opacity-30 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm text-center">
                👋 أهلاً بك! هذا الدليل سيساعدك على الاستفادة القصوى من منصة بورصة 2026 كمتابع
              </p>
            </div>
            {followerGuide.map((section, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{section.icon}</span>
                  <h2 className="text-white font-bold text-lg">{section.title}</h2>
                </div>
                <div className="space-y-2">
                  {section.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-black text-xs font-bold flex-shrink-0 mt-0.5">
                        {j + 1}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* دليل المحلل */}
        {activeTab === 'analyst' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-orange-500 border-opacity-30 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm text-center">
                👨‍💼 هذا الدليل مخصص للمحللين الراغبين في نشر توصياتهم على المنصة
              </p>
            </div>
            {analystGuide.map((section, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{section.icon}</span>
                  <h2 className="text-white font-bold text-lg">{section.title}</h2>
                </div>
                <div className="space-y-2">
                  {section.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-black text-xs font-bold flex-shrink-0 mt-0.5">
                        {j + 1}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* زر التسجيل */}
            <div className="text-center mt-6">
              <a
                href="/analysts"
                className="inline-block bg-orange-500 text-black px-8 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition"
              >
                سجل كمحلل الآن ←
              </a>
            </div>
          </div>
        )}

        {/* مصطلحات البورصة */}
        {activeTab === 'glossary' && (
          <div className="space-y-3">
            <div className="bg-gray-900 border border-orange-500 border-opacity-30 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm text-center">
                📚 قاموس المصطلحات الأساسية في البورصة المصرية
              </p>
            </div>
            {glossary.map((item, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-orange-500 transition">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 bg-opacity-20 border border-orange-500 flex items-center justify-center text-orange-500 font-bold text-xs flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-orange-500 font-bold text-sm mb-1">{item.term}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.definition}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}