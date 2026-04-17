  
**FASHION ECOMMERCE**

Tài liệu đặc tả hệ thống — Version 2.0

Mobile-first  ·  Admin Panel  ·  Analytics  ·  Inventory  ·  Layout Builder

Tổng hợp & tối ưu từ Torano.vn · Aristino.com  |  April 2026

# **1\. Tổng quan & Mô hình nghiệp vụ**

## **1.1 Định hướng Mobile-First**

*Mobile chiếm \>70% traffic thương mại điện tử Việt Nam. Toàn bộ thiết kế và luồng nghiệp vụ lấy mobile làm baseline, sau đó scale up lên tablet và desktop.*

| Nguyên tắc | Desktop | Tablet (≥768px) | Mobile (\<768px — PRIMARY) |
| :---- | :---- | :---- | :---- |
| Layout grid | 5 cột | 3 cột | 2 cột (đôi khi 1 cột) |
| Navigation | Mega menu ngang | Hamburger \+ mega | Bottom nav tab bar |
| Filter sidebar | Sidebar cố định trái | Drawer overlay | Bottom sheet full-screen |
| Cart | Mini cart drawer phải | Mini cart drawer | Full-screen cart page |
| Checkout | 2 cột (form \+ summary) | 1 cột | 1 cột, floating summary |
| Font size tối thiểu | 14px | 14px | 16px (iOS prevent zoom) |
| Touch target | — | 44×44px | 44×44px bắt buộc |
| Images | WebP 800px | WebP 600px | WebP 400px, lazy load |
| CTA sticky | Sticky bottom bar | Sticky bottom bar | Sticky bottom bar luôn hiện |
| Payment | All methods | All methods | Ưu tiên MoMo/ZaloPay/QR trước |

## **1.2 Mobile Navigation Pattern**

### **Bottom Tab Bar (thay header nav trên mobile)**

* Tab 1: Trang chủ (Home icon)

* Tab 2: Danh mục (Grid icon)

* Tab 3: Tìm kiếm (Search icon — luôn visible)

* Tab 4: Yêu thích / Wishlist (Heart icon \+ badge count)

* Tab 5: Tài khoản (Person icon — hoặc Cart nếu ưu tiên mua hàng)

  *Cart button nổi bật (FAB \- Floating Action Button) ở góc phải dưới, overlapping bottom tab, badge số lượng item.*

### **Mobile Header (thu gọn)**

* Logo centered, hamburger menu bên trái, cart icon \+ badge bên phải

* Search bar toàn chiều rộng bên dưới header (không dùng icon overlay trên mobile)

* Announcement bar: auto-scroll ticker trên mobile (1 dòng, không xuống hàng)

### **Gesture & Interaction Mobile**

* Swipe right → mở drawer menu (hamburger expand)

* Swipe left trên product card → quick add to cart action

* Pull to refresh trên collection page

* Pinch to zoom trên product image

* Long press sản phẩm → context menu: Thêm vào giỏ / Yêu thích / Xem nhanh

* Swipe carousel gallery: momentum scroll, snap to center

## **1.3 Mobile Checkout Flow (Rút gọn)**

*Mobile checkout phải hoàn thành trong tối đa 3 bước, tránh người dùng bỏ cuộc.*

1. Bước 1: Review giỏ hàng — list item \+ free ship bar \+ note \+ CTA Thanh toán

2. Bước 2: Thông tin giao hàng — form stacked (1 cột), địa chỉ dropdown 3 cấp, saved addresses nếu đã đăng nhập

3. Bước 3: Thanh toán — danh sách payment method icons lớn, COD mặc định, online payment redirect

   *Summary đơn hàng: accordion collapse/expand (không chiếm screen trên mobile), mặc định collapsed.*

# **2\. Use Cases Frontend (Mobile-first Priority)**

## **2.1 Homepage Mobile**

### **UC-M01: Xem Homepage trên mobile**

* Announcement bar: single-line ticker scroll

* Header compact: logo \+ hamburger \+ cart FAB

* Hero banner: full-width, swipe carousel, aspect ratio 4:3 (portrait-friendly)

* Category chips: horizontal scroll pills (không phải card lớn như desktop)

* Flash sale countdown timer: nổi bật màu đỏ, số đếm ngược

* Product grid 2 cột: card compact, ảnh vuông, badge, tên 2 dòng max, giá

* 'Xem thêm' button thay vì infinite scroll (tránh vô tình scroll khi ngón tay vuốt)

* Bottom tab bar cố định

## **2.2 Product Detail Mobile**

### **UC-M02: Xem chi tiết sản phẩm trên mobile**

* Gallery: full-width swipe carousel, dots indicator, thumbnail scroll horizontal bên dưới

* Thông tin sản phẩm: stacked dọc sau gallery

* Chọn màu: swatch row scroll ngang

* Chọn size: button grid 2 hàng × N cột

* Size guide: bottom sheet (không phải modal dialog desktop)

* Qty stepper: compact, inline với Thêm vào giỏ

* Sticky bottom bar: luôn hiện — giá \+ Thêm vào giỏ \+ Mua ngay (2 CTA side by side)

* Trust badges: horizontal scroll, icon nhỏ

* Tab section: scroll ngang tab headers, content bên dưới

* Related products: horizontal scroll (không phải grid)

## **2.3 Collection Page Mobile**

### **UC-M03: Lọc sản phẩm trên mobile**

* Header: tên danh mục \+ số SP \+ 2 icon: Filter (funnel) \+ Sort (arrows)

* Filter icon → bottom sheet với tất cả filter options

* Sort icon → bottom action sheet 4 options

* Active filters: horizontal scroll chips bên dưới header

* Grid: 2 cột mặc định, toggle 1 cột (cho ảnh lớn hơn)

* Load more button ở cuối (không infinite scroll)

## **2.4 Search Mobile**

### **UC-M04: Tìm kiếm trên mobile**

* Dedicated search screen (không overlay) với back button

* Keyboard hiện lên ngay khi vào màn hình search

* Recent searches: chips xóa được

* Popular searches: dạng list

* Voice search button (optional — Web Speech API)

* Kết quả real-time dưới input khi gõ

* Filter/Sort trong màn search result giống collection page

Yêu cầu của anh/chị về việc đảm bảo trải nghiệm **Web (Desktop/Tablet) phải thật tốt, tiện ích, đồng thời đẹp và hài hòa** là rất chính đáng, vì Mobile-First không có nghĩa là Desktop-Last.

Tài liệu hiện tại đã xác định các nguyên tắc layout khác biệt giữa ba breakpoint (**Mục 1.1**). Để nâng cao chất lượng UX/UI của Desktop lên tiêu chuẩn "đẹp và hài hòa" như yêu cầu, tôi đề xuất bổ sung một mục mới, tập trung vào **các mẫu tương tác và thẩm mỹ dành riêng cho Desktop (Desktop UX/UI & Visual Harmony)**

.-----Bổ sung Mục 2.5: Desktop UX/UI & Visual Harmony

**(Thêm vào Mục 2: Use Cases Frontend, sau Mục 2.4 Search Mobile)**

Module này tập trung vào các mẫu tương tác nâng cao và nguyên tắc thẩm mỹ để tận dụng tối đa không gian màn hình lớn (≥1280px).

| Tính năng / Nguyên tắc UX | Mô tả chi tiết |
| ----- | ----- |
| **Mega Menu Nâng cao** | **Interaction:** Kích hoạt bằng **Hover** (không cần click), có độ trễ ngắn (\\\<200ms) để tránh nhầm lẫn. **Aesthetics:** Chia Mega Menu thành 3-4 cột, sử dụng \*\*hình ảnh/banner nhỏ\*\* để giới thiệu các bộ sưu tập nổi bật bên trong menu, tăng tính trực quan và thẩm mỹ. |
| **Product Card Hover** | **Quick View:** Khi hover chuột lên Product Card, hiển thị \*\*ảnh thứ hai\*\* của sản phẩm (Secondary Image) và nút **Quick View Modal** (cho phép xem chi tiết cơ bản và chọn size/màu mà không cần rời trang Collection). |
| **Filter Sidebar Cố định** | **Interaction:** Sidebar (Mục 1.1) luôn hiển thị cố định bên trái, giữ trạng thái lọc (persistent state) khi người dùng cuộn. Áp dụng **Instant Filtering** (kết quả SP cập nhật ngay lập tức sau khi chọn/bỏ chọn filter) mà không cần tải lại trang. |
| **Mini Cart Drawer** | **Mini Cart Drawer (Mục 1.1):** Khi click hoặc hover vào icon Giỏ hàng, hiển thị drawer trượt ra từ bên phải. Cho phép người dùng \*\*xem/sửa số lượng\*\* và \*\*xóa item\*\* trực tiếp trong drawer mà không cần chuyển sang trang Giỏ hàng chính (Full-screen Cart Page). |
| **Không gian Trắng (Whitespace)** | Sử dụng không gian trắng rộng rãi (generous whitespace), đặc biệt ở lề (margins) và khoảng cách giữa các Section/Component để tạo cảm giác **sang trọng và hài hòa** (Luxury/Premium Feel), tránh làm trang web bị chật chội do tận dụng quá nhiều 5 cột grid. |
| **Sử dụng Media Độ phân giải cao** | Tận dụng băng thông lớn của Desktop: Hình ảnh Hero Banner (1440px) và Product Gallery hiển thị ở độ phân giải cao, sắc nét, sử dụng hiệu ứng **Subtle Parallax Scroll** (cuộn nhẹ) cho các Banner lớn để tăng tính thẩm mỹ và độ sâu thị giác (visual depth). |

