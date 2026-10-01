// عناصر هيكلية (Skeleton) بديلة لنص "جاري التحميل..." — بتدي إحساس أسرع وأقرب للشكل
// الفعلي للمحتوى وقت التحميل، بدل نص ثابت في نص الشاشة.

import type { CSSProperties } from 'react';

export function SkeletonLine({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`h-4 bg-[var(--surface-2)] rounded animate-pulse ${className}`} style={style} />;
}

export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-[var(--surface-2)] rounded mb-3 w-2/3" />
      {Array(lines).fill(0).map((_, i) => (
        <div key={i} className={`h-3 bg-[var(--surface-2)] rounded mb-2 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl animate-pulse ${className}`} />;
}
