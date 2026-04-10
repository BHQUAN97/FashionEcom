'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/** Stepper tang giam so luong — touch-friendly 44px target */
export function QuantityStepper({
  value,
  min = 1,
  max = 10,
  onChange,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-sm w-8' : 'text-base w-10';

  return (
    <div className={cn('flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit', className)}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          btnSize,
          'flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed',
        )}
        aria-label="Giam so luong"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className={cn(textSize, 'text-center font-medium select-none')}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          btnSize,
          'flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed',
        )}
        aria-label="Tang so luong"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
