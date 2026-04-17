'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { useCartStore } from '@/lib/stores/cart.store';
import { useWishlistStore } from '@/lib/stores/wishlist.store';
import { useCartToast } from '@/components/ui/cart-toast';
import { MOCK_PRODUCT_DETAIL, MOCK_REVIEWS, MOCK_PRODUCTS, MOCK_TRUST_BAR } from '@/lib/mock/data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

/** Map API variant data sang format cac component storefront expect */
interface ApiVariant {
  catProductVariantId: string;
  catProductVariantSku: string;
  catProductVariantPrice: number;
  catProductVariantComparePrice: number;
  catProductVariantCost: number;
  catProductVariantColor?: string | null;
  catProductVariantSize?: string | null;
  catProductVariantStatus: number;
  color?: { catColorId: string; catColorName: string; catColorHex: string } | null;
  size?: { catSizeId: string; catSizeValue: string } | null;
  bestSalePrice?: { salePrice: number; discountPct: number; campaignName: string } | null;
}

interface ApiProduct {
  catProductId: string;
  catProductName: string;
  catProductSlug: string;
  catProductDescription: string | null;
  catProductShortDesc: string | null;
  catProductBrand: string | null;
  catProductStatus: number;
  catProductIsFeatured: number;
  catProductIsNew: number;
  catCategoryId: string;
  catProductOrigin: string | null;
  catProductMaterial: string | null;
  catProductPackagingType: string | null;
  catProductCondition: string | null;
  catProductWeight: number;
  catProductLength: number;
  catProductWidth: number;
  catProductHeight: number;
  category?: { catCategoryId: string; catCategoryName: string };
  variants?: ApiVariant[];
  media?: { sysMediaId: string; sysMediaUrl: string; sysMediaAlt: string; sysMediaSort: number }[];
}

function mapApiToProduct(apiProduct: ApiProduct) {
  const variants = (apiProduct.variants || []).map((v) => ({
    id: v.catProductVariantId,
    sku: v.catProductVariantSku,
    color_id: v.color?.catColorId || '',
    color_name: v.color?.catColorName || v.catProductVariantColor || '',
    color_hex: v.color?.catColorHex || '#cccccc',
    size_id: v.size?.catSizeId || '',
    size_name: v.size?.catSizeValue || v.catProductVariantSize || '',
    price: Number(v.catProductVariantPrice),
    compare_at_price: Number(v.catProductVariantComparePrice),
    // Sale price tu BE — gia uu dai tot nhat tu campaign/flash sale
    sale_price: v.bestSalePrice?.salePrice ?? undefined,
    sale_discount_pct: v.bestSalePrice?.discountPct ?? 0,
    sale_campaign_name: v.bestSalePrice?.campaignName ?? undefined,
    stock_qty: 99,
    images: [],
  }));

  // Extract unique colors va sizes tu variants
  const colorMap = new Map<string, { id: string; name: string; hex: string }>();
  const sizeMap = new Map<string, { id: string; name: string }>();
  for (const v of variants) {
    if (v.color_id && !colorMap.has(v.color_id)) {
      colorMap.set(v.color_id, { id: v.color_id, name: v.color_name, hex: v.color_hex });
    }
    if (v.size_id && !sizeMap.has(v.size_id)) {
      sizeMap.set(v.size_id, { id: v.size_id, name: v.size_name });
    }
  }

  const images = (apiProduct.media || [])
    .sort((a, b) => a.sysMediaSort - b.sysMediaSort)
    .map((m) => ({ id: m.sysMediaId, url: m.sysMediaUrl, alt: m.sysMediaAlt || apiProduct.catProductName, sort_order: m.sysMediaSort }));

  return {
    id: apiProduct.catProductId,
    name: apiProduct.catProductName,
    slug: apiProduct.catProductSlug,
    description: apiProduct.catProductDescription || '',
    short_description: apiProduct.catProductShortDesc || '',
    category_id: apiProduct.catCategoryId,
    category_name: apiProduct.category?.catCategoryName || '',
    category_slug: '',
    brand: apiProduct.catProductBrand || '',
    price: variants[0]?.price || 0,
    compare_at_price: variants[0]?.compare_at_price || 0,
    discount_percent: 0,
    images,
    variants,
    colors: Array.from(colorMap.values()),
    sizes: Array.from(sizeMap.values()),
    avg_rating: 0,
    review_count: 0,
    is_new: apiProduct.catProductIsNew === 1,
    is_sale: false,
    is_bestseller: false,
    stock_status: 'in_stock' as const,
    // Thuoc tinh chi tiet san pham
    origin: apiProduct.catProductOrigin || null,
    material: apiProduct.catProductMaterial || null,
    packaging_type: apiProduct.catProductPackagingType || null,
    condition: apiProduct.catProductCondition || null,
    weight: apiProduct.catProductWeight || 0,
    length: apiProduct.catProductLength || 0,
    width: apiProduct.catProductWidth || 0,
    height: apiProduct.catProductHeight || 0,
  };
}

