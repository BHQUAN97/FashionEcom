'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui.store';
import { SearchTriggerBottomNav } from '@/components/search/search-overlay';

/** Hamburger button — ket noi voi mobile menu drawer */
export function MobileMenuButton() {
  const toggle = useUIStore((s) => s.toggleMobileMenu);
  return (
    <button aria-label="Menu" className="p-1" onClick={toggle}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

/** Tab item config */
const TABS = [
  { href: '/', label: 'Trang chủ', matchExact: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/danh-muc/ao-nam', label: 'Danh mục', matchPrefix: '/danh-muc', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  // Search tab handled separately
  { href: '/tai-khoan/yeu-thich', label: 'Yêu thích', matchPrefix: '/tai-khoan/yeu-thich', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { href: '/tai-khoan', label: 'Tài khoản', matchPrefix: '/tai-khoan', matchExclude: '/tai-khoan/yeu-thich', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
] as const;

/**
 * Bottom nav voi active state highlight
 * Nielsen #1: Visibility of system status — user biet minh dang o dau
 */
export function BottomNavWithActiveState() {
  const pathname = usePathname();

  const isActive = (tab: typeof TABS[number]) => {
    if ('matchExact' in tab && tab.matchExact) return pathname === tab.href;
    if ('matchExclude' in tab && tab.matchExclude && pathname.startsWith(tab.matchExclude)) return false;
    if ('matchPrefix' in tab && tab.matchPrefix) return pathname.startsWith(tab.matchPrefix);
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white z-50 safe-area-pb shadow-[0_0_3px_rgba(0,0,0,0.15)]">
      <div className="flex h-[55px] p-[5px]">
        {/* Tab 1: Trang chu */}
        <NavTab tab={TABS[0]} active={isActive(TABS[0])} />
        {/* Tab 2: Danh muc */}
        <NavTab tab={TABS[1]} active={isActive(TABS[1])} />
        {/* Tab 3: Tim kiem — dac biet, mo overlay */}
        <SearchTriggerBottomNav />
        {/* Tab 4: Yeu thich */}
        <NavTab tab={TABS[2]} active={isActive(TABS[2])} />
        {/* Tab 5: Tai khoan */}
        <NavTab tab={TABS[3]} active={isActive(TABS[3])} />
      </div>
    </nav>
  );
}

function NavTab({ tab, active }: { tab: typeof TABS[number]; active: boolean }) {
  return (
    <Link
      href={tab.href}
      className={cn(
        'flex-[0_0_20%] flex flex-col items-center justify-center gap-1 transition-colors',
        active ? 'text-red-600' : 'text-gray-600',
      )}
    >
      <span className="w-5 h-[22px] block relative">
        <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
        </svg>
      </span>
      <span className={cn('text-[11px] leading-none line-clamp-1', active ? 'font-bold' : 'font-medium')}>
        {tab.label}
      </span>
      {/* Active indicator dot */}
      {active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-600" />}
    </Link>
  );
}
