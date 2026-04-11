/** Mock data cho development — thay the khi co backend thuc */

import type { ProductListItem, Product, Review } from '@/types/product';
import type { Category } from '@/types/category';
import type { HeroBannerSlide, TrustBarItem, FlashSaleData } from '@/types/common';
import type { Order } from '@/types/order';
import type { Address } from '@/types/address';

// Placeholder image URL (gray square)
const IMG = (w: number, h: number, text = '') =>
  `https://placehold.co/${w}x${h}/e5e7eb/9ca3af.png?text=${encodeURIComponent(text || `${w}x${h}`)}`;

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Ao Polo', slug: 'ao-polo', description: '', image: IMG(400, 400, 'Ao Polo'), parent_id: null, children: [], product_count: 45, sort_order: 1 },
  { id: '2', name: 'Ao So Mi', slug: 'ao-so-mi', description: '', image: IMG(400, 400, 'Ao So Mi'), parent_id: null, children: [], product_count: 32, sort_order: 2 },
  { id: '3', name: 'Quan Tay', slug: 'quan-tay', description: '', image: IMG(400, 400, 'Quan Tay'), parent_id: null, children: [], product_count: 28, sort_order: 3 },
  { id: '4', name: 'Quan Jeans', slug: 'quan-jeans', description: '', image: IMG(400, 400, 'Quan Jeans'), parent_id: null, children: [], product_count: 36, sort_order: 4 },
  { id: '5', name: 'Phu Kien', slug: 'phu-kien', description: '', image: IMG(400, 400, 'Phu Kien'), parent_id: null, children: [], product_count: 20, sort_order: 5 },
  { id: '6', name: 'Sale', slug: 'sale', description: '', image: IMG(400, 400, 'Sale'), parent_id: null, children: [], product_count: 15, sort_order: 6 },
];

export const MOCK_PRODUCTS: ProductListItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: [
    'Ao Polo Nam Cao Cap Classic Fit',
    'Ao So Mi Nam Slim Fit Oxford',
    'Quan Tay Nam Lich Lam Wool Blend',
    'Quan Jeans Nam Straight Fit',
    'Ao Khoac Blazer Nam 2 Lop',
    'Ao Thun Nam Cotton Premium',
    'Quan Short Nam Chino',
    'Ao Vest Nam Cao Cap Italian Wool',
  ][i % 8],
  slug: `san-pham-${i + 1}`,
  price: [590000, 450000, 890000, 650000, 1290000, 350000, 490000, 2490000][i % 8],
  compare_at_price: [750000, 590000, 1190000, 790000, 1590000, 450000, 650000, 2990000][i % 8],
  discount_percent: [21, 24, 25, 18, 19, 22, 25, 17][i % 8],
  image: IMG(400, 400, `SP${i + 1}`),
  image_hover: IMG(400, 400, `SP${i + 1}+`),
  avg_rating: 4 + (i % 3) * 0.3,
  review_count: 10 + i * 3,
  is_new: i < 4,
  is_sale: i % 3 === 0,
  is_bestseller: i % 5 === 0,
  stock_status: i === 7 ? 'out_of_stock' : 'in_stock',
  colors: [
    { id: 'c1', hex: '#1a1a1a' },
    { id: 'c2', hex: '#1e3a5f' },
    { id: 'c3', hex: '#8b4513' },
  ].slice(0, (i % 3) + 1),
}));

