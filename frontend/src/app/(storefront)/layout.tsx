import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BackToTop } from '@/components/ui/back-to-top';
import { CartIconButton } from '@/components/cart/cart-icon-button';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { SearchTriggerMobile, SearchTriggerDesktop, SearchOverlayPanel } from '@/components/search/search-overlay';
import { DynamicNav } from '@/components/layout/dynamic-nav';
import { MobileMenuDrawer } from '@/components/layout/mobile-menu-drawer';
import { MobileMenuButton, BottomNavWithActiveState } from '@/components/layout/layout-client-parts';
import { CartToast } from '@/components/ui/cart-toast';
import { FooterNewsletter } from '@/components/layout/footer-newsletter';

export const metadata: Metadata = {
  title: { template: '%s | Torano', default: 'Torano — Thời trang nam cao cấp' },
  description: 'Mua sắm thời trang nam chính hãng Torano, giao hàng toàn quốc',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Torano',
  },
};

/**
 * Storefront layout — Torano style
 * Topbar den + Header trang (sticky) + Footer accordion mobile
 * Container max-w 1600px, padding 0 50px desktop
 */
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar — Torano: bg #242021, text trang */}
      <div className="bg-topbar text-topbar-text text-center text-xs py-2 md:text-sm">
        <p>Miễn phí giao hàng cho đơn từ 500.000đ | Hotline: 1900-xxxx</p>
      </div>

      {/* Header Mobile */}
      <header className="sticky top-0 z-50 bg-white border-b md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <MobileMenuButton />
          <Link href="/" className="block w-[100px] h-[28px] relative">
            <Image src="/images/theme/logo.png" alt="Torano" fill className="object-contain" priority />
          </Link>
          <CartIconButton className="p-1 relative" />
        </div>
        {/* Search bar — mo overlay khi click */}
        <SearchTriggerMobile />
      </header>

      {/* Header Desktop — Torano: container 1600px, padding 0 50px */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b">
        <div className="max-w-container mx-auto px-[30px] xl:px-[50px]">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="block w-[140px] h-[36px] relative shrink-0">
              <Image src="/images/theme/logo.png" alt="Torano" fill className="object-contain" priority />
            </Link>
            <DynamicNav />
            <div className="flex items-center gap-4 shrink-0">
              <SearchTriggerDesktop />
              <Link href="/tai-khoan" aria-label="Tài khoản" className="p-2 hover:bg-gray-100 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <Link href="/tai-khoan/yeu-thich" aria-label="Yêu thích" className="p-2 hover:bg-gray-100 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
              <CartIconButton className="p-2 hover:bg-gray-100 rounded-full transition relative" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Footer — Torano style: accordion mobile, border-right columns desktop */}
      <footer className="footer-torano bg-fashion-bg border-t">
        <div className="max-w-container mx-auto px-4 md:px-6 xl:px-[50px] py-8 md:py-0 grid grid-cols-1 md:grid-cols-4">
          {/* Col 1: Thuong hieu + social + thanh toan */}
          <div className="widget-footer py-4 md:py-[75px] md:pr-4">
            <div className="w-[120px] h-[32px] relative mb-3">
              <Image src="/images/theme/logo.png" alt="Torano" fill className="object-contain" />
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Hệ thống thời trang cho phái mạnh hàng đầu Việt Nam, hướng tới phong cách nam tính, lịch lãm và trẻ trung.
            </p>
            {/* Social icons — Torano: 32x32 border square rounded-[4px] */}
            <div className="flex gap-2 mb-6">
              {['facebook', 'twitter', 'instagram', 'tiktok', 'youtube'].map((s) => (
                <a key={s} href="#" className="w-8 h-8 border border-current rounded flex items-center justify-center text-fashion-text hover:text-fashion-hover hover:border-fashion-hover transition-all duration-400">
                  <span className="text-xs font-bold uppercase">{s[0]}</span>
                </a>
              ))}
            </div>
            <h4 className="text-sm font-semibold mb-3">Phương thức thanh toán</h4>
            <div className="flex flex-wrap gap-2">
              {['VNPAY', 'ZaloPay', 'MoMo', 'COD', 'VISA'].map((p) => (
                <span key={p} className="border border-gray-200 rounded-[3px] px-2 py-1 text-xs font-medium text-gray-600 bg-white overflow-hidden">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Thong tin lien he + van chuyen */}
          <div className="widget-footer py-4 md:py-[75px] md:px-4">
            <h4 className="widget-title">Thông tin liên hệ</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="font-medium">Địa chỉ:</span> 123 Nguyễn Huệ, Quận 1, TP. HCM</li>
              <li><span className="font-medium">Điện thoại:</span> 1900-xxxx</li>
              <li><span className="font-medium">Email:</span> support@fashionecom.vn</li>
            </ul>
            <h4 className="widget-title !mt-6">Phương thức vận chuyển</h4>
            <div className="flex flex-wrap gap-2">
              {['GHN', 'GHTK', 'J&T', 'Ninja Van'].map((s) => (
                <span key={s} className="border border-gray-200 rounded-[3px] px-2 py-1 text-xs font-medium text-gray-600 bg-white overflow-hidden">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Col 3: Nhom lien ket — Torano: bullet dot truoc moi link */}
          <div className="widget-footer py-4 md:py-[75px] md:px-4">
            <h4 className="widget-title">Nhóm liên kết</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/tim-kiem', label: 'Tìm kiếm' },
                { href: '/gioi-thieu', label: 'Giới thiệu' },
                { href: '/chinh-sach/doi-tra', label: 'Chính sách đổi trả' },
                { href: '/chinh-sach/bao-mat', label: 'Chính sách bảo mật' },
                { href: '/tuyen-dung', label: 'Tuyển dụng' },
                { href: '/lien-he', label: 'Liên hệ' },
              ].map(({ href, label }) => (
                <li key={href} className="relative pl-4">
                  <Link href={href} className="footer-link hover:text-fashion-hover transition">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Dang ky nhan tin — Torano: newsletter form */}
          <div className="widget-footer py-4 md:py-[75px] md:pl-4">
            <h4 className="widget-title !text-fashion-red">Đăng ký nhận tin</h4>
            <p className="text-sm leading-relaxed mb-4">
              Để cập nhật những sản phẩm mới, nhận thông tin ưu đãi đặc biệt và thông tin giảm giá khác.
            </p>
            <FooterNewsletter />
          </div>
        </div>

        {/* Copyright — Torano: border-top, padding 15px */}
        <div className="border-t border-[#dedede]">
          <div className="max-w-container mx-auto px-6 py-4 text-center text-[13px] text-gray-500">
            Copyright &copy; 2026 Torano. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Cart Drawer — slide-in tu phai */}
      <CartDrawer />

      {/* Search Overlay — fullscreen, 1 instance duy nhat */}
      <SearchOverlayPanel />

      {/* Back to top */}
      <BackToTop />

      {/* Cart toast — feedback khi them vao gio */}
      <CartToast />

      {/* Bottom Tab Bar — Mobile: active state highlight */}
      <BottomNavWithActiveState />

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer />
    </div>
  );
}
