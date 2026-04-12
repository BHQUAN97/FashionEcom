'use client';

import { cn } from '@/lib/utils';

export type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'bestseller' | 'rating';

const SORT_OPTIONS: { label: string; value: SortValue }[] = [
  { label: 'Sản phẩm nổi bật', value: 'bestseller' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá thấp đến cao', value: 'price_asc' },
  { label: 'Giá cao đến thấp', value: 'price_desc' },
  { label: 'Đánh giá cao', value: 'rating' },
];

interface SortSelectProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
  className?: string;
}

/** Sort dropdown — Torano style: "Sap xep theo" label + select */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-gray-500 whitespace-nowrap hidden md:inline">Sắp xếp theo</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortValue)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black appearance-none pr-8 cursor-pointer min-w-[160px]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
