'use client';

import Image from 'next/image';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND, formatDate } from '@/lib/utils/format';
import type { Order, OrderTimelineItem } from '@/types/order';

interface OrderDetailProps {
  order: Order;
}

/** Order detail — timeline, items, address, payment */
export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">Đơn hàng {order.code}</h2>
        <p className="text-sm text-gray-500 mt-1">Đặt ngày {formatDate(order.created_at)}</p>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Trạng thái đơn hàng</h3>
        <OrderTimeline timeline={order.timeline} />
      </div>

      {/* Items */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Sản phẩm</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden relative flex-shrink-0">
                <Image src={item.image} alt={item.product_name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.product_name}</p>
                <p className="text-xs text-gray-500">{item.variant_name} x {item.qty}</p>
                <p className="text-sm font-bold mt-0.5">{formatVND(item.price * item.qty)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping info */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Địa chỉ giao hàng</h3>
        <div className="text-sm text-gray-700 space-y-0.5">
          <p className="font-medium">{order.shipping_name} - {order.shipping_phone}</p>
          <p>{order.shipping_address}, {order.shipping_ward}, {order.shipping_district}, {order.shipping_province}</p>
        </div>
      </div>

      {/* Payment */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Thanh toán</h3>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Tạm tính</span>
            <span>{formatVND(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phí vận chuyển</span>
            <span>{order.shipping_fee === 0 ? 'Miễn phí' : formatVND(order.shipping_fee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá</span>
              <span>-{formatVND(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Tổng cộng</span>
            <span className="text-red-600">{formatVND(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTimeline({ timeline }: { timeline: OrderTimelineItem[] }) {
  return (
    <div className="space-y-0">
      {timeline.map((item, i) => {
        const isLast = i === timeline.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isLast ? (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              {!isLast && <div className="w-px h-full bg-gray-200 my-1" />}
            </div>
            <div className={cn('pb-4', isLast && 'font-medium')}>
              <p className="text-sm">{item.note}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
