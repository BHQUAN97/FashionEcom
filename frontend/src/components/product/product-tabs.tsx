'use client';

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { sanitizeHtml } from '@/lib/utils/sanitize';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/product';
import { formatDate } from '@/lib/utils/format';

/** Thuoc tinh chi tiet san pham tu backend */
export interface ProductAttributes {
  origin: string | null;
  material: string | null;
  packagingType: string | null;
  condition: string | null;
  weight: number;
  length: number;
  width: number;
  height: number;
}

interface ProductTabsProps {
  description: string;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  /** HTML content chinh sach doi tra — fallback default neu khong truyen */
  returnPolicy?: string;
  /** HTML content chinh sach bao mat — fallback default neu khong truyen */
  privacyPolicy?: string;
  /** Danh sach cau hoi thuong gap — fallback default neu khong truyen */
  faqItems?: { question: string; answer: string }[];
  /** Thuoc tinh chi tiet san pham (origin, material, weight...) */
  attributes?: ProductAttributes;
}

const DEFAULT_RETURN_POLICY = `
<h4>Chính sách đổi trả</h4>
<p>Đổi trả miễn phí trong 7 ngày kể từ ngày nhận hàng. Sản phẩm còn nguyên tem mác, chưa sử dụng.</p>
<h4>Chính sách vận chuyển</h4>
<p>Miễn phí giao hàng cho đơn từ 500.000đ. Giao hàng toàn quốc từ 2-5 ngày làm việc.</p>
<h4>Chính sách bảo hành</h4>
<p>Bảo hành 6 tháng cho các lỗi từ nhà sản xuất.</p>
`;

const DEFAULT_PRIVACY_POLICY = `
<p>Chúng tôi cam kết bảo mật thông tin cá nhân của khách hàng. Thông tin của bạn chỉ được sử dụng cho mục đích xử lý đơn hàng và cải thiện dịch vụ.</p>
<p>Chúng tôi không chia sẻ thông tin cá nhân của bạn cho bên thứ ba ngoại trừ các đối tác vận chuyển để giao hàng.</p>
`;

const DEFAULT_FAQ_ITEMS: { question: string; answer: string }[] = [
  { question: 'Làm thế nào để tôi đặt hàng online?', answer: 'Truy cập website, chọn sản phẩm, thêm vào giỏ hàng và thanh toán. Hoặc liên hệ hotline.' },
  { question: 'Đặt hàng trên web tôi muốn đổi mẫu thì làm thế nào?', answer: 'Liên hệ hotline hoặc chat trong vòng 24h sau khi đặt hàng.' },
  { question: 'Tôi có được xem hàng và thử không?', answer: 'Có, bạn được kiểm tra và thử hàng khi nhận hàng COD.' },
  { question: 'Tôi muốn đổi màu (size) thì cần làm gì?', answer: 'Liên hệ hotline trong vòng 7 ngày, sản phẩm còn nguyên tem mác.' },
  { question: 'Tôi mua hàng rồi, không vừa ý có thể đổi lại hay không?', answer: 'Có thể đổi trả trong 7 ngày kể từ ngày nhận hàng.' },
  { question: 'Tôi muốn miễn phí ship', answer: 'Đơn hàng từ 500.000đ được miễn phí giao hàng toàn quốc.' },
];

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
            <>Thu gọn <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Xem thêm <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}

