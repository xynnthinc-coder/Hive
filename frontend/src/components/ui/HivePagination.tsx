import React from 'react';

interface HivePaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function HivePagination({ currentPage, lastPage, onPageChange, className = '' }: HivePaginationProps) {
  if (lastPage <= 1) return null;

  const getPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (lastPage <= maxVisible) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', lastPage);
      } else if (currentPage >= lastPage - 2) {
        pages.push(1, '...', lastPage - 3, lastPage - 2, lastPage - 1, lastPage);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage);
      }
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 mt-6 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        title="Sebelumnya"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {getPages().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center text-on-surface-variant/50 text-sm">
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              isCurrent
                ? 'bg-honey text-on-primary border-none shadow-sm'
                : 'border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        title="Selanjutnya"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
