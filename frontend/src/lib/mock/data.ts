/** Mock data cho development — dữ liệu thực từ Torano.vn (scraped 189 products) */

import type { ProductListItem, Product, Review } from '@/types/product';
import type { Category } from '@/types/category';
import type { HeroBannerSlide, TrustBarItem, FlashSaleData } from '@/types/common';
import type { Order } from '@/types/order';
import type { Address } from '@/types/address';

// ===========================
// Helper: đường dẫn ảnh
// ===========================

/** Ảnh sản phẩm flat-lay (product card) */
const P = (name: string) => `/images/products/${name}`;
/** Ảnh sản phẩm lifestyle/model (hover, detail) */
const PD = (name: string) => `/images/products-detail/${name}`;
/** Ảnh theme (banner, category, logo...) */
const T = (name: string) => `/images/theme/${name}`;

// ===========================
// Ảnh model/lifestyle — dùng cho hover & gallery
// ===========================

const HOVER_POOL = [
  P('54629081966_cbaaad4789_k_1ef0ed7dd60e4779afcb8259929ec3b1_master.jpg'),
  P('54629287024_aa453ac2be_k_8bbc8777a0cc43d088864b6588a3cd3f_master.jpg'),
  P('54629391780_548de97568_k_e76a147413104a67ab054854afcf4ae1_master.jpg'),
  P('5_3246ef0319354cdebefa12c46b16df67_master.png'),
  P('8_3849787218384057ba447b05790935ce_master.png'),
  P('_o_web__1__0e9104c64a924e19a8f88bb29b3b5b51_master.png'),
  P('54850534122_abd94e6bc4_k_0366700a90854459af974377e28d3a30_master.jpg'),
  P('54930091512_12e28ca3bc_c_5c170ac00dee4db195185811ca48e016_master.jpg'),
  P('54947149811_02e5e698a8_k_e943f1095ba846f0b97468759adf3318_master.jpg'),
  P('576869033_1252460493594196_3116353017788408982_n_356619ed176d4bdc8b7284fdcc8c782b_master.jpg'),
  P('577038858_1255218279985084_5252201006724013030_n_a50bbe37fade4c44ae5774983b5dd3fe_master.jpg'),
  P('590729306_1268920281948217_8370921118819506715_n_07f456a575194ceca632fcdc9f6fcc47_master.jpg'),
  P('595913189_1278756820964563_6438612972851276560_n_c14be49bb87e437f951df031135d2c60_master.jpg'),
  P('600532210_1285691930271052_7217001211690083350_n_4f122840c25e45779b311cf4929e9544_master.jpg'),
  P('497728757_1107401171433463_2464759818378874823_n_e1e65cfc022749f7afe99b9960de023c_master.jpg'),
  P('514694025_1144505567723023_2229080463376009636_n_2fc8f4d493e544a78e71b085a26bfbdb_master.jpg'),
  P('517136676_1147676020739311_4226858427086245361_n_0ebde8dbb9e64dc5959b35bbdd2a394c_master.jpg'),
  P('img_0232_54976947321_o_c42f07dcd0bc43fd84a484ee8cf1abcf_master.jpg'),
];

// ===========================
// CATEGORIES — 8 danh mục chính theo Torano
// ===========================

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Áo Polo',       slug: 'ao-polo',    description: 'Áo polo nam cao cấp nhiều kiểu dáng', image: T('home_category_1_img.jpg'), parent_id: null, children: [], product_count: 55, sort_order: 1 },
  { id: 'cat-2', name: 'Áo Thun',       slug: 'ao-thun',    description: 'Áo thun nam thể thao & lifestyle',    image: T('home_category_2_img.jpg'), parent_id: null, children: [], product_count: 28, sort_order: 2 },
  { id: 'cat-3', name: 'Quần Short',    slug: 'quan-short',  description: 'Quần short nam đũi, gió, khaki',      image: T('home_category_3_img.jpg'), parent_id: null, children: [], product_count: 18, sort_order: 3 },
  { id: 'cat-4', name: 'Quần Âu',       slug: 'quan-au',     description: 'Quần âu, jeans, kaki nam cao cấp',    image: T('home_category_4_img.jpg'), parent_id: null, children: [], product_count: 40, sort_order: 4 },
  { id: 'cat-5', name: 'Áo Khoác',      slug: 'ao-khoac',    description: 'Áo khoác gió, bomber, phao, da lộn',  image: T('home_category_5_img.jpg'), parent_id: null, children: [], product_count: 35, sort_order: 5 },
  { id: 'cat-6', name: 'Áo Sơ Mi',      slug: 'ao-so-mi',    description: 'Áo sơ mi nam dài tay, ngắn tay',      image: T('home_category_6_img.jpg'), parent_id: null, children: [], product_count: 12, sort_order: 6 },
  { id: 'cat-7', name: 'Áo Nỉ/Hoodie',  slug: 'ao-ni',       description: 'Áo nỉ, hoodie, len nam giữ ấm',      image: T('home_category_7_img.jpg'), parent_id: null, children: [], product_count: 15, sort_order: 7 },
  { id: 'cat-8', name: 'Phụ Kiện',      slug: 'phu-kien',    description: 'Thắt lưng, phụ kiện da Torano',       image: T('home_category_8_img.jpg'), parent_id: null, children: [], product_count: 9,  sort_order: 8 },
];

// ===========================
// Helper: tạo variant từ color + size
// ===========================