# **3\. Admin Panel — Tổng quan**

## **3.1 Kiến trúc Admin**

*Admin Panel là ứng dụng riêng biệt hoặc sub-path /admin, chỉ truy cập được khi đăng nhập với role ADMIN hoặc STAFF.*

| Module | Sub-module | Mô tả |
| :---- | :---- | :---- |
| Dashboard | Tổng quan | KPIs: doanh thu, đơn hàng, khách hàng mới, tồn kho cảnh báo |
|  | Báo cáo nhanh | Biểu đồ doanh thu 7/30/90 ngày, top sản phẩm, top khách |
| Sản phẩm | Danh sách SP | CRUD, filter, bulk actions |
|  | Thêm/sửa SP | Form đầy đủ: thông tin, variants, ảnh, SEO |
|  | Danh mục | Cây danh mục, drag-drop sắp xếp, icon/banner |
|  | Thuộc tính | Quản lý màu sắc, size, chất liệu |
|  | Tồn kho | Số lượng theo variant, cảnh báo sắp hết, nhập kho |
| Đơn hàng | Danh sách | Filter theo trạng thái, tìm kiếm, export |
|  | Chi tiết đơn | Timeline hành trình, cập nhật trạng thái, in phiếu |
|  | Đổi trả | Quản lý yêu cầu đổi/trả, approve/reject |
| Khách hàng | Danh sách KH | Profile, lịch sử mua hàng, tổng chi tiêu |
|  | Phân khúc | RFM segmentation, nhóm KH VIP/thường/mới |
| Khuyến mãi | Mã giảm giá | CRUD discount codes, % hoặc fixed, điều kiện áp dụng |
|  | Flash sale | Time-limited sale, sản phẩm và % giảm |
| Tài chính | Doanh thu | Báo cáo lỗ lãi, chi phí, lợi nhuận theo kỳ |
|  | Tồn kho | Giá trị tồn kho, xoay vòng hàng |
| Layout Builder | Trang chủ | Kéo thả sections, cấu hình nội dung |
|  | Banners | Upload và quản lý banner slider |
|  | Menu | Cấu hình navigation links |
| Cài đặt | Thông tin shop | Tên, logo, contact, địa chỉ |
|  | Vận chuyển | Phương thức, phí, vùng giao hàng |
|  | Thanh toán | Kích hoạt/cấu hình cổng TT |
|  | Email template | Chỉnh sửa nội dung email tự động |
|  | SEO | Meta defaults, robots.txt, sitemap |

# **4\. Admin — Dashboard & Analytics**

## **4.1 Dashboard Tổng quan**

### **KPI Cards (hàng đầu trang)**

| KPI | Công thức | Hiển thị | Drill-down |
| :---- | :---- | :---- | :---- |
| Doanh thu hôm nay | Tổng giá trị đơn PAID hôm nay | So với hôm qua (% tăng/giảm) | Xem chi tiết từng đơn |
| Doanh thu tháng này | Tổng tháng hiện tại | So với tháng trước (%) | Biểu đồ theo ngày |
| Tổng đơn hàng | Đếm đơn trong kỳ | Breakdown: pending/shipped/done | Đến trang Orders |
| Khách hàng mới | Đăng ký trong kỳ | So với kỳ trước | Đến trang Customers |
| Giá trị đơn TB (AOV) | Revenue / Orders | Xu hướng 30 ngày | Phân bố giá trị đơn |
| Tồn kho cảnh báo | SP có stock ≤ threshold | Số lượng variant sắp hết | Đến trang Inventory |

### **Charts trên Dashboard**

* Biểu đồ doanh thu: Line chart theo ngày (7/30/90/365 ngày, custom range)

* Biểu đồ đơn hàng: Bar chart phân loại theo trạng thái (chờ xác nhận/đang giao/hoàn thành)

* Pie chart phương thức thanh toán: COD vs Online (MoMo/VNPAY/Payoo/...)

* Top 10 sản phẩm bán chạy: bar chart ngang, filter theo kỳ

* Top 10 danh mục: bar chart, revenue và số lượng

* Biểu đồ khách hàng mới theo ngày: area chart

* Heatmap đơn hàng theo giờ trong ngày × ngày trong tuần

## **4.2 Báo cáo Lỗ/Lãi**

*Báo cáo P\&L (Profit & Loss) cơ bản dành cho shop thời trang không cần phần mềm kế toán chuyên sâu.*

| Mục | Cách tính | Ghi chú |
| :---- | :---- | :---- |
| DOANH THU | Tổng giá bán × số lượng (đơn đã giao) | Loại trừ đơn hủy và đơn đổi trả |
| Giảm giá / coupon | Tổng discount\_amount áp dụng | Trừ vào doanh thu thuần |
| Doanh thu thuần | Doanh thu \- Giảm giá | Baseline tính lãi |
| Giá vốn (COGS) | cost\_price × số lượng bán | Nhập khi tạo variant sản phẩm |
| Lãi gộp | Doanh thu thuần \- COGS | Gross Profit |
| Chi phí vận chuyển | Phí ship trả cho đơn vị VC | Nếu freeship thì shop chịu |
| Phí cổng TT | % × giá trị đơn online | Mỗi cổng có % khác nhau (\~1–2.5%) |
| Lãi ròng | Lãi gộp \- Chi phí ship \- Phí cổng | Net Profit (chưa trừ fix cost) |
| Tỷ lệ lãi gộp | Lãi gộp / Doanh thu thuần × 100 | Gross Margin % |

### **Filters báo cáo tài chính**

* Theo kỳ: Hôm nay / Tuần này / Tháng này / Quý này / Năm này / Tùy chỉnh

* Theo danh mục sản phẩm

* Theo phương thức thanh toán

* Theo kênh bán: website / manual order

* Export: CSV, Excel (.xlsx)

## **4.3 Quản lý Tồn kho**

### **Màn hình Inventory**

| Cột | Nội dung | Ghi chú |
| :---- | :---- | :---- |
| Sản phẩm | Ảnh \+ tên \+ SKU | Link đến trang sửa SP |
| Biến thể | Màu / Size | Từng dòng là 1 variant |
| Tồn kho | Số lượng hiện tại | Màu đỏ nếu ≤ threshold |
| Đã bán (tháng) | Số lượng bán trong 30 ngày | Dự tính tốc độ bán |
| Ngày hết hàng (dự tính) | Tồn / Tốc độ bán | Cảnh báo nếu \< 14 ngày |
| Giá vốn | cost\_price | Nhân tồn kho \= giá trị tồn |
| Giá trị tồn | cost\_price × stock | Tổng giá trị kho |
| Hành động | Điều chỉnh kho / Nhập thêm | Modal nhập số lượng \+ lý do |

### **Nhập kho**

* Modal: chọn sản phẩm \+ variant, số lượng nhập, giá vốn mới (cập nhật weighted average), ghi chú

* Lịch sử nhập kho: log theo thời gian với người thực hiện

* Xuất kho điều chỉnh: trừ tồn do hàng lỗi/mất (với lý do)

### **Báo cáo Tồn kho**

* Tổng giá trị tồn kho hiện tại

* Danh sách sản phẩm sắp hết (stock ≤ low\_stock\_threshold)

* Danh sách sản phẩm hết hàng (stock \= 0\)

* Dead stock: sản phẩm tồn \>90 ngày chưa bán

* Inventory turnover rate: COGS / Average Inventory

Tuy nhiên, các chỉ số chuyên sâu hơn về **hành vi khách hàng (Behavioral Analytics)** và **đo lường hiệu suất khuyến mãi (Promotional Effectiveness)** như:

1. **Lượt xem (Page views)** theo sản phẩm.  
2. **Lượt tìm kiếm** (Search volume) và tỷ lệ chuyển đổi từ tìm kiếm.  
3. **Hiệu suất kỳ khuyến mại** (ROI, Incremental Sales).  
4. **Phân tích % giảm giá** theo cấp độ.

chưa được định nghĩa là các báo cáo có sẵn trong Admin Panel.

Để bổ sung đầy đủ các yêu cầu này, tôi đề xuất thêm một mục mới là **4.4 Báo cáo Chuyên sâu (Advanced Analytics)** vào phần **Admin — Dashboard & Analytics** trong tài liệu.-----Bổ sung Mục 4.4: Báo cáo Chuyên sâu (Advanced Analytics)

**(Thêm vào Mục 4.4, dưới Mục 4.3 Quản lý Tồn kho)**

