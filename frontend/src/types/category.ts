/** Danh muc san pham */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id: string | null;
  children: Category[];
  product_count: number;
  sort_order: number;
}
