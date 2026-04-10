'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DateRangePicker } from '@/components/admin/reports/DateRangePicker';
import { ReportCard } from '@/components/admin/reports/ReportCard';
import { EmptyReport } from '@/components/admin/reports/EmptyReport';
import { ReportSkeleton } from '@/components/admin/reports/ReportSkeleton';

/**
 * Trang nang cao — 3 tabs: Funnel / Luot xem SP / Tim kiem
 */

type AdvancedTab = 'funnel' | 'views' | 'search';

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropoff_rate: number;
}

interface SearchTerm {
  term: string;
  count: number;
  avg_results: number;
}

interface ProductView {
  product_id: string;
  product_name: string;
  total_views: number;
  unique_viewers: number;
  category_name: string;
}

export default function AdvancedAnalyticsPage() {
  const [tab, setTab] = useState<AdvancedTab>('funnel');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  // Funnel data
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);

  // Product views data
  const [productViews, setProductViews] = useState<ProductView[]>([]);

  // Search data
  const [topTerms, setTopTerms] = useState<SearchTerm[]>([]);
  const [noResultTerms, setNoResultTerms] = useState<SearchTerm[]>([]);
  const [searchSummary, setSearchSummary] = useState({ total_searches: 0, unique_terms: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      if (tab === 'funnel') {
        const res = await fetch(`/api/reports/funnel?${params}`);
        const json = await res.json();
        if (json.success && json.data) {
          setFunnelSteps(json.data.steps || []);
          setTotalSessions(json.data.total_sessions || 0);
        }
      } else if (tab === 'views') {
        const res = await fetch(`/api/reports/product-views?${params}`);
        const json = await res.json();
        if (json.success && json.data) {
          setProductViews(json.data.rows || []);
        }
      } else if (tab === 'search') {
        const res = await fetch(`/api/reports/search?${params}`);
        const json = await res.json();
        if (json.success && json.data) {
          setTopTerms(json.data.top_terms || []);
          setNoResultTerms(json.data.no_result_terms || []);
          setSearchSummary(json.data.summary || { total_searches: 0, unique_terms: 0 });
        }
      }
    } catch {
      // Fallback khi API chua san sang
    } finally {
      setLoading(false);
    }
  }, [tab, from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs: { key: AdvancedTab; label: string }[] = [
    { key: 'funnel', label: 'Funnel Checkout' },
    { key: 'views', label: 'Luot xem SP' },
    { key: 'search', label: 'Tim kiem' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs + Date filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <DateRangePicker from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
      </div>

      {loading ? (
        <ReportSkeleton />
      ) : (
        <>
          {/* === FUNNEL TAB === */}
          {tab === 'funnel' && (
            <div className="space-y-6">
              <ReportCard label="Tong sessions" value={totalSessions} />

              {funnelSteps.length === 0 ? (
                <EmptyReport message="Chua co du lieu funnel. Tich hop tracking events truoc." />
              ) : (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-sm font-medium mb-4">Funnel Checkout</h3>
                  <div className="space-y-3">
                    {funnelSteps.map((step, i) => {
                      const maxCount = funnelSteps[0]?.count || 1;
                      const widthPct = Math.max((step.count / maxCount) * 100, 5);
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{step.name}</span>
                            <span className="text-gray-500">
                              {step.count.toLocaleString()} ({step.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-8 relative">
                            <div
                              className="h-8 rounded-full flex items-center justify-end px-3"
                              style={{
                                width: `${widthPct}%`,
                                backgroundColor: step.dropoff_rate > 50 ? '#FEE2E2' : '#E5E7EB',
                                borderLeft: '4px solid',
                                borderColor: step.dropoff_rate > 50 ? '#EF4444' : '#1a1a1a',
                              }}
                            >
                              {i > 0 && (
                                <span className={`text-xs ${step.dropoff_rate > 50 ? 'text-red-600' : 'text-gray-500'}`}>
                                  -{step.dropoff_rate}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === PRODUCT VIEWS TAB === */}
          {tab === 'views' && (
            <div className="bg-white rounded-lg border overflow-x-auto">
              {productViews.length === 0 ? (
                <EmptyReport message="Chua co du lieu luot xem." />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium">San pham</th>
                      <th className="text-left px-4 py-3 font-medium">Danh muc</th>
                      <th className="text-right px-4 py-3 font-medium">Luot xem</th>
                      <th className="text-right px-4 py-3 font-medium">Nguoi xem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productViews.map((v, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">{v.product_name || v.product_id}</td>
                        <td className="px-4 py-3 text-gray-500">{v.category_name || '-'}</td>
                        <td className="px-4 py-3 text-right">{Number(v.total_views).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{Number(v.unique_viewers).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* === SEARCH TAB === */}
          {tab === 'search' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <ReportCard label="Tong luot tim kiem" value={searchSummary.total_searches} />
                <ReportCard label="Tu khoa duy nhat" value={searchSummary.unique_terms} />
              </div>

              {/* Top search terms chart */}
              {topTerms.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-sm font-medium mb-4">Top tu khoa tim kiem</h3>
                  <ResponsiveContainer width="100%" height={Math.max(topTerms.length * 32, 200)}>
                    <BarChart data={topTerms.slice(0, 15)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="term" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Luot tim" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* No-result terms */}
              {noResultTerms.length > 0 && (
                <div className="bg-white rounded-lg border overflow-x-auto">
                  <div className="px-4 py-3 border-b bg-red-50">
                    <p className="text-sm text-red-700">Tu khoa khong co ket qua</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium">Tu khoa</th>
                        <th className="text-right px-4 py-3 font-medium">Luot tim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {noResultTerms.map((t, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-3 text-red-600">{t.term}</td>
                          <td className="px-4 py-3 text-right">{t.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