interface ColorDef { id: string; name: string; hex: string }
interface SizeDef { id: string; name: string }

const COLORS: Record<string, ColorDef> = {
  den:       { id: 'c-den',   name: 'Đen',        hex: '#1a1a1a' },
  navy:      { id: 'c-navy',  name: 'Xanh Navy',  hex: '#1e3a5f' },
  trang:     { id: 'c-trang', name: 'Trắng',      hex: '#f5f5f5' },
  xam:       { id: 'c-xam',   name: 'Xám',        hex: '#808080' },
  be:        { id: 'c-be',    name: 'Be',          hex: '#c8ad7f' },
  nau:       { id: 'c-nau',   name: 'Nâu',        hex: '#8b5e3c' },
  xanh_reu:  { id: 'c-xreu',  name: 'Xanh rêu',   hex: '#4a6741' },
  do_dam:    { id: 'c-do',    name: 'Đỏ đậm',     hex: '#8b2500' },
};

const SIZES_SHIRT: SizeDef[] = [
  { id: 's-s', name: 'S' }, { id: 's-m', name: 'M' }, { id: 's-l', name: 'L' },
  { id: 's-xl', name: 'XL' }, { id: 's-2xl', name: '2XL' },
];

const SIZES_PANTS: SizeDef[] = [
  { id: 'sz-29', name: '29' }, { id: 'sz-30', name: '30' }, { id: 'sz-31', name: '31' },
  { id: 'sz-32', name: '32' }, { id: 'sz-33', name: '33' },
];

const SIZES_BELT: SizeDef[] = [
  { id: 'sb-1', name: 'Freesize' },
];

function makeVariants(
  prodIdx: number,
  colors: ColorDef[],
  sizes: SizeDef[],
  price: number,
  compare_at_price: number,
) {
  return colors.flatMap((c) =>
    sizes.map((s, si) => ({
      id: `v-${prodIdx}-${c.id}-${s.id}`,
      sku: `SKU-${prodIdx}-${c.id.replace('c-', '').toUpperCase()}-${s.name}`,
      color_id: c.id,
      size_id: s.id,
      price,
      compare_at_price,
      stock_qty: si === 0 && prodIdx % 5 === 0 ? 0 : 3 + si * 4,
    })),
  );
}

// ===========================
// PRODUCTS — 48 sản phẩm thực từ Torano (6 per category)
// ===========================

// --- Hàm tiện ích tạo product ---
let _prodId = 0;
function mkProduct(
  catId: string,
  name: string,
  code: string,
  slug: string,
  price: number,
  compare_price: number,
  image: string,
  hoverIdx: number,
  colorKeys: string[],
  sizesArr: SizeDef[],
  flags: { is_new?: boolean; is_bestseller?: boolean } = {},
): ProductListItem {
  _prodId++;
  const colors = colorKeys.map((k) => COLORS[k]);
  const is_sale = compare_price > 0;
  const discount_percent = is_sale ? Math.round((1 - price / compare_price) * 100) : 0;
  return {
    id: `prod-${_prodId}`,
    name,
    slug,
    price,
    compare_at_price: compare_price,
    discount_percent,
    image,
    image_hover: HOVER_POOL[hoverIdx % HOVER_POOL.length],
    avg_rating: 4.2 + (_prodId % 5) * 0.15,
    review_count: 8 + (_prodId * 3) % 40,
    is_new: flags.is_new ?? _prodId <= 8,
    is_sale,
    is_bestseller: flags.is_bestseller ?? _prodId % 7 === 0,
    stock_status: _prodId === 42 ? 'out_of_stock' : 'in_stock',
    colors,
    sizes: sizesArr,
    variants: makeVariants(_prodId, colors, sizesArr, price, compare_price),
  };
}

