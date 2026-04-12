import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { template: '%s | Fashion Ecom', default: 'Fashion Ecom — Thời trang nam cao cấp' },
  description: 'Mua sắm thời trang nam chính hãng, giao hàng toàn quốc',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Fashion Ecom',
  },
};

/**
 * Storefront layout — header, footer, bottom tab bar (mobile)
 * Mobile-first: bottom tab bar thay header nav
 */
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement Bar */}
      <div className="bg-[#1a2340] text-white text-center text-xs py-2 md:text-sm">
        <p>Miễn phí giao hàng cho đơn từ 500.000đ | Hotline: 1900-xxxx</p>
      </div>

      {/* Header Mobile */}
      <header className="sticky top-0 z-50 bg-white border-b md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <button aria-label="Menu" className="p-2">
            {/* Hamburger icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <a href="/" className="text-xl font-bold tracking-wider">FASHION</a>
          <button aria-label="Giỏ hàng" className="p-2 relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
        {/* Search bar full width mobile */}
        <div className="px-4 pb-3">
          <input
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </header>

      {/* Header Desktop */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16">
            <a href="/" className="text-2xl font-bold tracking-[0.2em] justify-self-start" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>FASHION</a>
            <nav className="flex gap-8 text-sm font-medium">
              <a href="/san-pham" className="hover:text-red-600 transition">SẢN PHẨM MỚI</a>
              {/* Áo nam — dropdown */}
              <div className="relative group">
                <a href="/danh-muc/ao-nam" className="hover:text-red-600 transition py-5 inline-block">ÁO NAM</a>
                <div className="absolute left-0 top-full w-48 bg-white border border-gray-200 shadow-lg rounded-b-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <a href="/danh-muc/ao-polo" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Áo Polo</a>
                  <a href="/danh-muc/ao-thun" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Áo Thun</a>
                  <a href="/danh-muc/ao-so-mi" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Áo Sơ Mi</a>
                  <a href="/danh-muc/ao-blazer" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Áo Blazer</a>
                  <a href="/danh-muc/ao-khoac" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Áo Khoác</a>
                </div>
              </div>
              {/* Quần nam — dropdown */}
              <div className="relative group">
                <a href="/danh-muc/quan-nam" className="hover:text-red-600 transition py-5 inline-block">QUẦN NAM</a>
                <div className="absolute left-0 top-full w-48 bg-white border border-gray-200 shadow-lg rounded-b-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <a href="/danh-muc/quan-tay" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Quần Tây</a>
                  <a href="/danh-muc/quan-jeans" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Quần Jeans</a>
                  <a href="/danh-muc/quan-short" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Quần Short</a>
                </div>
              </div>
              {/* Phụ kiện — dropdown */}
              <div className="relative group">
                <a href="/danh-muc/phu-kien" className="hover:text-red-600 transition py-5 inline-block">PHỤ KIỆN</a>
                <div className="absolute left-0 top-full w-48 bg-white border border-gray-200 shadow-lg rounded-b-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <a href="/danh-muc/that-lung" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition">Thắt Lưng</a>
                </div>
              </div>
              <a href="/danh-muc/sale" className="hover:text-red-600 transition text-red-600">SALE</a>
            </nav>
            <div className="flex items-center gap-4 justify-self-end">
              <a href="/tim-kiem" aria-label="Tìm kiếm" className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </a>
              <a href="/tai-khoan" aria-label="Tài khoản" className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </a>
              <a href="/tai-khoan/yeu-thich" aria-label="Yêu thích" className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </a>
              <a href="/gio-hang" aria-label="Giỏ hàng" className="p-2 hover:bg-gray-100 rounded-full relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Footer — Torano style */}
      <footer className="hidden md:block bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-4 gap-8">
          {/* Col 1: Thuong hieu + social + thanh toan */}
          <div>
            <h3 className="text-red-600 font-bold text-lg mb-3">Thời trang nam FASHION</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Hệ thống thời trang cho phái mạnh hàng đầu Việt Nam, hướng tới phong cách nam tính, lịch lãm và trẻ trung.
            </p>
            {/* Social icons */}
            <div className="flex gap-2 mb-6">
              {['facebook', 'twitter', 'instagram', 'tiktok', 'youtube'].map((s) => (
                <a key={s} href="#" className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-black transition text-gray-500 hover:text-black">
                  <span className="text-xs font-bold uppercase">{s[0]}</span>
                </a>
              ))}
            </div>
            <h4 className="text-sm font-semibold mb-3">Phương thức thanh toán</h4>
            <div className="flex flex-wrap gap-2">
              {['VNPAY', 'ZaloPay', 'MoMo', 'COD', 'VISA'].map((p) => (
                <span key={p} className="border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-600 bg-white">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Thong tin lien he + van chuyen */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Thông tin liên hệ</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <span className="font-medium text-gray-800">Địa chỉ:</span> 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
              </li>
              <li>
                <span className="font-medium text-gray-800">Điện thoại:</span> 1900-xxxx
              </li>
              <li>
                <span className="font-medium text-gray-800">Email:</span> support@fashionecom.vn
              </li>
            </ul>
            <h4 className="font-semibold text-sm mt-6 mb-3">Phương thức vận chuyển</h4>
            <div className="flex flex-wrap gap-2">
              {['GHN', 'GHTK', 'J&T', 'Ninja Van'].map((s) => (
                <span key={s} className="border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-600 bg-white">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Col 3: Nhom lien ket */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Nhóm liên kết</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li><a href="/tim-kiem" className="hover:text-black transition">Tìm kiếm</a></li>
              <li><a href="/gioi-thieu" className="hover:text-black transition">Giới thiệu</a></li>
              <li><a href="/chinh-sach/doi-tra" className="hover:text-black transition">Chính sách đổi trả</a></li>
              <li><a href="/chinh-sach/bao-mat" className="hover:text-black transition">Chính sách bảo mật</a></li>
              <li><a href="/tuyen-dung" className="hover:text-black transition">Tuyển dụng</a></li>
              <li><a href="/lien-he" className="hover:text-black transition">Liên hệ</a></li>
            </ul>
          </div>

          {/* Col 4: Dang ky nhan tin */}
          <div>
            <h4 className="text-red-600 font-semibold text-sm mb-3">Đăng ký nhận tin</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Để cập nhật những sản phẩm mới, nhận thông tin ưu đãi đặc biệt và thông tin giảm giá khác.
            </p>
            <div className="flex">
              <div className="flex-1 relative">
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full border border-gray-300 rounded-l-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-r-lg transition whitespace-nowrap">
                ĐĂNG KÝ
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-gray-400">
            Copyright &copy; 2026 Fashion Ecom. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Bottom Tab Bar — Mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t z-50 safe-area-pb">
        <div className="flex justify-around items-center h-14">
          <a href="/" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Trang chủ
          </a>
          <a href="/danh-muc/ao-nam" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Danh mục
          </a>
          <a href="/tim-kiem" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Tìm kiếm
          </a>
          <a href="/tai-khoan/yeu-thich" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Yêu thích
          </a>
          <a href="/tai-khoan" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Tài khoản
          </a>
        </div>
      </nav>
    </div>
  );
}
