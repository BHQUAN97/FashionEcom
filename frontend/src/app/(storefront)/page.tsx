'use client';

import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryGrid } from '@/components/home/category-grid';
import { SaleCarousel } from '@/components/home/sale-carousel';
import { CollectionBanner } from '@/components/home/collection-banner';
import { FeaturedProducts } from '@/components/home/featured-products';
import { OutfitOfDay } from '@/components/home/outfit-of-day';
import { CategoryProductTabs } from '@/components/home/category-product-tabs';
import { FlashSaleCountdown } from '@/components/home/flash-sale-countdown';
import { TrustBar } from '@/components/home/trust-bar';
import { NewsletterSignup } from '@/components/home/newsletter-signup';
import {
  MOCK_HERO_SLIDES,
  MOCK_FLASH_SALE,
  MOCK_PRODUCTS,
  MOCK_TRUST_BAR,
} from '@/lib/mock/data';

// Placeholder image helper
const IMG = (w: number, h: number, text = '') =>
  `https://placehold.co/${w}x${h}/e5e7eb/9ca3af.png?text=${encodeURIComponent(text || `${w}x${h}`)}`;

// --- Mock data cho cac section moi ---

/** Danh muc grid — 4 danh muc chinh voi lifestyle images */
const CATEGORY_GRID = [
  { id: '1', name: 'Polo', slug: 'ao-polo', image: IMG(600, 800, 'Polo') },
  { id: '2', name: 'Ao Thun', slug: 'ao-thun', image: IMG(600, 800, 'Ao+Thun') },
  { id: '3', name: 'Quan Short', slug: 'quan-short', image: IMG(600, 800, 'Quan+Short') },
  { id: '4', name: 'Quan Au', slug: 'quan-tay', image: IMG(600, 800, 'Quan+Au') },
];

/** San pham khuyen mai — loc san pham dang sale */
const SALE_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.is_sale);

/** Tabs san pham noi bat */
const FEATURED_TABS = [
  { label: 'SẢN PHẨM NỔI BẬT', products: MOCK_PRODUCTS.slice(0, 10) },
  { label: 'ĐỒ THU ĐÔNG', products: MOCK_PRODUCTS.slice(4, 14) },
  { label: 'ĐỒ CÔNG SỞ', products: MOCK_PRODUCTS.slice(2, 12) },
  { label: 'ĐỒ THỂ THAO', products: MOCK_PRODUCTS.slice(6, 16) },
];

/** Outfit of the day */
const OUTFITS = [
  { id: 'o1', image: IMG(600, 800, 'OUTFIT+DI+LAM'), label: 'OUTFIT DI LAM', link: '/bo-suu-tap/di-lam' },
  { id: 'o2', image: IMG(600, 800, 'OUTFIT+DI+CHOI'), label: 'OUTFIT DI CHOI', link: '/bo-suu-tap/di-choi' },
  { id: 'o3', image: IMG(600, 800, 'OUTFIT+LICH+LAM'), label: 'OUTFIT LICH LAM', link: '/bo-suu-tap/lich-lam' },
];

/** Category tabs — danh muc san pham chi tiet */
const CATEGORY_TABS = [
  { label: 'Ao Polo', slug: 'ao-polo', products: MOCK_PRODUCTS.slice(0, 5) },
  { label: 'Quan Short', slug: 'quan-short', products: MOCK_PRODUCTS.slice(5, 10) },
  { label: 'So mi - Quan dai', slug: 'ao-so-mi', products: MOCK_PRODUCTS.slice(10, 15) },
  { label: 'Ao Khoac', slug: 'ao-khoac', products: MOCK_PRODUCTS.slice(15, 20) },
];

/**
 * Homepage — Torano.vn inspired layout
 * Sections: Hero > Category Grid > Flash Sale > Sale Carousel > BST Banner >
 *   Featured Tabs > Outfit of Day > Category Tabs > Trust Bar > Newsletter
 */
export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Banner — swipe carousel, giu nguyen */}
      <HeroBanner slides={MOCK_HERO_SLIDES} />

      {/* 2. DANH MUC SAN PHAM — 4-column image grid */}
      <CategoryGrid categories={CATEGORY_GRID} />

      {/* 3. Flash Sale — countdown + product scroll */}
      <FlashSaleCountdown data={MOCK_FLASH_SALE} />

      {/* 4. SAN PHAM KHUYEN MAI — horizontal carousel voi arrows */}
      <SaleCarousel products={SALE_PRODUCTS} />

      {/* 5. BST Banner — full-width lifestyle banner */}
      <CollectionBanner
        image={IMG(1440, 400, 'BO+SUU+TAP+HE+2026')}
        title="BỘ SƯU TẬP HÈ 2026"
        subtitle="NEW COLLECTION"
        ctaText="KHÁM PHÁ NGAY"
        ctaLink="/bo-suu-tap/he-2026"
      />

      {/* 6. SAN PHAM NOI BAT — tabbed product grid */}
      <FeaturedProducts tabs={FEATURED_TABS} />

      {/* 7. OUTFIT OF THE DAY — 3-column lifestyle images */}
      <OutfitOfDay outfits={OUTFITS} />

      {/* 8. Category Tabs — danh muc san pham chi tiet */}
      <CategoryProductTabs tabs={CATEGORY_TABS} />

      {/* 9. Trust Bar */}
      <TrustBar items={MOCK_TRUST_BAR} />

      {/* 10. Newsletter */}
      <NewsletterSignup />
    </div>
  );
}
