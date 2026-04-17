'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NewsletterSignupProps {
  className?: string;
}

/** Newsletter signup — email input + submit */
export function NewsletterSignup({ className }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className={cn('bg-gray-100 py-8 px-4 md:py-12', className)}>
      <div className="max-w-md mx-auto text-center">
        <h3 className="text-lg font-bold">Đăng ký nhận ưu đãi</h3>
        <p className="text-sm text-gray-500 mt-1">
          Nhận ngay voucher 10% cho đơn hàng đầu tiên
        </p>
        {submitted ? (
          <p className="mt-4 text-green-600 text-sm font-medium">
            Cảm ơn bạn! Kiểm tra email để nhận voucher.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              required
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="btn-sweep btn-sweep-red rounded-lg"
            >
              ĐĂNG KÝ
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
