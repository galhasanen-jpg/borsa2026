'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'ar' | 'en';

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar');

  // استرجاع اللغة المحفوظة بعد أول رسم (لتفادي عدم تطابق الـ hydration)
  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'ar' || saved === 'en') setLang(saved);
  }, []);

  // تحديث اتجاه الصفحة ولغتها وحفظ الاختيار
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggle = () => setLang(lang === 'ar' ? 'en' : 'ar');

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
