'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Pagination component — Torano style
 * Hien thi so trang voi ellipsis khi nhieu trang
 */
export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  /** Tao mang so trang hien thi, chen '...' khi can */
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];

    if (totalPages <= 7) {
      // Hien tat ca neu <= 7 trang
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Luon hien trang 1
    pages.push(1);

    if (currentPage <= 3) {
      // Dau: 1 2 3 4 ... last
      pages.push(2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Cuoi: 1 ... n-3 n-2 n-1 n
      pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Giua: 1 ... p-1 p p+1 ... last
      pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={cn('flex items-center justify-center gap-1 mt-8', className)}>
      {/* Nut trang truoc */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-9 h-9 flex items-center justify-center rounded-full text-sm hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Trang truoc"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* So trang */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition',
              page === currentPage
                ? 'bg-black text-white'
                : 'hover:bg-gray-100 text-gray-700'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Nut trang sau */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-full text-sm hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
