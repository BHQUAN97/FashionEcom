'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';

interface Banner {
  cmsBannerId: string;
  cmsBannerTitle: string;
  cmsBannerImageDesktop: string;
  cmsBannerImageMobile: string;
  cmsBannerStatus: number;
  cmsBannerSort: number;
  cmsBannerClickCount: number;
  cmsBannerViewCount: number;
  cmsBannerStartDate: string | null;
  cmsBannerEndDate: string | null;
  cmsBannerAbVariant: string | null;
}

const STATUS_LABELS: Record<number, string> = { 0: 'An', 1: 'Hien thi', 2: 'Scheduled' };
const STATUS_COLORS: Record<number, string> = { 0: 'bg-gray-100 text-gray-600', 1: 'bg-green-100 text-green-700', 2: 'bg-blue-100 text-blue-700' };

/**
 * Admin Banner Manager — CRUD, schedule, A/B test tracking
 */
export default function BannerManagerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', imageDesktop: '', imageMobile: '', alt: '', link: '', ctaText: '',
    startDate: '', endDate: '', status: 1, abVariant: '',
  });

  const loadBanners = async () => {
    try {
      const res = await api.get<Banner[]>('/admin/layout/banners');
      setBanners(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      imageDesktop: form.imageDesktop,
      imageMobile: form.imageMobile,
      alt: form.alt || undefined,
      link: form.link || undefined,
      ctaText: form.ctaText || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      status: form.status,
      abVariant: form.abVariant || undefined,
    };

    if (editId) {
      await api.put(`/admin/layout/banners/${editId}`, payload);
    } else {
      await api.post('/admin/layout/banners', payload);
    }
    setShowForm(false);
    setEditId(null);
    loadBanners();
  };

  const handleEdit = (banner: Banner) => {
    setEditId(banner.cmsBannerId);
    setForm({
      title: banner.cmsBannerTitle,
      imageDesktop: banner.cmsBannerImageDesktop,
      imageMobile: banner.cmsBannerImageMobile,
      alt: '', link: '', ctaText: '',
      startDate: banner.cmsBannerStartDate || '',
      endDate: banner.cmsBannerEndDate || '',
      status: banner.cmsBannerStatus,
      abVariant: banner.cmsBannerAbVariant || '',
    });
    setShowForm(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmState.id) {
      await api.delete(`/admin/layout/banners/${confirmState.id}`);
      loadBanners();
    }
    setConfirmState({ open: false, id: null });
  };

  const getCTR = (b: Banner) => {
    if (b.cmsBannerViewCount === 0) return '0%';
    return `${((b.cmsBannerClickCount / b.cmsBannerViewCount) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Banner Manager</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', imageDesktop: '', imageMobile: '', alt: '', link: '', ctaText: '', startDate: '', endDate: '', status: 1, abVariant: '' }); }} className="px-4 py-2 bg-black text-white text-sm rounded">
          + Tao banner
        </button>
      </div>

      {/* Banner list */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Banner</th>
              <th className="text-left px-4 py-3 font-medium">Trang thai</th>
              <th className="text-left px-4 py-3 font-medium">Clicks/Views</th>
              <th className="text-left px-4 py-3 font-medium">CTR</th>
              <th className="text-left px-4 py-3 font-medium">A/B</th>
              <th className="text-right px-4 py-3 font-medium">Hanh dong</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {banners.map(b => (
              <tr key={b.cmsBannerId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
                      {b.cmsBannerImageDesktop && <img src={b.cmsBannerImageDesktop} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="font-medium">{b.cmsBannerTitle}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[b.cmsBannerStatus]}`}>
                    {STATUS_LABELS[b.cmsBannerStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{b.cmsBannerClickCount} / {b.cmsBannerViewCount}</td>
                <td className="px-4 py-3 font-medium">{getCTR(b)}</td>
                <td className="px-4 py-3">{b.cmsBannerAbVariant || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(b)} className="text-blue-600 hover:underline text-xs mr-2">Sua</button>
                  <button onClick={() => setConfirmState({ open: true, id: b.cmsBannerId })} className="text-red-600 hover:underline text-xs">Xoa</button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chua co banner nao</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4">
            <h2 className="font-bold">{editId ? 'Sua banner' : 'Tao banner moi'}</h2>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ten banner" className="w-full border rounded px-3 py-2 text-sm" />
            <input value={form.imageDesktop} onChange={(e) => setForm({ ...form, imageDesktop: e.target.value })} placeholder="URL anh desktop" className="w-full border rounded px-3 py-2 text-sm" />
            <input value={form.imageMobile} onChange={(e) => setForm({ ...form, imageMobile: e.target.value })} placeholder="URL anh mobile" className="w-full border rounded px-3 py-2 text-sm" />
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Link khi click" className="w-full border rounded px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            </div>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm">
              <option value={0}>An</option>
              <option value={1}>Hien thi</option>
              <option value={2}>Scheduled</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-sm">Huy</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-black text-white rounded text-sm">Luu</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmState.open}
        title="Xac nhan xoa"
        message="Ban co chac chan muon xoa banner nay? Hanh dong nay khong the hoan tac."
        variant="danger"
        confirmLabel="Xoa"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </div>
  );
}