/** Chi tiet san pham day du */
export const MOCK_PRODUCT_DETAIL: Product = {
  id: 'prod-1',
  name: 'Ao Polo Nam Cao Cap Classic Fit',
  slug: 'ao-polo-nam-cao-cap-classic-fit',
  description: `<h3>Mo ta san pham</h3>
<p>Ao Polo nam cao cap voi chat lieu cotton 100% mem mai, thoang mat. Thiet ke classic fit phu hop moi voc dang. Duong may ti mi, co ao cung cap giu form tot.</p>
<ul>
<li>Chat lieu: Cotton 100% - mem mai, thoang khi</li>
<li>Form: Classic fit - thoai mai, khong bo</li>
<li>Co: Co be, canh 3cm, cung cap</li>
<li>Nut: 3 nut, chat lieu nhua cao cap</li>
<li>Giau ao: Bo rib co gian</li>
</ul>
<h3>Huong dan bao quan</h3>
<ul>
<li>Giat may o nhiet do duoi 40 do</li>
<li>Khong dung thuoc tay</li>
<li>La ui nhiet do thap</li>
</ul>`,
  short_description: 'Ao Polo nam cotton 100% cao cap, form classic fit, co cung, thoang mat.',
  category_id: '1',
  category_name: 'Ao Polo',
  category_slug: 'ao-polo',
  brand: 'Fashion Ecom',
  price: 590000,
  compare_at_price: 750000,
  discount_percent: 21,
  images: [
    { id: 'img1', url: IMG(800, 800, 'Main'), alt: 'Ao Polo chinh dien', sort_order: 1 },
    { id: 'img2', url: IMG(800, 800, 'Side'), alt: 'Ao Polo mat ben', sort_order: 2 },
    { id: 'img3', url: IMG(800, 800, 'Back'), alt: 'Ao Polo mat sau', sort_order: 3 },
    { id: 'img4', url: IMG(800, 800, 'Detail'), alt: 'Chi tiet co ao', sort_order: 4 },
  ],
  variants: [
    { id: 'v1', sku: 'POLO-BLK-M', color_id: 'c1', color_name: 'Den', color_hex: '#1a1a1a', size_id: 's2', size_name: 'M', price: 590000, compare_at_price: 750000, stock_qty: 15, images: [] },
    { id: 'v2', sku: 'POLO-BLK-L', color_id: 'c1', color_name: 'Den', color_hex: '#1a1a1a', size_id: 's3', size_name: 'L', price: 590000, compare_at_price: 750000, stock_qty: 8, images: [] },
    { id: 'v3', sku: 'POLO-BLK-XL', color_id: 'c1', color_name: 'Den', color_hex: '#1a1a1a', size_id: 's4', size_name: 'XL', price: 590000, compare_at_price: 750000, stock_qty: 3, images: [] },
    { id: 'v4', sku: 'POLO-NVY-M', color_id: 'c2', color_name: 'Xanh Navy', color_hex: '#1e3a5f', size_id: 's2', size_name: 'M', price: 590000, compare_at_price: 750000, stock_qty: 12, images: [] },
    { id: 'v5', sku: 'POLO-NVY-L', color_id: 'c2', color_name: 'Xanh Navy', color_hex: '#1e3a5f', size_id: 's3', size_name: 'L', price: 590000, compare_at_price: 750000, stock_qty: 0, images: [] },
    { id: 'v6', sku: 'POLO-WHT-M', color_id: 'c3', color_name: 'Trang', color_hex: '#ffffff', size_id: 's2', size_name: 'M', price: 620000, compare_at_price: 750000, stock_qty: 20, images: [] },
    { id: 'v7', sku: 'POLO-WHT-L', color_id: 'c3', color_name: 'Trang', color_hex: '#ffffff', size_id: 's3', size_name: 'L', price: 620000, compare_at_price: 750000, stock_qty: 5, images: [] },
  ],
  colors: [
    { id: 'c1', name: 'Den', hex: '#1a1a1a' },
    { id: 'c2', name: 'Xanh Navy', hex: '#1e3a5f' },
    { id: 'c3', name: 'Trang', hex: '#ffffff' },
  ],
  sizes: [
    { id: 's2', name: 'M' },
    { id: 's3', name: 'L' },
    { id: 's4', name: 'XL' },
  ],
  avg_rating: 4.5,
  review_count: 28,
  is_new: true,
  is_sale: true,
  is_bestseller: false,
  stock_status: 'in_stock',
  tags: ['polo', 'cotton', 'classic-fit'],
  created_at: '2026-03-15T10:00:00Z',
};

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', customer_name: 'Nguyen Van A', rating: 5, content: 'Chat vai rat dep, form dung size. Se mua them mau khac.', images: [], created_at: '2026-04-01T08:00:00Z', is_verified: true },
  { id: 'r2', customer_name: 'Tran Thi B', rating: 4, content: 'Ao dep, giao hang nhanh. Tru 1 sao vi mau hoi khac anh.', images: [], created_at: '2026-03-28T12:00:00Z', is_verified: true },
  { id: 'r3', customer_name: 'Le Van C', rating: 5, content: 'Mua lan 2 roi, van rat hai long. Co ao cung, khong bi nhun.', images: [], created_at: '2026-03-20T15:00:00Z', is_verified: false },
];

export const MOCK_HERO_SLIDES: HeroBannerSlide[] = [
  { id: 's1', image: IMG(1440, 560, 'BST+Moi+2026'), image_mobile: IMG(750, 1000, 'BST+Moi'), title: 'Bo Suu Tap Moi 2026', subtitle: 'Phong cach - Lich lam - Dang cap', cta_text: 'KHAM PHA NGAY', cta_link: '/san-pham' },
  { id: 's2', image: IMG(1440, 560, 'Sale+50%25'), image_mobile: IMG(750, 1000, 'Sale'), title: 'Sale Len Den 50%', subtitle: 'Uu dai co han — chi trong tuan nay', cta_text: 'MUA NGAY', cta_link: '/danh-muc/sale' },
  { id: 's3', image: IMG(1440, 560, 'Ao+Polo'), image_mobile: IMG(750, 1000, 'Polo'), title: 'Ao Polo Premium', subtitle: 'Cotton 100% — thoang mat — form dep', cta_text: 'XEM BST', cta_link: '/danh-muc/ao-polo' },
];

