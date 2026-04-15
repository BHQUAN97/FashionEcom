import { cn } from '@/lib/utils';

interface BadgeSaleProps {
  percent: number;
  className?: string;
}

/**
 * Badge giam gia — Torano style
 * Pill rounded (border-radius: 11px), bg red, font-600, padding 5px 10px
 * Vi tri: top-[10px] left-[10px]
 */
export function BadgeSale({ percent, className }: BadgeSaleProps) {
  if (percent <= 0) return null;
  return (
    <span
      className={cn(
        'absolute top-2.5 left-2.5 bg-red-600 text-white text-xs font-semibold z-10',
        'rounded-[11px] px-2.5 py-[5px] leading-none tracking-[0.5px] min-w-[52px] text-center',
        className,
      )}
    >
      -{percent}%
    </span>
  );
}

/** Badge moi — Torano: den, cung pill style */
export function BadgeNew({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute top-2.5 left-2.5 bg-black text-white text-xs font-semibold z-10',
        'rounded-[11px] px-2.5 py-[5px] leading-none tracking-[0.5px]',
        className,
      )}
    >
      NEW
    </span>
  );
}

/** Badge het hang — Torano: xam nhat, pill style */
export function BadgeOutOfStock({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute top-2.5 left-2.5 bg-[#565656] text-white text-[10px] font-semibold z-10',
        'rounded-[11px] px-2.5 py-[5px] leading-none',
        className,
      )}
    >
      HẾT HÀNG
    </span>
  );
}
