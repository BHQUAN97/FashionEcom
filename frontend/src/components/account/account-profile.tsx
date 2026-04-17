'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';

/** Account profile form — edit name, phone, dob */
export function AccountProfile() {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '0901234567',
    dob: '1990-01-15',
  });
  const [saved, setSaved] = useState(false);

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    setSaved(true);
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black';

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Thông tin cá nhân</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Họ tên</label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Email</label>
          <input type="email" value={user?.email || ''} disabled className={`${inputClass} bg-gray-50`} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Số điện thoại</label>
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Ngày sinh</label>
          <input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} className={inputClass} />
        </div>

        <button type="submit" className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition">
          LƯU THAY ĐỔI
        </button>
        {saved && <p className="text-sm text-green-600">Đã lưu thành công!</p>}
      </form>
    </div>
  );
}
