'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronRight, ChevronDown, User, Heart, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui.store';
import { useAuthStore } from '@/lib/stores/auth.store';

interface MenuItem {
  label: string;
  href: string;
  className?: string;
  badge?: string | null;
  children: Omit<MenuItem, 'children'>[];
}

const DEFAULT_MENU: MenuItem[] = [
  { label: 'Sản phẩm mới', href: '/san-pham', children: [] },
  {
    label: 'Áo nam', href: '/danh-muc/ao-nam', children: [
      { label: 'Áo Polo', href: '/danh-muc/ao-polo' },
      { label: 'Áo Thun', href: '/danh-muc/ao-thun' },
      { label: 'Áo Sơ Mi', href: '/danh-muc/ao-so-mi' },
      { label: 'Áo Blazer', href: '/danh-muc/ao-blazer' },
      { label: 'Áo Khoác', href: '/danh-muc/ao-khoac' },
    ],
  },
  {
    label: 'Quần nam', href: '/danh-muc/quan-nam', children: [
      { label: 'Quần Tây', href: '/danh-muc/quan-tay' },
      { label: 'Quần Jeans', href: '/danh-muc/quan-jeans' },
      { label: 'Quần Short', href: '/danh-muc/quan-short' },
    ],
  },
  {
    label: 'Phụ kiện', href: '/danh-muc/phu-kien', children: [
      { label: 'Thắt Lưng', href: '/danh-muc/that-lung' },
    ],
  },
  { label: 'Sale', href: '/danh-muc/sale', children: [], className: '!text-fashion-red' },
];

/**
 * Mobile menu drawer — slide-in tu trai
 * Accordion danh muc + quick links account/wishlist/hotline
 */
export function MobileMenuDrawer() {
  const isOpen = useUIStore((s) => s.isMobileMenuOpen);
  const toggle = useUIStore((s) => s.toggleMobileMenu);
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [menu] = useState<MenuItem[]>(DEFAULT_MENU);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC de dong
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') toggle(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, toggle]);

  const handleToggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={toggle}
      />

      {/* Drawer — slide tu trai */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[61] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <Link href="/" onClick={toggle} className="block w-[100px] h-[28px] relative">
            <Image src="/images/theme/logo.png" alt="Torano" fill className="object-contain" />
          </Link>
          <button
            onClick={toggle}
            className="p-2 hover:bg-gray-200 rounded-full transition"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick account bar */}
        <div className="px-4 py-3 border-b bg-white">
          {isAuth ? (
            <Link
              href="/tai-khoan"
              onClick={toggle}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <User className="w-4 h-4" />
              Tài khoản của tôi
              <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/dang-nhap"
                onClick={toggle}
                className="flex-1 py-2 text-center text-sm font-semibold border border-red-600 text-red-600 rounded"
              >
                ĐĂNG NHẬP
              </Link>
              <Link
                href="/dang-ky"
                onClick={toggle}
                className="flex-1 py-2 text-center text-sm font-semibold bg-red-600 text-white rounded"
              >
                ĐĂNG KÝ
              </Link>
            </div>
          )}
        </div>

        {/* Menu items — accordion */}
        <div className="flex-1 overflow-y-auto">
          {menu.map((item, index) => (
            <div key={item.href} className="border-b border-gray-100">
              <div className="flex items-center">
                <Link
                  href={item.href}
                  onClick={toggle}
                  className={cn(
                    'flex-1 px-4 py-3.5 text-[15px] font-semibold',
                    item.className,
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-fashion-red text-white rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
                {item.children.length > 0 && (
                  <button
                    onClick={() => handleToggleExpand(index)}
                    className="w-12 h-12 flex items-center justify-center text-gray-400"
                    aria-label={`Mở danh mục ${item.label}`}
                  >
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        expandedIndex === index && 'rotate-180',
                      )}
                    />
                  </button>
                )}
              </div>
              {/* Sub-menu accordion */}
              {item.children.length > 0 && (
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-200',
                    expandedIndex === index ? 'max-h-96' : 'max-h-0',
                  )}
                >
                  <div className="bg-gray-50 py-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={toggle}
                        className="block px-8 py-2.5 text-sm text-gray-600 hover:text-red-600 transition"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer — quick links */}
        <div className="border-t bg-gray-50 px-4 py-3 space-y-2">
          <Link
            href="/tai-khoan/yeu-thich"
            onClick={toggle}
            className="flex items-center gap-2 text-sm text-gray-600 py-1"
          >
            <Heart className="w-4 h-4" />
            Sản phẩm yêu thích
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-600 py-1">
            <Phone className="w-4 h-4" />
            Hotline: 1900-xxxx
          </div>
        </div>
      </div>
    </>
  );
}
