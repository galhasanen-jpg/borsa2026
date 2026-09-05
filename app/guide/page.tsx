'use client';

import { useState } from 'react';
import { useLanguage } from '../components/LanguageProvider';

const content = {
  ar: {
    title: '📖 دليل الاستخدام',
    subtitle: 'كل ما تحتاج معرفته للاستفادة من منصة بورصة 2026',
    tabs: { pages: '🗺️ صفحات الموقع', follower: '👤 للمتابع', analyst: '👨‍💼 للمحلل', glossary: '📚 مصطلحات البورصة' },
    pagesIntro: '🗺️ شرح مبسّط لكل صفحة في الموقع: ما البيانات التي تراها فيها، وما المهام التي يمكنك تنفيذها بها',
    followerIntro: '👋 أهلاً بك! هذا الدليل سيساعدك على الاستفادة القصوى من منصة بورصة 2026 كمتابع',
    analystIntro: '👨‍💼 هذا الدليل مخصص للمحللين الراغبين في نشر توصياتهم على المنصة',
    glossaryIntro: '📚 قاموس المصطلحات الأساسية في البورصة المصرية',
    dataLabel: 'البيانات الظاهرة',
    tasksLabel: 'ما يمكنك فعله',
    registerCta: 'سجل كمحلل الآن ←',
    pagesGuide: [
      {
        title: 'الرئيسية', icon: '🏠', path: '/',
        data: [
          'بطاقات المؤشرات الرئيسية (مثل EGX30) مع السعر ونسبة التغيير',
          'جدول بأبرز الأسهم المصرية مع السعر والتغيير والحجم، يتحدث تلقائياً كل دقيقة',
          'لوحة بآخر الأخبار الاقتصادية',
        ],
        tasks: [
          'إلقاء نظرة سريعة على حالة السوق العامة',
          'الانتقال لصفحة سوق الأسهم لعرض القائمة الكاملة',
        ],
      },
      {
        title: 'سوق الأسهم', icon: '📈', path: '/stocks',
        data: [
          'كل أسهم البورصة المصرية مقسّمة حسب القطاع (بنوك، عقارات، اتصالات...)',
          'السعر اللحظي ونسبة التغيير والحجم لكل سهم',
          'رسم بياني وتحليل مبسّط للسهم الذي تختاره',
        ],
        tasks: [
          'تصفية الأسهم حسب القطاع أو البحث عنها',
          'الضغط على أي سهم لعرض رسمه البياني وبياناته بالتفصيل',
          'إنشاء قوائم متابعة خاصة (Watchlists) وإضافة أسهمك المفضلة إليها — يتطلب تسجيل دخول كمتابع',
        ],
      },
      {
        title: 'أخبار الأسهم', icon: '📰', path: '/stock-news',
        data: [
          'قائمة الأسهم مقسّمة حسب القطاع مع بحث سريع',
          'آخر الأخبار الخاصة بالسهم الذي تختاره من مصادر متعددة',
          'تحليلات القيمة العادلة للسهم (من المحللين أو مضافة يدوياً) مع توصية شراء/بيع/احتفاظ',
        ],
        tasks: [
          'البحث عن سهم معيّن واختياره لعرض أخباره',
          'التنقل بين تبويب الأخبار وتبويب القيمة العادلة',
          'إضافة تحليل قيمة عادلة يدوياً (اسم الجهة المحلّلة، التاريخ، القيمة، التوصية، ملاحظات)',
        ],
      },
      {
        title: 'أخبار عالمية', icon: '🌍', path: '/global-news',
        data: [
          'بث مباشر لقناة اقتصادية عند اختيار تصنيف "مباشر"',
          'أخبار عالمية واقتصادية مصنّفة حسب القسم',
        ],
        tasks: [
          'متابعة البث المباشر',
          'تصفح الأخبار حسب التصنيف الذي يهمك',
        ],
      },
      {
        title: 'المحللون', icon: '👨‍💼', path: '/analysts',
        data: [
          'قائمة المحللين المعتمدين على المنصة',
          'تخصص كل محلل ونبذة عنه',
          'عدد توصياته الإجمالي ونسبة نجاحه',
        ],
        tasks: [
          'تصفح قائمة المحللين ومقارنة نسب نجاحهم',
          'الضغط على "عرض" لدخول صفحة محلل معيّن ورؤية كل توصياته',
          'التسجيل كمحلل جديد عبر نموذج "سجل كمحلل" (يحتاج موافقة الإدارة)',
        ],
      },
      {
        title: 'صفحة المحلل', icon: '📊', path: '/analysts/[id]',
        data: [
          'بيانات المحلل (الاسم، التخصص، النبذة) وروابط جروب واتساب/تيليجرام',
          'إحصائيات: إجمالي التوصيات، الناجحة، المفتوحة، ونسبة النجاح',
          'كل توصياته بالتفصيل: السهم، نوع التوصية، سعر الدخول، الهدف، وقف الخسارة',
          'ملاحظات الأعضاء المتميزين والردود عليها',
        ],
        tasks: [
          'فلترة التوصيات حسب حالتها (مفتوحة، ناجحة، خاسرة)',
          'الانضمام لجروب المحلل عبر واتساب أو تيليجرام',
          'إضافة ملاحظة عامة أو الرد على ملاحظة عضو آخر',
        ],
      },
      {
        title: 'اتصل بنا', icon: '📞', path: '/contact',
        data: ['وسائل التواصل المباشرة (البريد الإلكتروني، واتساب)'],
        tasks: ['إرسال رسالة مباشرة عبر النموذج (الاسم، البريد، الموضوع، الرسالة) تصل لإدارة الموقع فوراً'],
      },
      {
        title: 'إنشاء حساب متابع', icon: '📝', path: '/register',
        data: ['قائمة المحللين المتاحين للاختيار', 'خطط الاشتراك الثلاث: مجاني، أساسي، متميز'],
        tasks: [
          'إنشاء حساب جديد كمتابع باختيار محلل وخطة اشتراك',
          'بعد موافقة المحلل ثم الإدارة، يصلك كود تفعيل على بريدك لإكمال التسجيل',
        ],
      },
      {
        title: 'تسجيل الدخول', icon: '🔑', path: '/login',
        data: [],
        tasks: [
          'الدخول لحسابك كمتابع بالبريد الإلكتروني وكلمة السر',
          'إذا كان حسابك بانتظار التفعيل سيتم تحويلك تلقائياً لصفحة إدخال كود التفعيل',
        ],
      },
      {
        title: 'لوحة تحكم المتابع', icon: '🗂️', path: '/dashboard',
        data: [
          'بيانات المحلل الذي تتابعه وخطتك الحالية',
          'كل توصياته المعتمدة مع تفاصيلها',
          'ملاحظات الأعضاء (للخطة المتميزة)',
        ],
        tasks: [
          'فلترة توصيات المحلل حسب حالتها',
          'إرسال ملاحظة خاصة للمحلل (خطة أساسية) أو ملاحظة عامة يراها الجميع (خطة متميزة)',
          'ترقية خطة اشتراكك من نفس الصفحة',
          'تسجيل الخروج',
        ],
      },
    ],
    followerGuide: [
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
    ],
    analystGuide: [
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
    ],
    glossary: [
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
    ],
  },
  en: {
    title: '📖 User Guide',
    subtitle: 'Everything you need to know to get the most out of Borsa 2026',
    tabs: { pages: '🗺️ Site Pages', follower: '👤 For Followers', analyst: '👨‍💼 For Analysts', glossary: '📚 Market Glossary' },
    pagesIntro: '🗺️ A simple walkthrough of every page on the site: what data you see there, and what you can do on it',
    followerIntro: "👋 Welcome! This guide will help you get the most out of Borsa 2026 as a follower",
    analystIntro: '👨‍💼 This guide is for analysts who want to publish their recommendations on the platform',
    glossaryIntro: '📚 A dictionary of the essential terms used in the Egyptian stock market',
    dataLabel: 'Data shown',
    tasksLabel: 'What you can do',
    registerCta: 'Register as an analyst now ←',
    pagesGuide: [
      {
        title: 'Home', icon: '🏠', path: '/',
        data: [
          'Cards for the main market indices (e.g. EGX30) with price and change %',
          "A table of Egypt's top stocks with price, change and volume, auto-refreshing every minute",
          'A panel with the latest economic news',
        ],
        tasks: [
          'Get a quick read on the overall market at a glance',
          'Jump to the Stock Market page to see the full list',
        ],
      },
      {
        title: 'Stock Market', icon: '📈', path: '/stocks',
        data: [
          'Every EGX-listed stock, grouped by sector (banks, real estate, telecom...)',
          'Live price, change % and volume for each stock',
          'A chart and a simplified analysis for whichever stock you pick',
        ],
        tasks: [
          'Filter stocks by sector or search for one',
          'Click any stock to see its chart and detailed data',
          'Create personal watchlists and add your favorite stocks to them — requires signing in as a follower',
        ],
      },
      {
        title: 'Stock News', icon: '📰', path: '/stock-news',
        data: [
          'A searchable stock list grouped by sector',
          'The latest news for whichever stock you select, pulled from multiple sources',
          'Fair-value analyses for the stock (from analysts or added manually) with a buy/sell/hold recommendation',
        ],
        tasks: [
          'Search for a stock and select it to see its news',
          'Switch between the News tab and the Fair Value tab',
          'Add a fair-value analysis manually (analyst name, date, value, recommendation, notes)',
        ],
      },
      {
        title: 'Global News', icon: '🌍', path: '/global-news',
        data: [
          'A live stream from a financial news channel under the "Live" category',
          'Global and economic news grouped by category',
        ],
        tasks: [
          'Watch the live stream',
          'Browse news by the category you care about',
        ],
      },
      {
        title: 'Analysts', icon: '👨‍💼', path: '/analysts',
        data: [
          'A list of the analysts approved on the platform',
          "Each analyst's specialization and bio",
          'Their total number of recommendations and success rate',
        ],
        tasks: [
          'Browse the analyst list and compare their success rates',
          'Click "View" to open an analyst\'s page and see all their recommendations',
          'Register as a new analyst via the "Register as Analyst" form (requires admin approval)',
        ],
      },
      {
        title: 'Analyst Page', icon: '📊', path: '/analysts/[id]',
        data: [
          "The analyst's info (name, specialization, bio) and WhatsApp/Telegram group links",
          'Stats: total recommendations, successful, open, and success rate',
          'Every recommendation in detail: stock, type, entry price, target, stop-loss',
          'Premium members\' comments and the replies on them',
        ],
        tasks: [
          'Filter recommendations by status (open, successful, failed)',
          "Join the analyst's group via WhatsApp or Telegram",
          "Add a public comment or reply to another member's comment",
        ],
      },
      {
        title: 'Contact Us', icon: '📞', path: '/contact',
        data: ['Direct contact channels (email, WhatsApp)'],
        tasks: ['Send a message straight through the form (name, email, subject, message) — it reaches the site admin instantly'],
      },
      {
        title: 'Create a Follower Account', icon: '📝', path: '/register',
        data: ['The list of analysts available to choose from', 'The three subscription plans: Free, Basic, Premium'],
        tasks: [
          'Create a new follower account by choosing an analyst and a plan',
          'Once the analyst and then the admin approve you, an activation code is emailed to you to finish signing up',
        ],
      },
      {
        title: 'Login', icon: '🔑', path: '/login',
        data: [],
        tasks: [
          'Sign in to your follower account with your email and password',
          "If your account is still pending activation, you'll be redirected to enter your activation code",
        ],
      },
      {
        title: 'Follower Dashboard', icon: '🗂️', path: '/dashboard',
        data: [
          "The analyst you're following and your current plan",
          'All of their approved recommendations with full details',
          'Member comments (Premium plan only)',
        ],
        tasks: [
          "Filter the analyst's recommendations by status",
          'Send a private note to the analyst (Basic plan) or a public comment everyone can see (Premium plan)',
          'Upgrade your subscription plan from the same page',
          'Log out',
        ],
      },
    ],
    followerGuide: [
      {
        title: 'Browsing analyst pages',
        icon: '👁️',
        steps: [
          'Go to the Analysts page from the top menu',
          "You'll find a list of every approved analyst with their stats",
          "Click an analyst's \"View\" button to see their recommendations",
          'You can filter recommendations by status (open, successful, failed)',
        ]
      },
      {
        title: 'How to read a recommendation',
        icon: '📊',
        steps: [
          'Entry price: the price recommended for buying or selling the stock',
          'Target price: the price the stock is expected to reach (the profit target)',
          'Stop-loss: the price at which you should exit to avoid bigger losses',
          'Recommendation type: buy, sell, or hold',
          'Duration: short-term (days), medium (weeks), or long-term (months)',
        ]
      },
      {
        title: 'Joining a group',
        icon: '💬',
        steps: [
          "Open the page of the analyst you want to follow",
          "You'll find WhatsApp and Telegram buttons at the top of the page",
          "Click the button to join the analyst's group",
          'Free plan: view recommendations only',
          'Basic plan: lets you send notes to the analyst',
          "Premium plan: lets you see other members' comments and interact with them",
        ]
      },
      {
        title: 'How to leave a comment',
        icon: '✍️',
        steps: [
          "Open the analyst's page",
          'Click the Member Comments tab',
          'Write your name and your comment in the form',
          'Choose your subscription type (Basic or Premium)',
          'Basic comments reach the analyst only',
          'Premium comments are visible to all premium members',
        ]
      },
      {
        title: 'The difference between plans',
        icon: '💰',
        steps: [
          'Free: view recommendations only, no interaction',
          'Basic: join the group + send notes to the analyst',
          'Premium: everything in Basic + see member comments + instant alerts',
        ]
      },
    ],
    analystGuide: [
      {
        title: 'How to register as an analyst',
        icon: '📝',
        steps: [
          'Go to the Analysts page from the top menu',
          'Click the "Register as Analyst" button at the top',
          'Enter your name, specialization and a short bio',
          'Add your WhatsApp and Telegram group links',
          'Submit the registration request',
          'The admin team will review your request and notify you of the result',
        ]
      },
      {
        title: 'How to add a recommendation',
        icon: '➕',
        steps: [
          "Once your request is approved, the admin team will get in touch",
          'The admin can add your recommendations from the admin dashboard',
          'Each recommendation includes: the stock, type, entry price, target, and stop-loss',
          'A detailed description can be added to any recommendation',
          'The recommendation appears on your page as soon as it is added',
        ]
      },
      {
        title: 'Tracking recommendation results',
        icon: '📈',
        steps: [
          'Visit your page to track all of your recommendations',
          'Recommendations can be filtered by status',
          'When a target is hit, the recommendation is updated to successful',
          'Your success rate is calculated automatically and shown on your page',
          'Your followers see your stats directly',
        ]
      },
      {
        title: 'Managing your group',
        icon: '👥',
        steps: [
          'Create your own WhatsApp or Telegram group',
          'Add the group link when you register',
          'You can create more than one group for different plans',
          'Free group: for general recommendations',
          'Paid group: for premium recommendations and direct interaction',
        ]
      },
    ],
    glossary: [
      { term: 'Entry price', definition: 'The price recommended for buying or selling the stock — the starting point of a recommendation' },
      { term: 'Target price', definition: 'The price the stock is expected to reach, at which the profit is taken and the trade is closed' },
      { term: 'Stop-loss', definition: 'A set price at which you exit the trade to avoid bigger losses — it must be respected' },
      { term: 'Technical analysis', definition: 'Studying charts and price patterns to forecast how a stock will move in the future' },
      { term: 'Fundamental analysis', definition: "Studying a company's financial statements, earnings and financial position to assess its true value" },
      { term: 'Fair value', definition: "A stock's estimated true value based on analysis, used to judge whether it's cheap or expensive" },
      { term: 'EGX30', definition: "An index of the 30 largest companies on the Egyptian Exchange by liquidity and market value" },
      { term: 'Trading volume', definition: 'The number of shares traded during a session — an indicator of interest in the stock' },
      { term: 'Liquidity', definition: 'How easily a stock can be bought and sold without significantly moving its price' },
      { term: 'Cash dividends', definition: "A portion of a company's profit distributed to shareholders in cash or bonus shares" },
      { term: 'IPO', definition: "A new company offering its shares for sale on the exchange for the first time" },
      { term: 'P/E ratio', definition: "A stock's price relative to its earnings, used to compare the valuation of different stocks" },
    ],
  },
};

