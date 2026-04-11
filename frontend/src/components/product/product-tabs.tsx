'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/product';
import { formatDate } from '@/lib/utils/format';

interface ProductTabsProps {
  description: string;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
}

/** Tabs: Mo ta, Danh gia, Chinh sach */
export function ProductTabs({ description, reviews, avgRating, reviewCount }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="mt-8">
      <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-3 text-sm"
        >
          Mo ta
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-3 text-sm"
        >
          Danh gia ({reviewCount})
        </TabsTrigger>
        <TabsTrigger
          value="policy"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-4 py-3 text-sm"
        >
          Chinh sach
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-4">
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
        />
      </TabsContent>

      <TabsContent value="reviews" className="mt-4">
        {/* Summary */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
          <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn('w-4 h-4', s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{reviewCount} danh gia</p>
          </div>
        </div>

        {/* Review list */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="pb-4 border-b last:border-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{review.customer_name}</span>
                {review.is_verified && (
                  <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Da mua</span>
                )}
              </div>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn('w-3 h-3', s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 mt-1.5">{review.content}</p>
              <span className="text-xs text-gray-400 mt-1 block">{formatDate(review.created_at)}</span>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="policy" className="mt-4">
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-1">Chinh sach doi tra</h4>
            <p>Doi tra mien phi trong 7 ngay ke tu ngay nhan hang. San pham con nguyen tem mac, chua su dung.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Chinh sach van chuyen</h4>
            <p>Mien phi giao hang cho don tu 500.000d. Giao hang toan quoc tu 2-5 ngay lam viec.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Chinh sach bao hanh</h4>
            <p>Bao hanh 6 thang cho cac loi tu nha san xuat. Khong bao hanh truong hop su dung sai cach.</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