| Tính năng | Phân tích chi tiết |
| ----- | ----- |
| **Báo cáo Lượt xem Sản phẩm** | Thống kê **Tổng lượt xem** (Page views) theo Sản phẩm, Danh mục, và Biến thể. Tính toán các tỷ lệ chuyển đổi hành vi: \*   **View-to-Cart Rate:** Tỷ lệ khách hàng thêm vào giỏ sau khi xem sản phẩm. \*   **View-to-Purchase Rate:** Tỷ lệ khách hàng hoàn tất mua hàng sau khi xem sản phẩm. Filter theo thời gian, thiết bị (Mobile/Desktop), và nguồn traffic. |
| **Báo cáo Hành vi Tìm kiếm** | Cung cấp insights về ý định mua hàng của khách hàng: \*   **Top Search Terms:** 10 từ khóa được tìm kiếm nhiều nhất (theo ngày/tuần/tháng). \*   **No Result Searches:** Các từ khóa tìm kiếm không trả về kết quả (để Admin bổ sung SP hoặc từ khóa). \*   **Search Conversion Rate:** Tỷ lệ chuyển đổi mua hàng của các phiên có sử dụng chức năng tìm kiếm. |
| **Đo lường Hiệu suất Khuyến mãi** | Đo lường hiệu quả thực sự của các chiến dịch **Mã giảm giá** và **Flash Sale**: \*   **Incremental Sales:** Doanh thu tăng thêm so với doanh thu dự kiến (baseline) nếu không có khuyến mãi. \*   **Lãi gộp (Gross Margin) trong kỳ sale:** So sánh lãi gộp trước và sau khi áp dụng giảm giá, giúp đánh giá chi phí khuyến mãi. |
| **Phân tích % Giảm giá (Discount Depth)** | Phân tích sâu về chi phí giảm giá: \*   **Tỷ lệ Discount TB:** Tổng giá trị discount / Tổng doanh thu. \*   **Phân khúc Sale theo Discount Tier:** Phân loại và báo cáo doanh thu từ các đơn hàng có mức giảm giá khác nhau (ví dụ: 0–10% giảm, 11–25% giảm, \>25% giảm). |
| **Báo cáo Banners & A/B Test** | **Click-Through Rate (CTR)** cho từng phiên bản banner (đã có trong **Mục 8.3**). So sánh CTR của các banner/section trên Homepage để tối ưu hóa Layout Builder. |

# **5\. Admin — Quản lý Đơn hàng & Hành trình**

## **5.1 Danh sách Đơn hàng**

| Filter/Feature | Mô tả |
| :---- | :---- |
| Tìm kiếm | Mã đơn, tên KH, SĐT, email |
| Filter trạng thái | Tất cả / Chờ xác nhận / Đã xác nhận / Đang giao / Đã giao / Đã hủy / Đổi trả |
| Filter thanh toán | Chờ TT / Đã TT / Thất bại / Hoàn tiền |
| Filter ngày | Hôm nay / Hôm qua / 7 ngày / 30 ngày / Tùy chỉnh |
| Filter phương thức TT | COD / MoMo / VNPAY / Payoo / Chuyển khoản |
| Sắp xếp | Mới nhất / Cũ nhất / Giá trị cao / Giá trị thấp |
| Bulk actions | Xác nhận hàng loạt / In phiếu / Export CSV |
| Quick stats | Cards: Mới hôm nay / Chờ xử lý / Đang giao / Doanh thu hôm nay |

## **5.2 Chi tiết Đơn hàng & Hành trình (Timeline)**

### **Layout trang chi tiết đơn hàng**

* Header: mã đơn \+ ngày tạo \+ trạng thái badge \+ actions (In phiếu / Xác nhận / Hủy / Đổi trả)

* 2 cột: trái (thông tin đơn) | phải (timeline \+ notes)

### **Timeline Hành trình Đơn hàng**

| Bước | Trạng thái | Trigger | Hành động Admin |
| :---- | :---- | :---- | :---- |
| 1 | Đơn hàng mới | KH đặt hàng thành công | Xem chi tiết, xác nhận hoặc hủy |
| 2 | Đã xác nhận | Admin click Xác nhận | Email gửi KH, chuẩn bị đóng gói |
| 3 | Đang đóng gói | Cập nhật thủ công hoặc WMS | In phiếu giao hàng |
| 4 | Đã bàn giao VC | Nhập mã tracking / API shipper | Email \+ SMS gửi KH với mã tracking |
| 5 | Đang vận chuyển | Webhook từ đơn vị VC | Hiển thị tracking realtime |
| 6 | Giao thành công | Webhook xác nhận giao | Đơn hoàn thành, trigger review email |
| 7A | Giao thất bại | Webhook từ VC | Liên hệ KH, sắp xếp giao lại |
| 7B | Đã hủy | Admin hoặc KH yêu cầu | Hoàn tồn kho, hoàn tiền nếu đã TT |
| 8 | Yêu cầu đổi/trả | KH gửi yêu cầu | Quy trình Return Management |

### **Tracking tích hợp**

* Hỗ trợ API đơn vị vận chuyển: GHN, Ninja Van, Ahamove, J\&T Express

* Webhook nhận cập nhật trạng thái tự động

* Hiển thị tracking timeline trong trang đơn hàng phía admin và KH

* Push notification / email khi trạng thái thay đổi

## **5.3 Quản lý Đổi trả (RMA)**

| Trường | Giá trị |
| :---- | :---- |
| return\_id | Auto increment |
| order\_id | Liên kết đơn gốc |
| items\[\] | SP trả về \+ số lượng \+ lý do |
| reason | Lỗi hàng / Sai sản phẩm / Không vừa / Đổi ý / Khác |
| type | Đổi hàng / Hoàn tiền / Đổi kích thước |
| status | Chờ xử lý / Đã tiếp nhận / Đang kiểm tra / Hoàn thành / Từ chối |
| refund\_amount | Số tiền hoàn (nếu type=refund) |
| staff\_notes | Ghi chú nội bộ (KH không thấy) |
| customer\_notes | Ghi chú từ KH |
| photos\[\] | Ảnh KH gửi kèm |

# **6\. Admin — Quản lý Khách hàng**

## **6.1 Profile Khách hàng**

### **Thông tin cơ bản**

* Họ tên, giới tính, ngày sinh, email, SĐT

* Ngày đăng ký, lần cuối đăng nhập, số lần đăng nhập

* Địa chỉ lưu (có thể nhiều địa chỉ)

* Tags/nhãn: VIP / Thường xuyên / Mới / Nguy cơ rời bỏ

### **Thống kê mua hàng của KH**

| Chỉ số | Mô tả | Hiển thị |
| :---- | :---- | :---- |
| Tổng số đơn | Tất cả đơn (kể cả hủy) | Count |
| Đơn hoàn thành | Delivered orders | Count \+ % |
| Tổng chi tiêu | Sum(order total) của đơn hoàn thành | Số tiền |
| Giá trị đơn TB | Total spend / completed orders | AOV của KH này |
| Sản phẩm thường mua | Top 3 category | Chips |
| Phương thức TT ưa dùng | Mode của payment\_method | Badge |
| Lần mua đầu | First order date | Date |
| Lần mua gần nhất | Latest order date | Date \+ 'X ngày trước' |
| Điểm RFM | Recency / Frequency / Monetary score | Phân loại KH |

### **Lịch sử đơn hàng của KH**

* List tất cả đơn: mã, ngày, tổng tiền, trạng thái, phương thức TT

* Click vào từng đơn → chi tiết đơn hàng

* Tìm kiếm trong lịch sử đơn của KH

## **6.2 Phân khúc Khách hàng (RFM)**

*RFM \= Recency (gần đây), Frequency (tần suất), Monetary (giá trị). Tự động phân loại KH.*

| Phân khúc | Đặc điểm | Hành động marketing đề xuất |
| :---- | :---- | :---- |
| Champions | Mua gần đây, thường xuyên, giá trị cao | Upsell, loyalty rewards, review request |
| Loyal Customers | Mua thường xuyên, giá trị ổn định | SP mới, ưu đãi member exclusive |
| Potential Loyalists | Mua gần đây, 1-2 lần | Welcome series, cross-sell |
| New Customers | Mua lần đầu gần đây | Onboarding email, hướng dẫn đổi trả |
| At Risk | Từng mua thường xuyên, lâu không mua | Win-back email, ưu đãi đặc biệt |
| Cant Lose Them | Từng mua nhiều, rất lâu rồi không mua | Aggressive win-back, gọi điện |
| Hibernating | Ít mua, lâu rồi | Thông báo sale lớn, SP mới |
| Lost | Rất lâu không mua, giá trị thấp | Unsubscribe campaign hoặc bỏ |

# **7\. Admin — Quản lý Sản phẩm & Danh mục**

## **7.1 Form Thêm/Sửa Sản phẩm**

### **Tab 1: Thông tin cơ bản**

* Tên sản phẩm (required, max 200 chars)

* Mã sản phẩm / SKU gốc (auto-generate hoặc nhập tay)

* Thương hiệu (dropdown)

* Danh mục (multi-select tree, sản phẩm có thể thuộc nhiều danh mục)

* Tags (input with autocomplete)

* Trạng thái: Đang bán / Nháp / Ẩn

* Hiển thị trên trang: Sản phẩm mới / Sale / Nổi bật (checkbox)

* Mô tả ngắn (plain text, hiển thị dưới title)

* Mô tả chi tiết (rich text editor: Bold/Italic/List/Image/Table)

### **Tab 2: Biến thể (Variants)**

* Định nghĩa thuộc tính: Màu sắc \+ Kích thước (có thể thêm: Chất liệu/Kiểu dáng)

* Auto-generate tất cả combinations

* Bảng variants: SKU / Giá bán / Giá gốc / Giá vốn / Tồn kho / Ảnh variant

* Bulk edit: chỉnh giá/tồn cho nhiều variant cùng lúc

* Import variants từ CSV

### **Tab 3: Hình ảnh & Media**

