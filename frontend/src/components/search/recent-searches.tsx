'use client';

import { Clock, X } from 'lucide-react';
import { useSearchStore } from '@/lib/stores/search.store';

interface RecentSearchesProps {
  onSelect: (term: string) => void;
}

/** Recent searches — localStorage chips, xoa duoc */
export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const { recentSearches, removeRecent, clearRecent } = useSearchStore();

  if (recentSearches.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Tìm kiếm gần đây</h3>
        <button onClick={clearRecent} className="text-xs text-gray-400 hover:text-red-600">
          Xoa tat ca
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recentSearches.map((term) => (
          <button
            key={term}
            onClick={() => onSelect(term)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition group"
          >
            <Clock className="w-3 h-3 text-gray-400" />
            {term}
            <span
              onClick={(e) => {
                e.stopPropagation();
                removeRecent(term);
              }}
              className="ml-0.5 opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3 text-gray-400 hover:text-red-600" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
