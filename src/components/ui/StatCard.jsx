import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import Skeleton from './Skeleton';

const TONES = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  neutral: 'bg-dark-100 text-dark-700',
};

function Delta({ current, previous }) {
  if (previous === undefined || previous === null) return null;
  if (!previous) {
    return current ? <p className="text-xs font-medium text-emerald-700">Nouveau</p> : null;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-700' : 'text-red-600'}`} title="Par rapport à la période précédente">
      <Icon className="h-3.5 w-3.5" />
      {up ? '+' : ''}{pct} %
    </p>
  );
}

export default function StatCard({ label, value, icon: Icon, tone = 'primary', hint, loading = false, current, previous }) {
  return (
    <div className="bg-white rounded-xl border border-dark-200 shadow-sm p-3 sm:p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 min-w-0">
      {Icon && (
        <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center shrink-0 ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-dark-500 truncate">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-24" />
        ) : (
          <>
            <p className="text-base sm:text-lg font-bold text-dark-900 whitespace-nowrap overflow-hidden text-ellipsis" title={String(value)}>
              {value}
            </p>
            <Delta current={current} previous={previous} />
          </>
        )}
        {hint && <p className="text-xs text-dark-500 truncate">{hint}</p>}
      </div>
    </div>
  );
}
