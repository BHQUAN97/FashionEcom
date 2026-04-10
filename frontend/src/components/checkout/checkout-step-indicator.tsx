'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CheckoutStep } from '@/lib/stores/checkout.store';

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: 'review', label: 'Kiem tra' },
  { key: 'shipping', label: 'Giao hang' },
  { key: 'payment', label: 'Thanh toan' },
];

interface CheckoutStepIndicatorProps {
  currentStep: CheckoutStep;
  className?: string;
}

/** Checkout step indicator — 3 steps: review / shipping / payment */
export function CheckoutStepIndicator({ currentStep, className }: CheckoutStepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className={cn('flex items-center justify-center gap-0', className)}>
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            {i > 0 && (
              <div
                className={cn(
                  'w-8 md:w-16 h-0.5',
                  isCompleted || isActive ? 'bg-black' : 'bg-gray-300',
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition',
                  isCompleted
                    ? 'bg-black border-black text-white'
                    : isActive
                      ? 'border-black text-black'
                      : 'border-gray-300 text-gray-400',
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs whitespace-nowrap',
                  isActive ? 'font-semibold text-black' : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
