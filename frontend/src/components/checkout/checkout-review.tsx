'use client';

import Image from 'next/image';
import { formatVND } from '@/lib/utils/format';
import { useCartStore } from '@/lib/stores/cart.store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/** Checkout review — items accordion, note */
export function CheckoutReview() {
  const items = useCartStore((s) => s.items);

  return (
    <div>
      <Accordion defaultValue={[0]}>
        <AccordionItem>
          <AccordionTrigger className="text-sm font-semibold">
            Đơn hàng ({items.length} sản phẩm)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden relative flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.color} / {item.size}
                    </p>
                    <p className="text-sm font-bold text-red-600 mt-0.5">{formatVND(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
