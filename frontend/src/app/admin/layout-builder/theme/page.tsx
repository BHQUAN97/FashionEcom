'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  colors: 'Màu sắc',
  fonts: 'Font chữ',
  branding: 'Thương hiệu',
  footer: 'Footer',
  announcement: 'Thông báo',
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
        <div className="flex items-center gap-3">
          <Link
            href="/admin/layout-builder"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            title="Quay lại Layout Builder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Cài đặt giao diện</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#ee4d2d] text-white text-sm rounded hover:bg-[#d73211] disabled:opacity-50">
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
                      <option value="0">Tắt</option>
                      <option value="1">Bật</option>
                    </select>
                  ) : entry.cmsThemeConfigType === 'image' ? (
                    <input
                      type="text"
                      value={entry.cmsThemeConfigValue}
                      onChange={(e) => updateValue(entry.cmsThemeConfigKey, e.target.value)}
                      placeholder="URL ảnh"
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
