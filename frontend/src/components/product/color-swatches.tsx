'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ColorSwatchesProps {
  colors: { id: string; name: string; hex: string }[];
  selectedId: string | null;
  onChange: (colorId: string) => void;
  className?: string;
}

/** Color swatch row — HEX circles voi selected state */
export function ColorSwatches({ colors, selectedId, onChange, className }: ColorSwatchesProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {colors.map((color) => {
        const isSelected = selectedId === color.id;
        const isLight = isLightColor(color.hex);
        return (
          <button
            key={color.id}
            onClick={() => onChange(color.id)}
            className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
              isSelected ? 'border-black scale-110' : 'border-gray-300 hover:border-gray-500',
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
            aria-label={`Màu ${color.name}`}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <Check className={cn('w-4 h-4', isLight ? 'text-gray-800' : 'text-white')} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Kiem tra mau sang de chon mau icon check */
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}
