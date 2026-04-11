'use client';

// Cac preset mau cho tung loai status
const DEFAULT_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-red-100 text-red-700',
  4: 'bg-blue-100 text-blue-700',
  5: 'bg-purple-100 text-purple-700',
  6: 'bg-orange-100 text-orange-700',
  7: 'bg-teal-100 text-teal-700',
};

interface StatusBadgeProps {
  status: number;
  label: string;
  colors?: Record<number, string>;
}

export function StatusBadge({ status, label, colors }: StatusBadgeProps) {
  const colorMap = colors || DEFAULT_COLORS;
  const color = colorMap[status] || DEFAULT_COLORS[0];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
