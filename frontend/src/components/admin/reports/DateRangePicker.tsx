'use client';

import { useState } from 'react';

/**
 * Date range picker voi presets — Hom nay, 7 ngay, 30 ngay, Thang nay, Quy nay, Nam nay, Custom
 */
interface DateRangePickerProps {
  from?: string;
  to?: string;
  onChange: (from: string, to: string) => void;
}

const PRESETS = [
  { label: 'Hom nay', days: 0 },
  { label: '7 ngay', days: 7 },
  { label: '30 ngay', days: 30 },
  { label: '90 ngay', days: 90 },
  { label: 'Nam nay', days: -1 },
];

function getPresetDates(days: number): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];

  if (days === -1) {
    // Nam nay
    const from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    return { from, to };
  }

  if (days === 0) {
    return { from: to, to };
  }

  const fromDate = new Date(now);
  fromDate.setDate(fromDate.getDate() - days);
  return { from: fromDate.toISOString().split('T')[0], to };
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<number | null>(30);

  const handlePreset = (days: number) => {
    setActivePreset(days);
    const dates = getPresetDates(days);
    onChange(dates.from, dates.to);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.days}
          onClick={() => handlePreset(p.days)}
          className={`px-3 py-1.5 text-xs rounded-md border transition ${
            activePreset === p.days
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={from || ''}
          onChange={(e) => {
            setActivePreset(null);
            onChange(e.target.value, to || '');
          }}
          className="px-2 py-1.5 text-xs border rounded-md"
        />
        <span className="text-gray-400">-</span>
        <input
          type="date"
          value={to || ''}
          onChange={(e) => {
            setActivePreset(null);
            onChange(from || '', e.target.value);
          }}
          className="px-2 py-1.5 text-xs border rounded-md"
        />
      </div>
    </div>
  );
}
