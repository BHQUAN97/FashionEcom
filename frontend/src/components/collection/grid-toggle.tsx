'use client';

import { Grid2X2, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridToggleProps {
  columns: 2 | 4;
  onChange: (cols: 2 | 4) => void;
  className?: string;
}

/** Toggle 2/4 col grid — chi hien thi tren mobile */
export function GridToggle({ columns, onChange, className }: GridToggleProps) {
  return (
    <div className={cn('flex gap-1 md:hidden', className)}>
      <button
        onClick={() => onChange(2)}
        className={cn(
          'p-1.5 rounded transition',
          columns === 2 ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600',
        )}
        aria-label="2 cot"
      >
        <Grid2X2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange(4)}
        className={cn(
          'p-1.5 rounded transition',
          columns === 4 ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600',
        )}
        aria-label="4 cot"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>
    </div>
  );
}
