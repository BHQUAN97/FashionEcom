'use client';

import { useState } from 'react';
import { Tag, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cart.store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

interface CouponInputProps {
  className?: string;
  onApplied?: (discountAmount: number, discountCode: string) => void;
}

/** Coupon input — goi API apply discount code */
export function CouponInput({ className, onApplied }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const itemCount = useCartStore((s) => s.getCount());

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/promotions/discounts/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          code: trimmed,
          cartSubtotal: subtotal,
          cartItemCount: itemCount,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message || 'Ma giam gia khong hop le');
        return;
      }

      const result = json.data;
      setSuccess(`Giảm ${result.discountAmount?.toLocaleString('vi-VN')}đ`);
      onApplied?.(result.discountAmount, result.code);
    } catch {
      setError('Không thể kiểm tra mã giảm giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
              setSuccess('');
            }}
            placeholder="Nhập mã giảm giá"
            disabled={!!success}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !!success}
          className="px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? '...' : success ? 'Đã áp dụng' : 'Áp dụng'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {success && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <Check className="w-3 h-3" /> {success}
        </p>
      )}
    </div>
  );
}
