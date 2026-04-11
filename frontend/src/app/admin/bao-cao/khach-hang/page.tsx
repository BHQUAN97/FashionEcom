'use client';

import { useState, useEffect, useCallback } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { ExportButton } from '@/components/admin/reports/export-button';
import { EmptyReport } from '@/components/admin/reports/empty-report';
import { ReportSkeleton } from '@/components/admin/reports/report-skeleton';

/**
 * Bao cao RFM Segmentation — Treemap + bang thong ke + drill-down
 * API: GET /api/reports/rfm, GET /api/reports/rfm/:segment/customers
 */

interface RfmSegment {
  name: string;
  count: number;
  percentage: number;
  aov: number;
  total_revenue: number;
}

interface RfmCustomer {
  customer_id: string;
  name: string;
  phone: string;
  r_score: number;
  f_score: number;
  m_score: number;
  monetary: number;
  segment: string;
}

// Mau sac theo spec Section 5.3
const SEGMENT_COLORS: Record<string, string> = {
  'Champions': '#22C55E',
  'Loyal Customers': '#3B82F6',
  'Potential Loyalists': '#8B5CF6',
  'New Customers': '#06B6D4',
  'At Risk': '#F59E0B',
  'Cant Lose Them': '#EF4444',
  'Hibernating': '#9CA3AF',
  'Lost': '#4B5563',
};

export default function CustomerRFMPage() {
  const [segments, setSegments] = useState<RfmSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [customers, setCustomers] = useState<RfmCustomer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/rfm');
      const json = await res.json();
      if (json.success && json.data) {
        setSegments(json.data.segments || []);
      }
    } catch {
      setSegments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSegments(); }, [fetchSegments]);

  const handleSegmentClick = async (segment: string) => {
    setSelectedSegment(segment);
    setLoadingCustomers(true);
    try {
      const res = await fetch(`/api/reports/rfm/${encodeURIComponent(segment)}/customers?limit=20`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomers(json.data.rows || []);
      }
    } catch {
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleRecalculate = async () => {
    await fetch('/api/reports/rfm/recalculate', { method: 'POST' });
    fetchSegments();
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    window.open(`/api/reports/rfm/export?format=${format}`, '_blank');
  };

  if (loading) return <ReportSkeleton />;

  // Treemap data
  const treemapData = segments.map((s) => ({
    name: s.name,
    size: s.count,
    fill: SEGMENT_COLORS[s.name] || '#6B7280',
  }));

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleRecalculate}
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          Tinh lai RFM
        </button>
        <ExportButton onExport={handleExport} />
      </div>

      {segments.length === 0 ? (
        <EmptyReport message="Chua co du lieu RFM. Bam 'Tinh lai RFM' de bat dau." />
      ) : (
        <>
          {/* Treemap */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm font-medium mb-4">RFM Segments</h3>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={treemapData}
                dataKey="size"
                nameKey="name"
                stroke="#fff"
                content={(props) => {
                  const p = props as { x: number; y: number; width: number; height: number; name?: string; fill?: string };
                  return (
                    <g>
                      {p.width >= 40 && p.height >= 30 ? (
                        <>
                          <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={p.fill} rx={4} />
                          <text x={p.x + p.width / 2} y={p.y + p.height / 2} textAnchor="middle" fill="#fff" fontSize={11}>
                            {p.name}
                          </text>
                        </>
                      ) : (
                        <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={p.fill} rx={4} />
                      )}
                    </g>
                  );
                }}
              >
                <Tooltip formatter={(value) => `${Number(value)} khach hang`} />
              </Treemap>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4">
              {segments.map((s) => (
                <button
                  key={s.name}
                  onClick={() => handleSegmentClick(s.name)}
                  className="flex items-center gap-1.5 text-xs hover:underline"
                >
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: SEGMENT_COLORS[s.name] || '#6B7280' }}
                  />
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Segment Table */}
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Segment</th>
                  <th className="text-right px-4 py-3 font-medium">So KH</th>
                  <th className="text-right px-4 py-3 font-medium">%</th>
                  <th className="text-right px-4 py-3 font-medium">AOV</th>
                  <th className="text-right px-4 py-3 font-medium">Tong DT</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s) => (
                  <tr key={s.name} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: SEGMENT_COLORS[s.name] || '#6B7280' }}
                      />
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-right">{s.count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{s.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right">{s.aov.toLocaleString()}d</td>
                    <td className="px-4 py-3 text-right font-medium">{s.total_revenue.toLocaleString()}d</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSegmentClick(s.name)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Chi tiet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Customer Drill-down */}
          {selectedSegment && (
            <div className="bg-white rounded-lg border overflow-x-auto">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium">Khach hang: {selectedSegment}</h3>
                <button onClick={() => setSelectedSegment(null)} className="text-xs text-gray-500 hover:underline">
                  Dong
                </button>
              </div>
              {loadingCustomers ? (
                <div className="p-8 text-center text-gray-400">Dang tai...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium">Ten</th>
                      <th className="text-left px-4 py-3 font-medium">SDT</th>
                      <th className="text-center px-4 py-3 font-medium">R</th>
                      <th className="text-center px-4 py-3 font-medium">F</th>
                      <th className="text-center px-4 py-3 font-medium">M</th>
                      <th className="text-right px-4 py-3 font-medium">Tong chi tieu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.customer_id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <a href={`/admin/khach-hang/${c.customer_id}`} className="text-blue-600 hover:underline">
                            {c.name}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                        <td className="px-4 py-3 text-center">{c.r_score}</td>
                        <td className="px-4 py-3 text-center">{c.f_score}</td>
                        <td className="px-4 py-3 text-center">{c.m_score}</td>
                        <td className="px-4 py-3 text-right font-medium">{Number(c.monetary).toLocaleString()}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
