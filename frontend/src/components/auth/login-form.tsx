'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/lib/stores/auth.store';

/** Login form — email/phone + password, remember me, forgot link */
export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock login — luon thanh cong
    setTimeout(() => {
      setAuth(
        { id: 'user-1', email, name: 'Nguyen Van A', role: 0 },
        'mock-access-token',
      );
      setLoading(false);
      router.push(ROUTES.ACCOUNT);
    }, 800);
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Dang nhap</h2>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Email hoac So dien thoai</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Mat khau</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhap mat khau"
            className={inputClass}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="rounded border-gray-300" />
          <span className="text-gray-600">Nho dang nhap</span>
        </label>
        <Link href={ROUTES.FORGOT_PASSWORD} className="text-red-600 hover:underline">
          Quen mat khau?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
      >
        {loading ? 'Dang xu ly...' : 'DANG NHAP'}
      </button>

      <p className="text-sm text-center text-gray-500">
        Chua co tai khoan?{' '}
        <Link href={ROUTES.REGISTER} className="text-black font-medium hover:underline">
          Dang ky ngay
        </Link>
      </p>
    </form>
  );
}
