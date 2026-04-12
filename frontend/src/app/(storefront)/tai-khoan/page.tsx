'use client';

import { AccountMenu } from '@/components/account/account-menu';
import { AccountProfile } from '@/components/account/account-profile';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';

/**
 * Account page — /tai-khoan
 * Mobile: menu list, Desktop: profile form
 */
export default function AccountPage() {
  const bp = useBreakpoint();

  // Mobile: hien menu
  if (bp === 'mobile') {
    return (
      <div>
        <h2 className="text-lg font-bold mb-4">Tài khoản</h2>
        <AccountMenu />
      </div>
    );
  }

  // Desktop: hien profile (menu nam o sidebar cua layout)
  return <AccountProfile />;
}
