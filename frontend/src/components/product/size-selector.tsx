'use client';

import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: { id: string; name: string; available?: boolean }[];
  selectedId: string | null;
  onChange: (sizeId: string) => void;
  className?: string;
}

/** Size selector — button grid, disabled neu het hang */
export function SizeSelector({ sizes, selectedId, onChange, className }: SizeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {sizes.map((size) => {
        const isSelected = selectedId === size.id;
        const isAvailable = size.available !== false;
        return (
          <button
            key={size.id}
            onClick={() => isAvailable && onChange(size.id)}
            disabled={!isAvailable}
            className={cn(
              'min-w-[44px] h-10 px-3 border text-sm font-medium rounded transition-all',
              isSelected
                ? 'border-black bg-black text-white'
                : isAvailable
                  ? 'border-gray-300 hover:border-black text-gray-700'
                  : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through',
            )}
            aria-label={`Size ${size.name}`}
            aria-pressed={isSelected}
          >
            {size.name}
          </button>
        );
      })}
    </div>
  );
}
