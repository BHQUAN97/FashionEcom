'use client';

import { Banknote, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCheckoutStore } from '@/lib/stores/checkout.store';
import { CONFIG } from '@/lib/constants/config';
import type { PaymentMethod } from '@/types/order';

const PAYMENT_METHODS: { key: PaymentMethod; label: string; desc: string; icon: typeof Banknote }[] = [
  { key: 'cod', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận được hàng', icon: Banknote },
  { key: 'bank_transfer', label: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản trước — xác nhận tự động', icon: Building2 },
];

/** Checkout payment selection — COD + bank transfer */
export function CheckoutPayment() {
  const { paymentMethod, setPaymentMethod } = useCheckoutStore();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Phương thức thanh toán</h3>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = paymentMethod === method.key;
          const Icon = method.icon;
          return (
            <button
              key={method.key}
              onClick={() => setPaymentMethod(method.key)}
              className={cn(
                'w-full flex items-center gap-3 p-4 border-2 rounded-lg text-left transition',
                isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-400',
              )}
            >
              <Icon className={cn('w-6 h-6 flex-shrink-0', isSelected ? 'text-red-600' : 'text-gray-400')} />
              <div className="flex-1">
                <p className={cn('text-sm font-medium', isSelected && 'text-red-600')}>{method.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  isSelected ? 'border-red-600' : 'border-gray-300',
                )}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bank transfer info */}
      {paymentMethod === 'bank_transfer' && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-semibold">Thông tin chuyển khoản</h4>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
            <span className="text-gray-500">Ngân hàng:</span>
            <span className="font-medium">{CONFIG.BANK_INFO.bank_name}</span>
            <span className="text-gray-500">Chủ TK:</span>
            <span className="font-medium">{CONFIG.BANK_INFO.account_name}</span>
            <span className="text-gray-500">Số TK:</span>
            <span className="font-medium">{CONFIG.BANK_INFO.account_number}</span>
            <span className="text-gray-500">Chi nhánh:</span>
            <span className="font-medium">{CONFIG.BANK_INFO.branch}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Nội dung CK: <span className="font-mono font-medium">[Mã đơn hàng]</span> — Hệ thống sẽ tự động xác nhận sau 1-5 phút.
          </p>
        </div>
      )}
    </div>
  );
}