export const MOCK_PRODUCTS: ProductListItem[] = [

  // ──────────────────────────────────────
  // CAT 1: Áo Polo (6 sản phẩm)
  // ──────────────────────────────────────

  mkProduct('cat-1', 'Áo polo kẻ bo tay GSTP068', 'GSTP068',
    'ao-polo-ke-bo-tay-3-gstp068', 550000, 0,
    P('_o_web_75638124a9704332bada4b2aa10c379b_master.png'), 0,
    ['navy', 'den', 'xam'], SIZES_SHIRT, { is_bestseller: true }),

  mkProduct('cat-1', 'Áo polo trơn bo kẻ thêu logo ngực GSTP643', 'GSTP643',
    'ao-polo-tron-bo-ke-theu-logo-nguc-4-gstp643', 550000, 0,
    P('_o_web_b3095315fbad44439231d69b28c8e420_master.png'), 1,
    ['navy', 'trang', 'den'], SIZES_SHIRT),

  mkProduct('cat-1', 'Áo polo kẻ bo tay phối màu GSTP042', 'GSTP042',
    'ao-polo-ke-bo-tay-phoi-mau-2-gstp042', 550000, 0,
    P('_o_web_b2d41e8adb7e4050a404a3ad11696770_master.png'), 2,
    ['den', 'be', 'navy'], SIZES_SHIRT),

  mkProduct('cat-1', 'Áo Polo trơn basic thêu logo ngực ESTP038', 'ESTP038',
    'ao-polo-tron-basic-den-theu-logo-nguc-estp038', 249000, 400000,
    P('1_42b0199a7ff846fb8d066deb10672a81_master.png'), 3,
    ['den', 'nau', 'trang', 'xam'], SIZES_SHIRT),

  mkProduct('cat-1', 'Áo polo can phối thêu logo đại bàng GSTP047', 'GSTP047',
    'ao-polo-can-phoi-theu-logo-nguc-3-gstp047', 299000, 480000,
    P('1_257a3776f6a54b32a5d2612e41582b64_master.png'), 4,
    ['navy', 'den'], SIZES_SHIRT),

  mkProduct('cat-1', 'Áo Polo dài tay basic thêu logo ngực GWTP502', 'GWTP502',
    'ao-polo-dai-tay-basic-theu-logo-nguc-3-gwtp502', 699000, 0,
    P('_o_web__2__85e02af752c1443aa16633aa1ac4076b_master.png'), 5,
    ['den', 'navy', 'xam'], SIZES_SHIRT, { is_new: true }),

  // ──────────────────────────────────────
  // CAT 2: Áo Thun (6 sản phẩm)
  // ──────────────────────────────────────

  mkProduct('cat-2', 'Áo T shirt trơn in thể thao GSTS018', 'GSTS018',
    'ao-t-shirt-tron-in-phan-quang-3-gsts018', 249000, 349000,
    P('2_c84d08a4d3984392b5b7be8a45e3e16e_master.png'), 6,
    ['den', 'trang', 'navy'], SIZES_SHIRT),

  mkProduct('cat-2', 'Áo T shirt trơn in thể thao GSTS017', 'GSTS017',
    'ao-t-shirt-tron-in-logo-phan-quang-4-gsts017', 249000, 349000,
    P('1_457e8f91dae54ba6a9ed2ad64be7ad47_master.png'), 7,
    ['den', 'xam'], SIZES_SHIRT),

  mkProduct('cat-2', 'Áo T shirt trơn in logo ngực GSTS006', 'GSTS006',
    'ao-t-shirt-tron-in-logo-nguc-2-gsts006', 279000, 0,
    P('_o_web_afc4f5e440bf4e9988e93da9d021a203_master.png'), 8,
    ['den', 'trang', 'xam'], SIZES_SHIRT),

  mkProduct('cat-2', 'Áo T shirt thể thao basic FSTS002', 'FSTS002',
    'ao-t-shirt-the-thao-basic-5-fsts002', 149000, 250000,
    P('tp038-1_f8e3fadea4364cbda92fa58a7b38aac7_master.png'), 9,
    ['den', 'trang'], SIZES_SHIRT),

  mkProduct('cat-2', 'Áo T shirt trơn in logo ngực FSTS001', 'FSTS001',
    'ao-t-shirt-tron-in-logo-nguc-8-fsts001', 169000, 250000,
    P('thiet_ke_chua_co_ten__5__ed54b4168e6f4f3f92e24f6ebd4961f7_master.png'), 10,
    ['den', 'navy', 'trang'], SIZES_SHIRT),

  mkProduct('cat-2', 'Áo T shirt họa tiết in logo Horse ngực FSTS026', 'FSTS026',
    'ao-t-shirt-hoa-tiet-in-logo-horse-nguc-6-fsts026', 300000, 0,
    P('tp038-1_12784231360b4e619e47e59ee28981c6_master.png'), 11,
    ['den', 'trang', 'be'], SIZES_SHIRT),

  // ──────────────────────────────────────
  // CAT 3: Quần Short (6 sản phẩm)
  // ──────────────────────────────────────

  mkProduct('cat-3', 'Quần short đũi cạp chun basic FSBI001', 'FSBI001',
    'quan-short-dui-cap-chun-basic-gap-gau-fsbi001', 299000, 450000,
    P('fsbi001-9_53586798344_o_d2e78b3de56d4b098fe40d3310c7f996_master.jpg'), 12,
    ['den', 'be', 'xam'], SIZES_PANTS),

  mkProduct('cat-3', 'Quần short khaki cạp thường basic FSBK012', 'FSBK012',
    'quan-short-khaki-cap-thuong-basic-fsbk012', 299000, 450000,
    P('fsbk012-2_53626901061_o_60d9ea3be5a44c31ac15ba401a919896_master.jpg'), 13,
    ['be', 'den', 'navy'], SIZES_PANTS),

  mkProduct('cat-3', 'Quần Short gió thể thao đục lỗ sườn BW600', 'BW600',
    'quan-short-gio-the-thao-duc-lo-suon-bw600', 169000, 249000,
    P('bw600_82451b6d03bc40ada574ce3f8401df2f_master.jpg'), 14,
    ['den', 'navy', 'xam'], SIZES_PANTS),

  mkProduct('cat-3', 'Quần short gió basic phối chun cạp FSBW001', 'FSBW001',
    'quan-short-gio-basic-phoi-chun-cap-fsbw001', 169000, 249000,
    P('avt_web_1150_x_1475_px__3592e7567bb24ab4bf2f4e467b2e48d3_master.png'), 15,
    ['den', 'navy'], SIZES_PANTS),

  mkProduct('cat-3', 'Quần Short Khaki chiết eo gấu LV FSBK015', 'FSBK015',
    'quan-short-khaki-chiet-eo-gau-lv-fsbk015', 350000, 0,
    P('tp038-1_2e954120db914978b420e969f044a0cd_master.png'), 16,
    ['be', 'den', 'xam'], SIZES_PANTS),

  mkProduct('cat-3', 'Quần short khaki cạp chun basic FSBK010', 'FSBK010',
    'quan-short-khaki-cap-chun-basic-fsbk010', 299000, 450000,
    P('53569696867_539e007d35_b_f6c9571bb6684f7cbcc39a3f20adc933_master.jpg'), 17,
    ['be', 'den', 'navy'], SIZES_PANTS),

  // ──────────────────────────────────────
  // CAT 4: Quần Âu / Jeans / Kaki (6 sản phẩm)
  // ──────────────────────────────────────

  mkProduct('cat-4', 'Quần âu slimfit trơn cạp chun gấu LV GABT892', 'GABT892',
    'quan-au-slimfit-tron-cap-chun-tui-cheo-theu-logo-5-gabt892', 649000, 0,
    P('t892_eb23ce8e51714572b03a1fbe52f91dfe_master.png'), 0,
    ['den', 'xam', 'navy'], SIZES_PANTS),

  mkProduct('cat-4', 'Quần âu regularfit trơn túi chéo thêu logo GABT891', 'GABT891',
    'quan-au-regularfit-tron-tui-cheo-theu-logo-3-gabt891', 649000, 0,
    P('t891_3eead5a7f97e4c649b40221367f517f5_master.png'), 1,
    ['den', 'xam', 'be'], SIZES_PANTS),

  mkProduct('cat-4', 'Quần âu slim-fit cạp trơn DABT900', 'DABT900',
    'quan-au-slimfit-cap-tron-5-dabt900', 449000, 650000,
    P('bt900_afe890ccab214119b1fcb9b0340878f9_master.jpg'), 2,
    ['den', 'xam'], SIZES_PANTS),

  mkProduct('cat-4', 'Quần Jeans basic slim EABJ012', 'EABJ012',
    'quan-jeans-basic-slim-eabj012', 449000, 650000,
    P('bj012_972f5893a3c14a8f8d4c71e8a453f23e_master.jpg'), 3,
    ['den', 'navy'], SIZES_PANTS),

  mkProduct('cat-4', 'Quần kaki dài basic cạp tender FABK001', 'FABK001',
    'quan-kaki-dai-basic-cap-tender-5-fabk001', 399000, 650000,
    P('qu_n_web_c166306cb69142db901aceaf3883c1c9_master.png'), 4,
    ['be', 'den', 'xam'], SIZES_PANTS),

  mkProduct('cat-4', 'Quần Jeans basic relaxedfit GABJ302', 'GABJ302',
    'quan-jeans-basic-relaxedfit-1-gabj302', 699000, 0,
    P('qu_n_web_fc8dbced49084e6e986c7b2134fd9de9_master.png'), 5,
    ['den', 'navy'], SIZES_PANTS, { is_bestseller: true }),

  // ──────────────────────────────────────
  // CAT 5: Áo Khoác (6 sản phẩm)
  // ──────────────────────────────────────

  mkProduct('cat-5', 'Áo khoác gió 2 lớp cổ bẻ thêu logo GWCW505', 'GWCW505',
    'ao-khoac-gio-2-lop-co-be-theu-logo-1-gwcw505', 899000, 0,
    P('_o_web_3b2942fceadc46408ee21184550cccd8_master.png'), 6,
    ['den', 'navy', 'xam'], SIZES_SHIRT, { is_bestseller: true }),

  mkProduct('cat-5', 'Áo khoác bộ gió 2 lớp can phối mũ liền GWCW051', 'GWCW051',
    'ao-khoac-gio-2-lop-can-phoi-mu-lien-3-gwcw051', 399000, 699000,
    P('5_3246ef0319354cdebefa12c46b16df67_master.png'), 7,
    ['den', 'navy'], SIZES_SHIRT),

  mkProduct('cat-5', 'Áo khoác bomber lót lông thêu logo ngực GWCU051', 'GWCU051',
    'ao-khoac-bomber-lot-long-theu-logo-nguc-5-gwcu051', 599000, 899000,
    P('8_3849787218384057ba447b05790935ce_master.png'), 8,
    ['den', 'nau', 'xanh_reu'], SIZES_SHIRT),

  mkProduct('cat-5', 'Áo khoác khaki 2 lớp chần bông cổ bomber GWCJ503', 'GWCJ503',
    'ao-khoac-khaki-2-lop-chan-bong-co-bomber-theu-logo-mat-sau-4-gwcj503', 999000, 1299000,
    P('_o_web_fd9680326d1d47e5b772a6defbd19237_master.png'), 9,
    ['den', 'be'], SIZES_SHIRT),

  mkProduct('cat-5', 'Áo khoác da lộn basic cổ bẻ lót lông GWCL902', 'GWCL902',
    'ao-khoac-da-lon-basic-co-be-theu-logo-nguc-4-gwcl902', 799000, 1099000,
    P('_o_web_6885a311ce9940899082e6aaac6555e9_master.png'), 10,
    ['den', 'nau', 'be'], SIZES_SHIRT),

  mkProduct('cat-5', 'Áo khoác phao 3 lớp lót bông regularfit GWCF004', 'GWCF004',
    'ao-khoac-phao-3-lop-lot-bong-co-cao-regularfit-tron-gwcf004', 699000, 1199000,
    P('_o_web_f03fa12180374293b18c50f93c3dd3fd_master.png'), 11,
    ['den', 'navy', 'xam'], SIZES_SHIRT),

  // ──────────────────────────────────────
  // CAT 6: Áo Sơ Mi (6 sản phẩm)
  // ──────────────────────────────────────

  mkProduct('cat-6', 'Áo sơ mi dài tay trơn GATB011', 'GATB011',
    'so-mi-dai-tay-tron-1-gatb011', 550000, 0,
    P('thiet_ke_chua_co_ten__5__c43044e163cf44329b0c081ddaff1e5c_master.png'), 12,
    ['trang', 'den', 'navy'], SIZES_SHIRT),

  mkProduct('cat-6', 'Áo sơ mi dài tay trơn Bamboo DATB920', 'DATB920',
    'ao-so-mi-dai-tay-tron-bamboo-datb920', 210000, 420000,
    P('tb920_a04cd3c42ae9458e9207fdccaf7bed48_master.png'), 13,
    ['trang', 'xam'], SIZES_SHIRT),

  mkProduct('cat-6', 'Sơ mi dài tay trơn dệt kim FATB001', 'FATB001',
    'so-mi-dai-tay-tron-det-kim-3-fatb001', 329000, 450000,
    P('tb001_c0675ef2b3a7434696f12bd8905d98e4_master.png'), 14,
    ['trang', 'den', 'be'], SIZES_SHIRT),

  mkProduct('cat-6', 'Sơ mi dài tay trơn FATB002', 'FATB002',
    'so-mi-dai-tay-tron-5-fatb002', 349000, 500000,
    P('tb002_de80d5dec15646a49b16d689b0873ac1_master.png'), 15,
    ['trang', 'navy'], SIZES_SHIRT),

  mkProduct('cat-6', 'Áo Polo trơn bề mặt hiệu ứng FSTP056', 'FSTP056',
    'ao-polo-tron-be-mat-hieu-ung-3-fstp056', 380000, 0,
    P('thiet_ke_chua_co_ten__4__e085a9db930d492a9783a68d45d4d534_master.png'), 16,
    ['den', 'xam', 'navy'], SIZES_SHIRT),

  mkProduct('cat-6', 'Áo Polo trơn bo kẻ FSTP046', 'FSTP046',
    'ao-polo-tron-bo-ke-1-fstp046', 380000, 0,
    P('thiet_ke_chua_co_ten__4__2efaf64af4c942c4a3711b6f14fe808a_master.png'), 17,
    ['den', 'navy'], SIZES_SHIRT),

  // ──────────────────────────────────────
  // CAT 7: Áo Nỉ / Hoodie (6 sản phẩm)
  // ──────────────────────────────────────

  mkProduct('cat-7', 'Áo nỉ họa tiết thêu logo ngựa GWTW823', 'GWTW823',
    'ao-ni-hoa-tiet-theu-logo-ngua-2-gwtw823', 599000, 0,
    P('25_585e2dd08dfc4392b986ec1b3d115d74_master.png'), 0,
    ['den', 'xam', 'navy'], SIZES_SHIRT),

  mkProduct('cat-7', 'Áo nỉ họa tiết in tràn GWTW824', 'GWTW824',
    'ao-ni-hoa-tiet-in-tran-3-gwtw824', 599000, 0,
    P('26_48c6beb5acd546ae860c015fe19dc154_master.png'), 1,
    ['den', 'navy'], SIZES_SHIRT),

  mkProduct('cat-7', 'Áo nỉ họa tiết thêu hình Unbridled ambition GWTW826', 'GWTW826',
    'ao-ni-hoa-tiet-theu-hinh-unbridled-ambition-3-gwtw826', 599000, 0,
    P('27_3aa82df04f8b4f8788b4488d4c08f881_master.png'), 2,
    ['den', 'xam'], SIZES_SHIRT),

  mkProduct('cat-7', 'Áo nỉ bộ can phối tay GWTW901', 'GWTW901',
    'ao-ni-can-phoi-tay-ao-basic-slimfit-5-gwtw901', 399000, 599000,
    P('_o_web_500d269f1d9d4aafb2dbf9db640f63bd_master.png'), 3,
    ['den', 'xam', 'navy'], SIZES_SHIRT),

  mkProduct('cat-7', 'Áo nỉ bộ can phối tay FWTW001', 'FWTW001',
    'ao-ni-bo-can-phoi-tay-6-fwtw001', 319000, 420000,
    P('19334a78-6cbb-4bbb-abeb-31088b5578ff_ea4d8d95d7fe424297ad95179a26f18b_master.jpg'), 4,
    ['den', 'xam'], SIZES_SHIRT),

  mkProduct('cat-7', 'Áo nỉ Hoodie in tràn họa tiết TRN FWTW002', 'FWTW002',
    'ao-hoodie-in-tran-hoa-tiet-trn-1-fwtw002', 650000, 0,
    P('thiet_ke_chua_co_ten__4__5f0ad70259c1470fbd5e51709ae99bd5_master.png'), 5,
    ['den', 'navy'], SIZES_SHIRT, { is_bestseller: true }),

  // ──────────────────────────────────────
  // CAT 8: Phụ Kiện — Thắt lưng (6 sản phẩm)
  // ──────────────────────────────────────

  mkProduct('cat-8', 'Thắt lưng da Torano GAAL002', 'GAAL002',
    'that-lung-da-torano-1-gaal002', 599000, 0,
    P('al002_4e1ff963227346adafb51ca0e87efe27_master.png'), 6,
    ['den', 'nau'], SIZES_BELT),

  mkProduct('cat-8', 'Thắt lưng đầu xoay 2 màu Torano GAAL003', 'GAAL003',
    'that-lung-dau-xoay-2-mau-torano-1-gaal003', 599000, 0,
    P('al003_6bbbf5c157ab4eefae2ddae428b4f01c_master.png'), 7,
    ['den', 'nau'], SIZES_BELT),

  mkProduct('cat-8', 'Thắt lưng đầu xoay 2 hiệu ứng Torano GAAL007', 'GAAL007',
    'that-lung-dau-xoay-2-hieu-ung-torano-1-gaal007', 699000, 0,
    P('al007_378e77d4f8244c68897fc748d4665b3a_master.png'), 8,
    ['den'], SIZES_BELT),

  mkProduct('cat-8', 'Thắt lưng da Torano GAAL015', 'GAAL015',
    'that-lung-da-torano-1-gaal015', 799000, 0,
    P('al010_aa92a95073b0446e86a1d050436111d2_master.png'), 9,
    ['den', 'nau'], SIZES_BELT),

  mkProduct('cat-8', 'Thắt lưng da Torano GAAL016', 'GAAL016',
    'that-lung-da-torano-1-gaal016', 799000, 0,
    P('al011_63e4d647752348dfb69f2538e4e13982_master.png'), 10,
    ['den'], SIZES_BELT),

  mkProduct('cat-8', 'Thắt lưng da Torano GAAL012', 'GAAL012',
    'that-lung-da-torano-1-gaal012', 699000, 0,
    P('al014_a9aad068cdb34d94b21abbbf81c6bbff_master.png'), 11,
    ['den', 'nau'], SIZES_BELT),
];

