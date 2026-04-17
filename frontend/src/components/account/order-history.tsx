'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatVND, formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import type { Order, OrderStatus } from '@/types/order';
import { MOCK_ORDERS } from '@/lib/mock/data';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Đang chuẩn bị', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  returned: { label: 'Đã trả hàng', color: 'bg-gray-100 text-gray-700' },
  refunded: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-700' },
};

/** Order history list — tab filter by status, paginated */
export function OrderHistory() {
  const orders = MOCK_ORDERS;

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Đơn hàng của tôi</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
          <Link href={ROUTES.PRODUCTS} className="text-sm text-red-600 hover:underline mt-2 inline-block">
            Bắt đầu mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_LABELS[order.status];
  return (
    <Link
      href={ROUTES.ORDER_DETAIL(order.code)}
      className="block border rounded-lg p-4 hover:border-gray-400 transition"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{order.code}</span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', status.color)}>
          {status.label}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {order.items.slice(0, 3).map((item) => (
          <div key={item.id} className="w-12 h-12 rounded bg-gray-100 overflow-hidden relative">
            <Image src={item.image} alt={item.product_name} fill sizes="48px" className="object-cover" />
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
            +{order.items.length - 3}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{formatDate(order.created_at)}</span>
        <span className="font-bold">{formatVND(order.total)}</span>
      </div>
    </Link>
  );
}
