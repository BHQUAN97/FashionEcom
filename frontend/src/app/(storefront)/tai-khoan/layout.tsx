'use client';

import type { ReactNode } from 'react';
import { AccountMenu } from '@/components/account/account-menu';

/**
 * Account layout — mobile: content only, desktop: sidebar + content
 * Protected route (chua enforce auth Phase 1)
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
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
