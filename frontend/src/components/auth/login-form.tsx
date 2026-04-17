'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/lib/stores/auth.store';

/** Login form — Torano style: clean card, red CTA, centered links */
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

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

    try {
      const res = await fetch(`${API_BASE}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Email hoặc mật khẩu không đúng');
      }

      const json = await res.json();
      const { user: u, accessToken } = json.data;
      setAuth(
        { id: u.sys_user_id, email: u.sys_user_email, name: u.sys_user_name || '', role: u.sys_user_role ?? 0 },
        accessToken,
      );
      router.push(ROUTES.ACCOUNT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tieu de chinh */}
      <h2 className="text-lg font-bold text-center tracking-wide uppercase">
        Đăng nhập tài khoản
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 text-center -mt-2">
        Nhập email và mật khẩu của bạn:
      </p>

      {error && (
        <p className="text-sm text-red-600 text-center bg-red-50 py-2 rounded">
          {error}
        </p>
      )}

      {/* Email */}
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition"
          required
        />
      </div>

      {/* Mat khau */}
      <div className="relative">
        <input
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition pr-11"
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* reCAPTCHA notice */}
      <p className="text-xs text-gray-400 text-center">
        Trang web này được bảo vệ bởi reCAPTCHA.{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
          Chính sách bảo mật
        </a>{' '}
        và{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
          Điều khoản dịch vụ
        </a>{' '}
        của Google.
      </p>

      {/* Nut dang nhap — do Torano */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
      </button>

      {/* Links ben duoi */}
      <div className="space-y-2 text-sm text-center">
        <p className="text-gray-500">
          Khách hàng mới?{' '}
          <Link href={ROUTES.REGISTER} className="text-red-600 hover:underline font-medium">
            Tạo tài khoản
          </Link>
        </p>
        <p className="text-gray-500">
          Quên mật khẩu?{' '}
          <Link href={ROUTES.FORGOT_PASSWORD} className="text-red-600 hover:underline font-medium">
            Khôi phục mật khẩu
          </Link>
        </p>
      </div>
    </form>
  );
}
