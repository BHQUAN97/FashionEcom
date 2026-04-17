'use client';

import { useCartStore } from '@/lib/stores/cart.store';
import { useEffect, useState } from 'react';

/** Badge so luong gio hang — client component, subscribe Zustand store */
export function CartBadge() {
  const count = useCartStore((s) => s.getCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || count === 0) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}
