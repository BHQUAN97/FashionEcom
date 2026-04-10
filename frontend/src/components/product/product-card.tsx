'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { useWishlistStore } from '@/lib/stores/wishlist.store';
import type { ProductListItem } from '@/types/product';
import { PriceDisplay } from './price-display';
import { BadgeSale, BadgeNew, BadgeOutOfStock } from './badge-sale';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

/**
 * Product Card — Torano style
 * Mobile: anh vuong, badge, ten 2 dong, gia gach + gia do
 * Desktop: hover → secondary image + Quick View
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const { hasItem, toggleItem } = useWishlistStore();
  const isWished = hasItem(product.id);
  const isOutOfStock = product.stock_status === 'out_of_stock';

  return (
    <div className={cn('group relative', className)}>
      {/* Anh san pham */}
      <Link href={ROUTES.PRODUCT_DETAIL(product.slug)} className="block">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
          {/* Badge */}
          {isOutOfStock ? (
            <BadgeOutOfStock />
          ) : product.is_sale && product.discount_percent > 0 ? (
            <BadgeSale percent={product.discount_percent} />
          ) : product.is_new ? (
            <BadgeNew />
          ) : null}

          {/* Main image */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
            className={cn(
              'object-cover transition-opacity duration-300',
              product.image_hover ? 'group-hover:opacity-0' : '',
              isOutOfStock && 'opacity-50',
            )}
          />

          {/* Hover image — chi desktop */}
          {product.image_hover && (
            <Image
              src={product.image_hover}
              alt={`${product.name} hover`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block"
            />
          )}

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product.id);
            }}
            className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition"
            aria-label={isWished ? 'Bo yeu thich' : 'Them yeu thich'}
          >
            <Heart
              className={cn('w-4 h-4', isWished ? 'fill-red-600 text-red-600' : 'text-gray-500')}
            />
          </button>

          {/* Quick View — desktop only */}
          <div className="absolute inset-x-0 bottom-0 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/70 text-white text-center py-2 text-xs font-medium">
              XEM NHANH
            </div>
          </div>
        </div>
      </Link>

      {/* Color dots */}
      {product.colors.length > 1 && (
        <div className="flex gap-1 mt-2">
          {product.colors.map((c) => (
            <span
              key={c.id}
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: c.hex }}
              title={c.hex}
            />
          ))}
        </div>
      )}

      {/* Ten san pham — 2 dong max */}
      <Link href={ROUTES.PRODUCT_DETAIL(product.slug)}>
        <h3 className="mt-1.5 text-sm font-medium line-clamp-2 text-gray-800 hover:text-black transition">
          {product.name}
        </h3>
      </Link>

      {/* Gia */}
      <PriceDisplay
        price={product.price}
        compareAtPrice={product.compare_at_price}
        size="sm"
        className="mt-1"
      />
    </div>
  );
}
