import React from 'react';

export default function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {label && <span className="text-sm text-dark-500 shrink-0">{label}</span>}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-dark-100 p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              value === opt.value ? 'bg-white text-primary-700 shadow-sm' : 'text-dark-600 hover:text-dark-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