export default function GuidePage() {
  const { lang } = useLanguage();
  const t = content[lang];
  const [activeTab, setActiveTab] = useState<'pages' | 'follower' | 'analyst' | 'glossary'>('pages');

  return (
    <main className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">

        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-orange-500 font-bold text-3xl mb-2">{t.title}</h1>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </div>

        {/* التبويبات */}
        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'pages' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {t.tabs.pages}
          </button>
          <button
            onClick={() => setActiveTab('follower')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'follower' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {t.tabs.follower}
          </button>
          <button
            onClick={() => setActiveTab('analyst')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'analyst' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {t.tabs.analyst}
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition ${activeTab === 'glossary' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {t.tabs.glossary}
          </button>
        </div>

        {/* دليل صفحات الموقع */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-orange-500 border-opacity-30 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm text-center">{t.pagesIntro}</p>
            </div>
            {t.pagesGuide.map((page, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{page.icon}</span>
                  <div>
                    <h2 className="text-white font-bold text-lg">{page.title}</h2>
                    <p className="text-gray-600 text-xs font-mono" dir="ltr">{page.path}</p>
                  </div>
                </div>

                {page.data.length > 0 && (
                  <div className="mb-4">
                    <p className="text-orange-500 text-xs font-bold mb-2">{t.dataLabel}</p>
                    <ul className="space-y-1.5">
                      {page.data.map((d, j) => (
                        <li key={j} className="flex items-start gap-2 text-gray-300 text-sm leading-relaxed">
                          <span className="text-gray-600 mt-1">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-orange-500 text-xs font-bold mb-2">{t.tasksLabel}</p>
                  <ul className="space-y-1.5">
                    {page.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-300 text-sm leading-relaxed">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* دليل المتابع */}
        {activeTab === 'follower' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-orange-500 border-opacity-30 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm text-center">{t.followerIntro}</p>
            </div>
            {t.followerGuide.map((section, i) => (
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
              <p className="text-gray-400 text-sm text-center">{t.analystIntro}</p>
            </div>
            {t.analystGuide.map((section, i) => (
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
                {t.registerCta}
              </a>
            </div>
          </div>
        )}

        {/* مصطلحات البورصة */}
        {activeTab === 'glossary' && (
          <div className="space-y-3">
            <div className="bg-gray-900 border border-orange-500 border-opacity-30 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm text-center">{t.glossaryIntro}</p>
            </div>
            {t.glossary.map((item, i) => (
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
