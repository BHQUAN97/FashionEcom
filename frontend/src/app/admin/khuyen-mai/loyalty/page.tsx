'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

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
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<LoyaltyConfig>('/admin/loyalty/config')
      .then((res) => setConfig((res.data as any).data || res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await api.put('/admin/loyalty/config', {
        earnRate: config.prmLoyaltyConfigEarnRate,
        redeemRate: config.prmLoyaltyConfigRedeemRate,
        maxRedeemPercent: config.prmLoyaltyConfigMaxRedeemPercent,
        minRedeemPoints: config.prmLoyaltyConfigMinRedeemPoints,
        expiryMonths: config.prmLoyaltyConfigExpiryMonths,
        pendingDays: config.prmLoyaltyConfigPendingDays,
        silverThreshold: config.prmLoyaltyConfigSilverThreshold,
        goldThreshold: config.prmLoyaltyConfigGoldThreshold,
        platinumThreshold: config.prmLoyaltyConfigPlatinumThreshold,
      });
      alert('Luu thanh cong!');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) return <div className="p-8 text-center text-gray-500">Dang tai...</div>;

  const Field = ({ label, field, suffix }: { label: string; field: keyof LoyaltyConfig; suffix?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={Number(config[field])}
          onChange={(e) => setConfig({ ...config, [field]: Number(e.target.value) })}
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
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
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
