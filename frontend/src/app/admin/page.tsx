'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ReportCard } from '@/components/admin/reports/report-card';
import { ReportSkeleton } from '@/components/admin/reports/report-skeleton';

/**
 * Admin Dashboard — KPI cards voi % change + 7 charts
 * Phase 3 upgrade: heatmap, top categories, new customers area chart
 */

interface KpiData {
  revenue_today: { value: number; change: number };
  revenue_month: { value: number; change: number };
  orders_count: { value: number; month: number; change: number };
  new_customers: { value: number; change: number };
  aov: { value: number; change: number };
  low_stock_alerts: { value: number };
}

interface HeatmapCell {
  day_of_week: number;
  hour_of_day: number;
  order_count: number;
}

// Mapping DAYOFWEEK MySQL: 1=Sun, 2=Mon, ..., 7=Sat
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const PIE_COLORS = ['#1a1a1a', '#3B82F6', '#D0021B', '#22C55E', '#F59E0B'];
const PAYMENT_LABELS: Record<number, string> = { 0: 'COD', 1: 'Chuyen khoan', 2: 'MoMo/VNPay' };

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [revenueChart, setRevenueChart] = useState<{ date: string; revenue: number }[]>([]);
  const [paymentChart, setPaymentChart] = useState<{ method: number; total: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ product_name: string; qty_sold: number; revenue: number }[]>([]);
  const [topCategories, setTopCategories] = useState<{ category_name: string; revenue: number }[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [newCustomersChart, setNewCustomersChart] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const r = (url: string) => fetch(url).then((res) => res.json()).catch(() => ({ data: null }));
      const [kpiRes, revRes, payRes, prodRes, catRes, heatRes, custRes] = await Promise.all([
        r('/api/admin/dashboard/kpis'),
        r(`/api/admin/dashboard/charts/revenue?range=${range}`),
        r(`/api/admin/dashboard/charts/payment-methods?range=${range}`),
        r(`/api/admin/dashboard/charts/top-products?range=${range}`),
        r(`/api/admin/dashboard/charts/top-categories?range=${range}`),
        r(`/api/admin/dashboard/charts/order-heatmap?range=${range}`),
        r(`/api/admin/dashboard/charts/new-customers?range=${range}`),
      ]);

      if (kpiRes.data) setKpis(kpiRes.data);
      if (revRes.data) setRevenueChart(revRes.data);
      if (payRes.data) setPaymentChart(payRes.data);
      if (prodRes.data) setTopProducts(prodRes.data);
      if (catRes.data) setTopCategories(catRes.data);
      if (heatRes.data) setHeatmap(heatRes.data);
      if (custRes.data) setNewCustomersChart(custRes.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return <ReportSkeleton />;

  // Build heatmap grid: 7 rows (days) x 24 cols (hours)
  const heatmapGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  let maxHeatVal = 1;
  for (const cell of heatmap) {
    const dayIdx = Number(cell.day_of_week) - 1; // 0-6
    const hour = Number(cell.hour_of_day);
    if (dayIdx >= 0 && dayIdx < 7 && hour >= 0 && hour < 24) {
      heatmapGrid[dayIdx][hour] = Number(cell.order_count);
      if (Number(cell.order_count) > maxHeatVal) maxHeatVal = Number(cell.order_count);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-1">
          {['7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs rounded-md border ${
                range === r ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <ReportCard label="Doanh thu hom nay" value={kpis.revenue_today.value} suffix="d" change={kpis.revenue_today.change} />
          <ReportCard label="Doanh thu thang" value={kpis.revenue_month.value} suffix="d" change={kpis.revenue_month.change} />
          <ReportCard label="Don hang (thang)" value={kpis.orders_count.month || kpis.orders_count.value} change={kpis.orders_count.change} />
          <ReportCard label="Khach hang moi" value={kpis.new_customers.value} change={kpis.new_customers.change} />
          <ReportCard label="AOV" value={kpis.aov.value} suffix="d" change={kpis.aov.change} />
          <ReportCard label="Ton kho canh bao" value={kpis.low_stock_alerts.value} />
        </div>
      )}

      {/* Row 1: Revenue line + Payment pie */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium mb-4">Doanh thu theo ngay</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(value) => Number(value).toLocaleString('vi-VN') + 'd'} />
              <Line type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium mb-4">Phuong thuc thanh toan</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={paymentChart.map((p) => ({
                  name: PAYMENT_LABELS[Number(p.method)] || `Khac (${p.method})`,
                  value: Number(p.total),
                }))}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {paymentChart.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value).toLocaleString('vi-VN') + 'd'} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Top Products + Top Categories */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium mb-4">Top 10 SP ban chay</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="product_name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => Number(value).toLocaleString()} />
              <Bar dataKey="qty_sold" name="Da ban" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium mb-4">Top 10 danh muc</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCategories.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
              <YAxis type="category" dataKey="category_name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => Number(value).toLocaleString('vi-VN') + 'd'} />
              <Bar dataKey="revenue" name="Doanh thu" fill="#D0021B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: New Customers Area + Order Heatmap */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium mb-4">Khach hang moi</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={newCustomersChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Khach moi" stroke="#3B82F6" fill="#DBEAFE" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium mb-4">Heatmap don hang</h3>
          <div className="overflow-x-auto">
            <div className="inline-block">
              {/* Header: hours */}
              <div className="flex">
                <div className="w-8" />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="w-6 text-center text-[10px] text-gray-400">{h}</div>
                ))}
              </div>
              {/* Grid rows */}
              {heatmapGrid.map((row, dayIdx) => (
                <div key={dayIdx} className="flex">
                  <div className="w-8 text-[10px] text-gray-500 flex items-center">{DAY_LABELS[dayIdx]}</div>
                  {row.map((val, hour) => {
                    const intensity = val / maxHeatVal;
                    const r = Math.round(208 + (208 - 208) * intensity); // D0 = 208
                    const g = Math.round(2 + (2 - 2) * intensity);
                    const b = Math.round(27 + (27 - 27) * intensity);
                    return (
                      <div
                        key={hour}
                        className="w-6 h-6 rounded-sm m-px cursor-default"
                        style={{
                          backgroundColor: val === 0
                            ? '#F3F4F6'
                            : `rgba(208, 2, 27, ${Math.max(0.1, intensity)})`,
                        }}
                        title={`${DAY_LABELS[dayIdx]} ${hour}h: ${val} don`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
