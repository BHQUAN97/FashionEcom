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
    <div className={cn('flex items-center justify-center gap-2 mt-8', className)}>
      {/* Nut trang truoc — an khi o trang 1 */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 text-sm transition"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* So trang — Torano style: active=black fill, inactive=border only */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-sm text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition',
              page === currentPage
                ? 'bg-black text-white'
                : 'border border-gray-200 hover:border-gray-400 text-gray-700'
            )}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Nut trang sau — ">" khong co border */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 text-sm transition"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
