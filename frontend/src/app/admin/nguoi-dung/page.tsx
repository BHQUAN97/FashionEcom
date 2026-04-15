'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface SysUser {
  sysUserId: string;
  sysUserName: string;
  sysUserEmail: string;
  sysUserRole: number;
  sysUserStatus: number;
  createdDate: string;
}

const ROLE_LABELS: Record<number, string> = {
  1: 'Super Admin', 2: 'Admin', 3: 'Quản lý',
  4: 'Nhân viên CSKH', 5: 'Biên tập viên', 6: 'Thủ kho',
};

/**
 * Admin Users — quan ly nguoi dung he thong + tao user moi
 */
export default function UsersPage() {
  const { data, loading, refetch } = useAdminFetch<{ data: SysUser[] }>({ url: '/admin/users' });
  const users = data?.data || [];

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 4 });

  const handleCreate = async () => {
    if (!form.email || !form.password) {
      setFormError('Email va mat khau la bat buoc');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Mat khau phai it nhat 8 ky tu');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/admin/users', form);
      setShowForm(false);
      setForm({ email: '', password: '', name: '', role: 4 });
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Loi tao user');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminTableLayout
      title="Người dùng hệ thống"
      actions={
        <button
          onClick={() => { setShowForm(true); setFormError(''); }}
          className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm"
        >
          Thêm người dùng
        </button>
      }
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tên</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Vai trò</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.sysUserId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.sysUserName}</td>
                <td className="px-4 py-3 text-gray-500">{u.sysUserEmail}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {ROLE_LABELS[u.sysUserRole] || `Role ${u.sysUserRole}`}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.sysUserStatus === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.sysUserStatus === 1 ? 'Hoạt động' : 'Khóa'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <EmptyTableRow colSpan={5} message="Chưa có người dùng nào" />
            )}
          </tbody>
        </table>
      </div>

      {/* Modal tao user moi */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">Thêm người dùng mới</h2>

            {formError && (
              <div className="p-2 bg-red-50 text-red-700 rounded text-sm">{formError}</div>
            )}

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Họ tên</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nguyen Van A" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="user@fashionecom.vn" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Mật khẩu * (tối thiểu 8 ký tự)</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Vai trò *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {Object.entries(ROLE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
              <button onClick={handleCreate} disabled={formLoading} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm">
                {formLoading ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminTableLayout>
  );
}
