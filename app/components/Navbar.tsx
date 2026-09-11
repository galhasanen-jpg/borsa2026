'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';

// restricted: يتطلب تسجيل دخول (يتطابق مع PROTECTED_PATHS في middleware.ts)
const navItems = [
  { id: 'home', label: 'الرئيسية', labelEn: 'Home', href: '/' },
  { id: 'stocks', label: 'سوق الأسهم', labelEn: 'Stock Market', href: '/stocks' },  { id: 'stock-news', label: 'أخبار الأسهم', labelEn: 'Stock News', href: '/stock-news' },
  { id: 'daily-briefing', label: 'النشرة اليومية', labelEn: 'Daily Briefing', href: '/daily-briefing', restricted: true },
  { id: 'global-news', label: 'أخبار عالمية', labelEn: 'Global News', href: '/global-news' },
  { id: 'analysts', label: 'المحللون', labelEn: 'Analysts', href: '/analysts', restricted: true },
  { id: 'contact', label: 'اتصل بنا', labelEn: 'Contact Us', href: '/contact' },
  { id: 'guide', label: 'دليل الاستخدام', labelEn: 'User Guide', href: '/guide' },
];

export default function Navbar() {
  const { lang, toggle } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteUser, setSiteUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('siteUser');
      if (stored) setSiteUser(JSON.parse(stored));
    } catch (e) {}
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/site-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    localStorage.removeItem('siteUser');
    setSiteUser(null);
    window.location.href = '/signin';
  }

  // الأقسام المحمية (النشرة اليومية، المحللون) نوجّه الزائر غير المسجّل مباشرة
  // لصفحة الدخول مع رسالة توضيحية، بدل ما يدخل الصفحة المحمية ويترد منها
  function handleNavClick(e: React.MouseEvent, item: typeof navItems[number]) {
    setMenuOpen(false);
    if (item.restricted && !siteUser) {
      e.preventDefault();
      window.location.href = `/signin?next=${encodeURIComponent(item.href)}&locked=1`;
    }
  }

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">

      {/* الشريط العلوي */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
        <a href="/" className="text-orange-500 font-bold text-2xl tracking-wider">
          بورصة<span className="text-white">2026</span>
        </a>

        <div className="flex items-center gap-4">
          {siteUser ? (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-gray-400">{lang === 'ar' ? 'مرحباً' : 'Hi'}, {siteUser.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-orange-500 transition"
              >
                {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            </div>
          ) : (
            <a
              href="/signin"
              className="hidden sm:block text-xs border border-gray-600 px-4 py-1.5 rounded hover:border-orange-500 hover:text-orange-500 transition text-gray-300"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </a>
          )}

          <button
            onClick={toggle}
            className="text-xs border border-gray-600 px-4 py-1.5 rounded hover:border-orange-500 hover:text-orange-500 transition"
          >
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white text-xl"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* قائمة الأقسام - ديسكتوب */}
      <div className="hidden md:flex items-center justify-end gap-8 px-6">
        {navItems.map(item => (
          <a
            key={item.id}
            href={item.href}
            onClick={e => handleNavClick(e, item)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              pathname === item.href
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {lang === 'ar' ? item.label : item.labelEn}
          </a>
        ))}
      </div>

      {/* قائمة الموبايل */}
      {menuOpen && (
        <div className="md:hidden flex flex-col border-t border-gray-800">
          {navItems.map(item => (
            


            <a
              key={item.id}
              href={item.href}
              onClick={e => handleNavClick(e, item)}
              className={`px-6 py-5 text-lg font-medium text-right border-b border-gray-800 transition ${
                pathname === item.href
                  ? 'text-orange-500 bg-gray-900'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              {lang === 'ar' ? item.label : item.labelEn}
            </a>
          ))}

          {siteUser ? (
            <button
              onClick={handleLogout}
              className="px-6 py-5 text-lg font-medium text-right text-gray-400 hover:text-white hover:bg-gray-900 transition"
            >
              {lang === 'ar' ? `خروج (${siteUser.name})` : `Logout (${siteUser.name})`}
            </button>
          ) : (
            <a
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-5 text-lg font-medium text-right text-orange-500 hover:bg-gray-900 transition"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </a>
          )}
        </div>
      )}

    </nav>
  );
}