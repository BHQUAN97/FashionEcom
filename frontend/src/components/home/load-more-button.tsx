'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
}

/** Nut xem them — thay infinite scroll */
export function LoadMoreButton({ onClick, loading = false, hasMore = true, className }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className={cn('text-center mt-6', className)}>
      <button
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center gap-2 border-2 border-black px-8 py-2.5 text-sm font-semibold hover:bg-black hover:text-white transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Dang tai...
          </>
        ) : (
          'XEM THEM'
        )}
      </button>
    </div>
  );
}
