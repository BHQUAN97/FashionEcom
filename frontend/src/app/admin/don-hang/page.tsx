'use client';

import { useState, useMemo } from 'react';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface Order {
  saleOrderId: string;
  saleOrderCode: string;
  saleOrderStatus: number;
  saleOrderTotal: number;
  saleOrderPaymentMethod: string;
  customerName: string;
  createdDate: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Chờ xác nhận', 1: 'Đã xác nhận', 2: 'Đang giao', 3: 'Đã giao', 4: 'Hoàn thành', 5: 'Đã hủy',
};
const STATUS_COLORS: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-700', 1: 'bg-blue-100 text-blue-700', 2: 'bg-orange-100 text-orange-700',
  3: 'bg-green-100 text-green-700', 4: 'bg-green-100 text-green-700', 5: 'bg-red-100 text-red-700',
};

/** Status tab definition */
const STATUS_TABS = [
  { label: 'Tất cả', value: undefined },
  { label: 'Chờ xác nhận', value: 0 },
  { label: 'Đã xác nhận', value: 1 },
  { label: 'Đang giao', value: 2 },
  { label: 'Đã giao', value: 3 },
  { label: 'Hoàn thành', value: 4 },
  { label: 'Đã hủy', value: 5 },
] as const;

/** Format giá VND */
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

/**
 * Admin Orders — danh sach don hang kieu Shopee Seller Center
 * Ho tro: filter status tabs, search theo ma don
 */
export default function OrdersPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Build URL dong voi filter params
  const fetchUrl = useMemo(() => {
    let url = '/admin/orders?limit=50';
    if (statusFilter !== undefined) url += `&status=${statusFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return url;
  }, [statusFilter, search]);

  const { data, loading } = useAdminFetch<{ data: Order[] }>({ url: fetchUrl });
  const orders = data?.data || [];

  // Dem so luong theo tung status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      const key = `s${o.saleOrderStatus}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [orders]);

  /** Ap dung search */
  const applySearch = () => {
    setSearch(searchInput);
  };

  /** Dat lai tat ca filter */
  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter(undefined);
  };

  return (
    <AdminTableLayout
      title="Đơn hàng"
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Status filter tabs */}
        <div className="border-b flex overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count =
              tab.value === undefined
                ? statusCounts.all
                : statusCounts[`s${tab.value}`] || 0;

            return (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-5 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  isActive
                    ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1 text-xs ${isActive ? 'text-[#ee4d2d]' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/30 focus:border-[#ee4d2d]"
          />
          <button
            onClick={applySearch}
            className="px-4 py-2 bg-[#ee4d2d] text-white rounded-md text-sm font-medium hover:bg-[#d73211] transition-colors"
          >
            Tìm kiếm
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Đặt lại
          </button>
        </div>

        {/* Orders table */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Mã đơn</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Khách hàng</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Tổng tiền</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Thanh toán</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.saleOrderId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`/admin/don-hang/${o.saleOrderId}`} className="text-[#ee4d2d] hover:underline font-mono text-xs">
                    {o.saleOrderCode}
                  </a>
                </td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={o.saleOrderStatus} label={STATUS_LABELS[o.saleOrderStatus]} colors={STATUS_COLORS} />
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(Number(o.saleOrderTotal))}</td>
                <td className="px-4 py-3 text-gray-500">{o.saleOrderPaymentMethod}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(o.createdDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <EmptyTableRow colSpan={6} message="Chưa có đơn hàng nào" />
            )}
          </tbody>
        </table>
      </div>
    </AdminTableLayout>
  );
}
