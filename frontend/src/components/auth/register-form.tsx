'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/lib/stores/auth.store';

/** Register form — name + phone + email + password + confirm */
export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Mat khau xac nhan khong khop');
      return;
    }
    if (form.password.length < 6) {
      setError('Mat khau phai co it nhat 6 ky tu');
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

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-center">Dang ky tai khoan</h2>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Ho ten *</label>
        <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Nguyen Van A" className={inputClass} required />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">So dien thoai *</label>
        <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="0901234567" className={inputClass} required />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Email *</label>
        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="email@example.com" className={inputClass} required />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Mat khau *</label>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="It nhat 6 ky tu" className={inputClass} required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
            {showPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Xac nhan mat khau *</label>
        <input type="password" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} placeholder="Nhap lai mat khau" className={inputClass} required />
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" className="rounded border-gray-300 mt-0.5" required />
        <span className="text-xs text-gray-600">
          Toi dong y voi <a href="/chinh-sach/bao-mat" className="text-red-600 hover:underline">Chinh sach bao mat</a> va{' '}
          <a href="/chinh-sach/dieu-khoan" className="text-red-600 hover:underline">Dieu khoan su dung</a>
        </span>
      </label>

      <button type="submit" disabled={loading} className="w-full py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
        {loading ? 'Dang xu ly...' : 'DANG KY'}
      </button>

      <p className="text-sm text-center text-gray-500">
        Da co tai khoan?{' '}
        <Link href={ROUTES.LOGIN} className="text-black font-medium hover:underline">Dang nhap</Link>
      </p>
    </form>
  );
}
