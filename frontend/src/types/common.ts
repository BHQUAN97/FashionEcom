/** Common types cho API responses */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface HeroBannerSlide {
  id: string;
  image: string;
  image_mobile: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
}

export interface TrustBarItem {
  icon: 'truck' | 'shield' | 'refresh' | 'headphones';
  line1: string;
  line2: string;
}

export interface FlashSaleData {
  id: string;
  title: string;
  end_time: string;
  products: import('./product').ProductListItem[];
}
