'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

/** Forgot password form */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 800);
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black';

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold">Kiem tra email</h2>
        <p className="text-sm text-gray-500">
          Chung toi da gui huong dan dat lai mat khau den <span className="font-medium text-black">{email}</span>
        </p>
        <Link href={ROUTES.LOGIN} className="text-sm text-red-600 hover:underline">
          Quay lai dang nhap
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Quen mat khau</h2>
      <p className="text-sm text-gray-500 text-center">
        Nhap email de nhan huong dan dat lai mat khau
      </p>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={inputClass} required />
      </div>

      <button type="submit" disabled={loading} className="w-full py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
        {loading ? 'Dang gui...' : 'GUI HUONG DAN'}
      </button>

      <p className="text-sm text-center">
        <Link href={ROUTES.LOGIN} className="text-gray-500 hover:underline">Quay lai dang nhap</Link>
      </p>
    </form>
  );
}
