import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

/** Auth layout — Torano style: centered white card, clean border, logo */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-[0.3em] uppercase">
            FASHION
          </Link>
        </div>
        <div className="bg-white border border-gray-200 p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
