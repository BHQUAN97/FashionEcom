'use client';

import Link from 'next/link';
import { useWishlistStore } from '@/lib/stores/wishlist.store';
import { ProductGrid } from '@/components/product/product-grid';
import { MOCK_PRODUCTS } from '@/lib/mock/data';
import { ROUTES } from '@/lib/constants/routes';

/** Wishlist grid — reuse ProductGrid, heart toggle remove */
export function WishlistGrid() {
  const { items } = useWishlistStore();

  // Loc san pham theo wishlist IDs
  const products = MOCK_PRODUCTS.filter((p) => items.includes(p.id));

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">💜</p>
        <p className="text-gray-500">Chưa có sản phẩm yêu thích nào</p>
        <Link href={ROUTES.PRODUCTS} className="text-sm text-red-600 hover:underline mt-2 inline-block">
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Sản phẩm yêu thích ({products.length})</h2>
      <ProductGrid products={products} columns={4} />
    </div>
  );
}
