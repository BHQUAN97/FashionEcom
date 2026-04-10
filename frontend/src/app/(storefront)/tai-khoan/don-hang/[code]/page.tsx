'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { OrderDetail } from '@/components/account/order-detail';
import { MOCK_ORDERS } from '@/lib/mock/data';

/** Order detail page — /tai-khoan/don-hang/[code] */
export default function OrderDetailPage() {
  const params = useParams();
  const code = params.code as string;
  const order = MOCK_ORDERS.find((o) => o.code === code) || MOCK_ORDERS[0];

  return (
    <div>
      <Link
        href={ROUTES.ORDERS}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lai don hang
      </Link>
      <OrderDetail order={order} />
    </div>
  );
}
