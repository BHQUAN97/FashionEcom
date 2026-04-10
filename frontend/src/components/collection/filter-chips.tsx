'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChip {
  label: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll: () => void;
  className?: string;
}

/** Active filter chips — horizontal scroll, remove chip */
export function FilterChips({ chips, onClearAll, className }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide items-center', className)}>
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.onRemove}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-200 transition flex-shrink-0"
        >
          {chip.label}
          <X className="w-3 h-3" />
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-red-600 hover:underline whitespace-nowrap flex-shrink-0"
      >
        Xoa tat ca
      </button>
    </div>
  );
}
