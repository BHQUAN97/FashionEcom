import type { ReactNode } from 'react';

/**
 * Admin layout — sidebar + topbar + content area
 * Sidebar: 240px desktop, collapse 64px tablet, hidden+hamburger mobile
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-lg font-bold tracking-wider">ADMIN</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 text-sm">
          {[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Don hang', href: '/admin/don-hang' },
            { label: 'Sản phẩm', href: '/admin/san-pham' },
            { label: 'Danh mục', href: '/admin/danh-muc' },
            { label: 'Ton kho', href: '/admin/ton-kho' },
            { label: 'Khach hang', href: '/admin/khach-hang' },
            { label: 'Khuyen mai', href: '/admin/khuyen-mai' },
            { label: 'Layout Builder', href: '/admin/layout-builder' },
            { label: 'Bao cao', href: '/admin/bao-cao' },
            { label: 'Media', href: '/admin/media' },
            { label: 'Nguoi dung', href: '/admin/nguoi-dung' },
            { label: 'Cai dat', href: '/admin/cai-dat' },
            { label: 'Nhat ky', href: '/admin/nhat-ky' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md hover:bg-gray-100 transition"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <button className="md:hidden p-2" aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm text-gray-500">FashionEcom Admin</div>
          <div className="flex items-center gap-4">
            <button aria-label="Thong bao" className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}
