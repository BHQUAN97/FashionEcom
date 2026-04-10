'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CouponInputProps {
  className?: string;
}

/** Coupon input — UI only Phase 1 */
export function CouponInput({ className }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleApply = () => {
    if (!code.trim()) return;
    // Phase 1: mock — luon bao loi
    setError('Ma giam gia khong hop le hoac da het han');
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
            }}
            placeholder="Nhap ma giam gia"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          onClick={handleApply}
          className="px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
        >
          Ap dung
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