// ===========================
// PRODUCT DETAIL — Polo GSTP068 (best-seller)
// ===========================

export const MOCK_PRODUCT_DETAIL: Product = {
  id: 'prod-1',
  name: 'Áo polo kẻ bo tay GSTP068',
  slug: 'ao-polo-ke-bo-tay-3-gstp068',
  description: `<h3>Mô tả sản phẩm</h3>
<p>Áo Polo nam Torano mã GSTP068 với kiểu dệt kẻ tinh tế, bo tay phối màu nổi bật. Chất liệu cotton pha polyester co giãn thoải mái, form regular fit phù hợp mọi vóc dáng.</p>
<ul>
<li>Chất liệu: Cotton pha Polyester — mềm mại, thoáng khí, co giãn nhẹ</li>
<li>Form: Regular fit — thoải mái, không bó sát</li>
<li>Cổ: Cổ bẻ dệt kẻ, cứng cáp giữ form tốt</li>
<li>Bo tay: Dệt kẻ phối màu, chi tiết tinh tế</li>
<li>Logo: Thêu logo Torano ở ngực trái</li>
<li>Gấu áo: Bo rib co giãn, dáng cong thời trang</li>
</ul>
<h3>Hướng dẫn bảo quản</h3>
<ul>
<li>Giặt máy ở nhiệt độ dưới 40°C</li>
<li>Không dùng thuốc tẩy</li>
<li>Là ủi nhiệt độ thấp, không là trực tiếp lên hình in/thêu</li>
<li>Phơi nơi thoáng mát, tránh ánh nắng trực tiếp</li>
</ul>`,
  short_description: 'Áo Polo nam Torano dệt kẻ, bo tay phối màu, form regular fit, cotton pha co giãn thoải mái.',
  category_id: 'cat-1',
  category_name: 'Áo Polo',
  category_slug: 'ao-polo',
  brand: 'Torano',
  price: 550000,
  compare_at_price: 0,
  discount_percent: 0,
  images: [
    { id: 'img1', url: PD('54026597926_f058b57c16_k_0fea7810ee2d4fd08589fede87ca5255_master.jpg'), alt: 'Áo Polo GSTP068 chính diện', sort_order: 1 },
    { id: 'img2', url: PD('54058892734_0b9029cd7f_c_25c7109b3fd7426eb926399034cd944b_master.jpg'), alt: 'Áo Polo GSTP068 mặt bên', sort_order: 2 },
    { id: 'img3', url: PD('54059021060_8ce8bd237c_k_d8b111359e494585aafb7e927ed42932_master.jpg'), alt: 'Áo Polo GSTP068 chi tiết cổ', sort_order: 3 },
    { id: 'img4', url: PD('54421064101_e29860270a_k_c1c938940e5249d5b0a2abaaf272c3bf_master.jpg'), alt: 'Áo Polo GSTP068 chi tiết bo tay', sort_order: 4 },
    { id: 'img5', url: PD('54421450050_3b12750fec_k_31e9304f09464d8bb34af602695625b5_master.jpg'), alt: 'Áo Polo GSTP068 chi tiết vải', sort_order: 5 },
  ],
  variants: [
    { id: 'dv1', sku: 'GSTP068-NVY-M',  color_id: 'c-navy',  color_name: 'Xanh Navy', color_hex: '#1e3a5f', size_id: 's-m',  size_name: 'M',  price: 550000, compare_at_price: 0, stock_qty: 15, images: [] },
    { id: 'dv2', sku: 'GSTP068-NVY-L',  color_id: 'c-navy',  color_name: 'Xanh Navy', color_hex: '#1e3a5f', size_id: 's-l',  size_name: 'L',  price: 550000, compare_at_price: 0, stock_qty: 10, images: [] },
    { id: 'dv3', sku: 'GSTP068-NVY-XL', color_id: 'c-navy',  color_name: 'Xanh Navy', color_hex: '#1e3a5f', size_id: 's-xl', size_name: 'XL', price: 550000, compare_at_price: 0, stock_qty: 7,  images: [] },
    { id: 'dv4', sku: 'GSTP068-DEN-M',  color_id: 'c-den',   color_name: 'Đen',       color_hex: '#1a1a1a', size_id: 's-m',  size_name: 'M',  price: 550000, compare_at_price: 0, stock_qty: 12, images: [] },
    { id: 'dv5', sku: 'GSTP068-DEN-L',  color_id: 'c-den',   color_name: 'Đen',       color_hex: '#1a1a1a', size_id: 's-l',  size_name: 'L',  price: 550000, compare_at_price: 0, stock_qty: 0,  images: [] },
    { id: 'dv6', sku: 'GSTP068-XAM-M',  color_id: 'c-xam',   color_name: 'Xám',       color_hex: '#808080', size_id: 's-m',  size_name: 'M',  price: 550000, compare_at_price: 0, stock_qty: 20, images: [] },
    { id: 'dv7', sku: 'GSTP068-XAM-L',  color_id: 'c-xam',   color_name: 'Xám',       color_hex: '#808080', size_id: 's-l',  size_name: 'L',  price: 550000, compare_at_price: 0, stock_qty: 8,  images: [] },
    { id: 'dv8', sku: 'GSTP068-XAM-XL', color_id: 'c-xam',   color_name: 'Xám',       color_hex: '#808080', size_id: 's-xl', size_name: 'XL', price: 550000, compare_at_price: 0, stock_qty: 5,  images: [] },
  ],
  colors: [
    { id: 'c-navy', name: 'Xanh Navy', hex: '#1e3a5f' },
    { id: 'c-den',  name: 'Đen',       hex: '#1a1a1a' },
    { id: 'c-xam',  name: 'Xám',       hex: '#808080' },
  ],
  sizes: [
    { id: 's-m', name: 'M' },
    { id: 's-l', name: 'L' },
    { id: 's-xl', name: 'XL' },
  ],
  avg_rating: 4.6,
  review_count: 34,
  is_new: true,
  is_sale: false,
  is_bestseller: true,
  stock_status: 'in_stock',
  tags: ['polo', 'ke-bo-tay', 'regular-fit', 'torano', 'gstp068'],
  created_at: '2026-03-10T08:00:00Z',
};

