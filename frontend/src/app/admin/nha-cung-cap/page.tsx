'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface Supplier {
  invSupplierId: string;
  invSupplierCode: string;
  invSupplierName: string;
  invSupplierPhone: string | null;
  invSupplierEmail: string | null;
  invSupplierStatus: number;
}

const STATUS_LABELS: Record<number, string> = { 0: 'Ngung', 1: 'Dang hop tac' };

/**
 * Admin Suppliers — CRUD nha cung cap
 */
export default function SuppliersPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', phone: '', email: '', address: '' });

  const { data, loading, refetch } = useAdminFetch<{ data: Supplier[] }>({ url: '/admin/suppliers' });
  const suppliers = data?.data || [];

  const handleCreate = async () => {
    try {
      await api.post('/admin/suppliers', form);
      setShowForm(false);
      setForm({ code: '', name: '', phone: '', email: '', address: '' });
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Co loi xay ra';
      alert(message);
    }
  };

  return (
    <AdminTableLayout
      title="Nha cung cap"
      actions={
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          {showForm ? 'Dong' : 'Them NCC'}
        </button>
      }
      loading={loading}
    >
      {showForm && (
        <div className="bg-white border rounded-lg p-6 grid grid-cols-2 gap-4">
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Ma NCC (VD: NCC-001)" className="border rounded px-3 py-2 text-sm" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ten NCC" className="border rounded px-3 py-2 text-sm" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="SDT" className="border rounded px-3 py-2 text-sm" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="border rounded px-3 py-2 text-sm" />
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Dia chi" className="border rounded px-3 py-2 text-sm col-span-2" />
          <button onClick={handleCreate} className="bg-green-600 text-white rounded px-4 py-2 text-sm hover:bg-green-700">Tao NCC</button>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ma</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ten NCC</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">SDT</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Trang thai</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {suppliers.map((s) => (
              <tr key={s.invSupplierId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{s.invSupplierCode}</td>
                <td className="px-4 py-3 font-medium">{s.invSupplierName}</td>
                <td className="px-4 py-3 text-gray-500">{s.invSupplierPhone || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{s.invSupplierEmail || '-'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.invSupplierStatus} label={STATUS_LABELS[s.invSupplierStatus]} />
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <EmptyTableRow colSpan={5} message="Chua co NCC nao" />
            )}
          </tbody>
        </table>
      </div>
    </AdminTableLayout>
  );
}
