'use client';

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
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

const MAX_HEIGHT = 300;

/** Wrapper gioi han chieu cao noi dung, hien nut "Xem them" neu tran */
function CollapsibleContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsCollapse(contentRef.current.scrollHeight > MAX_HEIGHT);
    }
  }, [children]);

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className={cn(
          'overflow-hidden transition-[max-height] duration-300',
          !expanded && needsCollapse && 'relative',
        )}
        style={{ maxHeight: expanded || !needsCollapse ? undefined : `${MAX_HEIGHT}px` }}
      >
        {children}
        {/* Gradient overlay khi thu gon */}
        {!expanded && needsCollapse && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {needsCollapse && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mx-auto mt-3 text-sm font-medium text-gray-600 hover:text-black transition"
        >
          {expanded ? (
            <>Thu gon <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Xem them <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}

/** Tabs: Mo ta, Danh gia, Chinh sach */
export function ProductTabs({ description, reviews, avgRating, reviewCount }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="mt-8 overflow-hidden !flex-col">
      <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0">
        <TabsTrigger
          value="description"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-active:border-black data-active:bg-transparent px-4 py-3 text-sm"
        >
          Mo ta
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-active:border-black data-active:bg-transparent px-4 py-3 text-sm"
        >
          Danh gia ({reviewCount})
        </TabsTrigger>
        <TabsTrigger
          value="policy"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-active:border-black data-active:bg-transparent px-4 py-3 text-sm"
        >
          Chinh sach
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-4">
        <CollapsibleContent>
          <div
            className="prose prose-sm max-w-none text-gray-700 break-words overflow-hidden"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
          />
        </CollapsibleContent>
      </TabsContent>

      <TabsContent value="reviews" className="mt-4">
        <CollapsibleContent>
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
        </CollapsibleContent>
      </TabsContent>

      <TabsContent value="policy" className="mt-4">
        <CollapsibleContent>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-1">Chính sách đổi trả</h4>
              <p>Đổi trả miễn phí trong 7 ngày kể từ ngày nhận hàng. Sản phẩm còn nguyên tem mác, chưa sử dụng.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Chính sách vận chuyển</h4>
              <p>Miễn phí giao hàng cho đơn từ 500.000đ. Giao hàng toàn quốc từ 2-5 ngày làm việc.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Chính sách bảo hành</h4>
              <p>Bảo hành 6 tháng cho các lỗi từ nhà sản xuất. Không bảo hành trường hợp sử dụng sai cách.</p>
            </div>
          </div>
        </CollapsibleContent>
      </TabsContent>
    </Tabs>
  );
}
