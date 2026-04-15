'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cart.store';
import { useUIStore } from '@/lib/stores/ui.store';
import { ROUTES } from '@/lib/constants/routes';
import type { ProductListItem } from '@/types/product';
import { PriceDisplay } from './price-display';

interface QuickAddPopupProps {
  product: ProductListItem;
  onClose: () => void;
}

/**
 * Quick Add Popup — Torano style
 * Trai: anh lon + thumbnails + nav arrows
 * Phai: ten, SKU, tinh trang, gia, mau sac (text buttons), kich thuoc, so luong, THEM VAO GIO
 */
export function QuickAddPopup({ product, onClose }: QuickAddPopupProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const openMiniCart = useUIStore((s) => s.openMiniCart);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.id || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  // Danh sach anh
  const images = [product.image, product.image_hover].filter(Boolean) as string[];

  // ESC de dong
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const prevImg = useCallback(() => setCurrentImg((p) => (p - 1 + images.length) % images.length), [images.length]);
  const nextImg = useCallback(() => setCurrentImg((p) => (p + 1) % images.length), [images.length]);

  // Ton kho theo mau + size
  const sizeStock = useMemo(() => {
    const map: Record<string, number> = {};
    product.sizes.forEach((s) => {
      const variant = product.variants.find(
        (v) => v.color_id === selectedColor && v.size_id === s.id,
      );
      map[s.id] = variant?.stock_qty ?? 0;
    });
    return map;
  }, [selectedColor, product.variants, product.sizes]);

  // Variant hien tai
  const currentVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return product.variants.find(
      (v) => v.color_id === selectedColor && v.size_id === selectedSize,
    ) || null;
  }, [selectedColor, selectedSize, product.variants]);

  const maxQty = currentVariant ? Math.min(currentVariant.stock_qty, 10) : 10;
  const canAdd = !!currentVariant && currentVariant.stock_qty > 0;
  const isInStock = product.stock_status !== 'out_of_stock';

  const handleAdd = () => {
    if (!currentVariant || !selectedColor || !selectedSize) return;
    const color = product.colors.find((c) => c.id === selectedColor);
    const size = product.sizes.find((s) => s.id === selectedSize);
    addToCart({
      variantId: currentVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      color: color?.name || '',
      color_hex: color?.hex || '#000',
      size: size?.name || '',
      price: currentVariant.price,
      compare_at_price: currentVariant.compare_at_price,
      image: product.image,
      qty,
      sku: currentVariant.sku,
      max_qty: maxQty,
    });
    setAdded(true);
    // Dong quick-add popup roi mo cart drawer
    setTimeout(() => {
      onClose();
      openMiniCart();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nut dong */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="md:flex">
          {/* === BEN TRAI: Anh san pham === */}
          <div className="md:w-1/2 p-4 md:p-6">
            {/* Anh chinh + nav arrows */}
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
              {images.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt={product.name}
                  fill
                  sizes="450px"
                  className={cn(
                    'object-cover transition-opacity duration-300',
                    i === currentImg ? 'opacity-100' : 'opacity-0',
                  )}
                />
              ))}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={cn(
                      'w-16 h-16 rounded border-2 overflow-hidden transition flex-shrink-0',
                      i === currentImg ? 'border-red-600' : 'border-transparent hover:border-gray-300',
                    )}
                  >
                    <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* === BEN PHAI: Thong tin + chon variant === */}
          <div className="md:w-1/2 p-4 md:p-6 md:pl-2">
            {/* Ten SP */}
            <h2 className="text-lg font-bold leading-snug pr-8">{product.name}</h2>

            {/* SKU + Tinh trang */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-gray-400">SKU: {product.slug.toUpperCase()}</span>
              <span className="text-gray-300">|</span>
              <span className={isInStock ? 'text-green-600' : 'text-red-500'}>
                {isInStock ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>

            {/* Gia + Badge giam gia */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <span className="text-sm text-gray-500">Giá:</span>
              <PriceDisplay
                price={currentVariant?.price || product.price}
                compareAtPrice={currentVariant?.compare_at_price || product.compare_at_price}
                size="lg"
              />
              {product.discount_percent > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                  -{product.discount_percent}%
                </span>
              )}
            </div>

            {/* Mau sac — text buttons voi border + check */}
            {product.colors.length > 0 && (
              <div className="mt-5">
                <label className="text-sm font-semibold mb-2 block">
                  Màu sắc: <span className="text-red-600">{product.colors.find((c) => c.id === selectedColor)?.name}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((c) => {
                    const isSelected = c.id === selectedColor;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedColor(c.id);
                          setSelectedSize(null);
                          setQty(1);
                        }}
                        className={cn(
                          'relative flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition',
                          isSelected
                            ? 'border-red-600 text-red-600 bg-red-50'
                            : 'border-gray-200 hover:border-gray-400',
                        )}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                        {isSelected && <Check className="w-3 h-3 text-red-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kich thuoc — check ton kho theo mau */}
            {product.sizes.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-semibold mb-2 block">Kích thước:</label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => {
                    const stock = sizeStock[s.id] ?? 0;
                    const isOOS = stock === 0;
                    const isSelected = s.id === selectedSize;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (isOOS) return;
                          setSelectedSize(s.id);
                          setQty(1);
                        }}
                        disabled={isOOS}
                        className={cn(
                          'min-w-[48px] h-10 px-3 text-sm font-medium rounded-lg border transition-all',
                          isSelected
                            ? 'border-red-600 text-red-600 bg-red-50'
                            : isOOS
                              ? 'border-gray-100 bg-gray-50 text-gray-300 line-through cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-400',
                        )}
                      >
                        {s.name}
                        {isSelected && <Check className="w-3 h-3 inline ml-1" />}
                      </button>
                    );
                  })}
                </div>
                {currentVariant && currentVariant.stock_qty > 0 && currentVariant.stock_qty <= 5 && (
                  <p className="text-xs text-orange-600 mt-1.5">Chỉ còn {currentVariant.stock_qty} sản phẩm</p>
                )}
              </div>
            )}

            {/* So luong */}
            <div className="mt-4 flex items-center gap-4">
              <label className="text-sm font-semibold">Số lượng:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition border-r"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(maxQty, qty + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition border-l"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nut THEM VAO GIO — do noi bat */}
            <button
              onClick={handleAdd}
              disabled={!canAdd || added}
              className={cn(
                'w-full mt-5 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-all',
                added
                  ? 'bg-green-600 text-white'
                  : canAdd
                    ? 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              {added
                ? '✓ ĐÃ THÊM VÀO GIỎ HÀNG'
                : !selectedSize && product.sizes.length > 0
                  ? 'VUI LÒNG CHỌN KÍCH THƯỚC'
                  : !canAdd
                    ? 'HẾT HÀNG'
                    : 'THÊM VÀO GIỎ'}
            </button>

            {/* Link xem chi tiet */}
            <div className="mt-3 text-center">
              <Link
                href={ROUTES.PRODUCT_DETAIL(product.slug)}
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-red-600 underline underline-offset-2 transition"
              >
                Xem chi tiết sản phẩm &raquo;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
