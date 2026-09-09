'use client';

import { useLanguage } from './LanguageProvider';

export default function LanguagePicker() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex gap-2 justify-center mb-6">
      <button
        onClick={() => setLang('ar')}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${lang === 'ar' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
      >
        1 — العربية
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${lang === 'en' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
      >
        2 — English
      </button>
    </div>
  );
}
