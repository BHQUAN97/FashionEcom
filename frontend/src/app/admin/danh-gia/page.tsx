'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';

interface Review {
  salReviewId: string;
  catProductId: string;
  sysCustomerId: string;
  salReviewRating: number;
  salReviewContent: string | null;
  salReviewAdminReply: string | null;
  salReviewStatus: number;
  createdDate: string;
}

const STATUS_LABELS: Record<number, string> = { 0: 'Chờ duyệt', 1: 'Đã duyệt', 2: 'Từ chối', 3: 'Ẩn' };
const STATUS_BADGE_COLORS: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-700', 1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700', 3: 'bg-gray-100 text-gray-600',
};

/**
 * Admin Reviews — moderation queue, duyet/tu choi, reply
 */
export default function ReviewsPage() {
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [statusFilter, setStatusFilter] = useState(0);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data, loading, refetch } = useAdminFetch<{ data: Review[] }>({ url: `/admin/reviews?status=${statusFilter}` });
  const reviews = data?.data || [];

  const updateStatus = async (id: string, status: number) => {
    await api.put(`/admin/reviews/${id}/status`, { status });
    refetch();
  };

  const handleConfirmReject = async () => {
    if (confirmState.id) {
      await updateStatus(confirmState.id, 2);
    }
    setConfirmState({ open: false, id: null });
  };

  const sendReply = async (id: string) => {
    await api.post(`/admin/reviews/${id}/reply`, { content: replyContent });
    setReplyId(null);
    setReplyContent('');
    refetch();
  };

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <AdminTableLayout
      title="Quản lý Đánh giá"
      filters={
        <div className="flex gap-4 border-b">
          {[0, 1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-1 py-2 text-sm font-medium transition ${statusFilter === s ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      }
      loading={loading}
    >
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.salReviewId} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 font-mono">{renderStars(r.salReviewRating)}</span>
                <StatusBadge status={r.salReviewStatus} label={STATUS_LABELS[r.salReviewStatus]} colors={STATUS_BADGE_COLORS} />
              </div>
              <span className="text-xs text-gray-400">{new Date(r.createdDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <p className="text-gray-700 text-sm">{r.salReviewContent || '(Không có nội dung)'}</p>

            {r.salReviewAdminReply && (
              <div className="mt-2 pl-3 border-l-2 border-[#ee4d2d]/30">
                <p className="text-xs text-[#ee4d2d] font-medium">Official Reply</p>
                <p className="text-sm text-gray-600">{r.salReviewAdminReply}</p>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              {r.salReviewStatus === 0 && (
                <>
                  <button onClick={() => updateStatus(r.salReviewId, 1)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Duyệt</button>
                  <button onClick={() => setConfirmState({ open: true, id: r.salReviewId })} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Từ chối</button>
                </>
              )}
              {!r.salReviewAdminReply && (
                <button onClick={() => setReplyId(r.salReviewId)} className="px-3 py-1 bg-orange-100 text-[#ee4d2d] rounded text-xs hover:bg-orange-200">Phản hồi</button>
              )}
            </div>

            {replyId === r.salReviewId && (
              <div className="mt-3 flex gap-2">
                <input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nội dung phản hồi..."
                  className="flex-1 border rounded px-3 py-1.5 text-sm"
                />
                <button onClick={() => sendReply(r.salReviewId)} className="px-3 py-1.5 bg-[#ee4d2d] hover:bg-[#d73211] text-white rounded text-sm">Gửi</button>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-400">Không có đánh giá nào</div>
        )}
      </div>
      <ConfirmDialog
        open={confirmState.open}
        title="Xác nhận từ chối"
        message="Bạn có chắc chắn muốn từ chối đánh giá này? Hành động này không thể hoàn tác."
        variant="danger"
        confirmLabel="Từ chối"
        onConfirm={handleConfirmReject}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </AdminTableLayout>
  );
}
