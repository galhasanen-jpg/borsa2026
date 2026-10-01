'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';

// restricted: يتطلب تسجيل دخول (يتطابق مع PROTECTED_PATHS في middleware.ts)
const navItems = [
  { id: 'home', label: 'الرئيسية', labelEn: 'Home', href: '/' },
  { id: 'stocks', label: 'سوق الأسهم', labelEn: 'Stock Market', href: '/stocks' },  { id: 'stock-news', label: 'أخبار الأسهم', labelEn: 'Stock News', href: '/stock-news' },
  { id: 'funds', label: 'صناديق الاستثمار', labelEn: 'Investment Funds', href: '/funds' },
  { id: 'daily-briefing', label: 'النشرة اليومية', labelEn: 'Daily Briefing', href: '/daily-briefing', restricted: true },
  { id: 'global-news', label: 'أخبار عالمية', labelEn: 'Global News', href: '/global-news' },
  { id: 'analysts', label: 'المحللون', labelEn: 'Analysts', href: '/analysts', restricted: true },
  { id: 'contact', label: 'اتصل بنا', labelEn: 'Contact Us', href: '/contact' },
  { id: 'guide', label: 'دليل الاستخدام', labelEn: 'User Guide', href: '/guide' },
];

export default function Navbar() {
  const { lang, toggle } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
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
    <nav className="bg-[var(--bg-nav)] border-b border-[var(--border)] sticky top-0 z-50">

      {/* الشريط العلوي */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
        <a href="/" className="text-[var(--accent-text)] font-bold text-2xl tracking-wider">
          {lang === 'ar' ? 'بورصة' : 'Borsa'}<span className="text-[var(--text-primary)]">2026</span>
        </a>

        <div className="flex items-center gap-4">
          {siteUser ? (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-[var(--text-secondary)]">{lang === 'ar' ? 'مرحباً' : 'Hi'}, {siteUser.name}</span>
              <a href="/account" className="text-[var(--text-secondary)] hover:text-[var(--accent-text)] transition">
                {lang === 'ar' ? 'حسابي' : 'My Account'}
              </a>
              <button
                onClick={handleLogout}
                className="text-[var(--text-secondary)] hover:text-[var(--accent-text)] transition"
              >
                {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            </div>
          ) : (
            <a
              href="/signin"
              className="hidden sm:block text-xs border border-[var(--border-strong)] px-4 py-1.5 rounded hover:border-orange-500 hover:text-[var(--accent-text)] transition text-[var(--text-primary)]"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </a>
          )}

          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light mode') : (lang === 'ar' ? 'الوضع الغامق' : 'Dark mode')}
            className="text-xs border border-[var(--border-strong)] px-3 py-1.5 rounded hover:border-orange-500 hover:text-[var(--accent-text)] transition"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={toggle}
            className="text-xs border border-[var(--border-strong)] px-4 py-1.5 rounded hover:border-orange-500 hover:text-[var(--accent-text)] transition"
          >
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? (lang === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (lang === 'ar' ? 'فتح القائمة' : 'Open menu')}
            className="md:hidden relative w-6 h-5 flex-shrink-0"
          >
            <span className={`absolute left-0 w-6 h-0.5 bg-[var(--text-primary)] rounded transition-all duration-300 ${menuOpen ? 'top-2 rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 top-2 w-6 h-0.5 bg-[var(--text-primary)] rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute left-0 w-6 h-0.5 bg-[var(--text-primary)] rounded transition-all duration-300 ${menuOpen ? 'top-2 -rotate-45' : 'top-4'}`} />
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
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              pathname === item.href
                ? 'border-orange-500 text-[var(--accent-text)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
            }`}
          >
            {lang === 'ar' ? item.label : item.labelEn}
          </a>
        ))}
      </div>

      {/* قائمة الموبايل */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col border-t border-[var(--border)]">
          {navItems.map(item => (



            <a
              key={item.id}
              href={item.href}
              onClick={e => handleNavClick(e, item)}
              className={`px-6 py-5 text-lg font-bold text-right border-b border-[var(--border)] transition ${
                pathname === item.href
                  ? 'text-[var(--accent-text)] bg-[var(--bg-card)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              {lang === 'ar' ? item.label : item.labelEn}
            </a>
          ))}

          {siteUser ? (
            <>
              <a
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-5 text-lg font-bold text-right text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition border-b border-[var(--border)]"
              >
                {lang === 'ar' ? `حسابي (${siteUser.name})` : `My Account (${siteUser.name})`}
              </a>
              <button
                onClick={handleLogout}
                className="px-6 py-5 text-lg font-bold text-right text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition"
              >
                {lang === 'ar' ? 'خروج' : 'Logout'}
              </button>
            </>
          ) : (
            <a
              href="/signin"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-5 text-lg font-bold text-right text-[var(--accent-text)] hover:bg-[var(--bg-card)] transition"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </a>
          )}
        </div>
      </div>

    </nav>
  );
}