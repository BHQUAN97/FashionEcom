'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { ReportCard } from '@/components/admin/reports/ReportCard';
import { DateRangePicker } from '@/components/admin/reports/DateRangePicker';
import { ExportButton } from '@/components/admin/reports/ExportButton';
import { EmptyReport } from '@/components/admin/reports/EmptyReport';
import { ReportSkeleton } from '@/components/admin/reports/ReportSkeleton';

/**
 * Trang bao cao doanh thu theo ky — Recharts BarChart + LineChart AOV
 * API: GET /api/reports/revenue
 */
interface RevenueRow {
  period_label: string;
  order_count: number;
  gross_revenue: number;
  total_discount: number;
  net_revenue: number;
}

interface RevenueSummary {
  total_orders: number;
  gross_revenue: number;
  total_discount: number;
  net_revenue: number;
  aov: number;
}

export default function RevenueReportPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [period, setPeriod] = useState('day');
  const [rows, setRows] = useState<RevenueRow[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/reports/revenue?${params}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRows(json.data.rows || []);
        setSummary(json.data.summary || null);
      }
    } catch {
      // Fallback: demo data khi API chua san sang
      setRows([]);
      setSummary({ total_orders: 0, gross_revenue: 0, total_discount: 0, net_revenue: 0, aov: 0 });
    } finally {
      setLoading(false);
    }
  }, [from, to, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const params = new URLSearchParams({ period, format });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    window.open(`/api/reports/revenue/export?${params}`, '_blank');
  };

  if (loading) return <ReportSkeleton />;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md"
          >
            <option value="day">Theo ngay</option>
            <option value="week">Theo tuan</option>
            <option value="month">Theo thang</option>
            <option value="quarter">Theo quy</option>
            <option value="year">Theo nam</option>
          </select>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ReportCard label="So don" value={summary.total_orders} />
          <ReportCard label="Doanh thu" value={summary.gross_revenue} suffix="d" />
          <ReportCard label="Giam gia" value={summary.total_discount} suffix="d" />
          <ReportCard label="DT thuan" value={summary.net_revenue} suffix="d" />
          <ReportCard label="AOV" value={summary.aov} suffix="d" />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyReport />
      ) : (
        <>
          {/* Revenue Bar Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm font-medium mb-4">Doanh thu thuan theo ky</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value: any) => Number(value).toLocaleString('vi-VN') + 'd'} />
                <Legend />
                <Bar dataKey="net_revenue" name="Doanh thu thuan" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AOV Trend Line Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm font-medium mb-4">AOV theo ky</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={rows.map((r) => ({
                ...r,
                aov: r.order_count > 0 ? Math.round(Number(r.net_revenue) / Number(r.order_count)) : 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: any) => Number(value).toLocaleString('vi-VN') + 'd'} />
                <Line type="monotone" dataKey="aov" name="AOV" stroke="#D0021B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Ky</th>
                  <th className="text-right px-4 py-3 font-medium">So don</th>
                  <th className="text-right px-4 py-3 font-medium">Doanh thu</th>
                  <th className="text-right px-4 py-3 font-medium">Giam gia</th>
                  <th className="text-right px-4 py-3 font-medium">DT thuan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">{row.period_label}</td>
                    <td className="px-4 py-3 text-right">{Number(row.order_count).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{Number(row.gross_revenue).toLocaleString()}d</td>
                    <td className="px-4 py-3 text-right">{Number(row.total_discount).toLocaleString()}d</td>
                    <td className="px-4 py-3 text-right font-medium">{Number(row.net_revenue).toLocaleString()}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