* Upload nhiều ảnh, drag-drop sắp xếp thứ tự

* Gán ảnh cho từng variant màu sắc

* Video URL (YouTube/Vimeo embed)

* Ảnh thumbnail cho danh sách

* Auto-resize: hệ thống tạo 3 sizes (400/800/1200px)

### **Tab 4: SEO**

* SEO Title (max 60 chars, counter)

* Meta Description (max 160 chars, counter)

* URL slug (auto từ tên, cho phép sửa tay)

* Preview snippet Google

* Canonical URL (nếu duplicate content)

### **Tab 5: Cài đặt thêm**

* Trọng lượng / Kích thước (cho tính phí ship)

* Barcode (EAN/UPC)

* Hàng cần ship / Hàng số (toggle)

* Cho phép mua khi hết hàng (backorder)

* Ngày bắt đầu bán (scheduled publish)

## **7.2 Quản lý Danh mục**

### **Cây danh mục**

* Tree view có thể expand/collapse

* Drag-drop sắp xếp thứ tự hiển thị

* Drag vào trong một danh mục để tạo sub-category

* Tối đa 3 cấp: Áo nam \> Áo Polo \> Áo Polo ngắn tay

### **Thông tin mỗi danh mục**

* Tên danh mục (đa ngôn ngữ nếu cần)

* URL slug

* Ảnh thumbnail / Banner danh mục

* Mô tả (cho SEO)

* Icon (SVG upload hoặc chọn từ icon library)

* Hiển thị trên: Menu chính / Footer / Sidebar / Tất cả

* Sắp xếp sản phẩm mặc định: Nổi bật / Mới nhất / Giá tăng / Bán chạy

* SEO: title \+ meta description

* Trạng thái: Hiện / Ẩn

## **7.3 Quản lý Thuộc tính**

### **Màu sắc**

* Tên màu (Đen, Trắng, Xanh Navy...)

