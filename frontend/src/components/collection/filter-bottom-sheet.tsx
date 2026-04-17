'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FilterSidebar, type FilterState } from './filter-sidebar';

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

/** Filter bottom sheet — mobile full-screen */
export function FilterBottomSheet({
  open,
  onClose,
  filters,
  onChange,
  resultCount,
}: FilterBottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-4 pt-4 pb-0">
        <SheetHeader className="pb-3 border-b">
          <SheetTitle className="text-base">Bộ lọc sản phẩm</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto flex-1 py-4" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          <FilterSidebar filters={filters} onChange={onChange} />
        </div>

        {/* Sticky bottom CTA */}
        <div className="border-t py-3 flex gap-3">
          <button
            onClick={() => {
              onChange({ categories: [], colors: [], sizes: [], priceRange: null });
            }}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium"
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-black text-white rounded-lg text-sm font-semibold"
          >
            Xem {resultCount} sản phẩm
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
