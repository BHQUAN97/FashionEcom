'use client';

import { useState, useMemo } from 'react';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface InventoryItem {
  invInventoryLevelId: string;
  catProductVariantId: string;
  invWarehouseId: string;
  invInventoryLevelAvailable: number;
  invInventoryLevelLocked: number;
  // Variant info (tu join)
  productName?: string;
  catProductVariantSku?: string;
  catProductVariantColor?: string;
  catProductVariantSize?: string;
  catProductVariantWeight?: number;
  color?: { catColorName: string; catColorHex: string } | null;
  size?: { catSizeValue: string } | null;
}

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

interface Warehouse {
  invWarehouseId: string;
  invWarehouseCode: string;
  invWarehouseName: string;
}

interface Color {
  catColorId: string;
  catColorName: string;
  catColorHex: string;
}

/**
 * Admin Inventory — ton kho da kho, filter theo warehouse + mau sac + size
 */
export default function InventoryPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const { data: whData } = useAdminFetch<Warehouse[] | { data: Warehouse[] }>({ url: '/admin/inventory/warehouses' });
  const warehouses = Array.isArray(whData) ? whData : (whData as { data: Warehouse[] } | null)?.data || [];

  const { data: colorsData } = useAdminFetch<{ data: Color[] }>({ url: '/admin/attributes/colors' });
  const colors = colorsData?.data || [];

  // Build query params
  const qp = new URLSearchParams();
  if (selectedWarehouse) qp.set('warehouseId', selectedWarehouse);
  if (selectedColor) qp.set('colorId', selectedColor);
  const qs = qp.toString();

  const { data: itemData, loading } = useAdminFetch<{ data: InventoryItem[] }>({
    url: `/admin/inventory${qs ? `?${qs}` : ''}`,
  });
  const allItems = itemData?.data || [];

  // Filter theo trang thai ton kho
  const items = useMemo(() => {
    if (stockFilter === 'all') return allItems;
    return allItems.filter((item) => {
      const available = Number(item.invInventoryLevelAvailable);
      if (stockFilter === 'out_of_stock') return available === 0;
      if (stockFilter === 'low_stock') return available > 0 && available <= 10;
      if (stockFilter === 'in_stock') return available > 10;
      return true;
    });
  }, [allItems, stockFilter]);

  const stockTabs: { key: StockFilter; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'in_stock', label: 'Còn hàng' },
    { key: 'low_stock', label: 'Sắp hết (≤ 10)' },
    { key: 'out_of_stock', label: 'Hết hàng' },
  ];

  return (
    <AdminTableLayout
      title="Ton kho"
      actions={
        <>
          <a href="/admin/ton-kho/dieu-chuyen" className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm">
            Dieu chuyen kho
          </a>
          <a href="/admin/ton-kho/nhap-kho" className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm">
            Nhap kho
          </a>
        </>
      }
      filters={
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tat ca kho</option>
            {warehouses.map((w: Warehouse) => (
              <option key={w.invWarehouseId} value={w.invWarehouseId}>
                {w.invWarehouseCode} — {w.invWarehouseName}
              </option>
            ))}
          </select>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tat ca mau</option>
            {colors.map((c) => (
              <option key={c.catColorId} value={c.catColorId}>{c.catColorName}</option>
            ))}
          </select>
        </div>
      }
      loading={loading}
    >
      {/* Stock status filter tabs */}
      <div className="flex border-b mb-4">
        {stockTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStockFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium -mb-px transition-colors ${
              stockFilter === tab.key
                ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tên SP</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Mau</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Size</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Cân nặng (g)</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Kha dung</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Tam giu</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Tong</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.invInventoryLevelId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {item.productName || '-'}
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {item.catProductVariantSku || item.catProductVariantId.substring(0, 12)}
                </td>
                <td className="px-4 py-3">
                  {item.color ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.color.catColorHex }} />
                      {item.color.catColorName}
                    </span>
                  ) : (item.catProductVariantColor || '-')}
                </td>
                <td className="px-4 py-3">
                  {item.size?.catSizeValue || item.catProductVariantSize || '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.catProductVariantWeight != null ? Number(item.catProductVariantWeight) : '-'}
                </td>
                <td className="px-4 py-3 text-right font-medium">{Number(item.invInventoryLevelAvailable)}</td>
                <td className="px-4 py-3 text-right text-orange-600">{Number(item.invInventoryLevelLocked)}</td>
                <td className="px-4 py-3 text-right font-bold">
                  {Number(item.invInventoryLevelAvailable) + Number(item.invInventoryLevelLocked)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <EmptyTableRow colSpan={8} message="Khong co du lieu ton kho" />
            )}
          </tbody>
        </table>
      </div>
    </AdminTableLayout>
  );
}
