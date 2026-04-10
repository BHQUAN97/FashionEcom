'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Package, Heart, MapPin, Lock, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/lib/stores/auth.store';

const MENU_ITEMS = [
  { href: ROUTES.ACCOUNT, label: 'Thong tin ca nhan', icon: User },
  { href: ROUTES.ORDERS, label: 'Don hang cua toi', icon: Package },
  { href: ROUTES.WISHLIST, label: 'San pham yeu thich', icon: Heart },
  { href: ROUTES.ADDRESSES, label: 'So dia chi', icon: MapPin },
];

/** Account menu — mobile: list page, desktop: sidebar */
export function AccountMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.HOME);
  };

  return (
    <nav className="space-y-1">
      {MENU_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg transition text-sm',
              isActive ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50',
            )}
          >
            <Icon className="w-5 h-5 text-gray-500" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-400 md:hidden" />
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 text-red-600 text-sm w-full"
      >
        <LogOut className="w-5 h-5" />
        <span>Dang xuat</span>
      </button>
    </nav>
  );
}
