import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

/** Auth layout — centered card, logo, responsive */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold tracking-widest">
            FASHION
          </Link>
        </div>
        <div className="bg-white rounded-xl border p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
