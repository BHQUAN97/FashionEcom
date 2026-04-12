'use client';

import { TrendingUp } from 'lucide-react';

interface PopularSearchesProps {
  terms: string[];
  onSelect: (term: string) => void;
}

/** Popular searches — list tu mock data */
export function PopularSearches({ terms, onSelect }: PopularSearchesProps) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2">Tìm kiếm phổ biến</h3>
      <div className="space-y-1">
        {terms.map((term) => (
          <button
            key={term}
            onClick={() => onSelect(term)}
            className="flex items-center gap-2 w-full px-2 py-2 hover:bg-gray-50 rounded transition text-left"
          >
            <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-sm">{term}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
