'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { DateRangePicker } from '@/components/admin/reports/DateRangePicker';
import { ExportButton } from '@/components/admin/reports/ExportButton';
import { EmptyReport } from '@/components/admin/reports/EmptyReport';
import { ReportSkeleton } from '@/components/admin/reports/ReportSkeleton';

/**
 * Bao cao Lo/Lai (P&L) — tree table + stacked bar + trend line
 * API: GET /api/reports/pnl
 */
interface PnLRow {
  group_name: string;
  gross_revenue: number;
  discount: number;
  net_revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin: number;
  shipping_cost: number;
  payment_fees: number;
  net_profit: number;
  net_margin: number;
  order_count: number;
}

interface PnLTrend {
  month: string;
  net_revenue: number;
  cogs: number;
  shipping: number;
}

export default function PnLReportPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [groupBy, setGroupBy] = useState('total');
  const [pnl, setPnl] = useState<PnLRow[]>([]);
  const [comparison, setComparison] = useState<PnLRow[]>([]);
  const [chartData, setChartData] = useState<PnLTrend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ group_by: groupBy });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/reports/pnl?${params}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPnl(json.data.pnl || []);
        setComparison(json.data.comparison || []);
        setChartData(json.data.chart_data || []);
      }
    } catch {
      setPnl([]);
      setComparison([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [from, to, groupBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    const params = new URLSearchParams({ group_by: groupBy, format });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    window.open(`/api/reports/pnl/export?${params}`, '_blank');
  };

  if (loading) return <ReportSkeleton />;

  const current = pnl[0];
  const prev = comparison[0];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
        <div className="flex items-center gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md"
          >
            <option value="total">Tong hop</option>
            <option value="category">Theo danh muc</option>
          </select>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {!current ? (
        <EmptyReport />
      ) : (
        <>
          {/* P&L Tree Table */}
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Chi tieu</th>
                  <th className="text-right px-4 py-3 font-medium">Ky hien tai</th>
                  <th className="text-right px-4 py-3 font-medium">Ky truoc</th>
                  <th className="text-right px-4 py-3 font-medium">Thay doi</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'DOANH THU', key: 'gross_revenue', bold: true },
                  { label: '(-) Giam gia / Coupon', key: 'discount', indent: true },
                  { label: '= DOANH THU THUAN', key: 'net_revenue', bold: true },
                  { label: '(-) Gia von (COGS)', key: 'cogs', indent: true },
                  { label: '= LAI GOP', key: 'gross_profit', bold: true },
                  { label: '(-) Chi phi van chuyen', key: 'shipping_cost', indent: true },
                  { label: '(-) Phi cong thanh toan', key: 'payment_fees', indent: true },
                  { label: '= LAI RONG', key: 'net_profit', bold: true, highlight: true },
                  { label: 'Ty le lai gop (%)', key: 'gross_margin', percent: true },
                  { label: 'Ty le lai rong (%)', key: 'net_margin', percent: true },
                ].map((row) => {
                  const curVal = Number((current as unknown as Record<string, unknown>)[row.key] || 0);
                  const prevVal = prev ? Number((prev as unknown as Record<string, unknown>)[row.key] || 0) : 0;
                  const change = prevVal !== 0 ? ((curVal - prevVal) / Math.abs(prevVal)) * 100 : 0;

                  return (
                    <tr
                      key={row.key}
                      className={`border-b last:border-0 ${row.highlight ? 'bg-gray-50' : ''}`}
                    >
                      <td className={`px-4 py-3 ${row.indent ? 'pl-8' : ''} ${row.bold ? 'font-semibold' : ''}`}>
                        {row.label}
                      </td>
                      <td className={`px-4 py-3 text-right ${row.bold ? 'font-semibold' : ''}`}>
                        {row.percent ? `${curVal.toFixed(1)}%` : curVal.toLocaleString('vi-VN') + 'd'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {row.percent ? `${prevVal.toFixed(1)}%` : prevVal.toLocaleString('vi-VN') + 'd'}
                      </td>
                      <td className={`px-4 py-3 text-right ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change !== 0 ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Stacked bar: breakdown cau truc P&L */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-sm font-medium mb-4">Cau truc doanh thu</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[{
                  label: 'Ky hien tai',
                  cogs: current.cogs,
                  shipping: current.shipping_cost,
                  fees: current.payment_fees,
                  profit: current.net_profit > 0 ? current.net_profit : 0,
                }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: any) => Number(value).toLocaleString('vi-VN') + 'd'} />
                  <Legend />
                  <Bar dataKey="cogs" name="Gia von" fill="#EF4444" stackId="a" />
                  <Bar dataKey="shipping" name="Ship" fill="#F59E0B" stackId="a" />
                  <Bar dataKey="fees" name="Phi TT" fill="#8B5CF6" stackId="a" />
                  <Bar dataKey="profit" name="Lai rong" fill="#22C55E" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Trend line: lai rong 12 thang */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-sm font-medium mb-4">Xu huong lai rong (12 thang)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData.map((d) => ({
                  month: d.month,
                  net_profit: Number(d.net_revenue) - Number(d.cogs) - Number(d.shipping),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: any) => Number(value).toLocaleString('vi-VN') + 'd'} />
                  <Line type="monotone" dataKey="net_profit" name="Lai rong" stroke="#22C55E" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
