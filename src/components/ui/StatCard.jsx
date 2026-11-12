import React from 'react';

const TONES = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  neutral: 'bg-dark-100 text-dark-700',
};

export default function StatCard({ label, value, icon: Icon, tone = 'primary', hint }) {
  return (
    <div className="bg-white rounded-xl border border-dark-200 shadow-sm p-3 sm:p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 min-w-0">
      {Icon && (
        <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center shrink-0 ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-dark-500 truncate">{label}</p>
        <p className="text-base sm:text-lg font-bold text-dark-900 whitespace-nowrap overflow-hidden text-ellipsis" title={String(value)}>
          {value}
        </p>
        {hint && <p className="text-xs text-dark-500 truncate">{hint}</p>}
      </div>
    </div>
  );
}
