'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
 * Mobile: anh, badge, ten, gia
 * Desktop: hover → "THEM VAO GIO" + eye icon, auto cycle anh
 * Hien +X mau sac, +X kich thuoc duoi anh
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { hasItem, toggleItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => setMounted(true), []);
  const isWished = mounted && hasItem(product.id);
  const isOutOfStock = product.stock_status === 'out_of_stock';

  // Danh sach anh
  const images = [product.image, product.image_hover].filter(Boolean) as string[];

  // Auto cycle anh khi hover
  const startCycle = useCallback(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1500);
  }, [images.length]);

  const stopCycle = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentImageIndex(0);
  }, []);

  useEffect(() => () => stopCycle(), [stopCycle]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    startCycle();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    stopCycle();
  };

  // SP khong co variant → them thang vao gio
  const hasVariants = product.colors.length > 0 || product.sizes.length > 0;

  return (
    <>
      <div
        className={cn('group relative', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Anh san pham */}
        <div className="block cursor-pointer" onClick={() => router.push(ROUTES.PRODUCT_DETAIL(product.slug))}>
          <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden relative">
            {/* Badge */}
            {isOutOfStock ? (
              <BadgeOutOfStock />
            ) : product.is_sale && product.discount_percent > 0 ? (
              <BadgeSale percent={product.discount_percent} />
            ) : product.is_new ? (
              <BadgeNew />
            ) : null}

            {/* Images — cycle khi hover */}
            {images.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={i === 0 ? product.name : `${product.name} - ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className={cn(
                  'object-cover transition-opacity duration-500',
                  i === currentImageIndex ? 'opacity-100' : 'opacity-0',
                  isOutOfStock && 'opacity-50',
                )}
                priority={i === 0}
              />
            ))}

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

            {/* Hover overlay — THEM VAO GIO + Eye icon */}
            {!isOutOfStock && (
              <div className="absolute inset-x-0 bottom-0 hidden md:flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 p-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickAdd(true);
                  }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded transition-colors shadow-lg"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  THEM VAO GIO
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(ROUTES.PRODUCT_DETAIL(product.slug));
                  }}
                  className="w-9 h-9 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-lg transition"
                  title="Xem chi tiet"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thong tin variant: +X mau sac, +X kich thuoc */}
        {hasVariants && (
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            {product.colors.length > 0 && (
              <span>+{product.colors.length} Mau sac</span>
            )}
            {product.sizes.length > 0 && (
              <span>+{product.sizes.length} Kich thuoc</span>
            )}
          </div>
        )}

        {/* Ten san pham */}
        <Link href={ROUTES.PRODUCT_DETAIL(product.slug)}>
          <h3 className="mt-1 text-sm font-medium line-clamp-2 text-gray-800 hover:text-black transition">
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
