'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { useWishlistStore } from '@/lib/stores/wishlist.store';
import type { ProductListItem } from '@/types/product';
import { PriceDisplay } from './price-display';
import { BadgeSale, BadgeNew, BadgeOutOfStock } from './badge-sale';
import { QuickAddPopup } from './quick-add-popup';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

/**
 * Product Card — Torano style
 * Desktop: hover → first image fade out, second image scale3d(1.1) + actions slide up
 * Mobile: anh, badge, ten, gia, icon add-to-cart tron goc phai
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { hasItem, toggleItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => setMounted(true), []);
  const isWished = mounted && hasItem(product.id);
  const isOutOfStock = product.stock_status === 'out_of_stock';

  // Danh sach anh
  const images = [product.image, product.image_hover].filter(Boolean) as string[];
  const hasSecondImage = images.length > 1;

  // SP khong co variant → them thang vao gio
  const hasVariants = product.colors.length > 0 || product.sizes.length > 0;

  return (
    <>
      <div className={cn('product-loop group relative', className)}>
        {/* Product inner — Torano structure */}
        <div className="product-inner bg-white h-full flex flex-col justify-between relative overflow-hidden transition-all duration-400">
          {/* Anh san pham — proloop-image */}
          <div
            className="relative overflow-hidden cursor-pointer"
            onClick={() => router.push(ROUTES.PRODUCT_DETAIL(product.slug))}
          >
            {/* Badge — Torano: rounded pill, top-left 10px */}
            {(() => {
              const salePct = product.sale_price && product.price > 0
                ? Math.round((1 - product.sale_price / product.price) * 100)
                : product.discount_percent;
              if (isOutOfStock) return <BadgeOutOfStock />;
              if (salePct && salePct > 0) return <BadgeSale percent={salePct} />;
              if (product.is_new) return <BadgeNew />;
              return null;
            })()}

            {/* Images — Torano: first/second swap voi opacity + scale3d */}
            <div className="proloop-image-inner aspect-[4/5] bg-gray-100">
              {images[0] && (
                <Image
                  src={images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  className={cn(
                    'img-first object-cover',
                    isOutOfStock && 'opacity-50',
                  )}
                  loading="lazy"
                />
              )}
              {hasSecondImage && (
                <Image
                  src={images[1]}
                  alt={`${product.name} - hover`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  className="img-second object-cover"
                />
              )}
            </div>

            {/* Overlay link */}
            <Link
              href={ROUTES.PRODUCT_DETAIL(product.slug)}
              className="absolute inset-0 z-[2]"
              aria-label={product.name}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Wishlist — Torano: icon goc phai tren */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(product.id);
              }}
              className="absolute top-2 right-2 z-10 w-[30px] h-[30px] flex items-center justify-center rounded bg-white/90 hover:bg-white transition"
              aria-label={isWished ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
            >
              <Heart
                className={cn('w-4 h-4', isWished ? 'fill-red-600 text-red-600' : 'text-gray-500')}
              />
            </button>

            {/* Actions — Torano: slide up from bottom on hover */}
            {!isOutOfStock && (
              <div className="proloop-actions">
                <div className="flex w-full gap-2.5">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowQuickAdd(true);
                    }}
                    className="btn-sweep btn-sweep-light flex-1 !py-2 !px-3 !text-xs !rounded shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    THÊM VÀO GIỎ
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(ROUTES.PRODUCT_DETAIL(product.slug));
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded bg-[#333] text-white hover:bg-black transition"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile: icon add-to-cart — Fitts's Law: min 44px touch target */}
            {!isOutOfStock && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuickAdd(true);
                }}
                className="md:hidden absolute bottom-1.5 right-1.5 z-10 w-9 h-9 flex items-center justify-center bg-[#333] rounded-full active:scale-95 transition-transform"
                aria-label="Thêm vào giỏ"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Detail — proloop-detail */}
          <div className="relative p-2 flex flex-col flex-1">
            {/* Variant indicators */}
            {hasVariants && (
              <div className="flex gap-3 mb-1.5 text-xs text-gray-500">
                {product.colors.length > 0 && (
                  <span>+{product.colors.length} Màu sắc</span>
                )}
                {product.sizes.length > 0 && (
                  <span>+{product.sizes.length} Kích thước</span>
                )}
              </div>
            )}

            {/* Ten san pham — Torano: 14px, font-500, line-clamp-2 */}
            <Link href={ROUTES.PRODUCT_DETAIL(product.slug)}>
              <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5em] mb-1 text-[var(--shop-color-text)] hover:text-[var(--shop-color-hover)] transition">
                {product.name}
              </h3>
            </Link>

            {/* Gia — uu tien sale_price tu campaign/flash sale */}
            <PriceDisplay
              price={product.sale_price ?? product.price}
              compareAtPrice={product.sale_price ? product.price : product.compare_at_price}
              size="sm"
              className="mt-auto"
            />
          </div>
        </div>
      </div>

      {/* Quick Add Popup */}
      {showQuickAdd && (
        <QuickAddPopup
          product={product}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </>
  );
}