// ===========================
// REVIEWS
// ===========================

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', customer_name: 'Nguyễn Văn Minh',  rating: 5, content: 'Chất vải rất đẹp, mặc thoáng mát. Form đúng size, không cần đổi. Rất hài lòng!', images: [], created_at: '2026-04-10T08:00:00Z', is_verified: true },
  { id: 'r2', customer_name: 'Trần Thị Hồng',    rating: 4, content: 'Mua tặng chồng, anh ấy rất thích. Trừ 1 sao vì giao hàng hơi chậm.', images: [], created_at: '2026-04-05T12:00:00Z', is_verified: true },
  { id: 'r3', customer_name: 'Lê Quốc Anh',      rating: 5, content: 'Mua lần 2 rồi. Cổ áo cứng cáp, giặt nhiều lần vẫn giữ form. Đáng tiền!', images: [], created_at: '2026-03-28T15:00:00Z', is_verified: true },
  { id: 'r4', customer_name: 'Phạm Đức Huy',     rating: 4, content: 'Áo đẹp, đường may tỉ mỉ. Màu navy rất sang. Sẽ mua thêm màu đen.', images: [], created_at: '2026-03-20T09:30:00Z', is_verified: false },
  { id: 'r5', customer_name: 'Hoàng Thế Vinh',   rating: 5, content: 'Torano chất lượng ổn định. Mua 3 cái cho 3 anh em, ai cũng khen.', images: [], created_at: '2026-03-15T16:00:00Z', is_verified: true },
];

