'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ProductGallery } from '@/components/product/product-gallery';
import { ColorSwatches } from '@/components/product/color-swatches';
import { SizeSelector } from '@/components/product/size-selector';
import { QuantityStepper } from '@/components/product/quantity-stepper';
import { PriceDisplay } from '@/components/product/price-display';
import { ProductTabs } from '@/components/product/product-tabs';
import { RelatedProducts } from '@/components/product/related-products';
import { StickyBottomCTA } from '@/components/product/sticky-bottom-cta';
import { TrustBar } from '@/components/home/trust-bar';
import { BadgeSale, BadgeNew } from '@/components/product/badge-sale';
import { useCartStore } from '@/lib/stores/cart.store';
import { useWishlistStore } from '@/lib/stores/wishlist.store';
import { MOCK_PRODUCT_DETAIL, MOCK_REVIEWS, MOCK_PRODUCTS, MOCK_TRUST_BAR } from '@/lib/mock/data';

/**
 * Product Detail Page — /san-pham/[slug]
 * Gallery, variant selection, sticky CTA, tabs, related products
 */
export default function ProductDetailPage() {
  const router = useRouter();
  const product = MOCK_PRODUCT_DETAIL;
  const reviews = MOCK_REVIEWS;

  const addToCart = useCartStore((s) => s.addItem);
  const { hasItem: isWished, toggleItem: toggleWishlist } = useWishlistStore();

  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.id || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  // Loc sizes co san cho mau duoc chon
  const availableSizes = useMemo(() => {
    return product.sizes.map((size) => {
      const variant = product.variants.find(
        (v) => v.color_id === selectedColor && v.size_id === size.id,
      );
      return { ...size, available: variant ? variant.stock_qty > 0 : false };
    });
  }, [selectedColor, product.variants, product.sizes]);

  // Tim variant hien tai
  const currentVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return product.variants.find(
      (v) => v.color_id === selectedColor && v.size_id === selectedSize,
    ) || null;
  }, [selectedColor, selectedSize, product.variants]);

  const currentPrice = currentVariant?.price || product.price;
  const currentComparePrice = currentVariant?.compare_at_price || product.compare_at_price;

  const handleAddToCart = () => {
    if (!currentVariant) return;
    addToCart({
      variantId: currentVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      color: currentVariant.color_name,
      color_hex: currentVariant.color_hex,
      size: currentVariant.size_name,
      price: currentVariant.price,
      compare_at_price: currentVariant.compare_at_price,
      image: product.images[0]?.url || '',
      qty,
      sku: currentVariant.sku,
      max_qty: Math.min(currentVariant.stock_qty, 10),
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push(ROUTES.CART);
  };

  const canAddToCart = !!currentVariant && currentVariant.stock_qty > 0;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <Breadcrumb
          items={[
            { label: product.category_name, href: ROUTES.CATEGORY(product.category_slug) },
            { label: product.name },
          ]}
        />

        {/* Main layout: gallery + info */}
        <div className="mt-4 md:flex md:gap-8">
          {/* Gallery */}
          <div className="md:w-1/2">
            <ProductGallery images={product.images} />
          </div>

          {/* Product info */}
          <div className="mt-4 md:mt-0 md:w-1/2">
            {/* Badges */}
            <div className="flex gap-2 mb-2">
              {product.is_sale && product.discount_percent > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 font-semibold">
                  -{product.discount_percent}%
                </span>
              )}
              {product.is_new && (
                <span className="bg-black text-white text-xs px-2 py-0.5 font-semibold">NEW</span>
              )}
            </div>

            {/* Ten */}
            <h1 className="text-xl md:text-2xl font-bold">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn('w-4 h-4', s <= Math.round(product.avg_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.review_count} danh gia)</span>
            </div>

            {/* Gia */}
            <PriceDisplay price={currentPrice} compareAtPrice={currentComparePrice} size="lg" className="mt-3" />

            {/* Mo ta ngan */}
            <p className="text-sm text-gray-600 mt-3">{product.short_description}</p>

            {/* Color swatches */}
            <div className="mt-4">
              <label className="text-sm font-semibold block mb-2">
                Mau sac: {product.colors.find((c) => c.id === selectedColor)?.name}
              </label>
              <ColorSwatches
                colors={product.colors}
                selectedId={selectedColor}
                onChange={(id) => {
                  setSelectedColor(id);
                  setSelectedSize(null); // Reset size khi doi mau
                }}
              />
            </div>

            {/* Size selector */}
            <div className="mt-4">
              <label className="text-sm font-semibold block mb-2">
                Kich thuoc: {availableSizes.find((s) => s.id === selectedSize)?.name || 'Chon size'}
              </label>
              <SizeSelector
                sizes={availableSizes}
                selectedId={selectedSize}
                onChange={setSelectedSize}
              />
            </div>

            {/* Quantity */}
            <div className="mt-4">
              <label className="text-sm font-semibold block mb-2">So luong</label>
              <QuantityStepper
                value={qty}
                min={1}
                max={currentVariant ? Math.min(currentVariant.stock_qty, 10) : 10}
                onChange={setQty}
              />
              {currentVariant && currentVariant.stock_qty <= 5 && currentVariant.stock_qty > 0 && (
                <p className="text-xs text-orange-600 mt-1">Chi con {currentVariant.stock_qty} san pham</p>
              )}
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden lg:flex gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                THEM VAO GIO
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                MUA NGAY
              </button>
            </div>

            {/* Wishlist — desktop */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="hidden lg:flex items-center gap-2 mt-3 text-sm text-gray-500 hover:text-red-600 transition"
            >
              <Heart className={cn('w-4 h-4', isWished(product.id) ? 'fill-red-600 text-red-600' : '')} />
              {isWished(product.id) ? 'Da yeu thich' : 'Them yeu thich'}
            </button>

            {/* Trust badges compact */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>✓ Mien phi giao hang tu 500K</span>
              <span>✓ Hang chinh hang 100%</span>
              <span>✓ Doi tra 7 ngay</span>
              <span>✓ Ho tro 24/7</span>
            </div>
          </div>
        </div>

        {/* Tabs: Mo ta, Danh gia, Chinh sach */}
        <ProductTabs
          description={product.description}
          reviews={reviews}
          avgRating={product.avg_rating}
          reviewCount={product.review_count}
        />

        {/* Related products */}
        <RelatedProducts products={MOCK_PRODUCTS.slice(0, 5)} />
      </div>

      {/* Trust bar */}
      <TrustBar items={MOCK_TRUST_BAR} className="mt-8" />

      {/* Sticky CTA — mobile/tablet */}
      <StickyBottomCTA
        price={currentPrice}
        compareAtPrice={currentComparePrice}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        disabled={!canAddToCart}
      />
    </div>
  );
}
