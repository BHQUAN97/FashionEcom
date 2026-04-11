'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface Supplier {
  invSupplierId: string;
  invSupplierCode: string;
  invSupplierName: string;
  invSupplierPhone: string | null;
  invSupplierEmail: string | null;
  invSupplierStatus: number;
}

/**
 * Admin Suppliers — CRUD nha cung cap
 */
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    api.get<{ data: Supplier[] }>('/admin/suppliers')
      .then((res) => setSuppliers(res.data.data || (res.data as unknown as Supplier[])))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/admin/suppliers', form);
      setShowForm(false);
      setForm({ code: '', name: '', phone: '', email: '', address: '' });
      // Reload
      const res = await api.get<{ data: Supplier[] }>('/admin/suppliers');
      setSuppliers(res.data.data || (res.data as unknown as Supplier[]));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Dang tai...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nha cung cap</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          {showForm ? 'Dong' : 'Them NCC'}
        </button>
      </div>

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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.invSupplierStatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.invSupplierStatus === 1 ? 'Dang hop tac' : 'Ngung'}
                  </span>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Chua co NCC nao</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
