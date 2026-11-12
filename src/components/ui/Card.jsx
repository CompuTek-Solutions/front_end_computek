import React from 'react';

export default function Card({ title, actions, className = '', bodyClassName = 'p-4 sm:p-6', children }) {
  return (
    <section className={`bg-white rounded-xl border border-dark-200 shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5">
          {title && <h2 className="text-base font-semibold text-dark-900">{title}</h2>}
          {actions}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
