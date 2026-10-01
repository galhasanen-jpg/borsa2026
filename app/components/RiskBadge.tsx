// بادچ مستوى المخاطر لصناديق الاستثمار — لون موحّد أينما ظهر (قائمة الصناديق،
// صفحة التفاصيل، صفحة المقارنة) بدل تكرار خريطة الألوان في كل ملف على حدة.

const RISK_COLORS: Record<string, string> = {
  'منخفضة': 'text-green-400 border-green-700',
  'متوسطة': 'text-yellow-400 border-yellow-700',
  'مرتفعة': 'text-red-400 border-red-700',
};

export default function RiskBadge({ level, label, className = '' }: { level: string; label?: string; className?: string }) {
  return (
    <span className={`inline-block text-xs font-bold border rounded px-2 py-0.5 ${RISK_COLORS[level] || 'text-gray-400 border-gray-700'} ${className}`}>
      {label ?? level}
    </span>
  );
}
