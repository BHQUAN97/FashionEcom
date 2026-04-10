import { cn } from '@/lib/utils';

interface BadgeSaleProps {
  percent: number;
  className?: string;
}

/** Badge giam gia do — hien thi tren goc trai product card */
export function BadgeSale({ percent, className }: BadgeSaleProps) {
  if (percent <= 0) return null;
  return (
    <span
      className={cn(
        'absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 font-semibold z-10',
        className,
      )}
    >
      -{percent}%
    </span>
  );
}

/** Badge moi — xanh */
export function BadgeNew({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 font-semibold z-10',
        className,
      )}
    >
      NEW
    </span>
  );
}

/** Badge het hang */
export function BadgeOutOfStock({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-0.5 font-semibold z-10',
        className,
      )}
    >
      HET HANG
    </span>
  );
}