export const MOCK_TRUST_BAR: TrustBarItem[] = [
  { icon: 'truck', line1: 'Mien phi giao hang', line2: 'Don tu 500.000d' },
  { icon: 'shield', line1: 'Hang chinh hang', line2: '100% authentic' },
  { icon: 'refresh', line1: 'Doi tra 7 ngay', line2: 'Mien phi doi tra' },
  { icon: 'headphones', line1: 'Ho tro 24/7', line2: 'Hotline: 1900-xxxx' },
];

export const MOCK_FLASH_SALE: FlashSaleData = {
  id: 'fs1',
  title: 'Flash Sale',
  end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  products: MOCK_PRODUCTS.slice(0, 6),
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    code: 'FE-20260410-001',
    status: 'delivered',
    items: [
      { id: 'oi1', product_name: 'Ao Polo Nam Cao Cap', variant_name: 'Den / M', sku: 'POLO-BLK-M', price: 590000, qty: 2, image: IMG(100, 100, 'Polo') },
      { id: 'oi2', product_name: 'Quan Tay Nam Lich Lam', variant_name: 'Xam / 32', sku: 'QT-GRY-32', price: 890000, qty: 1, image: IMG(100, 100, 'Quan') },
    ],
    subtotal: 2070000,
    shipping_fee: 0,
    discount: 0,
    total: 2070000,
    payment_method: 'cod',
    payment_status: 'paid',
    shipping_name: 'Nguyen Van A',
    shipping_phone: '0901234567',
    shipping_address: '123 Nguyen Hue',
    shipping_province: 'Ho Chi Minh',
    shipping_district: 'Quan 1',
    shipping_ward: 'Phuong Ben Nghe',
    note: '',
    created_at: '2026-04-05T10:00:00Z',
    updated_at: '2026-04-08T14:00:00Z',
    timeline: [
      { status: 'pending', note: 'Don hang da dat', created_at: '2026-04-05T10:00:00Z' },
      { status: 'confirmed', note: 'Da xac nhan', created_at: '2026-04-05T10:30:00Z' },
      { status: 'processing', note: 'Dang chuan bi hang', created_at: '2026-04-06T08:00:00Z' },
      { status: 'shipping', note: 'Da giao cho don vi van chuyen', created_at: '2026-04-07T09:00:00Z' },
      { status: 'delivered', note: 'Da giao thanh cong', created_at: '2026-04-08T14:00:00Z' },
    ],
  },
  {
    id: 'ord-2',
    code: 'FE-20260409-002',
    status: 'shipping',
    items: [
      { id: 'oi3', product_name: 'Ao So Mi Oxford', variant_name: 'Trang / L', sku: 'SM-WHT-L', price: 450000, qty: 1, image: IMG(100, 100, 'SoMi') },
    ],
    subtotal: 450000,
    shipping_fee: 30000,
    discount: 0,
    total: 480000,
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    shipping_name: 'Nguyen Van A',
    shipping_phone: '0901234567',
    shipping_address: '123 Nguyen Hue',
    shipping_province: 'Ho Chi Minh',
    shipping_district: 'Quan 1',
    shipping_ward: 'Phuong Ben Nghe',
    note: 'Giao gio hanh chinh',
    created_at: '2026-04-09T15:00:00Z',
    updated_at: '2026-04-10T08:00:00Z',
    timeline: [
      { status: 'pending', note: 'Don hang da dat', created_at: '2026-04-09T15:00:00Z' },
      { status: 'confirmed', note: 'Da xac nhan', created_at: '2026-04-09T15:30:00Z' },
      { status: 'shipping', note: 'Da giao cho GHTK', created_at: '2026-04-10T08:00:00Z' },
    ],
  },
];

export const MOCK_ADDRESSES: Address[] = [
  { id: 'addr-1', name: 'Nguyen Van A', phone: '0901234567', province: 'Ho Chi Minh', province_code: '79', district: 'Quan 1', district_code: '760', ward: 'Phuong Ben Nghe', ward_code: '26734', address_line: '123 Nguyen Hue', is_default: true },
  { id: 'addr-2', name: 'Nguyen Van A', phone: '0901234567', province: 'Ha Noi', province_code: '01', district: 'Cau Giay', district_code: '005', ward: 'Phuong Dich Vong', ward_code: '00178', address_line: '456 Xuan Thuy', is_default: false },
];

export const MOCK_POPULAR_SEARCHES = [
  'ao polo', 'quan jeans', 'ao so mi trang', 'quan tay', 'ao khoac', 'sale',
];
