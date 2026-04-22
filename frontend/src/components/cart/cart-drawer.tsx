'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart.store';
import { useUIStore } from '@/lib/stores/ui.store';
import { formatVND } from '@/lib/utils/format';
import { CONFIG } from '@/lib/constants/config';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/lib/stores/cart.store';

/** Mini cart item row — compact cho drawer */
function DrawerCartItem({ item }: { item: CartItem }) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100">
      {/* Anh san pham */}
      <Link
        href={ROUTES.PRODUCT_DETAIL(item.slug)}
        className="w-[80px] h-[80px] flex-shrink-0 bg-gray-50 relative"
      >
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </Link>

      {/* Thong tin */}
      <div className="flex-1 min-w-0 pr-11 md:pr-6 relative">
        {/* Nut xoa — goc phai tren; 44x44 mobile de dat touch target, compact desktop */}
        <button
          onClick={() => removeItem(item.variantId)}
          className="absolute -top-2 -right-2 md:top-0 md:right-0 w-11 h-11 md:w-auto md:h-auto md:p-0.5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
          aria-label="Xóa sản phẩm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ten + variant */}
        <h4 className="text-[13px] font-semibold leading-snug line-clamp-2 uppercase">
          {item.name}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {item.color} / {item.size}
        </p>

        {/* Qty stepper + Gia — touch target 44x44 tren mobile (constitution) */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-300 h-11 md:h-7">
            <button
              onClick={() => updateQty(item.variantId, item.qty - 1)}
              disabled={item.qty <= 1}
              className="w-11 h-11 md:w-7 md:h-7 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-30"
              aria-label="Giảm"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 md:w-7 text-center text-sm md:text-xs font-medium select-none">{item.qty}</span>
            <button
              onClick={() => updateQty(item.variantId, item.qty + 1)}
              disabled={item.qty >= item.max_qty}
              className="w-11 h-11 md:w-7 md:h-7 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-30"
              aria-label="Tăng"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-sm font-bold">{formatVND(item.price * item.qty)}</span>
            {item.compare_at_price > item.price && (
              <span className="text-xs text-gray-400 line-through block">
                {formatVND(item.compare_at_price * item.qty)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Free shipping progress bar — Torano style */
function ShippingProgressBar({ subtotal }: { subtotal: number }) {
  const threshold = CONFIG.FREE_SHIP_THRESHOLD;
  const remaining = threshold - subtotal;
  const percent = Math.min(100, (subtotal / threshold) * 100);
  const isFree = remaining <= 0;

  return (
    <div className="px-5 py-3 border-b border-gray-100">
      <p className="text-sm">
        {isFree ? (
          <>
            Bạn đã được <b>MIỄN PHÍ VẬN CHUYỂN</b>
          </>
        ) : (
          <>
            Bạn cần mua thêm{' '}
            <span className="font-bold text-[#e8a200]">{formatVND(remaining)}</span> để được{' '}
            <b>MIỄN PHÍ VẬN CHUYỂN</b>
          </>
        )}
      </p>
      {/* Progress bar voi icon truck ben trong */}
      <div className="relative mt-2 h-7">
        {/* Track nen */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full" />
        {/* Filled bar + truck icon */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full transition-all duration-500"
          style={{
            width: `calc(${percent}% - ${percent > 5 ? '14px' : '0px'})`,
            background: isFree
              ? '#22c55e'
              : 'linear-gradient(to right, #f5c542, #e8a200)',
          }}
        />
        {/* Truck icon — di chuyen theo percent */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
          style={{ left: `${percent}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center',
              isFree ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500',
            )}
          >
            <Truck className="w-[18px] h-[18px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cart Drawer — slide-in tu phai, Torano style */
export function CartDrawer() {
  const isOpen = useUIStore((s) => s.isMiniCartOpen);
  const toggleCart = useUIStore((s) => s.toggleMiniCart);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const isEmpty = items.length === 0;

  // Lock body scroll khi drawer mo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC de dong
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') toggleCart(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, toggleCart]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[61] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold">Giỏ hàng</h2>
          <button
            onClick={toggleCart}
            className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
            aria-label="Đóng giỏ hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEmpty ? (
          /* === Trang thai trong === */
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            {/* Illustration — shopping bag buon */}
            <div className="w-[200px] h-[200px] relative mb-6 opacity-60">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Decorative clouds */}
                <rect x="20" y="40" width="50" height="12" rx="6" fill="#dbeafe" />
                <rect x="130" y="30" width="40" height="10" rx="5" fill="#dbeafe" />
                <rect x="10" y="70" width="30" height="8" rx="4" fill="#dbeafe" />
                <rect x="160" y="65" width="25" height="8" rx="4" fill="#dbeafe" />
                {/* Shopping bag */}
                <rect x="55" y="60" width="90" height="100" rx="6" fill="#e0e7ff" stroke="#93a3b8" strokeWidth="2" />
                <path d="M80 60V45a20 20 0 0 1 40 0v15" stroke="#93a3b8" strokeWidth="2" fill="none" />
                {/* Sad face */}
                <circle cx="85" cy="110" r="3" fill="#f87171" />
                <circle cx="115" cy="110" r="3" fill="#f87171" />
                <path d="M85 130q15-8 30 0" stroke="#93a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
                {/* Arms */}
                <path d="M55 120l-15 15" stroke="#93a3b8" strokeWidth="2" strokeLinecap="round" />
                <path d="M145 120l15 15" stroke="#93a3b8" strokeWidth="2" strokeLinecap="round" />
                {/* Stars */}
                <text x="40" y="55" fontSize="12" fill="#fbbf24">✦</text>
                <text x="150" y="50" fontSize="10" fill="#f87171">★</text>
                <text x="30" y="95" fontSize="8" fill="#93c5fd">✦</text>
                <text x="165" y="90" fontSize="10" fill="#fbbf24">✦</text>
              </svg>
            </div>
            <p className="text-gray-500 text-base mb-4">Chưa có sản phẩm trong giỏ hàng...</p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href={ROUTES.PRODUCTS}
                onClick={toggleCart}
                className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                Trở về trang sản phẩm
              </Link>
              <Link
                href={ROUTES.CATEGORY('sale')}
                onClick={toggleCart}
                className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
              >
                Khuyến mãi dành cho bạn
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Thanh mien phi van chuyen */}
            <ShippingProgressBar subtotal={subtotal} />

            {/* Danh sach san pham — scrollable */}
            <div className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <DrawerCartItem key={item.variantId} item={item} />
              ))}
            </div>

            {/* Footer — tong tien + CTA */}
            <div className="border-t px-5 py-4 space-y-3">
              {/* Tong tien */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase">Tổng tiền:</span>
                <span className="text-lg font-bold text-red-600">{formatVND(subtotal)}</span>
              </div>

              {/* Nut Thanh Toan */}
              <Link
                href={ROUTES.CHECKOUT}
                onClick={toggleCart}
                className="block w-full py-3 bg-red-600 text-white text-center font-bold uppercase text-sm tracking-wide hover:bg-red-700 transition"
              >
                Thanh toán
              </Link>

              {/* Link phu */}
              <div className="flex items-center justify-between text-sm">
                <Link
                  href={ROUTES.CART}
                  onClick={toggleCart}
                  className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                >
                  Xem giỏ hàng
                </Link>
                <Link
                  href={ROUTES.CATEGORY('sale')}
                  onClick={toggleCart}
                  className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                >
                  Khuyến mãi dành cho bạn
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
