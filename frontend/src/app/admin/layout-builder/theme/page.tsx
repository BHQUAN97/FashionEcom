'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface ThemeEntry {
  cmsThemeConfigId: string;
  cmsThemeConfigKey: string;
  cmsThemeConfigValue: string;
  cmsThemeConfigType: string;
  cmsThemeConfigGroup: string;
  cmsThemeConfigLabel: string;
}

const GROUP_LABELS: Record<string, string> = {
  colors: 'Mau sac',
  fonts: 'Font chu',
  branding: 'Thuong hieu',
  footer: 'Footer',
  announcement: 'Thong bao',
};

/**
 * Admin Theme Settings — colors, fonts, logo, footer config
 */
export default function ThemeSettingsPage() {
  const [entries, setEntries] = useState<ThemeEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<ThemeEntry[]>('/admin/layout/theme')
      .then(res => setEntries(res.data));
  }, []);

  const updateValue = (key: string, value: string) => {
    setEntries(entries.map(e => e.cmsThemeConfigKey === key ? { ...e, cmsThemeConfigValue: value } : e));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/layout/theme', {
        entries: entries.map(e => ({ key: e.cmsThemeConfigKey, value: e.cmsThemeConfigValue })),
      });
    } finally {
      setSaving(false);
    }
  };

  // Group entries
  const groups = Object.keys(GROUP_LABELS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Cai dat giao dien</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-50">
          {saving ? 'Dang luu...' : 'Luu thay doi'}
        </button>
      </div>

      {groups.map(group => {
        const groupEntries = entries.filter(e => e.cmsThemeConfigGroup === group);
        if (groupEntries.length === 0) return null;

        return (
          <div key={group} className="bg-white border rounded-lg p-4 space-y-4">
            <h2 className="font-medium text-sm text-gray-500 uppercase">{GROUP_LABELS[group]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupEntries.map(entry => (
                <div key={entry.cmsThemeConfigKey}>
                  <label className="block text-sm font-medium mb-1">{entry.cmsThemeConfigLabel}</label>
                  {entry.cmsThemeConfigType === 'color' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={entry.cmsThemeConfigValue}
                        onChange={(e) => updateValue(entry.cmsThemeConfigKey, e.target.value)}
                        className="w-10 h-8 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={entry.cmsThemeConfigValue}
                        onChange={(e) => updateValue(entry.cmsThemeConfigKey, e.target.value)}
                        className="flex-1 text-sm border rounded px-3 py-1.5 font-mono"
                      />
                    </div>
                  ) : entry.cmsThemeConfigType === 'font' ? (
                    <select
                      value={entry.cmsThemeConfigValue}
                      onChange={(e) => updateValue(entry.cmsThemeConfigKey, e.target.value)}
                      className="w-full text-sm border rounded px-3 py-2"
                    >
                      {['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Playfair Display', 'Lato', 'Nunito', 'Poppins'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  ) : entry.cmsThemeConfigType === 'boolean' ? (
                    <select
                      value={entry.cmsThemeConfigValue}
                      onChange={(e) => updateValue(entry.cmsThemeConfigKey, e.target.value)}
                      className="w-full text-sm border rounded px-3 py-2"
                    >
                      <option value="0">Tat</option>
                      <option value="1">Bat</option>
                    </select>
                  ) : entry.cmsThemeConfigType === 'image' ? (
                    <input
                      type="text"
                      value={entry.cmsThemeConfigValue}
                      onChange={(e) => updateValue(entry.cmsThemeConfigKey, e.target.value)}
                      placeholder="URL anh"
                      className="w-full text-sm border rounded px-3 py-2"
                    />
                  ) : (
                    <input
                      type="text"
                      value={entry.cmsThemeConfigValue}
                      onChange={(e) => updateValue(entry.cmsThemeConfigKey, e.target.value)}
                      className="w-full text-sm border rounded px-3 py-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
