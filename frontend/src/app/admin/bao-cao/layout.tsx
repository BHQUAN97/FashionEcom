'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Report layout — sidebar nav giua cac bao cao
 */
const reportLinks = [
  { href: '/admin/bao-cao/doanh-thu', label: 'Doanh thu' },
  { href: '/admin/bao-cao/lo-lai', label: 'Lo / Lai' },
  { href: '/admin/bao-cao/ton-kho', label: 'Ton kho' },
  { href: '/admin/bao-cao/khach-hang', label: 'Khach hang (RFM)' },
  { href: '/admin/bao-cao/nang-cao', label: 'Nang cao' },
];

export default function ReportLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bao cao</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto border-b">
        {reportLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'border-gray-900 text-gray-900 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
