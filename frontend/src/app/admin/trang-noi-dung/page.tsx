'use client';

import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface CmsPage {
  cmsPageId: string;
  title: string;
  slug: string;
  status: number;
  sort: number;
  createdDate: string;
}

/**
 * Admin CMS Pages — danh sach trang noi dung tinh
 */
export default function CmsPagesPage() {
  const { data, loading } = useAdminFetch<{ data: CmsPage[] }>({ url: '/admin/layout/pages' });
  const pages = data?.data || [];

  return (
    <AdminTableLayout
      title="Trang nội dung"
      actions={
        <a href="/admin/trang-noi-dung/tao" className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm inline-block">
          Thêm trang
        </a>
      }
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tiêu đề</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày tạo</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((p) => (
              <tr key={p.cmsPageId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`/admin/trang-noi-dung/${p.cmsPageId}`} className="text-[#ee4d2d] hover:underline">
                    {p.title}
                  </a>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.slug}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.status === 1 ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {p.createdDate ? new Date(p.createdDate).toLocaleDateString('vi-VN') : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <a href={`/admin/trang-noi-dung/${p.cmsPageId}`} className="text-[#ee4d2d] hover:underline text-xs">Sửa</a>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <EmptyTableRow colSpan={5} message="Chưa có trang nội dung nào" />
            )}
          </tbody>
        </table>
      </div>
    </AdminTableLayout>
  );
}
