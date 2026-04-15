'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';

interface CampaignVariant {
  prmSaleCampaignVariantId: string;
  catProductVariantId: string;
  prmSaleCvDiscountType: number | null;
  prmSaleCvDiscountValue: number | null;
  prmSaleCvSalePrice: number | null;
  prmSaleCvStatus: number;
  variant?: {
    catProductVariantSku: string;
    catProductVariantPrice: number;
    color?: { catColorName: string; catColorHex: string } | null;
    size?: { catSizeValue: string } | null;
  };
}

interface Campaign {
  prmSaleCampaignId: string;
  prmSaleCampaignName: string;
  prmSaleCampaignDesc: string | null;
  prmSaleCampaignStartDate: string;
  prmSaleCampaignEndDate: string;
  prmSaleCampaignDiscountType: number;
  prmSaleCampaignDiscountValue: number;
  prmSaleCampaignPriority: number;
  prmSaleCampaignStatus: number;
  variantCount?: number;
  variants?: CampaignVariant[];
}

interface ProductVariant {
  catProductVariantId: string;
  catProductVariantSku: string;
  catProductVariantPrice: number;
  catProductId: string;
  color?: { catColorName: string; catColorHex: string } | null;
  size?: { catSizeValue: string } | null;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Draft', 1: 'Scheduled', 2: 'Active', 3: 'Paused', 4: 'Ended',
};
const STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-red-100 text-red-700',
};

/**
 * Admin Sale Campaign — CRUD chuong trinh sale, chon variant, set gia
 */
