'use client';

import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface Customer {
  saleCustomerId: string;
  saleCustomerName: string;
  saleCustomerEmail: string;
  saleCustomerPhone: string;
  saleCustomerTotalOrders: number;
  saleCustomerTotalSpent: number;
  createdDate: string;
}

/**
 * Admin Customers — danh sach khach hang
 */
export default function CustomersPage() {
  const { data, loading } = useAdminFetch<{ data: Customer[] }>({ url: '/admin/customers' });
  const customers = data?.data || [];

  return (
    <AdminTableLayout
      title="Khách hàng"
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tên khách hàng</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">SĐT</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Số đơn</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Tổng chi tiêu</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((c) => (
              <tr key={c.saleCustomerId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`/admin/khach-hang/${c.saleCustomerId}`} className="text-[#ee4d2d] hover:underline">
                    {c.saleCustomerName}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.saleCustomerEmail}</td>
                <td className="px-4 py-3 text-gray-500">{c.saleCustomerPhone}</td>
                <td className="px-4 py-3 text-right">{c.saleCustomerTotalOrders}</td>
                <td className="px-4 py-3 text-right font-medium">{Number(c.saleCustomerTotalSpent).toLocaleString('vi-VN')} VND</td>
                <td className="px-4 py-3 text-gray-500">{new Date(c.createdDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <EmptyTableRow colSpan={6} message="Chưa có khách hàng nào" />
            )}
          </tbody>
        </table>
      </div>
    </AdminTableLayout>
  );
}
