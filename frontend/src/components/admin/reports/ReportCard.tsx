'use client';

/**
 * KPI card cho reports — hien label, value formatted, % change, icon trend
 */
interface ReportCardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
}

export function ReportCard({ label, value, change, prefix = '', suffix = '' }: ReportCardProps) {
  const formatted = typeof value === 'number'
    ? prefix + value.toLocaleString('vi-VN') + suffix
    : prefix + value + suffix;

  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold">{formatted}</p>
      {change !== undefined && change !== null && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>{change >= 0 ? '\u2191' : '\u2193'}</span>
          <span>{Math.abs(change).toFixed(1)}% so voi ky truoc</span>
        </div>
      )}
    </div>
  );
}
