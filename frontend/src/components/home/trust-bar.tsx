import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrustBarItem } from '@/types/common';

const iconMap = {
  truck: Truck,
  shield: Shield,
  refresh: RefreshCw,
  headphones: Headphones,
};

interface TrustBarProps {
  items: TrustBarItem[];
  className?: string;
}

/** Trust bar — 4 icons: freeship, chinh hang, doi tra, tong dai */
export function TrustBar({ items, className }: TrustBarProps) {
  return (
    <section className={cn('border-t py-6 px-4 md:px-6', className)}>
      <div className="max-w-7xl mx-auto flex overflow-x-auto scrollbar-hide md:grid md:grid-cols-4 gap-6 md:gap-4">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <div
              key={item.line1}
              className="flex flex-col items-center gap-1.5 min-w-[140px] md:min-w-0 text-center"
            >
              <Icon className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{item.line1}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">{item.line2}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
