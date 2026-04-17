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

/** Active filter chips — Torano style: "Ban dang xem" heading + "Xoa het" link */
export function FilterChips({ chips, onClearAll, className }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn('', className)}>
      <h3 className="font-bold text-base mb-2">Bạn đang xem</h3>
      <div className="space-y-1.5">
        {chips.map((chip, i) => (
          <button
            key={i}
            onClick={chip.onRemove}
            className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black transition group"
          >
            <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onClearAll}
        className="text-sm text-red-600 hover:underline mt-2"
      >
        Xóa hết
      </button>
    </div>
  );
}
