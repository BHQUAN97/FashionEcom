'use client';

import { cn } from '@/lib/utils';

export type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'bestseller' | 'rating';

const SORT_OPTIONS: { label: string; value: SortValue }[] = [
  { label: 'Moi nhat', value: 'newest' },
  { label: 'Gia thap den cao', value: 'price_asc' },
  { label: 'Gia cao den thap', value: 'price_desc' },
  { label: 'Ban chay', value: 'bestseller' },
  { label: 'Danh gia cao', value: 'rating' },
];

interface SortSelectProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
  className?: string;
}

/** Sort dropdown */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortValue)}
      className={cn(
        'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black',
        className,
      )}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
