import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

export default function Modal({ open = true, onClose, title, size = 'lg', footer, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-dark-900/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${SIZES[size]} bg-white shadow-xl rounded-t-2xl sm:rounded-xl max-h-[92vh] flex flex-col`}
      >
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-dark-200">
          <h2 className="text-lg font-semibold text-dark-900 truncate">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 -mr-2 inline-flex items-center justify-center rounded-lg text-dark-500 hover:bg-dark-100 hover:text-dark-900"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 px-4 sm:px-6 py-3 border-t border-dark-200 bg-dark-50 sm:rounded-b-xl [&>*]:flex-1 sm:[&>*]:flex-none">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
