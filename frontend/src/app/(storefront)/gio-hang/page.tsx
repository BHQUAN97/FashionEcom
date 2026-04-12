'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useCartStore } from '@/lib/stores/cart.store';
import { CartItemRow } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { FreeShipBar } from '@/components/cart/free-ship-bar';
import { CouponInput } from '@/components/cart/coupon-input';
import { RelatedProducts } from '@/components/product/related-products';
import { MOCK_PRODUCTS } from '@/lib/mock/data';

/**
 * Cart page — /gio-hang
 * Item list, qty stepper, freeship bar, coupon, summary, upsell
 */
export default function CartPage() {
  const { items, updateQty, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold mt-4">Giỏ hàng trống</h2>
        <p className="text-gray-500 mt-2">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Link
          href={ROUTES.PRODUCTS}
          className="inline-block mt-4 px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
        >
          TIẾP TỤC MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
      <h1 className="text-lg md:text-2xl font-bold mb-4">
        Giỏ hàng <span className="text-gray-400 font-normal">({items.length})</span>
      </h1>

      <div className="md:flex md:gap-8">
        {/* Items list */}
        <div className="flex-1">
          <FreeShipBar currentTotal={subtotal} className="mb-4" />

          {items.map((item) => (
            <CartItemRow
              key={item.variantId}
              item={item}
              onUpdateQty={(qty) => updateQty(item.variantId, qty)}
              onRemove={() => removeItem(item.variantId)}
            />
          ))}

          <CouponInput className="mt-4" />
        </div>

        {/* Summary — desktop: sticky sidebar */}
        <div className="md:w-80 flex-shrink-0 mt-6 md:mt-0">
          <div className="md:sticky md:top-20 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Tổng đơn hàng</h3>
            <CartSummary subtotal={subtotal} />
            <Link
              href={ROUTES.CHECKOUT}
              className="block text-center w-full mt-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              TIẾN HÀNH THANH TOÁN
            </Link>
            <Link
              href={ROUTES.PRODUCTS}
              className="block text-center text-sm text-gray-500 hover:underline mt-3"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      {/* Upsell — san pham goi y */}
      <RelatedProducts products={MOCK_PRODUCTS.slice(8, 13)} className="mt-8" />

      {/* Sticky CTA — mobile */}
      <div className="fixed bottom-14 inset-x-0 z-40 bg-white border-t px-4 py-3 md:hidden">
        <Link
          href={ROUTES.CHECKOUT}
          className="block text-center w-full py-3 bg-red-600 text-white font-semibold rounded-lg"
        >
          THANH TOÁN ({items.length} SP)
        </Link>
      </div>
    </div>
  );
}
