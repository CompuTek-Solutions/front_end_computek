import React from 'react';
import { ChevronDown } from 'lucide-react';
import { inputClass } from './fields';

export default function Select({ className = '', children, ...props }) {
  return (
    <div className={`relative ${className}`}>
      <select className={`${inputClass} appearance-none pr-9`} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
    </div>
  );
}
