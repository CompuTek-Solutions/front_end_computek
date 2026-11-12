import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui';

const getPageNumbers = (currentPage, totalPages) => {
  const maxVisible = 5;
  if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);
  if (end - start + 1 < maxVisible) {
    if (start === 1) end = Math.min(totalPages, start + maxVisible - 1);
    else if (end === totalPages) start = Math.max(1, end - maxVisible + 1);
  }

  const pages = [];
  if (start > 1) pages.push(1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('…');
  if (end < totalPages) pages.push(totalPages);
  return pages;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
}) {
  if (!totalItems) return null;

  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-dark-600">
      <div className="flex items-center gap-3">
        <span>
          {from}–{to} sur {totalItems}
        </span>
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-dark-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Éléments par page"
          >
            {itemsPerPageOptions.map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            icon={ChevronLeft}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Page précédente"
          />
          <span className="px-3 sm:hidden">
            {currentPage} / {totalPages}
          </span>
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers(currentPage, totalPages).map((page, index) =>
              page === '…' ? (
                <span key={`gap-${index}`} className="px-2 text-dark-400">…</span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`h-9 min-w-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary-700 text-white'
                      : 'text-dark-700 hover:bg-dark-100'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
          <Button
            variant="secondary"
            size="icon"
            icon={ChevronRight}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Page suivante"
          />
        </div>
      )}
    </div>
  );
}