/** Accordion cho tab FAQ — moi item expand/collapse doc lap */
function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y">
      {items.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex items-center justify-between w-full py-3 text-left"
          >
            <span className="font-semibold text-sm pr-4">{item.question}</span>
            {openIndex === index ? (
              <ChevronUp className="w-4 h-4 flex-shrink-0 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-500" />
            )}
          </button>
          {openIndex === index && (
            <p className="text-sm text-gray-700 pb-3">{item.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}

const TAB_TRIGGER_CLASS = 'rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-active:border-black data-active:bg-transparent px-4 py-3 text-sm whitespace-nowrap';

/** Tabs: Mo ta, Danh gia, Chinh sach doi tra, Chinh sach bao mat, FAQ */
export function ProductTabs({
  description,
  reviews,
  avgRating,
  reviewCount,
  returnPolicy,
  privacyPolicy,
  faqItems,
  attributes,
}: ProductTabsProps) {
  const returnHtml = returnPolicy || DEFAULT_RETURN_POLICY;
  const privacyHtml = privacyPolicy || DEFAULT_PRIVACY_POLICY;
  const faqs = faqItems || DEFAULT_FAQ_ITEMS;

  // Build danh sach thuoc tinh chi tiet — chi hien row co du lieu
  const attributeRows: { label: string; value: string }[] = [];
  if (attributes) {
    if (attributes.origin) attributeRows.push({ label: 'Xuất xứ', value: attributes.origin });
    if (attributes.material) attributeRows.push({ label: 'Chất liệu', value: attributes.material });
    if (attributes.packagingType) attributeRows.push({ label: 'Kiểu đóng gói', value: attributes.packagingType });
    if (attributes.condition) attributeRows.push({ label: 'Tình trạng', value: attributes.condition });
    if (attributes.weight > 0) attributeRows.push({ label: 'Cân nặng', value: `${attributes.weight}g` });
    if (attributes.length > 0 && attributes.width > 0 && attributes.height > 0) {
      attributeRows.push({ label: 'Kích thước', value: `${attributes.length} x ${attributes.width} x ${attributes.height} cm` });
    }
  }
  const hasAttributes = attributeRows.length > 0;

  return (
    <Tabs defaultValue="description" className="mt-8 overflow-hidden !flex-col">
      <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0 overflow-x-auto">
        <TabsTrigger value="description" className={TAB_TRIGGER_CLASS}>
          Mô tả sản phẩm
        </TabsTrigger>
        {hasAttributes && (
          <TabsTrigger value="attributes" className={TAB_TRIGGER_CLASS}>
            Thông tin chi tiết
          </TabsTrigger>
        )}
        <TabsTrigger value="reviews" className={TAB_TRIGGER_CLASS}>
          Đánh giá ({reviewCount})
        </TabsTrigger>
        <TabsTrigger value="return-policy" className={TAB_TRIGGER_CLASS}>
          Chính sách đổi trả
        </TabsTrigger>
        <TabsTrigger value="privacy-policy" className={TAB_TRIGGER_CLASS}>
          Chính sách bảo mật
        </TabsTrigger>
        <TabsTrigger value="faq" className={TAB_TRIGGER_CLASS}>
          Câu hỏi thường gặp
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-4">
        <CollapsibleContent>
          <div
            className="prose prose-sm max-w-none text-gray-700 break-words overflow-hidden"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        </CollapsibleContent>
      </TabsContent>

      {hasAttributes && (
        <TabsContent value="attributes" className="mt-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {attributeRows.map((row) => (
              <div key={row.label} className="flex justify-between sm:justify-start gap-4 py-2 border-b border-gray-100">
                <dt className="text-sm text-gray-500 min-w-[120px]">{row.label}</dt>
                <dd className="text-sm font-medium text-gray-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>
      )}

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
              <p className="text-sm text-gray-500 mt-0.5">{reviewCount} đánh giá</p>
            </div>
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="pb-4 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.customer_name}</span>
                  {review.is_verified && (
                    <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Đã mua</span>
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

      <TabsContent value="return-policy" className="mt-4">
        <CollapsibleContent>
          <div
            className="prose prose-sm max-w-none text-gray-700 break-words overflow-hidden"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(returnHtml) }}
          />
        </CollapsibleContent>
      </TabsContent>

      <TabsContent value="privacy-policy" className="mt-4">
        <CollapsibleContent>
          <div
            className="prose prose-sm max-w-none text-gray-700 break-words overflow-hidden"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(privacyHtml) }}
          />
        </CollapsibleContent>
      </TabsContent>

      <TabsContent value="faq" className="mt-4">
        <FaqAccordion items={faqs} />
      </TabsContent>
    </Tabs>
  );
}
