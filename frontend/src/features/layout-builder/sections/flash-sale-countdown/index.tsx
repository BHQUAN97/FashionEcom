import { z } from 'zod';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default('Flash Sale'),
  // Che do hien thi
  display_mode: z.enum(['banner', 'compact', 'minimal']).default('banner'),
  // Flash sale data
  flash_sale_id: z.string().nullable().default(null),
  max_products: z.number().min(4).max(16).default(8),
  // Style
  bg_color: z.string().default('#D0021B'),
  text_color: z.string().default('#FFFFFF'),
  timer_style: z.enum(['box', 'colon', 'circle']).default('box'),
  // Hien thi
  show_progress_bar: z.boolean().default(true),
  show_original_price: z.boolean().default(true),
  show_sold_count: z.boolean().default(true),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tiêu đề', type: 'text' },
  { key: 'display_mode', label: 'Chế độ hiển thị', type: 'radio_cards', options: [
    { value: 'banner', label: 'Banner', icon: '🔥', description: 'Đầy đủ với nền' },
    { value: 'compact', label: 'Nhỏ gọn', icon: '⚡', description: 'Header nhỏ' },
    { value: 'minimal', label: 'Tối giản', icon: '▫', description: 'Chỉ countdown' },
  ]},
  { key: 'timer_style', label: 'Kiểu đồng hồ', type: 'radio_cards', options: [
    { value: 'box', label: 'Hộp', icon: '▣' },
    { value: 'colon', label: 'Dấu hai chấm', icon: ':' },
    { value: 'circle', label: 'Tròn', icon: '◯' },
  ]},
  { key: 'section_data', label: 'Dữ liệu', type: 'section_header' },
  { key: 'flash_sale_id', label: 'Flash Sale ID', type: 'text', placeholder: 'UUID của flash sale (tự động lấy)' },
  { key: 'max_products', label: 'Số SP tối đa', type: 'range', min: 4, max: 16, step: 2 },
  { key: 'section_style', label: 'Màu sắc', type: 'section_header' },
  { key: 'bg_color', label: 'Màu nền', type: 'color' },
  { key: 'text_color', label: 'Màu chữ', type: 'color' },
  { key: 'section_display', label: 'Hiển thị', type: 'section_header' },
  { key: 'show_progress_bar', label: 'Thanh tiến trình bán hàng', type: 'toggle' },
  { key: 'show_original_price', label: 'Hiện giá gốc', type: 'toggle' },
  { key: 'show_sold_count', label: 'Hiện số đã bán', type: 'toggle' },
]);

/** Timer display component */
function TimerDisplay({ style, color }: { style: string; color: string }) {
  const units = [
    { label: 'Ngày', value: '02' },
    { label: 'Giờ', value: '14' },
    { label: 'Phút', value: '37' },
    { label: 'Giây', value: '52' },
  ];

  if (style === 'circle') {
    return (
      <div className="flex gap-2">
        {units.map((u, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold" style={{ borderColor: color, color }}>
              {u.value}
            </div>
            <span className="text-[9px] mt-0.5 opacity-70" style={{ color }}>{u.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (style === 'colon') {
    return (
      <div className="flex items-center gap-1 text-xl font-bold font-mono" style={{ color }}>
        {units.map((u, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-0.5">:</span>}
            {u.value}
          </span>
        ))}
      </div>
    );
  }

  // Box style (default)
  return (
    <div className="flex gap-1.5">
      {units.map((u, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="bg-black/30 px-2 py-1 rounded text-sm font-bold font-mono min-w-[32px] text-center" style={{ color }}>
            {u.value}
          </span>
          <span className="text-[9px] mt-0.5 opacity-70" style={{ color }}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}

function Renderer({ config }: SectionRendererProps) {
  const title = (config.title as string) || 'Flash Sale';
  const mode = (config.display_mode as string) || 'banner';
  const bgColor = (config.bg_color as string) || '#D0021B';
  const textColor = (config.text_color as string) || '#FFFFFF';
  const timerStyle = (config.timer_style as string) || 'box';
  const showProgress = config.show_progress_bar !== false;
  const showOriginal = config.show_original_price !== false;
  const maxProducts = (config.max_products as number) || 8;

  const displayCount = Math.min(5, maxProducts);

  // Minimal mode — chi countdown
  if (mode === 'minimal') {
    return (
      <div className="py-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="font-bold text-sm">{title}</span>
          </div>
          <TimerDisplay style={timerStyle} color="#D0021B" />
        </div>
      </div>
    );
  }

  // Compact mode — header nho
  if (mode === 'compact') {
    return (
      <div className="py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="font-bold">{title}</span>
          </div>
          <TimerDisplay style={timerStyle} color="#D0021B" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: displayCount }).map((_, i) => (
            <div key={i} className="shrink-0 w-36 border rounded-lg p-2">
              <div className="aspect-square bg-gray-100 rounded mb-2 relative">
                <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded font-bold">-50%</div>
              </div>
              <div className="flex gap-1 items-baseline">
                <span className="text-xs text-red-600 font-bold">199K</span>
                {showOriginal && <span className="text-[10px] text-gray-400 line-through">399K</span>}
              </div>
              {showProgress && (
                <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${60 + i * 10}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Banner mode (default) — giong storefront FlashSaleCountdown
  return (
    <div className="py-8 px-4" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <h2 className="text-xl font-bold" style={{ color: textColor }}>{title}</h2>
        </div>
        <TimerDisplay style={timerStyle} color={textColor} />
      </div>

      {/* Product carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: displayCount }).map((_, i) => (
          <div key={i} className="shrink-0 w-[170px] sm:w-[200px] md:w-[240px] lg:w-[260px] xl:w-[280px] bg-white rounded-lg p-2.5 shadow-sm">
            <div className="aspect-square bg-gray-50 rounded-md mb-2 relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </div>
              <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">-{30 + i * 10}%</div>
            </div>
            <p className="text-xs text-gray-700 line-clamp-1 mb-1">Sản phẩm flash sale</p>
            <div className="flex gap-1 items-baseline">
              <span className="text-sm text-red-600 font-bold">{(99000 + i * 30000).toLocaleString('vi-VN')}d</span>
              {showOriginal && <span className="text-[10px] text-gray-400 line-through">{(199000 + i * 30000).toLocaleString('vi-VN')}d</span>}
            </div>
            {showProgress && (
              <div className="mt-2 h-1.5 bg-red-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" style={{ width: `${50 + i * 12}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-5">
        <button className="px-6 py-2 bg-white text-red-600 text-xs font-bold rounded tracking-wide hover:bg-gray-100 transition">
          XEM TAT CA FLASH SALE
        </button>
      </div>
    </div>
  );
}

export const flashSaleCountdownDefinition: SectionDefinition = {
  type: 'flash_sale_countdown',
  label: 'Flash Sale Countdown',
  icon: 'Zap',
  group: 'product',
  maxInstances: 1,
  defaultConfig: {
    title: 'Flash Sale',
    display_mode: 'banner',
    flash_sale_id: null,
    max_products: 8,
    bg_color: '#D0021B',
    text_color: '#FFFFFF',
    timer_style: 'box',
    show_progress_bar: true,
    show_original_price: true,
    show_sold_count: true,
  },
  configSchema,
  EditorComponent: Editor as React.FC<SectionEditorProps>,
  RendererComponent: Renderer,
};
