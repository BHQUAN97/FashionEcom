'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';

interface LoyaltyConfig {
  prmLoyaltyConfigEarnRate: number;
  prmLoyaltyConfigRedeemRate: number;
  prmLoyaltyConfigMaxRedeemPercent: number;
  prmLoyaltyConfigMinRedeemPoints: number;
  prmLoyaltyConfigExpiryMonths: number;
  prmLoyaltyConfigPendingDays: number;
  prmLoyaltyConfigSilverThreshold: number;
  prmLoyaltyConfigGoldThreshold: number;
  prmLoyaltyConfigPlatinumThreshold: number;
}

/**
 * Admin Loyalty Config — cau hinh chuong trinh tich diem
 */
export default function LoyaltyConfigPage() {
  const { data } = useAdminFetch<{ data: LoyaltyConfig } | LoyaltyConfig>({ url: '/admin/loyalty/config' });
  const initialConfig = data ? ((data as { data: LoyaltyConfig }).data || data) as LoyaltyConfig : null;

  // Local editable state — khoi tao tu fetched data
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync fetched data vao local state khi load xong
  const activeConfig = config || initialConfig;

  if (!activeConfig) return <div className="p-8 text-center text-gray-500">Dang tai...</div>;

  // Ensure local state is initialized
  if (!config && initialConfig) {
    setConfig(initialConfig);
    return <div className="p-8 text-center text-gray-500">Dang tai...</div>;
  }

  const handleSave = async () => {
    if (!activeConfig) return;
    setSaving(true);
    try {
      await api.put('/admin/loyalty/config', {
        earnRate: activeConfig.prmLoyaltyConfigEarnRate,
        redeemRate: activeConfig.prmLoyaltyConfigRedeemRate,
        maxRedeemPercent: activeConfig.prmLoyaltyConfigMaxRedeemPercent,
        minRedeemPoints: activeConfig.prmLoyaltyConfigMinRedeemPoints,
        expiryMonths: activeConfig.prmLoyaltyConfigExpiryMonths,
        pendingDays: activeConfig.prmLoyaltyConfigPendingDays,
        silverThreshold: activeConfig.prmLoyaltyConfigSilverThreshold,
        goldThreshold: activeConfig.prmLoyaltyConfigGoldThreshold,
        platinumThreshold: activeConfig.prmLoyaltyConfigPlatinumThreshold,
      });
      alert('Luu thanh cong!');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, field, suffix }: { label: string; field: keyof LoyaltyConfig; suffix?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={Number(activeConfig[field])}
          onChange={(e) => setConfig({ ...activeConfig, [field]: Number(e.target.value) })}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        {suffix && <span className="text-sm text-gray-500 whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cau hinh Loyalty</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50">
          {saving ? 'Dang luu...' : 'Luu thay doi'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Quy tac tich diem</h2>
          <Field label="Ty le tich" field="prmLoyaltyConfigEarnRate" suffix="VND = 1 diem" />
          <Field label="So ngay cho (pending)" field="prmLoyaltyConfigPendingDays" suffix="ngay" />
          <Field label="Het han diem sau" field="prmLoyaltyConfigExpiryMonths" suffix="thang" />
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Quy tac doi diem</h2>
          <Field label="Ty le doi" field="prmLoyaltyConfigRedeemRate" suffix="diem = 10,000 VND" />
          <Field label="Toi da % don hang" field="prmLoyaltyConfigMaxRedeemPercent" suffix="%" />
          <Field label="Diem toi thieu doi" field="prmLoyaltyConfigMinRedeemPoints" suffix="diem" />
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4 md:col-span-2">
          <h2 className="font-semibold text-gray-900">Phan hang (Tiering)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Nguong Silver" field="prmLoyaltyConfigSilverThreshold" suffix="VND/12th" />
            <Field label="Nguong Gold" field="prmLoyaltyConfigGoldThreshold" suffix="VND/12th" />
            <Field label="Nguong Platinum" field="prmLoyaltyConfigPlatinumThreshold" suffix="VND/12th" />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[
              { name: 'Member', bonus: '0%', color: 'bg-gray-100' },
              { name: 'Silver', bonus: '+10%', color: 'bg-gray-200' },
              { name: 'Gold', bonus: '+20%', color: 'bg-yellow-100' },
              { name: 'Platinum', bonus: '+30%', color: 'bg-purple-100' },
            ].map((tier) => (
              <div key={tier.name} className={`${tier.color} rounded-lg p-3 text-center`}>
                <div className="font-medium">{tier.name}</div>
                <div className="text-sm text-gray-600">Bonus: {tier.bonus}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
