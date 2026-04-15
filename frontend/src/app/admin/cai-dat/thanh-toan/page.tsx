'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';

interface PaymentConfig {
  method: string;
  label: string;
  enabled: boolean;
  feePercent: number;
}

const GATEWAYS: PaymentConfig[] = [
  { method: 'cod', label: 'Thanh toán khi nhận hàng (COD)', enabled: true, feePercent: 0 },
  { method: 'bank_transfer', label: 'Chuyển khoản ngân hàng', enabled: true, feePercent: 0 },
  { method: 'momo', label: 'MoMo', enabled: false, feePercent: 1.5 },
  { method: 'vnpay', label: 'VNPAY', enabled: false, feePercent: 1.1 },
  { method: 'payoo', label: 'Payoo', enabled: false, feePercent: 2.0 },
  { method: 'zalopay', label: 'ZaloPay', enabled: false, feePercent: 1.5 },
];

/**
 * Admin Payment Settings — bat/tat cong thanh toan, cau hinh API keys
 */
export default function PaymentSettingsPage() {
  const [gateways, setGateways] = useState<PaymentConfig[]>(GATEWAYS);
  const [loading, setLoading] = useState(false);

  const toggle = (index: number) => {
    const updated = [...gateways];
    updated[index].enabled = !updated[index].enabled;
    setGateways(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Luu config qua settings API
      await api.put('/admin/settings/payment', { gateways });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt Thanh toán</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50"
        >
          {loading ? 'Dang luu...' : 'Luu thay doi'}
        </button>
      </div>

      <div className="grid gap-4">
        {gateways.map((gw, idx) => (
          <div key={gw.method} className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">{gw.label}</h3>
              <p className="text-sm text-gray-500">Phi: {gw.feePercent}%</p>
            </div>
            <button
              onClick={() => toggle(idx)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                gw.enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  gw.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800">Luu y</h3>
        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>API keys duoc luu ma hoa trong he thong</li>
          <li>MoMo, VNPAY, ZaloPay can cau hinh callback URL trong dashboard cua gateway</li>
          <li>Giao dich chua thanh toan se tu dong huy sau 15 phut</li>
          <li>Phi gateway duoc tinh vao bao cao Lo/Lai</li>
        </ul>
      </div>
    </div>
  );
}
