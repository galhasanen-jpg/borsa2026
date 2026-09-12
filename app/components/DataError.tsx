'use client';

import { useLanguage } from './LanguageProvider';

// رسالة موحّدة تظهر لما قسم بيانات يفشل في التحميل (بدل ما يفضل فاضي بصمت
// أو يعلّق على هيكل التحميل للأبد من غير ما يوضح للمستخدم إن فيه مشكلة فعلية)
export default function DataError({ onRetry, compact = false }: { onRetry: () => void; compact?: boolean }) {
  const { lang } = useLanguage();

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-10'} px-4`}>
      <p className="text-gray-500 text-sm mb-2">
        {lang === 'ar' ? '⚠️ تعذّر تحميل البيانات' : '⚠️ Couldn’t load the data'}
      </p>
      <p className="text-gray-600 text-xs mb-3">
        {lang === 'ar' ? 'تحقّق من اتصالك بالإنترنت وحاول مرة أخرى' : 'Check your connection and try again'}
      </p>
      <button
        onClick={onRetry}
        className="bg-gray-800 text-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-700 hover:text-orange-500 transition"
      >
        {lang === 'ar' ? '🔄 إعادة المحاولة' : '🔄 Retry'}
      </button>
    </div>
  );
}
