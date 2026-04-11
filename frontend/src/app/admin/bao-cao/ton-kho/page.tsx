'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ReportCard } from '@/components/admin/reports/report-card';
import { ExportButton } from '@/components/admin/reports/export-button';
import { EmptyReport } from '@/components/admin/reports/empty-report';
import { ReportSkeleton } from '@/components/admin/reports/report-skeleton';

/**
 * Bao cao ton kho — 4 tabs: Tong quan / Chi tiet / Dead Stock / Turnover
 * API: GET /api/reports/inventory, /dead-stock, /turnover
 */

type TabKey = 'overview' | 'detail' | 'dead' | 'turnover';

interface InventorySummary {
  total_value: number;
  in_stock_sku: number;
  out_of_stock_sku: number;
  low_stock_sku: number;
}

interface InventoryRow {
  product_name: string;
  sku: string;
  color: string;
  size: string;
  available: number;
  locked: number;
  cost: number;
  stock_value: number;
  sold_30d: number;
}

interface TurnoverCategory {
  category_name: string;
  cogs: number;
  inventory_value: number;
  turnover_rate: number;
}

export default function InventoryReportPage() {
  const [tab, setTab] = useState<TabKey>('overview');
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [deadStock, setDeadStock] = useState<InventoryRow[]>([]);
  const [turnover, setTurnover] = useState<TurnoverCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, deadRes, turnRes] = await Promise.all([
        fetch('/api/reports/inventory').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/reports/inventory/dead-stock').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/reports/inventory/turnover').then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (invRes.success && invRes.data) {
        setSummary(invRes.data.summary || null);
        setRows(invRes.data.rows || []);
      }
      if (deadRes.success && deadRes.data) {
        setDeadStock(deadRes.data.rows || []);
      }
      if (turnRes.success && turnRes.data) {
        setTurnover(turnRes.data.by_category || []);
      }
    } catch {
      // Fallback khi API chua san sang
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    window.open(`/api/reports/inventory/export?format=${format}`, '_blank');
  };

  if (loading) return <ReportSkeleton />;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Tong quan' },
    { key: 'detail', label: 'Chi tiet' },
    { key: 'dead', label: 'Dead Stock' },
    { key: 'turnover', label: 'Turnover' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm rounded-md transition ${
                tab === t.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ExportButton onExport={handleExport} />
      </div>

      {/* Summary cards */}
      {summary && tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportCard label="Tong gia tri ton" value={summary.total_value} suffix="d" />
          <ReportCard label="SKU co hang" value={summary.in_stock_sku} />
          <ReportCard label="SKU het hang" value={summary.out_of_stock_sku} />
          <ReportCard label="SKU sap het" value={summary.low_stock_sku} />
        </div>
      )}

      {/* Detail Table */}
      {(tab === 'overview' || tab === 'detail') && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">San pham</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Mau/Size</th>
                <th className="text-right px-4 py-3 font-medium">Ton</th>
                <th className="text-right px-4 py-3 font-medium">Khoa</th>
                <th className="text-right px-4 py-3 font-medium">Da ban (30d)</th>
                <th className="text-right px-4 py-3 font-medium">Gia tri ton</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7}><EmptyReport /></td></tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">{row.product_name}</td>
                    <td className="px-4 py-3 text-gray-500">{row.sku}</td>
                    <td className="px-4 py-3 text-gray-500">{[row.color, row.size].filter(Boolean).join(' / ')}</td>
                    <td className={`px-4 py-3 text-right ${Number(row.available) <= 10 ? 'text-red-600 font-medium' : ''}`}>
                      {Number(row.available).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{Number(row.locked).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{Number(row.sold_30d).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">{Number(row.stock_value).toLocaleString()}d</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Dead Stock */}
      {tab === 'dead' && (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <div className="px-4 py-3 border-b bg-red-50">
            <p className="text-sm text-red-700">San pham co ton nhung khong ban trong 90 ngay gan nhat</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">San pham</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-right px-4 py-3 font-medium">Ton</th>
                <th className="text-right px-4 py-3 font-medium">Gia von</th>
                <th className="text-right px-4 py-3 font-medium">Gia tri ton dong</th>
              </tr>
            </thead>
            <tbody>
              {deadStock.length === 0 ? (
                <tr><td colSpan={5}><EmptyReport message="Khong co dead stock" /></td></tr>
              ) : (
                deadStock.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">{row.product_name}</td>
                    <td className="px-4 py-3 text-gray-500">{row.sku}</td>
                    <td className="px-4 py-3 text-right">{Number(row.available).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{Number(row.cost).toLocaleString()}d</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">
                      {Number(row.stock_value).toLocaleString()}d
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Turnover */}
      {tab === 'turnover' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-sm font-medium mb-4">Inventory Turnover theo danh muc</h3>
          {turnover.length === 0 ? (
            <EmptyReport message="Chua co du lieu turnover" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={turnover} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="category_name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                <Bar dataKey="turnover_rate" name="Turnover Rate" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
