'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { AccountMenu } from '@/components/account/account-menu';
import { useAuthStore } from '@/lib/stores/auth.store';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Account layout — protected route, redirect ve login neu chua dang nhap
 * Mobile: content only, desktop: sidebar + content
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, router]);

  // Chua login — khong render content
  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
      <div className="md:flex md:gap-8">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block md:w-60 flex-shrink-0">
          <div className="sticky top-20">
            <AccountMenu />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
