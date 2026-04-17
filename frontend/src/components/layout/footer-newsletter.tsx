'use client';

import { useState } from 'react';

/**
 * Footer newsletter form — voi feedback states
 * Nielsen #1: Visibility of system status
 */
export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: Goi API subscribe khi co
    setStatus('success');
    setEmail('');
    // Reset sau 5s de user co the dang ky email khac
    setTimeout(() => setStatus('idle'), 5000);
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-4 py-3">
        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-green-700 font-medium">
          Đăng ký thành công! Kiểm tra email để nhận ưu đãi.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Nhập email của bạn"
        required
        className="w-full h-[46px] pl-10 pr-[130px] rounded bg-white border border-fashion-border text-sm focus:outline-none focus:border-fashion-red"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 h-[46px] px-6 border border-fashion-border bg-fashion-red text-white text-sm font-bold uppercase rounded hover:bg-red-700 transition"
      >
        ĐĂNG KÝ
      </button>
    </form>
  );
}