/**
 * Product Detail Page — /san-pham/[slug]
 * Gallery, variant selection, sticky CTA, tabs, related products
 * Fetch tu API, fallback mock neu API chua san sang
 */
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  // Fetch product tu API, fallback mock
  const [apiProduct, setApiProduct] = useState<ReturnType<typeof mapApiToProduct> | null>(null);
  const [, setLoadingApi] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoadingApi(true);
    fetch(`${API_BASE}/products/slug/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success !== false && json.data) {
          setApiProduct(mapApiToProduct(json.data));
        }
      })
      .catch(() => {
        // Fallback: dung mock data
      })
      .finally(() => setLoadingApi(false));
  }, [slug]);

  // Dung API product neu co, fallback mock
  const product = apiProduct || MOCK_PRODUCT_DETAIL;
  const reviews = MOCK_REVIEWS;

  const addToCart = useCartStore((s) => s.addItem);
  const showToast = useCartToast((s) => s.showToast);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const wishlistItems = useWishlistStore((s) => s.items);

  // Defer wishlist state de tranh hydration mismatch (localStorage chi co tren client)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const isWished = (id: string) => hydrated && wishlistItems.includes(id);

  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.id || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  // Auto-select size dau tien co hang khi color thay doi hoac mount
  useEffect(() => {
    if (!selectedColor) return;
    const firstAvailable = product.sizes.find((s) => {
      const variant = product.variants.find(
        (v) => v.color_id === selectedColor && v.size_id === s.id,
      );
      return variant && variant.stock_qty > 0;
    });
    setSelectedSize(firstAvailable?.id || null);
  }, [selectedColor, product.sizes, product.variants]);

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

  // Uu tien sale price tu BE (da tinh san trong bestSalePrice)
  const currentPrice = currentVariant?.sale_price ?? currentVariant?.price ?? product.price;
  const currentComparePrice = currentVariant?.sale_price
    ? (currentVariant?.price ?? product.price) // Khi co sale, gia goc la gia variant
    : (currentVariant?.compare_at_price || product.compare_at_price);

  const handleAddToCart = () => {
    if (!currentVariant) return;
    // Dung gia hien thi (sale price neu co) — khong dung gia goc khi dang KM
    const effectivePrice = currentVariant.sale_price ?? currentVariant.price;
    addToCart({
      variantId: currentVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      color: currentVariant.color_name,
      color_hex: currentVariant.color_hex,
      size: currentVariant.size_name,
      price: effectivePrice,
      compare_at_price: currentVariant.sale_price ? currentVariant.price : currentVariant.compare_at_price,
      image: product.images[0]?.url || '',
      qty,
      sku: currentVariant.sku,
      max_qty: Math.min(currentVariant.stock_qty, 10),
    });
    // Toast feedback — Nielsen #1: cho KH biet da them thanh cong
    showToast({
      name: product.name,
      image: product.images[0]?.url || '',
      color: currentVariant.color_name,
      size: currentVariant.size_name,
      price: effectivePrice,
      qty,
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
              <span className="text-sm text-gray-500">({product.review_count} đánh giá)</span>
            </div>

            {/* Gia */}
            <PriceDisplay price={currentPrice} compareAtPrice={currentComparePrice} size="lg" className="mt-3" />

            {/* Mo ta ngan */}
            <p className="text-sm text-gray-600 mt-3">{product.short_description}</p>

            {/* Color swatches */}
            <div className="mt-4">
              <label className="text-sm font-semibold block mb-2">
                Màu sắc: {product.colors.find((c) => c.id === selectedColor)?.name}
              </label>
              <ColorSwatches
                colors={product.colors}
                selectedId={selectedColor}
                onChange={(id) => {
                  setSelectedColor(id);
                  // selectedSize se duoc auto-select boi useEffect
                }}
              />
            </div>

            {/* Size selector — Baymard: size guide giam 50% ti le tra hang */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">
                  Kích thước: {availableSizes.find((s) => s.id === selectedSize)?.name || 'Chọn size'}
                </label>
                <button
                  type="button"
                  className="text-xs text-gray-500 underline underline-offset-2 hover:text-red-600 transition flex items-center gap-1"
                  onClick={() => {
                    // TODO: Mo size guide modal khi co data tu CMS
                    window.open('/trang/huong-dan-chon-size', '_blank');
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4l3-7 4 14 3-7h4" />
                  </svg>
                  Hướng dẫn chọn size
                </button>
              </div>
              <SizeSelector
                sizes={availableSizes}
                selectedId={selectedSize}
                onChange={setSelectedSize}
              />
            </div>

            {/* Quantity */}
            <div className="mt-4">
              <label className="text-sm font-semibold block mb-2">Số lượng</label>
              <QuantityStepper
                value={qty}
                min={1}
                max={currentVariant ? Math.min(currentVariant.stock_qty, 10) : 10}
                onChange={setQty}
              />
              {currentVariant && currentVariant.stock_qty <= 5 && currentVariant.stock_qty > 0 && (
                <p className="text-xs text-orange-600 mt-1">Chỉ còn {currentVariant.stock_qty} sản phẩm</p>
              )}
            </div>

            {/* Desktop + Tablet CTA buttons — md tro len */}
            <div className="hidden md:flex gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                THÊM VÀO GIỎ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                MUA NGAY
              </button>
            </div>

            {/* Wishlist — desktop + tablet */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="hidden md:flex items-center gap-2 mt-3 text-sm text-gray-500 hover:text-red-600 transition"
            >
              <Heart className={cn('w-4 h-4', isWished(product.id) ? 'fill-red-600 text-red-600' : '')} />
              {isWished(product.id) ? 'Đã yêu thích' : 'Thêm yêu thích'}
            </button>

            {/* Trust badges compact */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>✓ Miễn phí giao hàng từ 500K</span>
              <span>✓ Hàng chính hãng 100%</span>
              <span>✓ Đổi trả 7 ngày</span>
              <span>✓ Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>

        {/* Tabs: Mo ta, Danh gia, Chinh sach */}
        <ProductTabs
          description={product.description}
          reviews={reviews}
          avgRating={product.avg_rating}
          reviewCount={product.review_count}
          attributes={{
            origin: product.origin ?? null,
            material: product.material ?? null,
            packagingType: product.packaging_type ?? null,
            condition: product.condition ?? null,
            weight: product.weight ?? 0,
            length: product.length ?? 0,
            width: product.width ?? 0,
            height: product.height ?? 0,
          }}
        />

        {/* Related products */}
        <RelatedProducts products={MOCK_PRODUCTS.slice(0, 10)} />
      </div>

      {/* Trust bar */}
      <TrustBar items={MOCK_TRUST_BAR} className="mt-8" />

      {/* Sticky bottom bar — Torano style, hien khi scroll qua product info */}
      <StickyBottomCTA
        image={product.images[0]?.url || ''}
        productName={product.name}
        price={currentPrice}
        compareAtPrice={currentComparePrice}
        colors={product.colors}
        selectedColorId={selectedColor}
        onColorChange={(id) => { setSelectedColor(id); }}
        sizes={availableSizes}
        selectedSizeId={selectedSize}
        onSizeChange={setSelectedSize}
        qty={qty}
        maxQty={currentVariant ? Math.min(currentVariant.stock_qty, 10) : 10}
        onQtyChange={setQty}
        onBuyNow={handleBuyNow}
        disabled={!canAddToCart}
      />
    </div>
  );
}
