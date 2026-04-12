/** San pham va cac type lien quan */

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color_id: string;
  color_name: string;
  color_hex: string;
  size_id: string;
  size_name: string;
  price: number;
  compare_at_price: number;
  stock_qty: number;
  images: ProductImage[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  brand: string;
  price: number;
  compare_at_price: number;
  discount_percent: number;
  images: ProductImage[];
  variants: ProductVariant[];
  colors: { id: string; name: string; hex: string }[];
  sizes: { id: string; name: string }[];
  avg_rating: number;
  review_count: number;
  is_new: boolean;
  is_sale: boolean;
  is_bestseller: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  tags: string[];
  created_at: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number;
  discount_percent: number;
  image: string;
  image_hover?: string;
  avg_rating: number;
  review_count: number;
  is_new: boolean;
  is_sale: boolean;
  is_bestseller: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  colors: { id: string; name: string; hex: string }[];
  sizes: { id: string; name: string }[];
  variants: {
    id: string;
    sku: string;
    color_id: string;
    size_id: string;
    price: number;
    compare_at_price: number;
    stock_qty: number;
  }[];
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  content: string;
  images: string[];
  created_at: string;
  is_verified: boolean;
}
