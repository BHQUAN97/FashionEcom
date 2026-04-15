'use client';

import { useState, useMemo } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';

interface FlashSaleItem {
  prmFlashSaleItemId: string;
  catProductId: string;
  prmFlashSaleItemDiscountPct: number;
  prmFlashSaleItemMaxQty: number;
  prmFlashSaleItemSoldQty: number;
}

interface FlashSale {
  prmFlashSaleId: string;
  prmFlashSaleTitle: string;
  prmFlashSaleStartDate: string;
  prmFlashSaleEndDate: string;
  prmFlashSaleStatus: number;
  items: FlashSaleItem[];
}

const STATUS_LABELS: Record<number, string> = { 0: 'Draft', 1: 'Sắp diễn ra', 2: 'Đang diễn ra', 3: 'Đã kết thúc' };

/** Gia trung binh uoc tinh de tinh doanh so (placeholder) */
const ESTIMATED_PRICE = 350000;

const STATUS_TABS = [
  { label: 'Tất cả', value: null },
  { label: 'Đang diễn ra', value: 2 },
  { label: 'Sắp diễn ra', value: 1 },
  { label: 'Đã kết thúc', value: 3 },
];

/** Format ngay gio theo kieu "HH:mm DD-MM-YYYY" */
function formatSlot(dateStr: string): string {
  const d = new Date(dateStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${hh}:${mm} ${dd}-${mo}-${yy}`;
}

/**
 * Admin Flash Sale Manager — Shopee-style layout
 * Stats overview, status filter tabs, time slot table
 */
export default function FlashSalePage() {
  const { data, loading, refetch } = useAdminFetch<{ data: FlashSale[]; pagination: unknown }>({ url: '/admin/promotions/flash-sales' });
  const flashSales = data?.data || [];

  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', startDate: '', endDate: '', status: 0,
    items: [{ productId: '', discountPct: 10, maxQty: 100 }] as Array<{ productId: string; discountPct: number; maxQty: number }>,
  });

  // --- Filtered list ---
  const filteredSales = useMemo(() => {
    if (activeTab === null) return flashSales;
    return flashSales.filter(fs => fs.prmFlashSaleStatus === activeTab);
  }, [flashSales, activeTab]);

  // --- Aggregate stats ---
  const stats = useMemo(() => {
    const activeSales = flashSales.filter(fs => fs.prmFlashSaleStatus === 2 || fs.prmFlashSaleStatus === 3);
    const totalSold = activeSales.reduce((sum, fs) => sum + fs.items.reduce((s, i) => s + i.prmFlashSaleItemSoldQty, 0), 0);
    const revenue = totalSold * ESTIMATED_PRICE;
    return { revenue, orders: totalSold, buyers: totalSold, accessRate: 0 };
  }, [flashSales]);

  // --- Helpers ---
  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return String(n);
  };

  const isToggled = (id: string, status: number) => {
    if (id in toggleStates) return toggleStates[id];
    return status === 2;
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { productId: '', discountPct: 10, maxQty: 100 }] });
  };

  const updateItem = (index: number, key: string, value: string | number) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [key]: value };
    setForm({ ...form, items: newItems });
  };

  const removeItem = (index: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      items: form.items.filter(i => i.productId),
    };

    if (editId) {
      await api.put(`/admin/promotions/flash-sales/${editId}`, payload);
    } else {
      await api.post('/admin/promotions/flash-sales', payload);
    }
    setShowForm(false);
    setEditId(null);
    refetch();
  };

  const handleConfirmDelete = async () => {
    if (confirmState.id) {
      await api.delete(`/admin/promotions/flash-sales/${confirmState.id}`);
      refetch();
    }
    setConfirmState({ open: false, id: null });
  };

  const getTotalProgress = (fs: FlashSale) => {
    const totalMax = fs.items.reduce((sum, i) => sum + i.prmFlashSaleItemMaxQty, 0);
    const totalSold = fs.items.reduce((sum, i) => sum + i.prmFlashSaleItemSoldQty, 0);
    if (totalMax === 0) return 0;
    return Math.round((totalSold / totalMax) * 100);
  };

  const getStatusBadge = (status: number) => {
    const styles: Record<number, string> = {
      0: 'bg-gray-100 text-gray-600',
      1: 'bg-blue-100 text-blue-700',
      2: 'bg-green-100 text-green-700',
      3: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles[0]}`}>
        {STATUS_LABELS[status] || 'N/A'}
      </span>
    );
  };

  return (
    <AdminTableLayout
      title="Flash Sale"
      actions={
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm({ title: '', startDate: '', endDate: '', status: 0, items: [{ productId: '', discountPct: 10, maxQty: 100 }] });
          }}
          className="px-4 py-2 text-white text-sm rounded bg-[#ee4d2d] hover:bg-[#d73211]"
        >
          + Tạo Flash Sale
        </button>
      }
      loading={loading}
    >
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Doanh Số</p>
          <p className="text-2xl font-bold mt-1">₫{formatCurrency(stats.revenue)}</p>
          <p className="text-xs text-gray-400 mt-1">so với 7 ngày trước: 0%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Đơn hàng</p>
          <p className="text-2xl font-bold mt-1">{stats.orders}</p>
          <p className="text-xs text-gray-400 mt-1">so với 7 ngày trước: 0%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Người mua</p>
          <p className="text-2xl font-bold mt-1">{stats.buyers}</p>
          <p className="text-xs text-gray-400 mt-1">so với 7 ngày trước: 0%</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-500">Tỷ lệ truy cập</p>
          <p className="text-2xl font-bold mt-1">{stats.accessRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">so với 7 ngày trước: 0%</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex border-b mb-4">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flash Sale Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Khung giờ</th>
              <th className="text-left px-4 py-3 font-medium">Sản Phẩm</th>
              <th className="text-left px-4 py-3 font-medium">Lượt Người mua đặt</th>
              <th className="text-left px-4 py-3 font-medium">Lượt nhấp chuột/xem</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-center px-4 py-3 font-medium">Bật/Tắt</th>
              <th className="text-right px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSales.map(fs => {
              const totalSold = fs.items.reduce((s, i) => s + i.prmFlashSaleItemSoldQty, 0);
              const activeItems = fs.items.filter(i => i.prmFlashSaleItemSoldQty > 0).length;
              const enabled = isToggled(fs.prmFlashSaleId, fs.prmFlashSaleStatus);

              return (
                <tr key={fs.prmFlashSaleId} className="hover:bg-gray-50">
                  {/* Khung gio */}
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">
                      {formatSlot(fs.prmFlashSaleStartDate)} - {formatSlot(fs.prmFlashSaleEndDate)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{fs.prmFlashSaleTitle}</div>
                  </td>

                  {/* San pham */}
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div>Bật Flash Sale <span className="font-medium">{activeItems}</span> / Số sản phẩm tham gia <span className="font-medium">{fs.items?.length || 0}</span></div>
                  </td>

                  {/* Luot nguoi mua dat */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{totalSold}</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ee4d2d] rounded-full" style={{ width: `${getTotalProgress(fs)}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{getTotalProgress(fs)}%</span>
                    </div>
                  </td>

                  {/* Luot nhan chuot/xem (placeholder) */}
                  <td className="px-4 py-3 text-gray-400">--</td>

                  {/* Trang thai */}
                  <td className="px-4 py-3">{getStatusBadge(fs.prmFlashSaleStatus)}</td>

                  {/* Toggle switch */}
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <div
                        onClick={() => setToggleStates(prev => ({ ...prev, [fs.prmFlashSaleId]: !enabled }))}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  </td>

                  {/* Thao tac */}
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => {
                        setEditId(fs.prmFlashSaleId);
                        setForm({
                          title: fs.prmFlashSaleTitle,
                          startDate: fs.prmFlashSaleStartDate.slice(0, 16),
                          endDate: fs.prmFlashSaleEndDate.slice(0, 16),
                          status: fs.prmFlashSaleStatus,
                          items: fs.items.map(i => ({ productId: i.catProductId, discountPct: Number(i.prmFlashSaleItemDiscountPct), maxQty: i.prmFlashSaleItemMaxQty })),
                        });
                        setShowForm(true);
                      }}
                      className="text-[#ee4d2d] hover:underline text-xs"
                    >
                      Chi tiết
                    </button>
                    <button className="text-[#ee4d2d] hover:underline text-xs">Sao chép</button>
                    <button className="text-[#ee4d2d] hover:underline text-xs">Dữ liệu</button>
                    <button
                      onClick={() => setConfirmState({ open: true, id: fs.prmFlashSaleId })}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredSales.length === 0 && <EmptyTableRow colSpan={7} />}
          </tbody>
        </table>
      </div>

      {/* Form modal — giu nguyen logic */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold">{editId ? 'Sửa Flash Sale' : 'Tạo Flash Sale mới'}</h2>

            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề flash sale" className="w-full border rounded px-3 py-2 text-sm" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Bắt đầu</label>
                <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Kết thúc</label>
                <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>

            <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm">
              <option value={0}>Draft</option>
              <option value={1}>Scheduled</option>
              <option value={2}>Active</option>
            </select>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Sản phẩm ({form.items.length})</h3>
                <button onClick={addItem} className="text-xs px-2 py-1 border rounded">+ Thêm SP</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} placeholder="Product ID" className="flex-1 text-sm border rounded px-2 py-1 font-mono" />
                  <input type="number" value={item.discountPct} onChange={(e) => updateItem(i, 'discountPct', Number(e.target.value))} className="w-16 text-sm border rounded px-2 py-1" />
                  <span className="text-xs text-gray-400">%</span>
                  <input type="number" value={item.maxQty} onChange={(e) => updateItem(i, 'maxQty', Number(e.target.value))} className="w-16 text-sm border rounded px-2 py-1" />
                  <span className="text-xs text-gray-400">SL</span>
                  <button onClick={() => removeItem(i)} className="text-red-500 text-xs">X</button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-sm">Hủy</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-white rounded text-sm bg-[#ee4d2d] hover:bg-[#d73211]">Lưu</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmState.open}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa flash sale này? Hành động này không thể hoàn tác."
        variant="danger"
        confirmLabel="Xóa"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </AdminTableLayout>
  );
}