* Mã HEX để hiển thị swatch (\#1a1a1a)

* Thứ tự hiển thị

### **Kích thước**

* Nhóm size: Áo (S/M/L/XL/XXL) / Quần số (28/30/32/34) / Giày (39–44)

* Mô tả: hướng dẫn chọn size tương ứng

* Bảng quy đổi theo số đo cơ thể

Tuy nhiên, để hoàn thiện các tính năng nâng cao nằm trong **Phase 5 – Advanced**, tôi xin bổ sung chi tiết 3 module sau vào tài liệu đặc tả, theo đúng tinh thần mở rộng hệ thống: **Quản lý Đa Kho hàng**, **Hệ thống Khách hàng Thân thiết (Loyalty)**, và **Quản lý Đánh giá/Hỏi đáp**.-----Bổ sung Chi tiết Tính năng Nâng cao (Advanced Modules)1. Bổ sung vào Mục 4.3 Quản lý Tồn kho: Quản lý Đa Kho hàng (Multi-Warehouse Inventory)

Đây là yêu cầu cần thiết khi shop có nhiều điểm bán/kho hàng. Bổ sung chi tiết này sau Mục 4.3.3 Báo cáo Tồn kho.

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **Danh sách Kho/Cửa hàng** | CRUD (Thêm/Sửa/Xóa) các địa điểm lưu trữ hàng hóa (Kho Trung tâm, Cửa hàng 1...). Trường dữ liệu bao gồm: Tên kho, Mã kho (Code), Địa chỉ chi tiết, SĐT liên hệ. |
| **Phân bổ Tồn kho theo Vị trí** | Tồn kho của từng biến thể sản phẩm (\`variant\_id\`) được quản lý theo từng địa điểm (\`warehouse\_id\`). Báo cáo tồn kho hiển thị tổng và tồn kho chi tiết theo từng kho. |
| **Phiếu Điều chuyển Kho** | Lập phiếu chuyển hàng giữa các kho. Phiếu gồm: Kho xuất, Kho nhập, Danh sách SP \+ Quantity, Lý do chuyển. Theo dõi trạng thái: Chờ đóng gói $\\to$ Đang vận chuyển $\\to$ Đã nhận. |
| **Quy tắc Fulfillment** | Cài đặt logic ưu tiên để hệ thống tự động chọn kho thực hiện đơn hàng online: 1\. Kho gần khách nhất (tối ưu chi phí). 2\. Kho có tồn kho lớn nhất. 3\. Chỉ định kho thủ công. |
| **Hỗ trợ Click & Collect** | Khách hàng có thể chọn nhận hàng tại cửa hàng/kho hàng có tồn kho khả dụng. |
| **Kiểm kho (Stock-take)** | Chức năng tạo phiên kiểm kê: đóng băng tồn kho tạm thời, so sánh số lượng thực tế với hệ thống, tạo báo cáo chênh lệch (thừa/thiếu) để điều chỉnh tồn kho chính xác. |

2\. Bổ sung vào Mục 6.2 Phân khúc Khách hàng (RFM): Hệ thống Khách hàng Thân thiết (Loyalty Program)

Phần này sẽ tạo thành **Mục 6.3** mới, mở rộng từ cơ sở phân khúc RFM.

**6.3 Hệ thống Điểm thưởng & Phân hạng (Loyalty & Tiering)**

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **Phân hạng (Tiering)** | Tự động phân loại khách hàng thành các cấp độ (ví dụ: Member, Silver, Gold, Platinum). Quy tắc Thăng/Giáng hạng dựa trên **Tổng chi tiêu trong 12 tháng gần nhất** hoặc **Số lượng đơn hàng hoàn thành**. |
| **Cài đặt Quyền lợi** | Cấu hình ưu đãi cố định cho từng hạng (ví dụ: Gold giảm 5% mọi đơn hàng, Platinum ưu tiên giao hàng), hoặc tự động gửi Voucher sinh nhật. |
| **Quy tắc Tích điểm** | **Tỷ lệ Tích điểm:** Cài đặt tỷ lệ VND $\\to$ Điểm (ví dụ: 10.000 VND \= 1 điểm). Có thể loại trừ các danh mục/sản phẩm đã giảm giá. |
| **Quy tắc Sử dụng điểm** | **Tỷ lệ Đổi điểm:** Cài đặt tỷ lệ Điểm $\\to$ VND (ví dụ: 100 điểm \= 10.000 VND). **Giới hạn:** Thiết lập % giá trị đơn hàng tối đa có thể thanh toán bằng điểm (ví dụ: 50% tổng giá trị). |
| **Lịch sử Giao dịch Điểm** | Trong Profile Khách hàng, hiển thị chi tiết: Điểm tích lũy, Điểm đã sử dụng, Điểm hết hạn, Điểm hoàn lại (từ đơn hàng bị hủy/trả). |
| **Quản lý Hết hạn Điểm** | Điểm thưởng có thể hết hạn sau X tháng. Hệ thống tự động gửi thông báo nhắc nhở cho khách hàng. |

3\. Bổ sung vào Mục 7.3 Quản lý Thuộc tính: Quản lý Đánh giá & Hỏi đáp Sản phẩm (Reviews & Q\&A)

Phần này sẽ tạo thành **Mục 7.4** mới, quản lý nội dung do người dùng tạo (UGC).

**7.4 Quản lý Đánh giá Sản phẩm (Reviews & Ratings)**

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **Kiểm duyệt Review (Moderation)** | Admin Panel có màn hình riêng để xem xét tất cả đánh giá mới (pending). Cho phép **Phê duyệt** (Hiển thị ngay), **Từ chối** (Ẩn) hoặc **Sửa** nội dung. |
| **Tích hợp Media** | Cho phép khách hàng đính kèm **ảnh** và **video ngắn** vào nhận xét. Admin kiểm duyệt nội dung media riêng biệt. |
| **Trả lời Review** | Cho phép nhân viên Admin/CSKH trả lời công khai nhận xét của khách hàng. Câu trả lời của Admin được đánh dấu là **'Official Reply'** trên storefront. |
| **Báo cáo Đánh giá** | Thống kê: Điểm trung bình toàn shop, Phân bố sao (Star Breakdown Chart), Top sản phẩm có rating cao nhất/thấp nhất. |
| **Hỏi & Đáp (Q\&A)** | Cho phép khách hàng đặt câu hỏi về sản phẩm. Admin có thể trả lời trực tiếp từ Admin Panel. |
| **Tự động Trigger Review** | Hệ thống tự động gửi email hoặc push notification yêu cầu đánh giá sau 7 ngày kể từ khi đơn hàng đạt trạng thái **Giao thành công**. |

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **Danh sách Nhà cung cấp** | CRUD (Thêm/Sửa/Xóa) thông tin NCC. Các trường dữ liệu: Tên NCC, Mã số thuế, Địa chỉ, Người liên hệ, SĐT, Email, Điều khoản thanh toán (ví dụ: Net 30, COD). |
| **Lịch sử giao dịch NCC** | Trong profile của từng NCC, hiển thị lịch sử các **Đơn đặt hàng (PO)** đã tạo, **Phiếu Nhập kho** đã nhận, **Tổng giá trị** đã thanh toán. |
| **Liên kết Sản phẩm** | Gán các sản phẩm/variant cụ thể với NCC mặc định (Primary Supplier), bao gồm cả Mã SP của NCC (Supplier SKU) để dễ dàng đối chiếu khi nhập hàng. |
| **Báo cáo Mua hàng theo NCC** | Thống kê số lượng và tổng giá trị hàng đã nhập từ NCC đó trong một kỳ (giúp đánh giá hiệu suất và đàm phán giá). |

**2\. Quản lý Đơn đặt hàng (Purchase Orders \- PO)**

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **Tạo Đơn đặt hàng (PO)** | Lập PO mới, chọn NCC, danh sách sản phẩm cần mua (bao gồm variant), số lượng, và **Giá mua (Unit Cost)**. Giá mua này sẽ dùng để tính Giá vốn (Weighted Average) khi hàng được nhập kho. |
| **PO Trạng thái** | Theo dõi 5 trạng thái chính: **Draft** (Nháp) $\\to$ **Pending Approval** (Chờ duyệt) $\\to$ **Ordered** (Đã gửi NCC) $\\to$ **Received** (Đã nhận hàng một phần/toàn bộ) $\\to$ **Completed/Closed**. |
| **Nhập kho từ PO** | Khi hàng về, nhân viên kho chỉ cần chọn PO, hệ thống sẽ tự động tạo **Phiếu Nhập kho (Goods Receipt Note)**. Phiếu nhập chỉ định số lượng thực nhận và kho đích (hỗ trợ Multi-Warehouse). Tồn kho tự động cập nhật. |
| **PO Tracking** | Thêm các trường dữ liệu liên quan đến logistics: Ngày dự kiến giao, Mã vận đơn (nếu có), Chi phí vận chuyển/hải quan của lô hàng (được tính vào COGS nếu cần). |
| **Cảnh báo Tái đặt hàng** | Tự động tạo PO nháp khi tồn kho của một nhóm sản phẩm nhất định (ví dụ: Best Sellers) giảm xuống dưới mức **Reorder Point** đã được cấu hình. |
| **Export PO** | Export PO ra file PDF hoặc Excel theo template chuẩn (có logo và chữ ký số) để gửi cho NCC. |

# **8\. Layout Builder — Tùy biến Giao diện**

*Layout Builder cho phép Admin thay đổi bố cục, nội dung homepage và các trang marketing mà không cần code. Lấy cảm hứng từ Shopify Theme Editor.*

## **8.1 Homepage Section Builder**

### **Danh sách Section có thể kéo thả**

| Section type | Tùy biến được | Ghi chú |
| :---- | :---- | :---- |
| Hero Slider | Số slides / Ảnh / Text / CTA link / Auto-play speed | Tối đa 5 slides |
| Announcement Bar | Text / Link / Background color / Auto-scroll | 1 dòng, có thể thêm nhiều messages |
| Category Grid | Danh mục chọn / Layout (grid/scroll) / Số cột | Kéo thêm/bớt danh mục |
| Product Carousel | Title / Collection nguồn / Số SP hiển thị / Show badge | Horizontal scroll |
| Featured Products Tab | Số tabs / Tên tab / Collection mỗi tab / Số cột grid | Max 5 tabs |
| Lookbook / Outfit | Tiêu đề / 3 ảnh / Label / Link MUA FULLSET | Hotspot position x,y |
| Banner Full-width | Ảnh desktop \+ mobile / Text overlay / CTA / Link | Responsive ảnh riêng |
| Banner 2-3 cột | N ảnh / Text / Link cho từng ảnh | Grid responsive |
| Trust Bar | 4 items / Icon / Text dòng 1 / Text dòng 2 | SVG icon upload |
| Text \+ Image | Text (rich) / Ảnh / Vị trí ảnh (trái/phải) | For story, about section |
| Video | YouTube/Vimeo URL / Thumbnail / Autoplay toggle | Responsive embed |
| Newsletter | Heading / Subtext / Placeholder / Button label | Kết nối email platform |
| Custom HTML | Nhập HTML tự do | Dành cho devs nhúng widget |
| Spacer | Height (px) | Tạo khoảng trống |
| Divider | Color / Style (solid/dashed) / Width | Horizontal rule |

### **Cách hoạt động**

* Sidebar trái: danh sách sections đang có, drag handle để sắp xếp

* Main area: preview trực tiếp (live preview)

* Click vào section trong preview → panel cài đặt slide in từ phải

* Toggle: xem chế độ Mobile / Tablet / Desktop

* Undo/Redo: lịch sử thay đổi 20 bước

* Save Draft: lưu nháp mà không publish

* Publish: áp dụng ngay hoặc hẹn giờ

* Reset: khôi phục về theme mặc định

## **8.2 Menu Builder**

### **Cấu hình Navigation**

* Menu chính (header): drag-drop items, tối đa 2 cấp

* Footer menu: nhiều cột, mỗi cột là 1 menu group

* Mobile menu: tự động từ main menu, có thể override

* Mỗi item: Label / URL / Mở trong tab mới / Icon (optional) / Badge text ('Mới', 'Sale')

* Item type: Link thường / Danh mục / Trang tĩnh / URL ngoài

## **8.3 Banner Manager**

* Upload ảnh banner: desktop (1440×600px) \+ mobile (768×500px)

* Title / Subtitle / CTA text / CTA link

* Thứ tự hiển thị (drag-drop)

* Ngày bắt đầu / kết thúc (schedule)

* Trạng thái: Đang hiển thị / Tắt

* A/B test: 2 phiên bản, tracking click-through rate

## **8.4 Theme Settings (Cài đặt giao diện toàn cục)**

* Primary color (màu nút CTA, badge)

* Font heading / Font body (chọn từ Google Fonts)

* Logo: upload, chỉnh kích thước

* Favicon

* Footer: bật/tắt từng cột, chỉnh nội dung

* Announcement bar: text, link, màu nền

* Cookie consent: bật/tắt, text

* Loading spinner / skeleton style

# **9\. Admin — Khuyến mãi & Marketing**

## **9.1 Mã giảm giá**

| Trường | Giá trị / Options |
| :---- | :---- |
| Mã code | Text tự đặt hoặc auto-generate (SALE50 / SUMMER2026) |
| Loại giảm | % giảm (e.g. 20%) hoặc Số tiền cố định (e.g. 50,000đ) |
| Áp dụng cho | Tất cả SP / Danh mục cụ thể / SP cụ thể |
| Điều kiện tối thiểu | Không / Giá trị đơn tối thiểu / Số lượng SP tối thiểu |
| Giới hạn sử dụng | Không giới hạn / Tổng N lần / Mỗi KH N lần |
| Thời hạn | Không / Từ ngày A đến ngày B |
| Chỉ cho KH | Tất cả / KH đã đăng nhập / KH cụ thể (nhập email) |
| Kết hợp | Có thể / Không thể kết hợp với mã khác |
| Thống kê | Số lần đã dùng / Tổng discount đã phát / Doanh thu liên quan |

## **9.2 Flash Sale**

* Tiêu đề flash sale \+ countdown timer (hẹn giờ kết thúc)

* Chọn sản phẩm áp dụng (multi-select)

* % giảm cho từng SP hoặc áp dụng chung

* Số lượng giới hạn mỗi SP (sold-out khi hết)

* Hiển thị trên homepage section 'Sản phẩm khuyến mãi'

* Tự động bật/tắt theo lịch

# **10\. Admin — Cài đặt Hệ thống**

## **10.1 Cài đặt Shop**

* Tên shop, mô tả ngắn, email liên hệ, SĐT, địa chỉ

* Logo, favicon, ảnh social share mặc định (OG Image)

* Múi giờ, đơn vị tiền tệ (VND mặc định), định dạng ngày

* Ngôn ngữ mặc định (Tiếng Việt)

## **10.2 Cài đặt Vận chuyển**

| Phương thức | Cấu hình |
| :---- | :---- |
| Freeship theo đơn | Ngưỡng tối thiểu (VD: 500,000đ) |
| Phí ship cố định | Mức phí mặc định khi dưới ngưỡng |
| Phí ship theo vùng | Nội thành / Ngoại thành / Tỉnh thành khác |
| Tích hợp GHN API | API key, shop\_id, tự động tính phí theo địa chỉ |
| Tích hợp GHTK | API key, tự động booking đơn |
| Click & Collect | Danh sách cửa hàng, giờ mở cửa |

## **10.3 Cài đặt Thanh toán**

| Cổng | Kích hoạt bằng | Thông tin cần |
| :---- | :---- | :---- |
| COD | Toggle | Không cần thêm |
| Chuyển khoản ngân hàng | Toggle | Tên NH, chủ TK, số TK, nội dung CK |
| Ví MoMo | Toggle \+ API keys | Partner code, Access key, Secret key |
| VNPAY | Toggle \+ API keys | TMN Code, Hash secret |
| Payoo | Toggle \+ API keys | Merchant ID, API key, Secret |
| ZaloPay | Toggle \+ API keys | App ID, Key 1, Key 2 |

## **10.4 Quản lý Users Admin**

| Role | Quyền truy cập |
| :---- | :---- |
| Super Admin | Tất cả, kể cả xóa và cài đặt billing |
| Admin | Tất cả trừ xóa dữ liệu quan trọng |
| Manager | Dashboard, Orders, Products, Customers, Reports |
| Staff / CSKH | Orders (xem \+ xử lý), Customers (xem) |
| Content Editor | Products (sửa nội dung), Layout Builder, Banners |
| Warehouse | Inventory, Orders (xem trạng thái) |

# **11\. Giải pháp kỹ thuật — Admin Stack**

## **11.1 Tech stack Admin Panel**

| Layer | Công nghệ | Lý do chọn |
| :---- | :---- | :---- |
| Admin Framework | Next.js 14 App Router \+ /admin route group | Tái sử dụng components với storefront |
| UI Admin | shadcn/ui \+ Tailwind \+ Radix UI primitives | Accessible, customizable, dark mode |
| Charts / Analytics | Recharts hoặc Tremor | React-native, đẹp, responsive |
| Rich Text Editor | Tiptap (extension của ProseMirror) | Headless, extensible, không phụ thuộc vendor |
| Data Grid / Table | TanStack Table v8 | Headless, virtualized, sorting/filtering built-in |
| Drag & Drop (Layout Builder) | @dnd-kit/core | Modern, accessible DnD cho React |
| File Upload | react-dropzone \+ R2 presigned URLs | Direct upload không qua server |
| Date/Time | date-fns \+ react-day-picker | Lightweight, tree-shakeable |
| Form Validation | React Hook Form \+ Zod | Type-safe, performant |
| State (Admin) | Zustand stores riêng cho admin | Tách biệt với storefront state |
| API Layer | tRPC hoặc REST với Hono | End-to-end type safety |
| Auth Admin | NextAuth với role-based middleware | Reuse với storefront auth |
| Export Excel | SheetJS (xlsx) | Client-side export không cần server |

## **11.2 Kiến trúc Database bổ sung**

### **Bảng Admin-specific**

* admin\_users: id, email, password\_hash, role, last\_login, is\_active

* inventory\_logs: id, variant\_id, change\_amount, reason, type (sale/return/adjustment/import), admin\_id, created\_at

* cost\_prices: variant\_id, cost\_price, effective\_date (lịch sử giá vốn)

* discount\_codes: id, code, type, value, conditions\_json, usage\_count, max\_usage, start\_at, end\_at

* flash\_sales: id, title, ends\_at, items\_json (product\_id, discount%, max\_qty)

* layout\_sections: id, page, position, type, config\_json, is\_published, version

* banners: id, title, image\_desktop, image\_mobile, link, start\_at, end\_at, position, is\_active

* return\_requests: id, order\_id, items\_json, reason, type, status, refund\_amount, notes, photos\[\]

* analytics\_events: id, event\_type, data\_json, session\_id, user\_id, created\_at (raw events for funnel)

## **11.3 Performance Admin**

* Lazy load routes: mỗi module admin là dynamic import

* Table virtualization: chỉ render rows trong viewport (TanStack Virtual)

* Server-side pagination: không load toàn bộ records

* Redis cache: dashboard KPIs cache 5 phút, invalidate khi có đơn mới

* Background jobs: heavy reports chạy async, notify khi xong

* Optimistic updates: UI update ngay khi action, rollback nếu API lỗi

Chào anh/chị,

Tôi đã cập nhật tài liệu theo yêu cầu của anh/chị, tập trung vào việc làm chi tiết hóa hệ thống **Log và Bảo mật** để đảm bảo khả năng truy vết và phát hiện lỗi sớm, đồng thời điều chỉnh bỏ yêu cầu về 2FA.

Dưới đây là các bổ sung chi tiết vào **Mục 10** (Cài đặt Hệ thống) và **Mục 11** (Giải pháp Kỹ thuật).-----1. Cập nhật Mục 10.5: Quản lý Bảo mật & Audit Log

Mục này được điều chỉnh để loại bỏ yêu cầu 2FA và tăng cường khả năng ghi log hoạt động của nhân viên.

**10.5 Quản lý Log & Bảo mật (Revised)**

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **Audit Log (Nhật ký Truy cập)** | Ghi lại mọi hành động của nhân viên Admin: **Ai** (Admin ID), **Khi nào** (Timestamp), **Hành động gì** (Thêm/Sửa/Xóa/View/Publish), **Đối tượng nào** (Product ID, Order ID, Layout Section ID), và **Chi tiết thay đổi** (Lưu trữ JSON diff hoặc nội dung trước/sau khi sửa). |
| **Filter & Search Log** | Cho phép Super Admin tìm kiếm/lọc nhật ký theo User, Role, Ngày, Loại hành động, và Đối tượng thao tác để phục vụ cho việc truy vết lỗi hoặc tranh chấp. |
| **Cài đặt Mật khẩu** | Yêu cầu độ phức tạp của mật khẩu (min 8 ký tự, chữ hoa/thường, số, ký tự đặc biệt) và tần suất đổi mật khẩu (ví dụ: 90 ngày). **(Lưu ý: Bỏ yêu cầu 2FA theo đề xuất)**. |
| **Thông báo Đăng nhập lạ** | Gửi email cảnh báo đến Super Admin nếu phát hiện đăng nhập vào Admin Panel từ một thiết bị hoặc địa điểm chưa từng được sử dụng trước đây. |
| **Giới hạn IP truy cập (Optional)** | Cho phép Super Admin giới hạn truy cập vào Admin Panel chỉ từ các địa chỉ IP cố định (Văn phòng/Server) để tăng cường bảo mật. |

2\. Bổ sung Mục 11.4: Hệ thống Log & Monitoring (API Error Detection)

Phần này là giải pháp kỹ thuật nhằm đảm bảo phát hiện sớm và toàn diện các lỗi hệ thống, đặc biệt là lỗi kết nối với API bên thứ ba.

**(Thêm vào Mục 11: Giải pháp kỹ thuật — Admin Stack)**

**11.4 Logging & Monitoring**

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **System Error Logging** | Tích hợp hệ thống log tập trung (ví dụ: Sentry, Datadog, hoặc ELK stack) để thu thập log lỗi server-side, client-side, và API (Backend). |
| **Comprehensive API Logs** | Ghi lại nhật ký chi tiết cho mọi giao tiếp API bên ngoài, bao gồm: Request Payload (dữ liệu gửi đi), Response Code (200, 4xx, 5xx), Response Body (dữ liệu nhận về), Stack Trace (nếu có lỗi), và Thời gian xử lý. Đặc biệt cho các dịch vụ: **Vận chuyển (GHN/GHTK) và Thanh toán (MoMo/VNPAY)**. |
| **Error Early Detection (Alerting)** | Cấu hình ngưỡng cảnh báo tự động (Alerting) khi tỷ lệ lỗi API vượt quá mức an toàn (ví dụ: 5xx errors \> 1% hoặc latency \> 500ms). Hệ thống sẽ gửi cảnh báo ngay lập tức qua Email/Slack cho đội ngũ Kỹ thuật. |
| **Uptime Monitoring** | Tích hợp công cụ giám sát Uptime (ví dụ: Uptime Robot) để kiểm tra trạng thái hoạt động của Admin Panel và Storefront cứ mỗi 5 phút. |

11.5: Hỗ trợ theo Ngữ cảnh & Onboarding Guide

Module này sử dụng kỹ thuật overlay (tour bus/walkthrough) để hướng dẫn người dùng mới làm quen với các màn hình phức tạp như Danh sách Đơn hàng, Quản lý Sản phẩm, hoặc Layout Builder.

**11.5 Hỗ trợ theo Ngữ cảnh (Contextual Help)**

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **Guided Tour Overlay** | Giao diện overlay (modal) hiển thị **hướng dẫn từng bước (step-by-step)**. Mỗi bước sẽ chỉ vào một thành phần cụ thể trên màn hình (ví dụ: nút "Filter," cột "Trạng thái," hoặc "Bulk Action") và cung cấp mô tả ngắn gọn về chức năng của nó. |
| **Trigger Tự động** | Hướng dẫn sẽ tự động kích hoạt **lần đầu tiên** một user (Admin ID) với một Role cụ thể truy cập một màn hình phức tạp (Screen ID), hoặc khi một tính năng nâng cao mới được triển khai. |
| **Kích hoạt Thủ công** | Một icon 'Help' (ví dụ: dấu `?`) hoặc nút 'Xem Hướng dẫn' được đặt cố định ở góc trên bên phải của các màn hình quan trọng. Người dùng có thể click vào để kích hoạt lại Guided Tour bất cứ lúc nào. |
| **Quản lý Trạng thái Guide** | Hệ thống lưu trữ: \*\*Admin ID\*\* và \*\*Screen ID\*\* đã được hoàn thành. Nếu người dùng chọn 'Skip' hoặc hoàn thành tour, hướng dẫn sẽ không tự động bật lại cho màn hình đó, tránh gây phiền toái cho người dùng đã quen thuộc. |
| **Nội dung Guide (Admin)** | Cho phép Super Admin tạo và chỉnh sửa nội dung của các Guide Tour cho từng màn hình, bao gồm: tiêu đề của mỗi bước, mô tả, và selector CSS hoặc ID của thành phần UI cần highlight. (Tương tự như một module CMS đơn giản cho nội dung help-text). |
| **Áp dụng cho Role** | Cài đặt để một Guide Tour chỉ hiển thị cho các Role cụ thể (ví dụ: Guide cho Inventory chỉ hiển thị cho Role Warehouse, Guide cho Layout Builder chỉ hiển thị cho Content Editor) – củng cố nguyên tắc **Role-based Access Control** (RBAC). |

**11\. Giải pháp kỹ thuật — Admin Stack (Bổ sung Chi tiết)**

Để làm rõ hơn các yêu cầu về trải nghiệm người dùng, tính minh bạch nghiệp vụ, và giám sát hệ thống, các mục dưới đây được bổ sung vào phần giải pháp kỹ thuật, liên kết trực tiếp các công nghệ được chọn trong **Mục 11.1** với các mục tiêu UX/vận hành của Admin Panel.**11.4 Tiêu chuẩn Component & Trực quan hóa (Modern UX/UI)**

Mục tiêu là đảm bảo Admin Panel dễ sử dụng, trực quan, giảm thiểu thời gian đào tạo cho nhân viên, đặc biệt với các màn hình quản lý dữ liệu lớn:

| Tiêu chuẩn UX/UI | Mô tả chi tiết (Liên kết với Tech Stack) |
| ----- | ----- |
| **Component Hiện đại** | Các màn hình phức tạp (như danh sách Sản phẩm, Đơn hàng, Báo cáo) phải được xây dựng bằng thư viện UI hiện đại (**shadcn/ui** – Radix UI Primitives) để đảm bảo trải nghiệm nhất quán. |
| **Data Grid Hiệu quả** | Phải sử dụng **TanStack Table v8** để xử lý các bảng dữ liệu có hàng ngàn bản ghi. Hệ thống phải hỗ trợ mạnh mẽ các chức năng **lọc** (theo nhiều trường), **sắp xếp** (multi-sort), và **phân trang** (pagination) hiệu quả, duy trì hiệu suất mượt mà. |
| **Công cụ Trực quan** | **Layout Builder** phải sử dụng công nghệ kéo thả (**@dnd-kit/core**) và **Live Preview** (xem trước trực tiếp) để cho phép Content Editor tùy chỉnh giao diện Storefront một cách trực quan, không cần kiến thức kỹ thuật. |

**11.5 Tính Minh bạch Quy trình & Truy vết (Traceability)**

Mục tiêu là đảm bảo mọi quy trình nghiệp vụ và thao tác của người dùng Admin đều có thể được theo dõi và xác định rõ ràng (củng cố Mục 10.5 và 5.2):

| Tính năng Truy vết | Mô tả chi tiết |
| ----- | ----- |
| **Timeline Quy trình** | Các quy trình nghiệp vụ dài và quan trọng như **Hành trình Đơn hàng** phải được hiển thị theo **8 bước Timeline** với trình tự thời gian và trạng thái rõ ràng. Điều này giúp nhân viên CSKH/Warehouse dễ dàng nắm bắt tình trạng hiện tại và các bước tiếp theo, cũng như dễ dàng truy vết sự chậm trễ. |
| **Audit Log (Nhật ký)** | Hệ thống phải ghi lại chi tiết các hành động **Thêm/Sửa/Xóa/View** của từng Admin ID, bao gồm **thời gian**, **đối tượng** (Product ID, Order ID), và **chi tiết nội dung thay đổi** (JSON diff hoặc giá trị trước/sau khi sửa) để đảm bảo tính minh bạch và truy vết khi xảy ra lỗi hoặc tranh chấp dữ liệu. |

**11.6 Logging & Monitoring (API Error Detection)**

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **System Error Logging** | Tích hợp hệ thống log tập trung (ví dụ: Sentry, Datadog, hoặc ELK stack) để thu thập log lỗi server-side, client-side, và API (Backend). |
| **Comprehensive API Logs** | Ghi lại nhật ký chi tiết cho mọi giao tiếp API bên ngoài, bao gồm: Request Payload (dữ liệu gửi đi), Response Code (200, 4xx, 5xx), Response Body (dữ liệu nhận về), Stack Trace (nếu có lỗi), và Thời gian xử lý. Đặc biệt cho các dịch vụ: **Vận chuyển (GHN/GHTK) và Thanh toán (MoMo/VNPAY)**. |
| **Error Early Detection (Alerting)** | Cấu hình ngưỡng cảnh báo tự động (Alerting) khi tỷ lệ lỗi API vượt quá mức an toàn (ví dụ: 5xx errors \> 1% hoặc latency \> 500ms). Hệ thống sẽ gửi cảnh báo ngay lập tức qua Email/Slack cho đội ngũ Kỹ thuật. |
| **Uptime Monitoring** | Tích hợp công cụ giám sát Uptime (ví dụ: Uptime Robot) để kiểm tra trạng thái hoạt động của Admin Panel và Storefront cứ mỗi 5 phút. |

**11.7 Hỗ trợ theo Ngữ cảnh (Contextual Help)**

| Tính năng | Mô tả chi tiết |
| ----- | ----- |
| **Guided Tour Overlay** | Giao diện overlay (modal) hiển thị **hướng dẫn từng bước (step-by-step)**. Mỗi bước sẽ chỉ vào một thành phần cụ thể trên màn hình (ví dụ: nút "Filter," cột "Trạng thái," hoặc "Bulk Action") và cung cấp mô tả ngắn gọn về chức năng của nó. |
| **Trigger Tự động** | Hướng dẫn sẽ tự động kích hoạt **lần đầu tiên** một user (Admin ID) với một Role cụ thể truy cập một màn hình phức tạp (Screen ID), hoặc khi một tính năng nâng cao mới được triển khai. |
| **Kích hoạt Thủ công** | Một icon 'Help' (ví dụ: dấu ?) hoặc nút 'Xem Hướng dẫn' được đặt cố định ở góc trên bên phải của các màn hình quan trọng. Người dùng có thể click vào để kích hoạt lại Guided Tour bất cứ lúc nào. |
| **Quản lý Trạng thái Guide** | Hệ thống lưu trữ: Admin ID và Screen ID đã được hoàn thành. Nếu người dùng chọn 'Skip' hoặc hoàn thành tour, hướng dẫn sẽ không tự động bật lại cho màn hình đó, tránh gây phiền toái cho người dùng đã quen thuộc. |
| **Nội dung Guide (Admin)** | Cho phép Super Admin tạo và chỉnh sửa nội dung của các Guide Tour cho từng màn hình, bao gồm: tiêu đề của mỗi bước, mô tả, và selector CSS hoặc ID của thành phần UI cần highlight. (Tương tự như một module CMS đơn giản cho nội dung help-text). |
| **Áp dụng cho Role** | Cài đặt để một Guide Tour chỉ hiển thị cho các Role cụ thể (ví dụ: Guide cho Inventory chỉ hiển thị cho Role Warehouse, Guide cho Layout Builder chỉ hiển thị cho Content Editor) – củng cố nguyên tắc **Role-based Access Control** (RBAC). |

Chào anh/chị,

Tài liệu đặc tả (Version 2.0) của anh/chị đã đạt đến mức độ chi tiết và toàn diện rất cao. Để biến nó thành "vũ khí" hoàn hảo cho đội ngũ Phát triển (Development), tôi xin đề xuất và làm rõ các điểm bổ sung sau, tập trung vào **Khả năng mở rộng (Scalability)**, **Trải nghiệm CSKH (CX)** và **Tính sẵn sàng của hệ thống (Availability)**:-----Đề xuất & Khuyến nghị Bổ sung (Recommendations)1. Bổ sung Cơ chế Omni-channel & Đồng bộ (Mục 4 & 6\)

Nếu thương hiệu có hoặc dự kiến mở cửa hàng vật lý, việc đồng bộ dữ liệu là tối quan trọng để tránh overselling và duy trì tính nhất quán của Loyalty.

| Khối chức năng | Khuyến nghị Bổ sung |
| ----- | ----- |
| **Quản lý Tồn kho** | **Tích hợp Real-time Inventory Sync:** Tồn kho của các cửa hàng vật lý (được định nghĩa trong **Multi-Warehouse**) phải được đồng bộ hóa với tồn kho online qua API **theo thời gian thực (Real-time)** khi có giao dịch POS tại cửa hàng, đặc biệt trong các sự kiện Flash Sale. Tồn kho phải được **trừ ngay lập tức** khi có đơn hàng, bất kể kênh bán. |
| **Loyalty & Khách hàng** | **Thống nhất Loyalty Program:** Điểm thưởng tích lũy và Phân hạng Khách hàng (**Mục 6.3**) phải được **đồng bộ Real-time** từ Website sang hệ thống POS. Khách hàng phải có thể tích/tiêu điểm ngay lập tức sau khi mua hàng ở bất kỳ kênh nào. Thông tin mua hàng tại POS cũng phải được ghi lại trong **Profile Khách hàng (Mục 6.1)**. |

2\. Trải nghiệm Tìm kiếm Nâng cao (Mục 11.8)

Mặc dù đã nhắc đến Algolia/Meilisearch (trong Phase 5), cần làm rõ yêu cầu kỹ thuật chi tiết để tối ưu khả năng tìm kiếm cho ngành thời trang (ngành có nhiều thuật ngữ địa phương và lỗi chính tả).

**(Bổ sung Mục 11.8: Advanced Search Technical Requirements)**

| Tiêu chuẩn Tìm kiếm Nâng cao | Mô tả chi tiết (Liên kết với Algolia/Meilisearch) |
| ----- | ----- |
| **Typo-tolerance** | Hệ thống phải xử lý được lỗi chính tả từ 1 đến 2 ký tự (ví dụ: gõ "áo thung" vẫn trả về "áo thun"), kể cả khi người dùng bỏ dấu hoặc gõ nhầm vị trí các ký tự gần nhau trên bàn phím. |
| **Synonyms & Stopwords** | **Synonyms:** Khả năng định nghĩa các cặp từ đồng nghĩa trong Admin Panel (ví dụ: "jean" \= "denim", "khoác" \= "jacket") để mở rộng kết quả. **Stopwords:** Loại bỏ các từ không cần thiết (như "và", "của", "cái") khỏi thuật toán tìm kiếm. |
| **Relevance Ranking** | Áp dụng thuật toán xếp hạng dựa trên: Mức độ khớp từ khóa $\\to$ Tần suất bán hàng (Best Sellers) $\\to$ Mới nhất (New Arrivals) $\\to$ Tồn kho (Ưu tiên SP còn hàng). |

3\. Tối ưu Panel CSKH (Mục 6.4)

Để tăng hiệu quả hỗ trợ, cần bổ sung các tính năng giúp CSKH xử lý vấn đề của khách hàng nhanh chóng, đặc biệt khi cần đặt đơn hàng hộ hoặc kiểm tra lỗi.

| Tính năng CSKH Nâng cao | Mô tả chi tiết |
| ----- | ----- |
| **Impersonation** | Cho phép các Role cấp cao (Super Admin, Admin, Manager) có thể **đăng nhập ẩn danh dưới quyền của khách hàng (Impersonate)**. Chức năng này giúp Admin tái tạo chính xác lỗi KH gặp phải (ví dụ: lỗi thanh toán, lỗi hiển thị) hoặc đặt đơn hàng thủ công thay cho khách hàng. Cần **Audit Log** chi tiết cho hành động này. |
| **Tích hợp Chat Log** | Tích hợp Chat Log: Khung Chat (Zalo ZCA / Facebook Messenger) cần được **nhúng trực tiếp** vào màn hình Profile Khách hàng (**Mục 6.1**) và trang Chi tiết Đơn hàng (**Mục 5.2**), hiển thị lịch sử trao đổi liên quan đến đơn hàng đó. |
| **Order Creation (CS)** | Cho phép nhân viên CSKH/Admin tạo đơn hàng mới thủ công từ Profile Khách hàng (Manual Order Creation), đặc biệt cần thiết cho việc xử lý đổi hàng hoặc đền bù. |

4\. Quy định về Chịu tải (Load Testing NFR) (Mục 11.9)

Do hệ thống có module Flash Sale, việc xác định rõ yêu cầu phi chức năng (NFR) về hiệu suất là bắt buộc để đảm bảo sự kiện sale không làm sập hệ thống.

**(Bổ sung Mục 11.9: Non-Functional Requirement \- Load Testing)**

| Chỉ số Chịu tải NFR | Yêu cầu Kỹ thuật |
| ----- | ----- |
| **Concurrent Users (CCU)** | **Hệ thống phải chịu tải được 5,000 CCU truy cập cùng lúc** trong các sự kiện Flash Sale (thời gian cao điểm), tập trung vào các API sau: Product Detail Page, Add-to-Cart API, và Checkout Payment API. |
| **Response Time (Latency)** | Trong điều kiện 5,000 CCU, Latency tối đa cho các API quan trọng (thêm giỏ, tạo đơn) **không được vượt quá 1.5 giây**. Thời gian Response Time trung bình (P95) phải dưới 500ms. |
| **Solution & Mitigations** | Sử dụng các giải pháp như: **Redis cache** cho trạng thái tồn kho (giảm tải DB), **CDN** cho static assets, và kiến trúc **Serverless/Autoscaling** để mở rộng linh hoạt. Các thao tác Add-to-Cart phải được xử lý bằng Queue/Background Jobs để tránh làm nghẽn luồng Checkout chính trong thời gian cao điểm. |

# 	

# **12\. Mobile-Specific Technical Requirements**

## **12.1 Performance Mobile**

| Metric | Target | Giải pháp |
| :---- | :---- | :---- |
| First Contentful Paint | \< 1.5s on 4G | Critical CSS inline, preload fonts, SSR |
| Largest Contentful Paint | \< 2.5s | Hero image preload, WebP format, CDN |
| Cumulative Layout Shift | \< 0.1 | Explicit image dimensions, skeleton loaders |
| Time to Interactive | \< 3.5s | Code splitting, lazy load below fold |
| Total Bundle Size | \< 200KB JS (initial) | Tree shaking, dynamic imports |
| Images | WebP, lazy load, responsive srcset | next/image tự động |
| Fonts | Preload critical, font-display: swap | Tránh layout shift |
| Service Worker | Offline fallback page | PWA basic support |

## **12.2 Mobile UX Patterns**

### **Skeleton Loading (thay spinner)**

* Product card skeleton: gray placeholder cho ảnh \+ 2 dòng text

* Collection page skeleton: header \+ 4 cards

* Product detail skeleton: gallery placeholder \+ form skeleton

### **Empty States**

* Giỏ hàng trống: ảnh minh họa \+ 'Giỏ hàng của bạn đang trống' \+ CTA 'Khám phá sản phẩm'

* Search không có kết quả: gợi ý từ khóa khác, hiển thị sản phẩm phổ biến

* Wishlist trống: 'Lưu những sản phẩm bạn thích' \+ CTA

### **Error Handling Mobile**

* Offline: banner thông báo \+ retry button, cache trang đã xem

* Add to cart thất bại: toast notification đỏ, không mất selection

* Payment timeout: hướng dẫn rõ ràng, link kiểm tra đơn hàng

* Form validation: inline errors bên dưới field (không alert popup)

### **PWA Features (Progressive Web App)**

* Manifest.json: tên, icon, theme color → 'Thêm vào màn hình chính'

* Service Worker: cache static assets, offline fallback

* Push notifications (optional): thông báo đơn hàng, flash sale

* App-like transitions: page transitions mượt (View Transitions API)

# **13\. Checklist Triển khai — Version 2.0**

## **Phase 1 — Storefront Mobile-First (5–7 tuần)**

* Tất cả trang storefront với mobile-first layout

* Bottom tab bar navigation

* Mobile-optimized product gallery (swipe)

* Bottom sheet cho filter, size guide, options

* Sticky CTA bar trên mobile

* Mobile checkout 3 bước

* Mini cart drawer mobile-friendly

* PWA manifest \+ offline fallback

* Core Web Vitals đạt target

## **Phase 2 — Admin Core (4–5 tuần)**

* Auth admin với role-based access

* Dashboard: KPIs \+ charts cơ bản

* Quản lý sản phẩm \+ variants \+ ảnh

* Quản lý danh mục (cây, drag-drop)

* Quản lý đơn hàng \+ timeline trạng thái

* Tích hợp tracking GHN/GHTK

* Tồn kho: xem \+ điều chỉnh

* Quản lý khách hàng: profile \+ lịch sử

## **Phase 3 — Analytics & Finance (3–4 tuần)**

* Báo cáo doanh thu theo kỳ

* Báo cáo lỗ/lãi (P\&L cơ bản)

* Báo cáo tồn kho: giá trị \+ dead stock \+ turnover

* Customer analytics: RFM segmentation

* Funnel checkout: drop-off analysis

* Export CSV/Excel cho tất cả báo cáo

## **Phase 4 — Layout Builder & Marketing (3–4 tuần)**

* Homepage section builder (drag-drop)

* Banner manager

* Menu builder

* Theme settings

* Mã giảm giá \+ flash sale

* Email templates editor

* A/B test banners

## **Phase 5 — Advanced (3–4 tuần)**

* Tích hợp cổng TT đầy đủ (Payoo/VNPAY/MoMo/ZaloPay)

* Return/RMA management

* Push notifications (web \+ mobile)

* Advanced search (Algolia/Meilisearch)

* Multi-warehouse inventory

* Loyalty points system

* Abandoned cart recovery

# **14\. Bảng tổng hợp — So sánh tính năng**

| Tính năng | Torano | Aristino | Version tối ưu đề xuất |
| :---- | :---- | :---- | :---- |
| Mobile nav | Header \+ mega | Header \+ bottom nav hybrid | ✅ Bottom tab bar \+ FAB cart |
| Search | Full-screen overlay | Inline search bar | ✅ Dedicated search screen mobile, overlay desktop |
| Filter mobile | Chưa rõ | Filter sheet | ✅ Bottom sheet full-screen filter |
| Checkout steps | 1 bước (Haravan) | 2 bước riêng | ✅ 2 bước \+ summary accordion mobile |
| Payment methods | COD only visible | 6 phương thức | ✅ 6+ phương thức, hiển thị icon lớn mobile |
| Store locator | List only | Map \+ list (Aristino) | ✅ Google Maps \+ list \+ filter tỉnh/quận |
| Admin dashboard | Haravan built-in | Haravan built-in | ✅ Custom dashboard với P\&L \+ inventory |
| Layout builder | Haravan theme | Haravan theme | ✅ Section builder kéo thả |
| Inventory tracking | Basic | Basic | ✅ Chi tiết: giá vốn \+ cảnh báo \+ nhập kho log |
| Customer analytics | Không | Không | ✅ RFM segmentation \+ lifetime value |
| Order timeline | Basic status | Basic status | ✅ 8-bước timeline \+ tracking tích hợp |
| Return management | Manual | Manual | ✅ RMA workflow với status \+ approval |
| PWA support | Không | Không | ✅ Manifest \+ service worker \+ offline |
| A/B testing | Không | Không | ✅ Banner A/B với CTR tracking |

*END — Fashion Ecom System Specification v2.0  |  April 2026*