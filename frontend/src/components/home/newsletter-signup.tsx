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
        <h3 className="text-lg font-bold">Dang ky nhan uu dai</h3>
        <p className="text-sm text-gray-500 mt-1">
          Nhan ngay voucher 10% cho don hang dau tien
        </p>
        {submitted ? (
          <p className="mt-4 text-green-600 text-sm font-medium">
            Cam on ban! Kiem tra email de nhan voucher.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email cua ban"
              required
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition"
            >
              DANG KY
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