export default function SaleCampaignPage() {
  const { data, loading, refetch } = useAdminFetch<{ data: Campaign[] }>({
    url: '/admin/promotions/campaigns',
  });
  const campaigns = data?.data || [];

  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [, setEditDetail] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '', desc: '', startDate: '', endDate: '',
    discountType: 1, discountValue: 0, priority: 0, status: 0,
  });

  // Variant selection
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ProductVariant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<
    { variantId: string; sku: string; price: number; color?: string; colorHex?: string; size?: string;
      discountType?: number; discountValue?: number; salePrice?: number }[]
  >([]);

  // Load campaign detail khi edit
  useEffect(() => {
    if (editId) {
      api.get<Campaign>(`/admin/promotions/campaigns/${editId}`)
        .then((res) => {
          const c = res.data;
          setEditDetail(c);
          setForm({
            name: c.prmSaleCampaignName,
            desc: c.prmSaleCampaignDesc || '',
            startDate: c.prmSaleCampaignStartDate?.substring(0, 16) || '',
            endDate: c.prmSaleCampaignEndDate?.substring(0, 16) || '',
            discountType: c.prmSaleCampaignDiscountType,
            discountValue: Number(c.prmSaleCampaignDiscountValue),
            priority: c.prmSaleCampaignPriority,
            status: c.prmSaleCampaignStatus,
          });
          setSelectedVariants(
            (c.variants || []).map((cv) => ({
              variantId: cv.catProductVariantId,
              sku: cv.variant?.catProductVariantSku || '',
              price: Number(cv.variant?.catProductVariantPrice || 0),
              color: cv.variant?.color?.catColorName,
              colorHex: cv.variant?.color?.catColorHex,
              size: cv.variant?.size?.catSizeValue,
              discountType: cv.prmSaleCvDiscountType ?? undefined,
              discountValue: cv.prmSaleCvDiscountValue != null ? Number(cv.prmSaleCvDiscountValue) : undefined,
              salePrice: cv.prmSaleCvSalePrice != null ? Number(cv.prmSaleCvSalePrice) : undefined,
            })),
          );
        })
        .catch(() => setError('Khong the tai chi tiet campaign'));
    }
  }, [editId]);

  // Tim san pham de them variant
  const handleSearch = async () => {
    if (!productSearch.trim()) return;
    try {
      const res = await api.get<{ catProductId: string; variants: ProductVariant[] }[]>(
        `/admin/products?search=${encodeURIComponent(productSearch)}&limit=5`,
      );
      // Flatten variants tu tat ca products
      const variants: ProductVariant[] = [];
      for (const p of (Array.isArray(res.data) ? res.data : [])) {
        // Fetch variants cho tung product
        const vRes = await api.get<ProductVariant[]>(`/admin/products/${p.catProductId}/variants`);
        variants.push(...vRes.data);
      }
      setSearchResults(variants);
    } catch {
      setSearchResults([]);
    }
  };

  // Them variant vao danh sach
  const addVariant = (v: ProductVariant) => {
    if (selectedVariants.some((sv) => sv.variantId === v.catProductVariantId)) return;
    setSelectedVariants((prev) => [
      ...prev,
      {
        variantId: v.catProductVariantId,
        sku: v.catProductVariantSku,
        price: Number(v.catProductVariantPrice),
        color: v.color?.catColorName,
        colorHex: v.color?.catColorHex,
        size: v.size?.catSizeValue,
      },
    ]);
  };

  const removeVariant = (variantId: string) => {
    setSelectedVariants((prev) => prev.filter((v) => v.variantId !== variantId));
  };

  // Tinh gia sale preview
  const calcPreviewPrice = (originalPrice: number, item: typeof selectedVariants[0]) => {
    if (item.salePrice != null && item.salePrice > 0) return item.salePrice;
    const type = item.discountType ?? form.discountType;
    const value = item.discountValue ?? form.discountValue;
    if (type === 1 && value > 0) return Math.round(originalPrice * (1 - value / 100));
    if (type === 2 && value > 0) return Math.max(0, originalPrice - value);
    return originalPrice;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      setError('Vui long dien ten, ngay bat dau va ket thuc');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        ...form,
        variants: selectedVariants.map((v) => ({
          variantId: v.variantId,
          discountType: v.discountType,
          discountValue: v.discountValue,
          salePrice: v.salePrice,
        })),
      };

      if (editId) {
        await api.put(`/admin/promotions/campaigns/${editId}`, body);
        setMessage('Cap nhat thanh cong');
      } else {
        await api.post('/admin/promotions/campaigns', body);
        setMessage('Tao chuong trinh sale thanh cong');
      }
      setShowForm(false);
      setEditId(null);
      setEditDetail(null);
      setSelectedVariants([]);
      refetch();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Loi luu campaign');
    } finally {
      setSaving(false);
    }
  };

  // Xoa campaign
  const handleDelete = async () => {
    if (!confirmState.id) return;
    try {
      await api.delete(`/admin/promotions/campaigns/${confirmState.id}`);
      refetch();
    } catch {
      setError('Loi xoa campaign');
    }
    setConfirmState({ open: false, id: null });
  };

  // Reset form
  const openCreate = () => {
    setEditId(null);
    setEditDetail(null);
    setForm({ name: '', desc: '', startDate: '', endDate: '', discountType: 1, discountValue: 0, priority: 0, status: 0 });
    setSelectedVariants([]);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setShowForm(true);
  };

  // ==================== RENDER ====================

  // Form mode
  if (showForm) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{editId ? 'Sua' : 'Tao'} chuong trinh sale</h1>
          <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-sm text-gray-500 hover:underline">
            Quay lai
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Thong tin campaign */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="font-medium">Thong tin chuong trinh</h2>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ten chuong trinh *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="VD: Sale He 2026" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mo ta</label>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Bat dau *</label>
                  <input type="datetime-local" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Ket thuc *</label>
                  <input type="datetime-local" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Loai giam mac dinh</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value={1}>Phan tram (%)</option>
                    <option value={2}>So tien co dinh</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Gia tri giam mac dinh</label>
                  <input type="number" value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" min={0} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Do uu tien</label>
                  <input type="number" value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" min={0} max={10} />
                </div>
              </div>
            </div>

            {/* Tim va them variant */}
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="font-medium">Chon san pham / variant</h2>
              <div className="flex gap-2">
                <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Tim theo ten hoac ma SP..." />
                <button onClick={handleSearch} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Tim</button>
              </div>

              {/* Ket qua tim kiem */}
              {searchResults.length > 0 && (
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {searchResults.map((v) => (
                    <button key={v.catProductVariantId} onClick={() => addVariant(v)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between">
                      <span>
                        <span className="font-mono text-xs">{v.catProductVariantSku}</span>
                        {v.color && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: v.color.catColorHex }} />
                            {v.color.catColorName}
                          </span>
                        )}
                        {v.size && <span className="ml-1 text-gray-500">{v.size.catSizeValue}</span>}
                      </span>
                      <span className="text-gray-500">{Number(v.catProductVariantPrice).toLocaleString()}d</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bang variant da chon — edit gia per variant */}
            {selectedVariants.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-medium mb-4">Variant trong campaign ({selectedVariants.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">SKU</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Mau/Size</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">Gia goc</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">Override %/tien</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">Gia sale fix</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">Preview</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedVariants.map((v, i) => {
                        const preview = calcPreviewPrice(v.price, v);
                        const discount = v.price > 0 ? Math.round((1 - preview / v.price) * 100) : 0;
                        return (
                          <tr key={v.variantId} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono text-xs">{v.sku}</td>
                            <td className="px-3 py-2">
                              <span className="flex items-center gap-1">
                                {v.colorHex && <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: v.colorHex }} />}
                                {v.color || ''} {v.size || ''}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right text-gray-500">{v.price.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right">
                              <input type="number" placeholder="Default"
                                value={v.discountValue ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : undefined;
                                  setSelectedVariants((prev) => prev.map((sv, j) =>
                                    j === i ? { ...sv, discountValue: val, discountType: val != null ? form.discountType : undefined } : sv));
                                }}
                                className="w-20 border rounded px-2 py-1 text-right text-xs" />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <input type="number" placeholder="-"
                                value={v.salePrice ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : undefined;
                                  setSelectedVariants((prev) => prev.map((sv, j) =>
                                    j === i ? { ...sv, salePrice: val } : sv));
                                }}
                                className="w-24 border rounded px-2 py-1 text-right text-xs" />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className="font-medium text-red-600">{preview.toLocaleString()}d</span>
                              {discount > 0 && <span className="text-xs text-gray-400 ml-1">-{discount}%</span>}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={() => removeVariant(v.variantId)} className="text-xs text-red-500 hover:underline">Xoa</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="font-medium">Trang thai</h2>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value={0}>Draft</option>
                <option value={1}>Scheduled</option>
                <option value={2}>Active</option>
                <option value={3}>Paused</option>
                <option value={4}>Ended</option>
              </select>
            </div>

            <button onClick={handleSubmit} disabled={saving}
              className="w-full px-4 py-3 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm font-medium">
              {saving ? 'Dang luu...' : editId ? 'Cap nhat' : 'Tao chuong trinh'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List mode
  return (
    <AdminTableLayout
      title="Chuong trinh Sale"
      actions={
        <button onClick={openCreate} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm">
          + Tao chuong trinh
        </button>
      }
      loading={loading}
    >
      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ten chuong trinh</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Thoi gian</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Giam</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">SP</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">TT</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.length === 0 ? (
              <EmptyTableRow colSpan={6} message="Chua co chuong trinh sale nao" />
            ) : (
              campaigns.map((c) => (
                <tr key={c.prmSaleCampaignId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.prmSaleCampaignName}</div>
                    {c.prmSaleCampaignDesc && (
                      <div className="text-xs text-gray-400 truncate max-w-xs">{c.prmSaleCampaignDesc}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <div>{new Date(c.prmSaleCampaignStartDate).toLocaleString('vi-VN')}</div>
                    <div>{new Date(c.prmSaleCampaignEndDate).toLocaleString('vi-VN')}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {c.prmSaleCampaignDiscountType === 1
                      ? `${Number(c.prmSaleCampaignDiscountValue)}%`
                      : `${Number(c.prmSaleCampaignDiscountValue).toLocaleString()}d`}
                  </td>
                  <td className="px-4 py-3 text-center">{c.variantCount || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.prmSaleCampaignStatus] || ''}`}>
                      {STATUS_LABELS[c.prmSaleCampaignStatus] || c.prmSaleCampaignStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button onClick={() => openEdit(c.prmSaleCampaignId)} className="text-xs text-[#ee4d2d] hover:underline">Sua</button>
                    <button onClick={() => setConfirmState({ open: true, id: c.prmSaleCampaignId })}
                      className="text-xs text-red-500 hover:underline">Xoa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title="Xoa chuong trinh sale?"
        message="Tat ca variant trong chuong trinh se bi xoa. Thao tac nay khong the hoan tac."
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </AdminTableLayout>
  );
}
