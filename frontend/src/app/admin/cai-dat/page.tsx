'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { api } from '@/lib/api/client';

// API trả về dạng { shop: { key: value }, shipping: { key: value }, ... }
type SettingsData = Record<string, Record<string, string>>;

const SETTING_GROUPS = [
  { key: 'shop', label: 'Thông tin cửa hàng', fields: [
    { key: 'site_name', label: 'Tên cửa hàng' },
    { key: 'site_phone', label: 'Số điện thoại' },
    { key: 'site_email', label: 'Email' },
    { key: 'site_address', label: 'Địa chỉ' },
    { key: 'site_description', label: 'Mô tả ngắn' },
  ]},
  { key: 'shipping', label: 'Giao hàng', fields: [
    { key: 'shipping_fee', label: 'Phí giao hàng mặc định (VNĐ)' },
    { key: 'free_ship_threshold', label: 'Miễn phí ship từ (VNĐ)' },
  ]},
  { key: 'payment', label: 'Thanh toán', fields: [
    { key: 'cod_enabled', label: 'Bật COD (true/false)' },
    { key: 'bank_transfer_enabled', label: 'Bật chuyển khoản (true/false)' },
    { key: 'bank_account', label: 'Số tài khoản ngân hàng' },
    { key: 'bank_name', label: 'Tên ngân hàng' },
  ]},
];

/**
 * Admin Settings — cài đặt chung cửa hàng
 */
export default function SettingsPage() {
  const { data: res, loading } = useAdminFetch<{ data: SettingsData }>({ url: '/admin/settings' });
  const settingsFromApi = res?.data || {};

  const [activeGroup, setActiveGroup] = useState('shop');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Sync settings vào form
  useEffect(() => {
    if (Object.keys(settingsFromApi).length > 0 && !initialized) {
      const flat: Record<string, string> = {};
      Object.entries(settingsFromApi).forEach(([, groupValues]) => {
        if (typeof groupValues === 'object' && groupValues) {
          Object.entries(groupValues).forEach(([k, v]) => { flat[k] = v || ''; });
        }
      });
      setFormData(flat);
      setInitialized(true);
    }
  }, [settingsFromApi, initialized]);

  const currentGroup = SETTING_GROUPS.find((g) => g.key === activeGroup);

  const handleSave = async () => {
    if (!currentGroup) return;
    setSaving(true);
    setMessage('');
    try {
      const groupData: Record<string, string> = {};
      currentGroup.fields.forEach((f) => { groupData[f.key] = formData[f.key] || ''; });
      await api.put(`/admin/settings/${activeGroup}`, groupData);
      setMessage('Đã lưu thành công');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Lỗi khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {SETTING_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeGroup === g.key ? 'bg-orange-50 text-[#ee4d2d]' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {g.label}
            </button>
          ))}
          <hr className="my-3" />
          <Link href="/admin/cai-dat/bao-mat" className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 block">
            Bảo mật
          </Link>
          <Link href="/admin/layout-builder/theme" className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 block">
            Giao diện
          </Link>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm border ${
              message.includes('Lỗi') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">{currentGroup?.label}</h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>

            <div className="space-y-4">
              {currentGroup?.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input
                    value={formData[f.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder={f.label}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
