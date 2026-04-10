'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Checkout success — /thanh-toan/thanh-cong
 * Thank you page voi order code + CTA
 */
export default function CheckoutSuccessPage() {
  // Mock order code
  const orderCode = `FE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <h1 className="text-2xl font-bold mt-4">Dat hang thanh cong!</h1>
      <p className="text-gray-500 mt-2">Cam on ban da mua hang tai Fashion Ecom</p>

      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-500">Ma don hang</p>
        <p className="text-lg font-bold mt-1">{orderCode}</p>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Chung toi se gui email xac nhan don hang den dia chi email cua ban.
        Ban co the theo doi don hang trong phan Tai khoan.
      </p>

      <div className="flex flex-col gap-3 mt-6">
        <Link
          href={ROUTES.ORDERS}
          className="block py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
        >
          THEO DOI DON HANG
        </Link>
        <Link
          href={ROUTES.PRODUCTS}
          className="block py-3 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          TIEP TUC MUA SAM
        </Link>
      </div>
    </div>
  );
}