// ===========================
// HERO SLIDES
// ===========================

export const MOCK_HERO_SLIDES: HeroBannerSlide[] = [
  { id: 's1', image: T('slide_1_img.jpg'), image_mobile: T('slide_1_mb.jpg'), title: 'Back In Form',        subtitle: 'Not just back to work — back with presence', cta_text: 'KHÁM PHÁ NGAY', cta_link: '/san-pham' },
  { id: 's2', image: T('slide_2_img.jpg'), image_mobile: T('slide_2_mb.jpg'), title: 'Embrace Holiday',     subtitle: 'FW Collection 2026',                        cta_text: 'XEM BST',        cta_link: '/danh-muc/ao-khoac' },
  { id: 's3', image: T('slide_3_img.jpg'), image_mobile: T('slide_3_mb.jpg'), title: 'Sale Lên Đến 50%',    subtitle: 'Ưu đãi có hạn — chỉ trong tuần này',        cta_text: 'MUA NGAY',       cta_link: '/danh-muc/ao-polo' },
  { id: 's4', image: T('slide_4_img.jpg'), image_mobile: T('slide_4_mb.jpg'), title: 'Lookbook For Men',    subtitle: 'Phong cách — Lịch lãm — Đẳng cấp',         cta_text: 'KHÁM PHÁ',       cta_link: '/san-pham' },
];

