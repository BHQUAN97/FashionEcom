'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

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

const STATUS_LABELS: Record<number, string> = { 0: 'Cho duyet', 1: 'Da duyet', 2: 'Tu choi', 3: 'An' };
const STATUS_COLORS: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-700', 1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700', 3: 'bg-gray-100 text-gray-600',
};

/**
 * Admin Reviews — moderation queue, duyet/tu choi, reply
 */
export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(0);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Review[] }>(`/admin/reviews?status=${statusFilter}`);
      setReviews(res.data.data || (res.data as unknown as Review[]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, [statusFilter]);

  const updateStatus = async (id: string, status: number) => {
    await api.put(`/admin/reviews/${id}/status`, { status });
    loadReviews();
  };

  const sendReply = async (id: string) => {
    await api.post(`/admin/reviews/${id}/reply`, { content: replyContent });
    setReplyId(null);
    setReplyContent('');
    loadReviews();
  };

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quan ly Danh gia</h1>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.salReviewId} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 font-mono">{renderStars(r.salReviewRating)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[r.salReviewStatus]}`}>
                  {STATUS_LABELS[r.salReviewStatus]}
                </span>
              </div>
              <span className="text-xs text-gray-400">{new Date(r.createdDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <p className="text-gray-700 text-sm">{r.salReviewContent || '(Khong co noi dung)'}</p>

            {r.salReviewAdminReply && (
              <div className="mt-2 pl-3 border-l-2 border-blue-300">
                <p className="text-xs text-blue-600 font-medium">Official Reply</p>
                <p className="text-sm text-gray-600">{r.salReviewAdminReply}</p>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              {r.salReviewStatus === 0 && (
                <>
                  <button onClick={() => updateStatus(r.salReviewId, 1)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Duyet</button>
                  <button onClick={() => updateStatus(r.salReviewId, 2)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Tu choi</button>
                </>
              )}
              {!r.salReviewAdminReply && (
                <button onClick={() => setReplyId(r.salReviewId)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">Phan hoi</button>
              )}
            </div>

            {replyId === r.salReviewId && (
              <div className="mt-3 flex gap-2">
                <input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Noi dung phan hoi..."
                  className="flex-1 border rounded px-3 py-1.5 text-sm"
                />
                <button onClick={() => sendReply(r.salReviewId)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Gui</button>
              </div>
            )}
          </div>
        ))}
        {!loading && reviews.length === 0 && (
          <div className="text-center py-8 text-gray-400">Khong co danh gia nao</div>
        )}
      </div>
    </div>
  );
}
