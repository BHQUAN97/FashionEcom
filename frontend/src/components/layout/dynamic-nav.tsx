'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// --- Types ---

interface ApiMenuItem {
  cmsMenuItemId: string;
  cmsMenuItemLabel: string;
  cmsMenuItemType: string; // 'url' | 'category' | 'page'
  cmsMenuItemValue: string;
  cmsMenuItemIcon: string | null;
  cmsMenuItemBadge: string | null;
  cmsMenuItemOpenNewTab: number; // 0 or 1
  cmsMenuItemSort: number;
  children: ApiMenuItem[];
}

interface NavItem {
  label: string;
  href: string;
  className?: string;
  badge?: string | null;
  openNewTab?: boolean;
  children: Omit<NavItem, 'children'>[];
}

// --- Fallback menu khi API fail hoac tra empty ---

const DEFAULT_MENU: NavItem[] = [
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

// --- Helpers ---

/** Chuyen doi API menu item type thanh href */
function resolveHref(item: ApiMenuItem): string {
  switch (item.cmsMenuItemType) {
    case 'page':
      return `/trang/${item.cmsMenuItemValue}`;
    case 'category':
      return `/danh-muc/${item.cmsMenuItemValue}`;
    case 'url':
    default:
      return item.cmsMenuItemValue;
  }
}

/** Map API response sang NavItem[] */
function mapApiMenuToNav(items: ApiMenuItem[]): NavItem[] {
  return items.map((item) => ({
    label: item.cmsMenuItemLabel,
    href: resolveHref(item),
    badge: item.cmsMenuItemBadge,
    openNewTab: item.cmsMenuItemOpenNewTab === 1,
    children: (item.children || []).map((child) => ({
      label: child.cmsMenuItemLabel,
      href: resolveHref(child),
      badge: child.cmsMenuItemBadge,
      openNewTab: child.cmsMenuItemOpenNewTab === 1,
    })),
  }));
}

// --- Chevron icon (reusable) ---

function ChevronDown() {
  return (
    <svg
      className="w-3 h-3 ml-1 inline-block transition-transform group-hover:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// --- Component ---

/**
 * Dynamic navigation — fetch menu tu API, fallback ve default menu
 * Client component vi can useEffect + useState de fetch data
 */
export function DynamicNav() {
  const [menu, setMenu] = useState<NavItem[]>(DEFAULT_MENU);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

    fetch(`${API_BASE}/layout/menus/header`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        // API tra ve { success, data, message }
        const items: ApiMenuItem[] = json.data;
        if (Array.isArray(items) && items.length > 0) {
          setMenu(mapApiMenuToNav(items));
        }
        // Neu empty → giu DEFAULT_MENU
      })
      .catch(() => {
        // API fail → giu DEFAULT_MENU, khong log loi ra console user
      });
  }, []);

  /** Props chung cho link co the open new tab */
  const linkProps = (openNewTab?: boolean) =>
    openNewTab ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {};

  return (
    <nav className="flex gap-6 mx-auto">
      {menu.map((item) => (
        <div key={item.href} className="relative group">
          <Link
            href={item.href}
            className={`menu-link${item.children.length > 0 ? ' menu-link--has-child' : ''}${item.className ? ` ${item.className}` : ''}`}
            {...linkProps(item.openNewTab)}
          >
            {item.label}
            {item.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold leading-none bg-fashion-red text-white rounded">
                {item.badge}
              </span>
            )}
            {item.children.length > 0 && <ChevronDown />}
          </Link>

          {item.children.length > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-48 bg-white border border-gray-200 shadow-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="menu-dropdown-item"
                  {...linkProps(child.openNewTab)}
                >
                  {child.label}
                  {child.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold leading-none bg-fashion-red text-white rounded">
                      {child.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
