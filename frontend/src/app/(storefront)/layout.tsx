import type { ReactNode } from 'react';

/**
 * Storefront layout — header, footer, bottom tab bar (mobile)
 * Mobile-first: bottom tab bar thay header nav
 */
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement Bar */}
      <div className="bg-black text-white text-center text-xs py-1.5 md:text-sm">
        <p>Mien phi giao hang cho don tu 500.000d | Hotline: 1900-xxxx</p>
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
          <button aria-label="Gio hang" className="p-2 relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
        {/* Search bar full width mobile */}
        <div className="px-4 pb-3">
          <input
            type="search"
            placeholder="Tim kiem san pham..."
            className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </header>

      {/* Header Desktop */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="text-2xl font-bold tracking-widest">FASHION</a>
            <nav className="flex gap-8 text-sm font-medium">
              <a href="/san-pham" className="hover:text-red-600 transition">SAN PHAM MOI</a>
              <a href="/danh-muc/ao-nam" className="hover:text-red-600 transition">AO NAM</a>
              <a href="/danh-muc/quan-nam" className="hover:text-red-600 transition">QUAN NAM</a>
              <a href="/danh-muc/phu-kien" className="hover:text-red-600 transition">PHU KIEN</a>
              <a href="/danh-muc/sale" className="hover:text-red-600 transition text-red-600">SALE</a>
            </nav>
            <div className="flex items-center gap-4">
              <button aria-label="Tim kiem" className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <a href="/tai-khoan" aria-label="Tai khoan" className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </a>
              <a href="/tai-khoan/yeu-thich" aria-label="Yeu thich" className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </a>
              <button aria-label="Gio hang" className="p-2 hover:bg-gray-100 rounded-full relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Footer */}
      <footer className="hidden md:block bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">FASHION ECOM</h3>
            <p className="text-sm">Thoi trang nam cao cap</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">HO TRO</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/chinh-sach/van-chuyen">Chinh sach van chuyen</a></li>
              <li><a href="/chinh-sach/doi-tra">Chinh sach doi tra</a></li>
              <li><a href="/chinh-sach/bao-mat">Chinh sach bao mat</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">LIEN HE</h4>
            <ul className="space-y-2 text-sm">
              <li>Hotline: 1900-xxxx</li>
              <li>Email: support@fashionecom.vn</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">THANH TOAN</h4>
            <p className="text-sm">COD | MoMo | VNPAY | ZaloPay</p>
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
            Trang chu
          </a>
          <a href="/danh-muc/ao-nam" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Danh muc
          </a>
          <a href="/tim-kiem" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Tim kiem
          </a>
          <a href="/tai-khoan/yeu-thich" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Yeu thich
          </a>
          <a href="/tai-khoan" className="flex flex-col items-center gap-0.5 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Tai khoan
          </a>
        </div>
      </nav>
    </div>
  );
}
