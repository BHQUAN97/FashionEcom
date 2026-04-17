import dynamic from 'next/dynamic';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryGrid } from '@/components/home/category-grid';
import {
  MOCK_HERO_SLIDES,
  MOCK_FLASH_SALE,
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_TRUST_BAR,
} from '@/lib/mock/data';

// Below-the-fold — lazy load, chi tai khi user scroll xuong
const FlashSaleCountdown = dynamic(
  () => import('@/components/home/flash-sale-countdown').then(m => ({ default: m.FlashSaleCountdown })),
  { ssr: false },
);
const SaleCarousel = dynamic(
  () => import('@/components/home/sale-carousel').then(m => ({ default: m.SaleCarousel })),
  { ssr: false },
);
const CollectionBanner = dynamic(
  () => import('@/components/home/collection-banner').then(m => ({ default: m.CollectionBanner })),
);
const FeaturedProducts = dynamic(
  () => import('@/components/home/featured-products').then(m => ({ default: m.FeaturedProducts })),
  { ssr: false },
);
const OutfitOfDay = dynamic(
  () => import('@/components/home/outfit-of-day').then(m => ({ default: m.OutfitOfDay })),
);
const CategoryProductTabs = dynamic(
  () => import('@/components/home/category-product-tabs').then(m => ({ default: m.CategoryProductTabs })),
  { ssr: false },
);
const TrustBar = dynamic(
  () => import('@/components/home/trust-bar').then(m => ({ default: m.TrustBar })),
);
const NewsletterSignup = dynamic(
  () => import('@/components/home/newsletter-signup').then(m => ({ default: m.NewsletterSignup })),
  { ssr: false },
);

// --- Section data tu mock ---

/** Danh muc grid — 8 danh muc chinh Torano */
const CATEGORY_GRID = MOCK_CATEGORIES.slice(0, 8).map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  image: c.image,
}));

/** San pham khuyen mai — loc san pham dang sale */
const SALE_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.is_sale);

/** Tabs san pham noi bat — chia theo loai san pham */
const FEATURED_TABS = [
  { label: 'SẢN PHẨM NỔI BẬT', products: MOCK_PRODUCTS.filter((p) => p.is_bestseller || p.is_new).slice(0, 10) },
  { label: 'ÁO POLO', products: MOCK_PRODUCTS.slice(0, 6) },
  { label: 'ÁO KHOÁC', products: MOCK_PRODUCTS.slice(24, 30) },
  { label: 'QUẦN ÂU & JEANS', products: MOCK_PRODUCTS.slice(18, 24) },
];

/** Outfit of the day — anh set combo Torano */
const OUTFITS = [
  { id: 'o1', image: '/images/theme/home_set_combo_1_img.jpg', label: 'OUTFIT ĐI LÀM', link: '/danh-muc/ao-polo' },
  { id: 'o2', image: '/images/theme/home_set_combo_2_img.jpg', label: 'OUTFIT ĐI CHƠI', link: '/danh-muc/ao-thun' },
  { id: 'o3', image: '/images/theme/home_set_combo_3_img.jpg', label: 'OUTFIT LỊCH LÃM', link: '/danh-muc/ao-khoac' },
];

/** Category tabs — danh muc san pham chi tiet */
const CATEGORY_TABS = [
  { label: 'Áo Polo', slug: 'ao-polo', products: MOCK_PRODUCTS.slice(0, 6) },
  { label: 'Quần Short', slug: 'quan-short', products: MOCK_PRODUCTS.slice(12, 18) },
  { label: 'Áo Sơ Mi', slug: 'ao-so-mi', products: MOCK_PRODUCTS.slice(30, 36) },
  { label: 'Áo Khoác', slug: 'ao-khoac', products: MOCK_PRODUCTS.slice(24, 30) },
];

/**
 * Homepage — Torano.vn inspired layout
 * Sections: Hero > Category Grid > Flash Sale > Sale Carousel > BST Banner >
 *   Featured Tabs > Outfit of Day > Category Tabs > Trust Bar > Newsletter
 */
export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Banner — above-the-fold, load ngay */}
      <HeroBanner slides={MOCK_HERO_SLIDES} />

      {/* 2. DANH MUC SAN PHAM — above-the-fold, load ngay */}
      <CategoryGrid categories={CATEGORY_GRID} />

      {/* 3. Flash Sale — lazy load, co carousel + timer */}
      <FlashSaleCountdown data={MOCK_FLASH_SALE} />

      {/* 4. SAN PHAM KHUYEN MAI — lazy load */}
      <SaleCarousel products={SALE_PRODUCTS} />

      {/* 5. BST Banner — lazy load */}
      <CollectionBanner
        image="/images/theme/a1.png"
        title="BỘ SƯU TẬP HÈ 2026"
        subtitle="NEW COLLECTION"
        ctaText="KHÁM PHÁ NGAY"
        ctaLink="/bo-suu-tap/he-2026"
      />

      {/* 6. SAN PHAM NOI BAT — lazy load */}
      <FeaturedProducts tabs={FEATURED_TABS} />

      {/* 7. OUTFIT OF THE DAY — lazy load */}
      <OutfitOfDay outfits={OUTFITS} />

      {/* 8. Category Tabs — lazy load */}
      <CategoryProductTabs tabs={CATEGORY_TABS} />

      {/* 9. Trust Bar — lazy load */}
      <TrustBar items={MOCK_TRUST_BAR} />

      {/* 10. Newsletter — lazy load */}
      <NewsletterSignup />
    </div>
  );
}
