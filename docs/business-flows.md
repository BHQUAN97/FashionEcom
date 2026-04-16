# FashionEcom — Luồng nghiệp vụ & E2E Test Coverage

> Tài liệu mô tả chi tiết các luồng nghiệp vụ chính, workflow, giải pháp kỹ thuật và phạm vi E2E test.
> Cập nhật: 2026-04-16

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Luồng Khách hàng (Storefront)](#2-luồng-khách-hàng-storefront)
3. [Luồng Admin (Quản trị)](#3-luồng-admin-quản-trị)
4. [Chi tiết giải pháp kỹ thuật](#4-chi-tiết-giải-pháp-kỹ-thuật)
5. [E2E Test Coverage](#5-e2e-test-coverage)

---

## 1. Tổng quan

### Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14 (App Router) + Tailwind + shadcn/ui |
| Backend   | NestJS 10 + TypeORM + MySQL 8.0     |
| State     | Zustand (persist localStorage)       |
| Auth      | JWT (cookie + memory)                |
| Test      | Playwright (E2E), Vitest (Unit)      |

### Ports (Dev)

| Service   | Port |
|-----------|------|
| Frontend  | 5300 (dev), 3300 (E2E) |
| Backend   | 5301 |
| MySQL     | 3309 |
| Redis     | 6382 |

---

## 2. Luồng Khách hàng (Storefront)

### 2.1 Xem & Lọc sản phẩm

**Workflow:**
```
Homepage → Collection (/san-pham) → Filter/Sort → Product Grid → Load More
```

**Chi tiết:**

| Bước | Mô tả | Component |
|------|--------|-----------|
| 1. Vào Collection | URL `/san-pham`, hiển thị tất cả sản phẩm | `CollectionPage` |
| 2. Filter sidebar (Desktop) | Bộ lọc: Danh mục, Khoảng giá (dual range slider), Màu sắc (swatches), Size (buttons) | `FilterSidebar` |
| 3. Filter bottom sheet (Mobile) | Cùng bộ lọc, hiện dạng bottom sheet 85vh | `FilterBottomSheet` |
| 4. Filter chips | Hiển thị filter đang áp dụng, có nút "Xóa hết" | `FilterChips` |
| 5. Sort | Dropdown: Nổi bật, Mới nhất, Giá thấp→cao, Giá cao→thấp, Đánh giá cao | `SortSelect` |
| 6. Product Grid | Grid 2/4 cột (toggle), product cards với hover effects | `ProductGrid` + `ProductCard` |
| 7. Load More | "Xem thêm" button, load thêm 12 sản phẩm | `LoadMoreButton` |

**Giải pháp kỹ thuật:**
- Filter state quản lý bằng React `useState` (client-side filtering)
- Price slider dùng dual `input[type="range"]` với `clipPath` để 2 handle không chồng
- Filter chips tự động tạo từ filter state, mỗi chip có nút xóa riêng
- Grid toggle cho phép chuyển 2↔4 cột

---

### 2.2 Xem chi tiết sản phẩm

**Workflow:**
```
Product Card → Product Detail (/san-pham/[slug])
  ├── Gallery (zoom, thumbnails)
  ├── Chọn màu (ColorSwatches)
  ├── Chọn size (SizeSelector) ← AUTO-SELECT size đầu tiên có hàng
  ├── Chọn số lượng (QuantityStepper)
  ├── THÊM VÀO GIỎ / MUA NGAY
  ├── Tabs: Mô tả, Đánh giá, Chính sách
  └── Sản phẩm liên quan
```

**Chi tiết variant selection:**

| Bước | Hành vi | Logic |
|------|---------|-------|
| Mount | Auto-select màu đầu tiên | `useState(product.colors[0]?.id)` |
| Mount | **Auto-select size đầu tiên có hàng** | `useEffect` tìm size có `stock_qty > 0` |
| Đổi màu | **Auto-select lại size phù hợp** | `useEffect` dependency trên `selectedColor` |
| Chọn size | Cập nhật currentVariant | `useMemo` tìm variant match color+size |
| Hết hàng | Size bị disable + strikethrough | `stock_qty === 0` → disabled button |
| Còn ít | Hiện cảnh báo "Chỉ còn X sản phẩm" | `stock_qty <= 5 && stock_qty > 0` |

**Giải pháp auto-select size (BUG FIX):**
```typescript
// Trước: selectedSize = null → user phải tự chọn
// Sau: useEffect auto-select size đầu tiên có hàng
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
```

---

### 2.3 Thêm nhanh (Quick Add Popup)

**Workflow:**
```
Product Card (hover/mobile tap) → Quick Add Popup
  ├── Ảnh sản phẩm (carousel)
  ├── SKU + Tình trạng
  ├── Giá + Badge giảm giá
  ├── Chọn màu + size (auto-select)
  ├── Chọn số lượng
  ├── THÊM VÀO GIỎ → ✓ ĐÃ THÊM → Auto mở Cart Drawer
  └── Link "Xem chi tiết sản phẩm"
```

**Trigger:**
- Desktop: Hover product card → `.proloop-actions` slide up → Click "THÊM VÀO GIỎ"
- Mobile: Tap icon ShoppingBag (góc phải dưới, 36x36px touch target)

**UX sau khi thêm:**
1. Button chuyển sang "✓ ĐÃ THÊM VÀO GIỎ HÀNG" (xanh)
2. 800ms delay → đóng popup + mở Cart Drawer

**Giải pháp mobile scroll (BUG FIX):**
- Thêm `overscroll-contain` ngăn scroll xuyên popup
- Thêm `pb-6` cho right panel đảm bảo nút "Thêm vào giỏ" không bị cắt
- `document.body.style.overflow = 'hidden'` khi popup mở

---

### 2.4 Giỏ hàng

**Workflow:**
```
Cart Page (/gio-hang)
  ├── Free Ship Bar (progress bar đến ngưỡng miễn phí)
  ├── Danh sách sản phẩm (CartItemRow)
  │   ├── Ảnh + Tên + Màu/Size
  │   ├── Quantity Stepper (min=1, max=max_qty)
  │   └── Nút xóa (Trash icon)
  ├── Coupon Input
  ├── Cart Summary (Tạm tính, Phí ship, Tổng cộng)
  ├── "TIẾN HÀNH THANH TOÁN" → /thanh-toan
  └── Mobile sticky CTA (bottom bar fixed)
```

**State management:**
- Zustand store `fashionecom-cart` persist localStorage
- Actions: `addItem`, `updateQty`, `removeItem`, `clearCart`, `getSubtotal`
- Hydration: `useStoreHydrated()` hook tránh SSR mismatch

---

### 2.5 Thanh toán (Checkout)

**Workflow:**
```
/thanh-toan
  ├── [Optional] Banner gợi ý đăng nhập (KHÔNG bắt buộc)
  ├── Step Indicator: ① Kiểm tra → ② Giao hàng → ③ Thanh toán
  │
  ├── Step 1: Review
  │   ├── Accordion "Đơn hàng (X sản phẩm)" — expand xem chi tiết
  │   ├── Mobile: Collapsible order summary
  │   └── Desktop: Sidebar "Tổng đơn hàng"
  │
  ├── Step 2: Shipping
  │   ├── Họ tên * + SĐT *
  │   ├── Tỉnh/TP * → Quận/Huyện * → Phường/Xã *
  │   ├── Địa chỉ cụ thể *
  │   ├── Ghi chú (optional)
  │   └── Validation: tất cả * phải có giá trị → enable nút next
  │
  ├── Step 3: Payment
  │   ├── COD (Thanh toán khi nhận hàng) — mặc định
  │   ├── Chuyển khoản ngân hàng → hiện thông tin TK
  │   └── Nút "ĐẶT HÀNG"
  │
  └── Submit
      ├── Validate cart với server (POST /products/cart/validate)
      ├── Kiểm tra invalid items (hết hàng, thay đổi giá)
      ├── Clear cart + redirect → /thanh-toan-thanh-cong
      └── Error handling: hiện thông báo lỗi inline
```

**Giải pháp Guest Checkout (BUG FIX):**

| Trước | Sau |
|-------|-----|
| `if (!isAuthenticated)` → block + redirect login | Bỏ block hoàn toàn |
| Không thể checkout nếu chưa đăng nhập | Guest checkout bình thường |
| — | Hiển thị banner gợi ý: "Đăng nhập để theo dõi đơn hàng và tích điểm thành viên" |
| — | Banner có link Đăng nhập + Tạo tài khoản |
| — | Authenticated user: ẩn banner |

---

## 3. Luồng Admin (Quản trị)

### 3.1 Tổng quan Admin Layout

```
/admin-login → /admin (Dashboard)
  ├── Sidebar (18 nav links)
  │   ├── Dashboard, Đơn hàng, Sản phẩm, Danh mục
  │   ├── Thuộc tính, Tồn kho, Khách hàng, Khuyến mãi
  │   ├── Layout Builder, Trang nội dung, Báo cáo, Media
  │   ├── Người dùng, Nhà cung cấp, Đánh giá, Import & Sync
  │   └── Cài đặt, Nhật ký
  └── Topbar (FashionEcom Admin, Thông báo, Avatar dropdown)
```

**Auth:**
- Login: POST `/admin/auth/login` → JWT token
- Token lưu cookie `fashionecom-auth-token` (7 ngày, Secure, SameSite=Strict)
- User info lưu Zustand persist `fashionecom-auth`
- Logout: xóa cả cookie + localStorage → redirect `/admin-login`

### 3.2 Dashboard

```
/admin
  ├── Range filter: 7d / 30d / 90d
  ├── 6 KPI cards
  │   ├── Doanh thu hôm nay, Doanh thu tháng
  │   ├── Đơn hàng (tháng), Khách hàng mới
  │   ├── AOV (Average Order Value)
  │   └── Tồn kho cảnh báo
  └── Charts
      ├── Doanh thu theo ngày (line chart)
      ├── Phương thức thanh toán (pie chart)
      ├── Top 10 SP bán chạy (bar chart)
      ├── Top 10 danh mục (bar chart)
      ├── Khách hàng mới (area chart)
      └── Heatmap đơn hàng (7x24 grid)
```

### 3.3 Quản lý Sản phẩm

```
/admin/san-pham — Danh sách
  ├── Status tabs: Tất cả | Đang bán | Ẩn | Hết hàng
  ├── Search: tên, SKU, mã sản phẩm
  ├── Category dropdown filter
  ├── Table: Tên, Giá, Kho, Trạng thái, Thao tác
  ├── Expandable variant rows (click mũi tên)
  └── "+ Thêm sản phẩm" → /admin/san-pham/tao

/admin/san-pham/tao — Tạo mới
  ├── 5 Tabs:
  │   ├── Tab 1: Thông tin cơ bản (Tên*, Mã*, Thương hiệu, Danh mục*, Mô tả ngắn)
  │   ├── Tab 2: Thông tin chi tiết (Xuất xứ, Chất liệu, Kiểu đóng gói, Tình trạng)
  │   ├── Tab 3: Mô tả (HTML editor, SEO: Slug, Title, Description)
  │   ├── Tab 4: Vận chuyển (Cân nặng, Kích thước, Pre-order)
  │   └── Tab 5: Thông tin khác (Trạng thái, Nổi bật, Mới)
  └── Sidebar: Content Quality Score (Cấp độ Nội dung)
      ├── Checklist: tên 25-100 ký tự, danh mục, mô tả ≥100, chi tiết, cân nặng
      └── Level: Cần cải thiện → Đạt chuẩn → Xuất sắc
```

### 3.4 Quản lý Đơn hàng

```
/admin/don-hang
  ├── Status tabs: Tất cả | Chờ xác nhận | Đã xác nhận | Đang giao | Đã giao | Hoàn thành | Đã hủy
  ├── Search: mã đơn hàng
  └── Table: Mã đơn, Khách hàng, Trạng thái (badge màu), Tổng tiền, Thanh toán, Ngày tạo
```

### 3.5 Các trang quản lý khác

| Trang | URL | Chức năng chính |
|-------|-----|-----------------|
| Danh mục | `/admin/danh-muc` | CRUD danh mục (hierarchical parent-child), modal form |
| Thuộc tính | `/admin/thuoc-tinh` | Tab Màu sắc (hex picker) + Tab Kích cỡ (groups) |
| Tồn kho | `/admin/ton-kho` | Filter warehouse/color, tabs: Tất cả/Còn hàng/Sắp hết/Hết hàng |
| Khách hàng | `/admin/khach-hang` | Table: Tên, Email, SĐT, Số đơn, Tổng chi tiêu |
| Khuyến mãi | `/admin/khuyen-mai` | Hub: Chương trình Sale, Flash Sale, Mã giảm giá, Loyalty |
| Mã giảm giá | `/admin/khuyen-mai/ma-giam` | CRUD coupon codes, random generator |
| Đánh giá | `/admin/danh-gia` | Tabs: Chờ duyệt/Đã duyệt/Từ chối/Ẩn, action: Duyệt/Từ chối/Phản hồi |
| Người dùng | `/admin/nguoi-dung` | CRUD users, 6 roles: Super Admin → Thủ kho |
| Nhà cung cấp | `/admin/nha-cung-cap` | CRUD suppliers, inline form |
| Media | `/admin/media` | Upload (drag-drop, 5MB max), grid preview, copy path, delete |
| Cài đặt | `/admin/cai-dat` | 3 groups: Thông tin cửa hàng, Giao hàng, Thanh toán |
| Layout Builder | `/admin/layout-builder` | Drag-drop sections, live preview, undo/redo |
| Nhật ký | `/admin/nhat-ky` | Audit log |

---

## 4. Chi tiết giải pháp kỹ thuật

### 4.1 Auth System

```
┌──────────────┐     POST /admin/auth/login      ┌──────────────┐
│   Frontend   │ ────────────────────────────────→ │   Backend    │
│              │ ←──── { user, accessToken } ───── │              │
└──────────────┘                                   └──────────────┘
       │
       ├── accessToken → cookie (fashionecom-auth-token, 7d, Secure)
       ├── user → Zustand persist (fashionecom-auth, localStorage)
       └── isAuthenticated() → check token in memory || cookie
```

### 4.2 Cart State (Zustand Persist)

```typescript
// localStorage key: "fashionecom-cart"
interface CartItem {
  variantId: string;   // PK
  productId: string;
  name: string;
  slug: string;
  color: string;
  color_hex: string;
  size: string;
  price: number;
  compare_at_price: number;
  image: string;
  qty: number;
  sku: string;
  max_qty: number;
}
```

### 4.3 Checkout State (Zustand Persist)

```typescript
// localStorage key: "fashionecom-checkout"
interface CheckoutState {
  step: 'review' | 'shipping' | 'payment';
  shipping: {
    name: string;
    phone: string;
    province_code: string;
    province: string;
    district_code: string;
    district: string;
    ward_code: string;
    ward: string;
    address_line: string;
    note: string;
  };
  paymentMethod: 'cod' | 'bank_transfer';
}
```

### 4.4 Product Variant Selection Logic

```
Mount
  │
  ├── selectedColor = colors[0].id (first color)
  │
  ├── useEffect(selectedColor) → auto-select size
  │   └── Find first size where variant(color, size).stock_qty > 0
  │       ├── Found → setSelectedSize(size.id)
  │       └── Not found → setSelectedSize(null)
  │
  ├── useMemo(selectedColor, selectedSize) → currentVariant
  │   └── Find variant matching both color + size
  │
  └── canAdd = !!currentVariant && currentVariant.stock_qty > 0
```

---

## 5. E2E Test Coverage

### 5.1 Test Files

| File | Tests | Luồng |
|------|-------|-------|
| `customer-flow.spec.ts` | 43 | Filter, Sort, Product Detail, Quick Add, Cart, Checkout (guest+auth) |
| `admin-flow.spec.ts` | 59 | Login, Dashboard, tất cả trang admin, sidebar navigation |
| `checkout.spec.ts` | 14 | Checkout 3 steps chi tiết |
| `cart.spec.ts` | 4 | Cart trống + có sản phẩm |
| `collection.spec.ts` | 5 | Collection page cơ bản |
| `search.spec.ts` | 11 | Search header + trang tìm kiếm |
| `auth.spec.ts` | 6 | Login/Register forms |
| `homepage.spec.ts` | 5 | Storefront layout |
| `navigation.spec.ts` | 5 | Route navigation |
| `responsive.spec.ts` | 5 | Mobile/Desktop responsive |
| `admin.spec.ts` | 16 | Admin layout + navigation (cũ) |
| **Tổng** | **~173** | |

### 5.2 Coverage theo luồng nghiệp vụ

| Luồng | Covered | Chi tiết |
|-------|---------|----------|
| Filter sản phẩm | ✅ | Sidebar, chips, clear, size filter, category links, price slider |
| Sort sản phẩm | ✅ | Dropdown options, desktop visibility |
| Xem chi tiết SP | ✅ | Navigation, color/size labels, auto-select, trust badges |
| Quick Add | ✅ | Open popup, SKU/giá, auto-select size, ESC close, link chi tiết |
| Giỏ hàng trống | ✅ | Empty state, link tiếp tục mua sắm |
| Giỏ hàng có SP | ✅ | Danh sách, tổng đơn, free ship bar, link thanh toán |
| Guest Checkout | ✅ | Không bị block, banner gợi ý, full 3-step flow |
| Auth Checkout | ✅ | Không hiện banner, full flow + chuyển khoản |
| Checkout Validation | ✅ | Cart trống, shipping disabled, quay lại, COD mặc định |
| Admin Login | ✅ | Form render, placeholder, submit empty |
| Admin Layout | ✅ | Sidebar, topbar, nav links, avatar dropdown |
| Admin Dashboard | ✅ | Heading, range buttons, KPI cards, charts |
| Admin Sản phẩm | ✅ | List, search, tabs, create form (5 tabs), quality score |
| Admin Đơn hàng | ✅ | List, status tabs, search |
| Admin Khách hàng | ✅ | List, table |
| Admin Danh mục | ✅ | List, create modal |
| Admin Tồn kho | ✅ | Load, status tabs |
| Admin Khuyến mãi | ✅ | Hub, card links, mã giảm giá navigation |
| Admin Thuộc tính | ✅ | Tab Màu sắc, tab Kích cỡ |
| Admin Cài đặt | ✅ | Setting groups, lưu, switch tab |
| Admin Người dùng | ✅ | List, create modal |
| Admin Media | ✅ | Heading, upload button |
| Admin Đánh giá | ✅ | Status tabs |
| Admin NCC | ✅ | Heading, add button |
| Admin Layout Builder | ✅ | Load, no 404 |
| Admin Nhật ký | ✅ | Load, no 404 |
| Sidebar Navigation | ✅ | 6 major routes click test |
| Search | ✅ | Mobile/desktop, popular, results, no results, clear |

### 5.3 Bug đã phát hiện và sửa qua E2E

| # | Bug | Loại | File | Fix |
|---|-----|------|------|-----|
| 1 | Checkout bắt buộc đăng nhập | Nghiệp vụ | `thanh-toan/page.tsx` | Bỏ `if(!isAuthenticated)` block, thêm banner gợi ý |
| 2 | Size không auto-select | Nghiệp vụ | `quick-add-popup.tsx`, `[slug]/page.tsx` | Thêm `useEffect` auto-select |
| 3 | Mobile quick-add scroll bị cắt | UI | `quick-add-popup.tsx` | `overscroll-contain` + `pb-6` |
| 4 | Test text không diacritics | Cú pháp | `search.spec.ts` | "Tim kiem" → "Tìm kiếm" |
| 5 | Test text không diacritics | Cú pháp | `checkout.spec.ts` | "Thanh toan" → "Thanh toán" |
| 6 | Test text không diacritics | Cú pháp | `cart.spec.ts` | "Gio hang" → "Giỏ hàng" |
| 7 | Test text không diacritics | Cú pháp | `collection.spec.ts` | "BO LOC" → "Bộ lọc" |
| 8 | Strict mode violations | Cú pháp | Nhiều spec files | Thêm `.first()`, `.last()`, scoped selectors |