// ===========================
// TRUST BAR
// ===========================

export const MOCK_TRUST_BAR: TrustBarItem[] = [
  { icon: 'truck',      line1: 'Miễn phí giao hàng', line2: 'Đơn từ 500.000đ' },
  { icon: 'shield',     line1: 'Hàng chính hãng',    line2: '100% authentic' },
  { icon: 'refresh',    line1: 'Đổi trả 7 ngày',     line2: 'Miễn phí đổi trả' },
  { icon: 'headphones', line1: 'Hỗ trợ 24/7',        line2: 'Hotline: 1900-xxxx' },
];

// ===========================
// FLASH SALE — 6 sản phẩm sale từ mock data
// ===========================

export const MOCK_FLASH_SALE: FlashSaleData = {
  id: 'fs1',
  title: 'Flash Sale',
  end_time: new Date(Date.now() + 4 * 3600_000).toISOString(),
  products: MOCK_PRODUCTS.filter((p) => p.is_sale).slice(0, 6),
};

// ===========================
// ORDERS
// ===========================

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    code: 'FE-20260410-001',
    status: 'delivered',
    items: [
      { id: 'oi1', product_name: 'Áo polo kẻ bo tay GSTP068',    variant_name: 'Xanh Navy / M', sku: 'GSTP068-NVY-M', price: 550000, qty: 2, image: P('_o_web_75638124a9704332bada4b2aa10c379b_master.png') },
      { id: 'oi2', product_name: 'Quần âu slimfit GABT892',       variant_name: 'Đen / 31',      sku: 'GABT892-DEN-31', price: 649000, qty: 1, image: P('t892_eb23ce8e51714572b03a1fbe52f91dfe_master.png') },
    ],
    subtotal: 1749000,
    shipping_fee: 0,
    discount: 0,
    total: 1749000,
    payment_method: 'cod',
    payment_status: 'paid',
    shipping_name: 'Nguyễn Văn A',
    shipping_phone: '0901234567',
    shipping_address: '123 Nguyễn Huệ',
    shipping_province: 'Hồ Chí Minh',
    shipping_district: 'Quận 1',
    shipping_ward: 'Phường Bến Nghé',
    note: '',
    created_at: '2026-04-05T10:00:00Z',
    updated_at: '2026-04-08T14:00:00Z',
    timeline: [
      { status: 'pending',    note: 'Đơn hàng đã đặt',                created_at: '2026-04-05T10:00:00Z' },
      { status: 'confirmed',  note: 'Đã xác nhận',                     created_at: '2026-04-05T10:30:00Z' },
      { status: 'processing', note: 'Đang chuẩn bị hàng',             created_at: '2026-04-06T08:00:00Z' },
      { status: 'shipping',   note: 'Đã giao cho đơn vị vận chuyển',  created_at: '2026-04-07T09:00:00Z' },
      { status: 'delivered',  note: 'Đã giao thành công',              created_at: '2026-04-08T14:00:00Z' },
    ],
  },
  {
    id: 'ord-2',
    code: 'FE-20260412-002',
    status: 'shipping',
    items: [
      { id: 'oi3', product_name: 'Áo khoác gió 2 lớp GWCW505', variant_name: 'Đen / L', sku: 'GWCW505-DEN-L', price: 899000, qty: 1, image: P('_o_web_3b2942fceadc46408ee21184550cccd8_master.png') },
      { id: 'oi4', product_name: 'Thắt lưng da Torano GAAL002', variant_name: 'Đen / Freesize', sku: 'GAAL002-DEN', price: 599000, qty: 1, image: P('al002_4e1ff963227346adafb51ca0e87efe27_master.png') },
    ],
    subtotal: 1498000,
    shipping_fee: 0,
    discount: 150000,
    total: 1348000,
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    shipping_name: 'Nguyễn Văn A',
    shipping_phone: '0901234567',
    shipping_address: '123 Nguyễn Huệ',
    shipping_province: 'Hồ Chí Minh',
    shipping_district: 'Quận 1',
    shipping_ward: 'Phường Bến Nghé',
    note: 'Giao giờ hành chính',
    created_at: '2026-04-12T15:00:00Z',
    updated_at: '2026-04-13T08:00:00Z',
    timeline: [
      { status: 'pending',   note: 'Đơn hàng đã đặt',    created_at: '2026-04-12T15:00:00Z' },
      { status: 'confirmed', note: 'Đã xác nhận',          created_at: '2026-04-12T15:30:00Z' },
      { status: 'shipping',  note: 'Đã giao cho GHTK',    created_at: '2026-04-13T08:00:00Z' },
    ],
  },
];

// ===========================
// ADDRESSES
// ===========================

export const MOCK_ADDRESSES: Address[] = [
  { id: 'addr-1', name: 'Nguyễn Văn A', phone: '0901234567', province: 'Hồ Chí Minh', province_code: '79', district: 'Quận 1',   district_code: '760', ward: 'Phường Bến Nghé', ward_code: '26734', address_line: '123 Nguyễn Huệ', is_default: true },
  { id: 'addr-2', name: 'Nguyễn Văn A', phone: '0901234567', province: 'Hà Nội',       province_code: '01', district: 'Cầu Giấy', district_code: '005', ward: 'Phường Dịch Vọng', ward_code: '00178', address_line: '456 Xuân Thủy',  is_default: false },
];

// ===========================
// POPULAR SEARCHES
// ===========================

export const MOCK_POPULAR_SEARCHES = [
  'áo polo', 'quần jeans', 'áo sơ mi', 'quần âu', 'áo khoác gió', 'thắt lưng da', 'áo nỉ hoodie', 'quần short',
];
