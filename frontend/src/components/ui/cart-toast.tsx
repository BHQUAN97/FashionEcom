'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import { create } from 'zustand';

// --- Toast store ---

interface ToastItem {
  id: number;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  qty: number;
}

interface CartToastState {
  toast: ToastItem | null;
  showToast: (item: Omit<ToastItem, 'id'>) => void;
  hideToast: () => void;
}

let toastId = 0;

export const useCartToast = create<CartToastState>((set) => ({
  toast: null,
  showToast: (item) => set({ toast: { ...item, id: ++toastId } }),
  hideToast: () => set({ toast: null }),
}));

// --- Toast UI component ---

/**
 * Cart toast — Nielsen #1: Visibility of system status
 * Hien o goc tren phai (desktop) hoac tren cung (mobile)
 * Tu dong an sau 4s, co nut X de dong
 */
export function CartToast() {
  const { toast, hideToast } = useCartToast();
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(hideToast, 300);
  }, [hideToast]);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(dismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dismiss]);

  if (!toast) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 left-4 md:left-auto md:w-[380px] z-[70] transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none',
      )}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 border-b border-green-100">
          <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
            <Check className="w-4 h-4" />
            Đã thêm vào giỏ hàng
          </div>
          <button onClick={dismiss} className="p-1 hover:bg-green-100 rounded transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body — thong tin san pham vua them */}
        <div className="flex gap-3 p-3">
          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
            <Image src={toast.image} alt={toast.name} fill sizes="64px" className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium line-clamp-1">{toast.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {toast.color} / {toast.size} &times; {toast.qty}
            </p>
            <p className="text-sm font-bold mt-1">{formatVND(toast.price * toast.qty)}</p>
          </div>
        </div>

        {/* Footer — links */}
        <div className="flex gap-2 px-3 pb-3">
          <Link
            href={ROUTES.CART}
            onClick={dismiss}
            className="flex-1 py-2 text-center text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            Xem giỏ hàng
          </Link>
          <Link
            href={ROUTES.CHECKOUT}
            onClick={dismiss}
            className="flex-1 py-2 text-center text-sm font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
}
