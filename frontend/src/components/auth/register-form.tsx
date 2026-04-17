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
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
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
    if (form.password.length < 8 || !/^(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số');
      return;
    }
    if (form.phone && !/^(0|\+84)[0-9]{9,10}$/.test(form.phone)) {
      setError('Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

    try {
      const res = await fetch(`${API_BASE}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      // TODO: Khi co customer auth API rieng, doi sang endpoint do
      // Hien tai dung admin auth de test flow, se tach rieng sau
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Không thể tạo tài khoản');
      }

      const json = await res.json();
      const { user: u, accessToken } = json.data;
      setAuth(
        { id: u.sys_user_id, email: u.sys_user_email, name: u.sys_user_name || form.name, role: u.sys_user_role ?? 0 },
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
          maxLength={100}
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

      {/* So dien thoai */}
      <div>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="Số điện thoại (tuỳ chọn)"
          pattern="^(0|\+84)[0-9]{9,10}$"
          className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-gray-900 transition"
        />
      </div>

      {/* Mat khau */}
      <div className="relative">
        <input
          type={showPw ? 'text' : 'password'}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          placeholder="Mật khẩu (ít nhất 8 ký tự, 1 chữ hoa, 1 số)"
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
