import React from 'react';
import { Search } from 'lucide-react';
import { inputClass } from './fields';

export default function SearchInput({ className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
      <input type="search" className={`${inputClass} pl-9`} {...props} />
    </div>
  );
}
