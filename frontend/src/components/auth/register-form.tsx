'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/lib/stores/auth.store';

/** Register form — Torano style: clean card, red CTA */
export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    // Mock register
    setTimeout(() => {
      setAuth(
        { id: 'user-new', email: form.email, name: form.name, role: 0 },
        'mock-access-token',
      );
      setLoading(false);
      router.push(ROUTES.ACCOUNT);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tieu de chinh */}
      <h2 className="text-lg font-bold text-center tracking-wide uppercase">
        Đăng ký tài khoản
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 text-center -mt-2">
        Nhập thông tin để tạo tài khoản mới:
      </p>

      {error && (
        <p className="text-sm text-red-600 text-center bg-red-50 py-2 rounded">
          {error}
        </p>
      )}

      {/* Ho ten */}
      <div>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Họ tên"
          className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition"
          required
        />
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition"
          required
        />
      </div>

      {/* Mat khau */}
      <div className="relative">
        <input
          type={showPw ? 'text' : 'password'}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          placeholder="Mật khẩu"
          className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition pr-11"
          required
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Xac nhan mat khau */}
      <div className="relative">
        <input
          type={showConfirm ? 'text' : 'password'}
          value={form.confirm}
          onChange={(e) => update('confirm', e.target.value)}
          placeholder="Xác nhận mật khẩu"
          className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition pr-11"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

      {/* Nut dang ky — do Torano */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition disabled:opacity-50"
      >
        {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
      </button>

      {/* Link dang nhap */}
      <p className="text-sm text-center text-gray-500">
        Đã có tài khoản?{' '}
        <Link href={ROUTES.LOGIN} className="text-red-600 hover:underline font-medium">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
